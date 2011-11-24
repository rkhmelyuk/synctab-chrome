var _optionWrapper = function(name) {
	return {
		get: function() {
			return localStorage[name];
		},
		getInt: function() {
			return parseInt(localStorage[name]);
		},
		getBoolean: function() {
			return localStorage[name] === 'true';
		},
		getArray: function() {	
			var value = localStorage[name];
			if (value) {
				return JSON.parse(value);
			}
			return [];
		},
		set: function(value) {
			localStorage[name] = value;
		},
		clear: function () {
			delete localStorage[name];
		},
		setIfNothing: function(value) {
			var current = this.get();
			if (!current || current == undefined) {
				this.set(value);
			}
		},
		isEmpty: function() {
			var value = this.get();
			return value == null || value == undefined;
		}
	}
}

var SyncTab = {

	apiUrl: "http://synctabapp.khmelyuk.com/api",

	device: 'Chrome',
	defaultTagName: 'Chrome',

	options: {
		tag: _optionWrapper('tag'),
		tags: _optionWrapper('tags'),
		email: _optionWrapper('email'),
		token: _optionWrapper('token'),
		lastSyncDate: _optionWrapper('lastSyncDate'),
		addToBookmarks: _optionWrapper('addToBookmarks'),
		selectOpenedTab: _optionWrapper('selectOpenedTab'),
		refreshInterval: _optionWrapper('refreshInterval'),
		showNotifications: _optionWrapper('showNotifications')
	},

	/**
	 * Check if user is authorized or not.
	 */
	needLogin: function() {
		return SyncTab.options.token.isEmpty();
	},

	/**
	 * Initialize options with default values.
	 */
	initOptions: function() {
		SyncTab.options.refreshInterval.setIfNothing(60000);
		SyncTab.options.showNotifications.setIfNothing(true);
		SyncTab.options.selectOpenedTab.setIfNothing(false);
		SyncTab.options.addToBookmarks.setIfNothing(false);
	},

	/**
	 * Open a login page.
	 */
	openLoginPage: function() {
		chrome.tabs.create({url: 'login.html'});	
	},

	/**
	 * Open new tabs for each received shared tab, 
	 * and show notification if need.
	 */
	handleNewTabs: function(tabs) {
		if (tabs.length > 0) {

			// Open browser tabs for each received shared tab.
			for (var i = 0; i < tabs.length; i++) {
				SyncTab.handleNewTab(tabs[i]);
			}

			// Show notification if enabled.
			if (SyncTab.options.showNotifications.getBoolean()) {
				SyncTab.showNotification(tabs);
			}

			// Save sync timestamp.
			SyncTab.options.lastSyncDate.set(new Date().getTime());
		}
	},

	/**
	 * Handle new tab: open and add to bookmarks if enabled.
	 */
	handleNewTab: function(tab) {
		try {
			chrome.tabs.create({
				url: tab.link,
				selected: SyncTab.options.selectOpenedTab.getBoolean(),
				pinned: false
			});

			if (SyncTab.options.addToBookmarks.getBoolean()) {
				var title = tab.title;
				if (!title) { title  = "" }
				chrome.bookmarks.create({
					parentId: "1",
					url: tab.link,
					title: title 
				});
			}
		}
		catch (err) {
			// do nothing
		}
	},

	/**
	 * Show notification about new tabs.
	 */
	showNotification: function(tabs) {
		var num = tabs.length;
		var message = "" + num;
		if (num == 1) {
			message += " shared tab was opened.";
		}
		else {
			message += " shared tabs were opened.";
		}

		webkitNotifications.createNotification(
			"icon48.png", "SyncTab: new tabs",  message
		).show();
	},

	/** 
	 * Authorize user by email and password.
	 */
	authorize: function(email, password, callback) {
		$.ajax({
			type: 'POST',
			url: SyncTab.apiUrl + "/authorize",
			data: {email: email, password: password},
			success: function(json, textStatus, jqXHR) {
				if (json.status) {
					SyncTab.options.email.set(email);
					SyncTab.options.token.set(json.token);

					callback(true);
				}
				else {
					callback(false);
				}
			},
			error: function(jqXHR) {
				callback(false);
			}
		})
	},

	/** 
	 * Register user by email and password.
	 */
	register: function(email, password, callback) {
		$.ajax({
			type: 'POST',
			url: SyncTab.apiUrl + "/register",
			data: {email: email, password: password},
			success: function(json, textStatus, jqXHR) {
				if (json.status) {
					callback(true, null);
				}
				else {
					callback(false, json.message);
				}
			},
			error: function(jqXHR) {
				callback(false, "Unexpected Server Error. Please try again or later.");
			}
		});
	},

	/** 
	 * Logout for current session;
	 */
	logout: function() {
		var token = SyncTab.options.token;
		if (!token.isEmpty()) {
			SyncTab.options.token.clear();
			SyncTab.options.email.clear();
			SyncTab.options.tags.clear();
		}
	},

	/**
	 * Loads the list of tags.
	 */
	loadTags: function(callback) {
		$.ajax({
			url: SyncTab.apiUrl + "/getTags", 
			dataType: 'json', 
			data: {'token': SyncTab.options.token.get()},
			success: function(json, textStatus, jqXHR) {
				if (json.status) {
					var tags = json.tags;

					SyncTab._setCurrentTag(tags);
					SyncTab.options.tags.set(JSON.stringify(tags));

					// say it's read and OK
					callback(true);
				}
				else {
					callback(false);
				}
			},
			error: function(jqXHR) {
				if (jqXHR.status == 401) {
					var bgPage = chrome.extension.getBackgroundPage();
					bgPage.logout(true);
				}
				callback(false);
			}
		});
	},

	_setCurrentTag: function(tags) {
		if (!SyncTab.options.tag.get()) {
			// set current tag for browser to be Chrome
			var tagsLen = tags.length;
			for (var i = 0; i < tagsLen; i++) {
				var tag = tags[i];
				if (tag.name == SyncTab.defaultTagName) {
					SyncTab.options.tag.set(tag.id);
					break;
				}
			}					
		}
	},

	shareTab: function(link, tagId, callback) {
		if (link && tagId) {
			$.ajax({
				type: 'POST',
				url: SyncTab.apiUrl + "/shareTab",
				data: {
					'link': link, 'tagId': tagId, 
					'device': SyncTab.device, 
					'token': SyncTab.options.token.get()
				},
				success: function(json, textStatus, jqXHR) {
					callback(json.status);
				},
				error: function(jqXHR) { callback(false); }
			});
		}
	}
};