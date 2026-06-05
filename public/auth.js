const BASE_URL ="https://banking-webapp-9y8z.onrender.com"

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
      const err = await res.json()
      showResult(err.message || 'Something went wrong', 'error')
      return
    }
    return await res.json();
  } catch (error) {
    showResult('Error: ' + error.message, 'error');
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

  showDashboard();
  loadDashboard();
}

async function signup() {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  
  if (!name || !email || !password) {
    showResult('Please fill all fields', 'error','signupResult');
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

  const data = await request("/auth/signup", "POST", { name, email, password });
  if(data) {
    showResult('Account created! You can now login.', 'success', 'signupResult')
    showLogin()
  }
}

async function loadDashboard() {
  const data = await request("/dashboard", "GET");
    localStorage.setItem("myuser", JSON.stringify(data))
  if (!data) return logout();
  renderDashboard();
  showBalance(data)

}


 
function renderDashboard() {
  const cacheUser = JSON.parse(localStorage.getItem("myuser"))
  console.log('this is the catche:', cacheUser)
  if(cacheUser) {
    const user = cacheUser
console.log('this is the user:', user)
  const avatarName = user.name
  const avatarLetter = avatarName.charAt(0).toUpperCase();
  document.getElementById("avatarInitial").textContent = avatarLetter;
  document.querySelector("#username").innerHTML = `<h1 style="color: ;">Hi, ${user.name.toUpperCase() || user.name.toUpperCase()}</h1>`;
  document.querySelector("#balance").textContent = ` #${user.balance.toLocaleString()} `;
  document.querySelector("#accountnumber").textContent = `  AccountNo:${user.accountnumber} `;
}
}

function showDashboard() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("signupPage").classList.add("hidden");
  document.getElementById("dashboardPage").classList.remove("hidden")
  document.querySelector(".layout-wrapper").classList.add("hidden");
    fetch('main-sidebar.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById("sidebar-container").innerHTML = data;
    });
}

function showLogin() {
  document.getElementById("signupPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("dashboardPage")?.classList.add("hidden");
  document.querySelector(".layout-wrapper").classList.remove("hidden");
}

function showSignup() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("signupPage").classList.remove("hidden");
  document.querySelector(".layout-wrapper").classList.remove("hidden");
}

async function logout() {
  await fetch(BASE_URL + "/auth/logout", {
    method: "POST",
    credentials: "include"
  })

  localStorage.removeItem("user")
  showLogin();
}

function showResult(message, type) {
  const loginResult = document.getElementById("loginResult");
  const signupResult = document.getElementById("signupResult");

  if(loginResult) {
    loginResult.textContent = message
    loginResult.className = 'show ' + type
  }
  if(signupResult) {
    signupResult.textContent = message
    signupResult.className = 'show ' + type 
  }
}

function initapp() {
  const user = JSON.parse(localStorage.getItem("user"))
  if (user) {
    showDashboard()
    loadDashboard()
  } else {
    showLogin()
  }
}
initapp()

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



const sections = document.querySelector(".section")
// TRANSACRION HISTORY
async function loadTransactionHistory() {

  try {

// CALL MY API FROM ROUTER
const res = await fetch(BASE_URL + "/transfer/history", {
  headers: {
    credentials: "include",
    contentType: "application/json",
  }
})

if(!res.ok) { 
   console.error("Fetch failed:", res.status);
      sections.innerHTML = "<p>Error loading transactions</p>"
}





 const data = await res.json()


     console.log("Data received:", data.transactions); 
// CONSOLE.LOG TO DEBUG MY CODE
console.log("FULL API RESPONSE:", data) 
     sections.innerHTML = ""

     if(data.transactions.length === 0) {
      sections.innerHTML = "<p>No transactions found</p>"
      return
     }



     
  await data.transactions.slice(0, 3).forEach(transaction => {


   console.log('my trans',transaction.amount)
   console.log('my trans',transaction.date)
   console.log('trans', transaction.direction)





   
   console.log('my trans',transaction.userId.name)
  
   console.log('my trans',transaction.amount)
   console.log('my trans',transaction.date)
   console.log('trans', transaction.direction)
// Adding boolean value to both credit and debit side
let message ;
let amount;
if(transaction.direction === 'debit') {
  message = `Transfer ₦${transaction.amount} to ${transaction.counterParty.name.toUpperCase()}`
}
 if ( transaction.direction === 'credit')  {
message = `Received ₦${transaction.amount} from ${transaction.counterParty.name}`
}
 


//Debit amount
if(transaction.direction === 'debit') {
   amount = `-#${transaction.amount}`

}
 if ( transaction.direction === 'credit')  {
amount = `+#${transaction.amount}`
}



    sections.innerHTML += `
    
    <a class="view" style="font-size: 8px;"href="/transaction-detail.html?id=${transaction.transactionId}">View</a>

   <div class="toAmount">
    
   <h5> ${message}</h5>


     <h3 >${amount}</h3>
   </div>

    <div class="dateStatus">
     <h5 class="date">${new Date(transaction.date).toLocaleString()}</h5>
     <h4 class="status">${transaction.status}</h4>

     
    </div>`
})




// 
}
catch (error) {
  console.error("Error fetching transactions:", error);
  sections.innerHTML = `<p>Error loading transactions</p>`
}


  }
 






const viewBalance = document.querySelector(".vieweye")
const hideBalance = document.querySelector('.hiddeneye')
function hidebalance () {

 hideBalance.addEventListener( 'click' , () => {
balance.textContent = "****"
hideBalance.classList.toggle('active')
viewBalance.classList.toggle('active')
 })

}
  

  

  function showBalance(data) {

  viewBalance.addEventListener( 'click' , () => {
balance.textContent = ` #${data.balance.toLocaleString()} `
  viewBalance.classList.toggle('active')
  hideBalance.classList.remove('active')

  })

  }




loadTransactionHistory()

// SIDEBAR TOGGLEF
// SIDEBAR TOGGLEF
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar')
  const overlay = document.getElementById('overlay')
  
  sidebar.classList.toggle('active')
  overlay.classList.toggle('active')
}

// Close sidebar when clicking menu item (mobile)
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      toggleSidebar()
    }
  })
})

// Close sidebar on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const sidebar = document.getElementById('sidebar')
    const overlay = document.getElementById('overlay')
    sidebar.classList.remove('active')
    overlay.classList.remove('active')
  }
})



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
      messageDiv.textContent = data.message || 'Error'
      messageDiv.className = 'error'
      return
    }
    
    messageDiv.textContent = 'OTP sent! Check your email'
    messageDiv.className = 'success'
    
    // Show OTP step after 1 second
    setTimeout(() => {
      document.getElementById('emailStep').classList.add('hidden')
      document.getElementById('otpStep').classList.remove('hidden')
    }, 1000)
    
  } catch (err) {
    messageDiv.textContent = 'Error: ' + err.message
    messageDiv.className = 'error'
  }
}

