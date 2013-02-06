$(document).ready(function() {

	if (SyncTab.needLogin()) {
		$('#login').show();
		$('#share').hide();
	}
	else {
		var options = SyncTab.options;
		var bgPage = chrome.extension.getBackgroundPage();

		function showTags() {
			var tags = options.tags.getArray();
			var currentTagId = options.tag.get();

			var tagsLen = tags.length;
			for (var i = 0; i < tagsLen; i++) {
				var tag = tags[i];
				if (tag.id != currentTagId) {
					$('.tags').append("<div class='tag' rel='" + tag.id + "'>" + tag.name + "</div>");
				}
			}
		}
		
		var tags = options.tags.getArray();
		if (tags) {
			showTags();
		}
		else {
			SyncTab.loadTags(function(status) {
				if (status) showTags();
			});
		}
	}

	$('.tag').click(function() {
		var tagId = $(this).attr('rel');
		$('.tags').hide();
		$('#in_progress').show();
		chrome.tabs.getSelected(null, function(tab) {
			SyncTab.shareTab(tab.url, tagId, function(status) {
				window.close();
			});
		});
	});
	$('#loginNow').click(function() {
		SyncTab.openLoginPage();
		window.close();
	})
});