
$(document).ready(function() {
	$("#email").change(function() {
		validateEmail($(this).val().trim());
	});
	$("#password").change(function() {
		validatePassword($(this).val().trim());
	});
});

function validateEmail(email) {
	if (!email) {
		$('#emailError').text("Email is required").show();
		return true;
	}
	
	$('#emailError').hide();
	return false;
}

function validatePassword(password) {
	if (!password) {
		$('#passwordError').text("Password is required").show();
		return true;
	}
	
	$('#passwordError').hide();
	return false;
}
