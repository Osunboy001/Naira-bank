//  BASE URL 
const BASE_URL ="https://banking-webapp-9y8z.onrender.com"

//  SIDEBAR
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar')
  const overlay = document.getElementById('overlay')

  sidebar.classList.toggle('active')
  overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none'
}

document.addEventListener('keydown', (e) => {
  if (e.key === "Escape") {
    document.getElementById('sidebar').classList.remove('active')
    document.getElementById('overlay').style.display = 'none'
  }
})

// SEARCH 
function searchUser() {
  let input = document.getElementById("search").value.toLowerCase()
  let rows = document.querySelectorAll("#users tr")

  rows.forEach(row => {
    let name = row.cells[0].innerText.toLowerCase()
    let acc = row.cells[1].innerText.toLowerCase()

    row.style.display = (name.includes(input) || acc.includes(input)) ? "" : "none"
  })
}

// LOAD USERS =
async function loadUsers() {
  try {
  
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    const data = await res.json()

    const tbody = document.getElementById("users")
    tbody.innerHTML = ""

   data.users.forEach(user => {
  tbody.innerHTML += `
    <tr>
      <td>
        <a href="admin-edit.html?id=${user._id}" style=" color:black;   cursor:pointer; text-decoration:none; color:black">
          ${user.name}
        </a>
      </td>
      <td>${user.accountnumber}</td>
      <td>₦${user.balance.toLocaleString()}</td>
      <td>
        <span class="status ${user.status === "blocked" ? "blocked" : "active"}">
          ${user.status || "active"}
        </span>
      </td>
      <td>
        <button class="btn view">View</button>
        <button class="btn ${user.status === "blocked" ? "unblock" : "block"}"
          onclick="blockUser('${user._id}')">
          ${user.status === "blocked" ? "Unblock" : "Block"}
        </button>
      </td>
    </tr>
  `
})

  } catch (err) {
    console.log("LOAD USERS ERROR:", err)
  }
}

// =LOAD STATS 
async function loadStats() {
  try {
   
    

    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
    })

     




    const data = await res.json()
console.log("STATS:", data)
    document.querySelectorAll(".card p")[0].textContent = data.totalUsers
    document.querySelectorAll(".card p")[1].textContent = `₦${data.totalBalance.toLocaleString()}`
    document.querySelectorAll(".card p")[2].textContent = data.activeUsers
    document.querySelectorAll(".card p")[3].textContent = data.blockedUsers

  } catch (err) {
    console.log("STATS ERROR:", err)
  }
}

//  BLOCK USER 
async function blockUser(userId) {
  try {
   

    const res = await fetch(`${BASE_URL}/admin/${userId}/block`, {
  method: "PATCH",
  headers: {
  contentype: "application/json",
      },
      credentials: "include"
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.message)



  } catch (err) {
    console.log("BLOCK ERROR:", err)
  }
}

//  LOGOUT 
function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("us")
  window.location.href = "/index.html"
}

//  INIT 
loadUsers()
loadStats()