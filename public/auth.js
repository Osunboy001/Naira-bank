const BASE_URL ="http://localhost:3000/api/v1"

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
  if (!data) return logout();
  renderDashboard(data);
}

function renderDashboard(data) {
  const avatarName = data.user?.name || data.name || "User";
  const avatarLetter = avatarName.charAt(0).toUpperCase();
  document.getElementById("avatarInitial").textContent = avatarLetter;
  document.querySelector("#username").innerHTML = `<h1 style="color: ;">Hi, ${data.user?.name || data.name}</h1>`;
  document.querySelector("#balance").textContent = ` #${data.balance.toLocaleString()} `;
  document.querySelector("#accountnumber").textContent = `  acctnumber:${data.accountnumber} `;
}

function showDashboard() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("signupPage").classList.add("hidden");
  document.getElementById("dashboardPage").classList.remove("hidden")
  document.querySelector(".layout-wrapper").classList.add("hidden");
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

     
  data.transactions.forEach(transaction => {
  
    sections.innerHTML += `
   <div class="toAmount">
   <h5>Transfer to ${transaction.to.name.toUpperCase()}</h5>

     <h5> Receive from ${transaction.from.name.toUpperCase()}</h5>

     <h3>#${transaction.amount}</h3>
   </div>

    <div class="dateStatus">
     <h5 class="date">${new Date(transaction.date).toLocaleString()}</h5>
     <h4 class="status">${transaction.status}</h4>
    </div>`
})

}
catch (error) {
  console.error("Error fetching transactions:", error);
  sections.innerHTML = `<p>Error loading transactions   ${error.message}</p>`
}


  }
 








loadTransactionHistory()