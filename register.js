$(document).ready(function() {
	var bgPage = chrome.extension.getBackgroundPage();

	$('#check').change(function() {
		var password = $('#password')
		if ($(this).is(":checked")) {
			password.hide();
			var showPassword = $("<input id='shownPassword' type='text' readonly/>");
			showPassword.insertAfter(password).val(password.val());
		}
		else {
			password.show();
			$('#shownPassword').remove();
		}
	});

	$('#registerForm').submit(function(e) {
		e.preventDefault();

		var email = $("#email").val().trim();
		var password = $("#password").val().trim();
		var hasError = false;

		hasError |= validateEmail(email);
		hasError |= validatePassword(password);

		if (!hasError) {
			SyncTab.register(email, password, function(status, msg) {
				if (status) {
					$("#formContent").hide();
					$("#registeredNowContent").show();
				}
				else {
					$('#formError').text(msg).show();
				}
			});
		}

		return false;
	});
});