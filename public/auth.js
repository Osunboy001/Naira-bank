const BASE_URL = window.location.origin + '/api/v1'

// Show a success/error message on the login or signup card.
// `targetId` is optional; when omitted we pick the visible card's message box.
function showResult(message, type = 'error', targetId) {
  let el = targetId ? document.getElementById(targetId) : null

  if (!el) {
    const signupPage = document.getElementById('signupPage')
    const onSignupPage = signupPage && !signupPage.classList.contains('hidden')
    el = document.getElementById(onSignupPage ? 'signupResult' : 'loginResult')
  }

  if (!el) {
    console.warn(`[${type}] ${message}`)
    return
  }

  el.textContent = message
  el.className = 'show ' + type
}

async function request(endpoint, method, body) {
  try {
    const res = await fetch(BASE_URL + endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
      try {
        const err = await res.json()
        showResult(err.msg || err.message || 'Something went wrong please try again.', 'error')
      } catch {
        showResult('Something went wrong', 'error')
      }
      return
    }
    return await res.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      showResult('Network error. Please check your connection.', 'error');
    } else {
      showResult(error.message || 'Network error. Please check your connection.', 'error');
    }
  }
}

async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const data = await request("/auth/signin", "POST", { email, password });

  if (!data) return
  localStorage.setItem("user", JSON.stringify(data.user)) 

  if (data.user.role === "admin") {
    window.location.href = "/admin.html"
    return
  }

  // KYC-first: unverified users must finish verification before the app.
  try {
    const kycRes = await fetch(BASE_URL + '/kyc', { credentials: 'include' })
    if (kycRes.ok) {
      const kyc = await kycRes.json()
      if (kyc.status !== 'verified') {
        window.location.href = "/kyc.html"
        return
      }
    }
  } catch (err) {
    // Fall through to the dashboard; the server-side page guard re-checks.
  }

  window.location.href = "/user-dashboard.html"
}

function showLogin() {

    document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("signupPage").classList.add("hidden");
  document.querySelector(".layout-wrapper").classList.remove("hidden");
}


async function signup() {
  const firstName = document.getElementById("signupFirstName").value.trim();
  const lastName = document.getElementById("signupLastName").value.trim();
  const location = document.getElementById("signupLocation").value.trim();
  const dateOfBirth = document.getElementById("signupDob").value;
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  
  if (!firstName || !lastName || !location || !dateOfBirth || !email || !password) {
    showResult('Please fill all fields', 'error','signupResult');
    return;
  }

  if (firstName.length < 2 || lastName.length < 2) {
    showResult('First name and last name must be at least 2 characters', 'error', 'signupResult');
    return;
  }

  if (location.length < 3) {
    showResult('Please enter your location', 'error', 'signupResult');
    return;
  }

  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime()) || dob >= new Date()) {
    showResult('Please enter a valid date of birth', 'error', 'signupResult');
    return;
  }
  
  if (password.length < 8) {
    showResult('Password must be at least 8 characters', 'error', 'signupResult')
    return
  }

  if (!/[A-Z]/.test(password)) {
    showResult('Password must have at least one uppercase letter', 'error', 'signupResult')
    return
  }

  if (!/[0-9]/.test(password)) {
    showResult('Password must have at least one number', 'error', 'signupResult')
    return
  }

  if (!/[!@#$%^&*.]/.test(password)) {
    showResult('Password must have at least one special character (!@#$%^&*)', 'error', 'signupResult')
    return
  }

  const data = await request("/auth/signup", "POST", { firstName, lastName, location, dateOfBirth, email, password });
  if(data) {
    // Show the message on the login card we're about to reveal.
    showResult('Account created! You can now login.', 'success', 'loginResult')
    showLogin()
  }
}


function showSignup() {

    document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("signupPage").classList.remove("hidden");
  document.querySelector(".layout-wrapper").classList.remove("hidden");
}
// VERIFY EMAIL
// Sends a verification email ONLY if the address is registered.

async function verifyEmail() {
  const email = document.getElementById("signupEmail").value;

  if (!email) {
    showResult('Please enter your email first', 'error', 'signupResult');
    return;
  }

  const data = await request("/auth/verify-email", "POST", { email });

  if (data) {
    showResult('If this email is registered, a verification link has been sent to it.', 'success', 'signupResult');
  }
}








// OPEN MODAL
function openForgotModal(e) {
  e.preventDefault()
  document.getElementById('forgotPasswordModal').classList.remove('hidden')
  document.getElementById('emailStep').classList.remove('hidden')
  document.getElementById('otpStep').classList.add('hidden')
  document.getElementById('passwordStep').classList.add('hidden')
}

// CLOSE MODAL
function closeForgotModal() {
  document.getElementById('forgotPasswordModal').classList.add('hidden')
  document.getElementById('emailMessage').textContent = ''
  document.getElementById('otpMessage').textContent = ''
  document.getElementById('passwordMessage').textContent = ''
}

// SUBMIT EMAIL
async function submitForgotEmail() {
  const email = document.getElementById('forgotEmail').value
  const messageDiv = document.getElementById('emailMessage')
  
  if (!email) {
    messageDiv.textContent = 'Please enter email'
    messageDiv.className = 'error'
    return
  }
  
  try {
    const res = await fetch(BASE_URL + '/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email })
    })
    
    const data = await res.json()
  
    
    if (!res.ok) {
      messageDiv.textContent = data.msg || data.message || 'Something went wrong'
      messageDiv.className = 'error'
      return
    }
    
    messageDiv.textContent = data.msg || 'OTP sent! Check your email'
    messageDiv.className = 'success'
    

  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      messageDiv.textContent = 'Network error. Please check your connection.'
    } else {
      messageDiv.textContent = err.message || 'Network error. Please check your connection.'
    }
    messageDiv.className = 'error'
  }
}


function myFunction() {
  var x = document.getElementById("loginPassword");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

function myFunc() {
  var y = document.getElementById("signupPassword");
  if (y.type === "password") {
    y.type = "text";
  } else {
    y.type = "password";
  }
}

