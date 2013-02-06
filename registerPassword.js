$(document).ready(function() {
	var bgPage = chrome.extension.getBackgroundPage();
	
	$('#resetPasswordForm').submit(function(e) {
		e.preventDefault();

		$('#resetPasswordForm').hide();
		$('#wait').show();

		var email = $("#email").val().trim();
		var hasError = validateEmail(email);

		if (!hasError) {
			SyncTab.resetPassword(email, function(status) {
				if (status) {
					$('#resetPasswordForm').hide();
					$('#wait').hide();
					$('#resetSent').show();
				}
				else {
					$('#wait').hide();
					$('#resetPasswordForm').show();
					$('#formError').text("Incorrect Email").show();
				}
			});
		}

		return false;
	});
});