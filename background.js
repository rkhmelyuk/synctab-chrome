var refreshInterval;

function setupMenu() {
	var tags = SyncTab.options.tags.getArray();
	var currentTagId = SyncTab.options.tag.get();

	chrome.contextMenus.removeAll();

	var tagsLen = tags.length;
	for (var i = 0; i < tagsLen; i++) {
		var tag = tags[i];
		if (tag.id != currentTagId) {
			chrome.contextMenus.create({
				type: "normal",
				title: "Send to " + tag.name,
				contexts: ["link"],
				onclick: function(info, link) {
					SyncTab.shareTab(info.linkUrl, tag.id, 
						function(status) {});

				}
			});
		}
	}
}

function load() {
	SyncTab.initOptions();

	if (SyncTab.needLogin()) {
	 	SyncTab.openLoginPage();
	}
	else {
		startRefreshWithInterval();
		setupMenu();
	}
}

function login() {
	refreshSyncedTabs();
	startRefreshWithInterval();
}

function logout(showLoginPage) {
	SyncTab.logout();
	stopRefreshWithInterval();

	if (showLoginPage) {
		SyncTab.openLoginPage();
	}
}

function refreshSyncedTabs() {
	if (!SyncTab.needLogin()) {
		// check if there is any active windows
		chrome.windows.getCurrent(function(window) {
			if (window.id != chrome.windows.WINDOW_ID_NONE) {
				// if there is any window - load tabs
				loadNewTabs();
			}
		});
	}
	else {
		stopRefreshWithInterval();
	}
}

function loadNewTabs() {
	var token = SyncTab.options.token.get()
	var timestamp = SyncTab.options.lastSyncDate.get();

	// if checked for first time, than set date = yesterday
	if (timestamp == undefined) {
		var yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		timestamp = yesterday.getTime();
	}

	$.ajax({
		url: SyncTab.apiUrl + "/getSharedTabs", 
		dataType: 'json', 
		data: {'ts': timestamp, 'token': token, 'tagId': SyncTab.options.tag.get()},
		success: function(json, textStatus, jqXHR) {
			if (jqXHR.status == 200) {
				if (json.status) {
					SyncTab.handleNewTabs(json.tabs);
				}
			}
		},
		error: function(jqXHR) {
			if (jqXHR.status == 401) {
				logout(true);
			}
		}
	});

	// refresh the list of tags
	SyncTab.loadTags(function(val) {
		setupMenu();
	});
}

function optionsChanged() {
	stopRefreshWithInterval();
	startRefreshWithInterval();
}

function startRefreshWithInterval() {
	refreshInterval = setInterval(
		refreshSyncedTabs, 
		SyncTab.options.refreshInterval.getInt());
}

function stopRefreshWithInterval() {
	if (refreshInterval) {
		clearInterval(refreshInterval);
	}
}

load();
