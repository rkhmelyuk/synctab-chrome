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

	options: {
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
		$.post(SyncTab.apiUrl + "/authorize", {email: email, password: password}, 
			function(json, textStatus) {
				if (json.status) {
					SyncTab.options.email.set(email);
					SyncTab.options.token.set(json.token);

					callback(true);
				}
				else {
					callback(false);
				}
			}
		);
	},

	/** 
	 * Register user by email and password.
	 */
	register: function(email, password, callback) {
		$.post(SyncTab.apiUrl + "/register", {email: email, password: password}, 
			function(json, textStatus) {
				if (json.status) {
					callback(true, null);
				}
				else {
					callback(false, json.message);
				}
			}
		);
	},

	/** 
	 * Logout for current session;
	 */
	logout: function() {
		var token = SyncTab.options.token;
		if (!token.isEmpty()) {
			// TODO - implement me
			SyncTab.options.token.clear();
			SyncTab.options.email.clear();
		}
	}
};