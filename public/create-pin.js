const BASE_URL = window.location.origin + '/api/v1'


// CEEATE A FUNTION TO TOKEN SO THAT IT CAN BE REUSEABLE
function token() { return localStorage.getItem("token") }

function showErr(id, msg) {
  const el = document.getElementById(id)
  el.textContent = msg
  el.classList.add("show")
}

function hideErr(id) {
  document.getElementById(id).classList.remove("show")
}

//  PIN STRENGTH 
function onPinInput() {
  const pin = document.getElementById("pin").value.replace(/\D/g, "")
  document.getElementById("pin").value = pin

  hideErr("pinError")
  document.getElementById("pin").classList.remove("nb-ok", "nb-err")

  const wrap = document.getElementById("strengthWrap")
  const label = document.getElementById("strengthLabel")
  const bar1 = document.getElementById("bar1")
  const bar2 = document.getElementById("bar2")
  const bar3 = document.getElementById("bar3")

  if (pin.length === 0) {
    wrap.classList.remove("show")
    return
  }

  wrap.classList.add("show")

  // reset bars
  bar1.className = "nb-bar"
  bar2.className = "nb-bar"
  bar3.className = "nb-bar"

  const weak = ["1234", "0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999", "123456", "000000"]
  const isWeak = weak.includes(pin) || pin.length < 4

  if (isWeak || pin.length < 5) {
    bar1.classList.add("weak")
    label.textContent = "Weak"
    label.className = "nb-strength-label weak"
  } else if (pin.length === 5) {
    bar1.classList.add("medium")
    bar2.classList.add("medium")
    label.textContent = "Medium"
    label.className = "nb-strength-label medium"
  } else {
    bar1.classList.add("strong")
    bar2.classList.add("strong")
    bar3.classList.add("strong")
    label.textContent = "Strong"
    label.className = "nb-strength-label strong"
  }

  onConfirmInput()
}

// CONFIRM PIN MATCH 
function onConfirmInput() {
  const pin = document.getElementById("pin").value
  const confirm = document.getElementById("confirmPin").value
  const hint = document.getElementById("matchHint")

  hideErr("confirmError")

  if (confirm.length === 0) {
    hint.textContent = ""
    hint.className = "nb-match-hint"
    return
  }

  if (pin.startsWith(confirm) || confirm === pin) {
    if (confirm === pin && confirm.length >= 4) {
      hint.textContent = "PINs match"
      hint.className = "nb-match-hint ok"
      document.getElementById("confirmPin").classList.add("nb-ok")
      document.getElementById("confirmPin").classList.remove("nb-err")
    } else {
      hint.textContent = ""
      hint.className = "nb-match-hint"
    }
  } else {
    hint.textContent = "PINs do not match"
    hint.className = "nb-match-hint no"
    document.getElementById("confirmPin").classList.add("nb-err")
    document.getElementById("confirmPin").classList.remove("nb-ok")
  }
}

// ── CREATE PIN ──
async function createPin() {
  hideErr("pinError")
  hideErr("confirmError")

  const pin = document.getElementById("pin").value
  const confirmPin = document.getElementById("confirmPin").value

  if (!pin || pin.length < 4) {
    showErr("pinError", "PIN must be at least 4 digits")
    return
  }

  if (!confirmPin) {
    showErr("confirmError", "Please confirm your PIN")
    return
  }

  if (pin !== confirmPin) {
    showErr("confirmError", "PINs do not match")
    document.getElementById("confirmPin").classList.add("nb-err")
    return
  }

  const weak = ["1234", "0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999", "123456", "000000"]
  if (weak.includes(pin)) {
    showErr("pinError", "This PIN is too easy to guess. Please choose a stronger PIN.")
    return
  }

  document.getElementById("formSection").classList.add("nb-hidden")
  document.getElementById("loadingSection").classList.remove("nb-hidden")

  try {
    const res = await fetch(BASE_URL + "/transfer/create-pin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token()
      },
      body: JSON.stringify({ pin })
    })

    const data = await res.json()
    document.getElementById("loadingSection").classList.add("nb-hidden")

    if (!res.ok) {
      document.getElementById("formSection").classList.remove("nb-hidden")
      if (data.message && data.message.toLowerCase().includes("already")) {
        showErr("pinError", "You already have a PIN. Go back to transfer.")
      } else {
        showErr("pinError", data.message || "Failed to create PIN. Try again.")
      }
      return
    }

    document.getElementById("successSection").classList.remove("nb-hidden")

  } catch (error) {
    document.getElementById("loadingSection").classList.add("nb-hidden")
    document.getElementById("formSection").classList.remove("nb-hidden")
    showErr("pinError", "Network error. Check your connection and try again.")
  }
}

// NAVIGATION 
function goToTransfer() {
  window.location.href = "transaction.html"
}

function goToDashboard() {
  window.location.href = "transaction.html"
}




//  SIDEBAR TOGGLE
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





