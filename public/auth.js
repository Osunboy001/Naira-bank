const BASE_URL = "http://localhost:3000/api/v1";
const formAlertDOM = document.querySelector(".form-alert");
async function request(endpoint, method, body) {

  try {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL + endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
     
    },
   
    body: body ? JSON.stringify(body) : undefined
    
  });

    if (!res.ok) {
        showResult('Incorrect email or password', 'error');
        return;
    }

    const data = await res.json();
    console.log(token);

    return data;

 
} catch (error) {
    showResult('Error: ' + error.message, 'error');
}

}

async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const data = await request("/auth/signin", "POST", { email, password });
  if (!data.token) return alert(data.message || "Login failed");  
  
  // decode user from token
  const payload = JSON.parse(atob(data.token.split('.')[1]));

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(payload));

  if (payload.role === "admin") {
    window.location.href = "/admin.html";
    return;
  }

  showDashboard();
  loadDashboard();
}

async function signup() {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  if (!name || !email || !password) {
    showResult('Please fill all fields', 'error');
    
    return;
  }

  const data = await request("/auth/signup", "POST", { name, email, password });
  if (!data.token) return alert(data.message || "Signup failed");

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  showDashboard();
  loadDashboard();
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
  document.querySelector("#balance").textContent =` #${data.balance.toLocaleString()} ` ;
    document.querySelector("#accountnumber").textContent =`  acctnumber:${data.accountnumber} ` ;
  

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

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showLogin();
}

// error function
function showResult(message, type) {
  result.textContent = message;
  result.className = 'show ' + type;
}


function initapp () {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

console.log("USER FROM STORAGE:", user)

  if (token && user) {
showDashboard()
      loadDashboard()

}
   
 else {
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


