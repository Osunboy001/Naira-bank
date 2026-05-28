const BASE_URL = "http://localhost:3000/api/v1"; 
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token")
    ;
async function resetPassword() {

 

  const newPassword = document.getElementById('newPassword').value
  const confirmPassword = document.getElementById('confirmPassword').value
  const messageDiv = document.getElementById('passwordMessage')
  
  if (!newPassword || !confirmPassword) {
    messageDiv.textContent = 'Please fill all fields'
    messageDiv.className = 'error'
    return
  }
  
  if (newPassword !== confirmPassword) {
    messageDiv.textContent = 'Passwords do not match'
    messageDiv.className = 'error'
    return
  }
  
  try {
    const res = await fetch(BASE_URL + '/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({token, newPassword, confirmPassword })
    })
    
    const data = await res.json()
    console.log(data)
    
    if (!res.ok) {
      messageDiv.textContent = data.message || 'Error'

      return
    }
    
    messageDiv.textContent = 'Password updated! Redirecting...'
   
    // Close modal and redirect after 2 seconds
    setTimeout(() => {
   window.location = "/login-user.html";
    }, 2000)
    
  } catch (err) {
    messageDiv.textContent = 'Error: ' + err.message
    messageDiv.className = 'error'
  }
}
