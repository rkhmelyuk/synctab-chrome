$(document).ready(function() {
	var bgPage = chrome.extension.getBackgroundPage();

	var options = SyncTab.options;

	function showTagsAsOptions() {
		$('#tag').empty();

		var tags = options.tags.getArray();
		var tagsLen = tags.length;
		for (var i = 0; i < tagsLen; i++) {
			var tag = tags[i];
			var option = "<option value='"+tag.id + "'>" + tag.name + "</option>";
			$('#tag').append(option);
		}

		$('#tag').val(options.tag.get());
	}

	if (SyncTab.needLogin()) {
		$('#accountInfo').hide();
		$('#guest').show();
	}
	else {
		var tags = options.tags.getArray();
		if (tags.length > 0) {
			console.log(tags);
			showTagsAsOptions();
		}
		else {
			SyncTab.loadTags(function(status) {
				if (status) showTagsAsOptions();
			});
		}
	}

	$('#email').text(options.email.get());
	$("#addToBookmarks").val(options.addToBookmarks.get());
	$("#refreshInterval").val(options.refreshInterval.get());
	$("#selectOpenedTab").val(options.selectOpenedTab.get());
	//$("#showNotifications").val(options.showNotifications.get());

	$('#logout').click(function() {
		bgPage.logout(false);

		$('#accountInfo').hide();
		$('#guest').show();
	});

	$('.optionValue').change(function(e) {

		var tag = $('#tag').val();
		var refreshInterval = $("#refreshInterval").val();
		var addToBookmarks = $("#addToBookmarks").val().trim();
		var selectOpenedTab = $("#selectOpenedTab").val().trim();
		//var showNotifications = $("#showNotifications").val().trim();

		options.tag.set(tag);
		options.addToBookmarks.set(addToBookmarks);
		options.refreshInterval.set(refreshInterval);
		options.selectOpenedTab.set(selectOpenedTab);
		//options.showNotifications.set(showNotifications);

		bgPage.optionsChanged();
	});
});