// Demo OTP storage
let generatedOTP = null;

// Generate random 6-digit OTP
function sendOTP(mobileInputId, otpStatusId) {
    const mobile = document.getElementById(mobileInputId).value.trim();

    if (mobile.length !== 10) {
        document.getElementById(otpStatusId).innerText = "Enter a valid 10-digit mobile number.";
        document.getElementById(otpStatusId).style.color = "red";
        return;
    }

    generatedOTP = Math.floor(100000 + Math.random() * 900000);

    document.getElementById(otpStatusId).innerText =
        "OTP sent successfully (Demo OTP: " + generatedOTP + ")";
    document.getElementById(otpStatusId).style.color = "green";
}

// Verify OTP
function verifyOTP(otpInputId, otpStatusId) {
    const entered = document.getElementById(otpInputId).value.trim();

    if (entered === generatedOTP.toString()) {
        document.getElementById(otpStatusId).innerText = "OTP Verified ✔";
        document.getElementById(otpStatusId).style.color = "green";
        return true;
    } else {
        document.getElementById(otpStatusId).innerText = "Incorrect OTP ❌";
        document.getElementById(otpStatusId).style.color = "red";
        return false;
    }
}
