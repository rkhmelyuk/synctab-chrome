$(document).ready(function() {
	var bgPage = chrome.extension.getBackgroundPage();

	if (!SyncTab.needLogin()) {
		$('#formContent').hide();
		$("#loggedInNowContent").hide();
		$('#loggedInAlreadyContent').show();
		$('#username').text(SyncTab.options.email.get());
	}
	
	$('#loginForm').submit(function(e) {
		e.preventDefault();

		var email = $("#email").val().trim();
		var password = $("#password").val().trim();
		var hasError = false;

		hasError |= validateEmail(email);
		hasError |= validatePassword(password);

		if (!hasError) {
			SyncTab.authorize(email, password, function(status) {
				if (status) {
					bgPage.login();
					document.location = "options.html";
				}
				else {
					$('#formError').text("Incorrect Email or Password").show();
				}
			});
		}

		return false;
	});

	$('#logout').click(function() {
		bgPage.logout(false);

		$('#formContent').show();
		$("#loggedInNowContent").hide();
		$('#loggedInAlreadyContent').hide();
	});
});