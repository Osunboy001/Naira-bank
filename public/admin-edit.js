const BASE_URL = "http://localhost:3000/api/v1"

const urlParams = new URLSearchParams(window.location.search)
const userId = urlParams.get("id")

// LOAD USER 
async function loadUser() {
  try {
    if (!userId) {
      alert("No user ID found in URL")
      return
    }

    const token = localStorage.getItem("token")

    const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await res.json()

    console.log("LOAD USER:", data)

    if (!res.ok) {
      alert(data.message || "Failed to load user")
      return
    }

    const user = data.user || data

    if (!user) {
      alert("User not found")
      return
    }

    document.getElementById("name").value = user.name || ""
    document.getElementById("email").value = user.email || ""
    document.getElementById("account").value = user.accountnumber || ""

  } catch (error) {
    console.log("LOAD ERROR:", error)
    alert("Something went wrong loading user")
  }
}

//  UPDATE USER
async function updateUser() {
  const name = document.getElementById("name").value
  const email = document.getElementById("email").value

  const token = localStorage.getItem("token")

  const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, email })
  })

  const data = await res.json()

  if (!res.ok) {
    alert(data.message || "Update failed")
    return
  }

  alert("User updated successfully")

  // redirect back to dashboard after update
  window.location.href = "/admin.html"
}

loadUser()