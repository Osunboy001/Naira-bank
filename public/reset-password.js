const BASE_URL = "http://localhost:3000/api/v1";

// Get token from URL
const params = new URLSearchParams(window.location.search);
const token = params.get("token");

// Check if token exists
if (!token) {
  alert("Invalid reset link. Please request a new one.");
  window.location.href = "/login-user.html";
}

async function resetPassword(e) {
  // Stop form submission
  e.preventDefault(); 

  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const messageDiv = document.getElementById("passwordMessage");

  // Clear my previous message
  messageDiv.textContent = "";
  messageDiv.className = "message";

  // Validation
  if (!newPassword || !confirmPassword) {
    messageDiv.textContent = "Please fill all fields";
    messageDiv.className = "message error";
    return;
  }

  if (newPassword.length < 8) {
    messageDiv.textContent = "Password must be at least 8 characters";
    messageDiv.className = "message error";
    return;
  }

  if (newPassword !== confirmPassword) {
    messageDiv.textContent = "Passwords do not match";
    messageDiv.className = "message error";
    return;
  }

  // Disable button
  const btn = document.querySelector(".reset-btn");
  btn.disabled = true;
  btn.textContent = "Updating...";

  try {
    const res = await fetch(BASE_URL + "/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      messageDiv.textContent = data.message || "Error updating password";
      messageDiv.className = "message error";
      btn.disabled = false;
      btn.textContent = "Update Password";
      return;
    }

    messageDiv.textContent = "Password updated successfully! Redirecting...";
    messageDiv.className = "message success";

    // Redirect after 2 seconds
    setTimeout(() => {
      window.location.href = "/login-user.html";
    }, 2000);
  } catch (err) {
    messageDiv.textContent = "Error: " + err.message;
    messageDiv.className = "message error";
    btn.disabled = false;
    btn.textContent = "Update Password";
  }
}