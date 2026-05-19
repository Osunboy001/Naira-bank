const BASE_URL ="http://localhost:3000/api/v1"

let accountnumber = ""
let amount = ""
let pin = ""
let receiverConfirmed = false
let acctTimer = null

function token() { return localStorage.getItem("token") }
function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token()
  }
}

function showErr(id, msg) {
  const el = document.getElementById(id)
  el.textContent = msg
  el.classList.add("show")
}

function hideErr(id) {
  document.getElementById(id).classList.remove("show")
}

function fmt(n) {
  return "₦" + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })
}

// ── LOAD BALANCE ──
async function loadBalance() {
  try {
    const res = await fetch(BASE_URL + "/dashboard", {
      headers: { "Authorization": "Bearer " + token() }
    })
    const data = await res.json()
    document.getElementById("balanceDisplay").textContent = fmt(data.balance)
    document.getElementById("acctDisplay").textContent = "Acct: " + data.accountnumber
  } catch (e) {
    document.getElementById("balanceDisplay").textContent = "ERROR"
  }
}

//  CHECK PIN STATUS 
async function checkPinStatus() {
  try {
    const res = await fetch(BASE_URL + "/transfer/check-pin", {
      headers: authHeaders()
    })
    const data = await res.json()
    const info = document.getElementById("pinInfo")
    const title = document.getElementById("pinTitle")
    const sub = document.getElementById("pinSubtitle")

    if (data.hasPin) {
      title.textContent = "Enter your transfer PIN"
      sub.textContent = "Confirm your identity to proceed"
      info.className = "nb-pin-info info show"
      info.textContent = "Enter your 4–6 digit transfer PIN to send money"
    } else {
      title.textContent = "Create a transfer PIN"
      sub.textContent = "You need a PIN to send money"
      info.className = "nb-pin-info warn show"
      info.textContent = "You don't have a PIN yet. Create one now  you'll use it for all future transfers."
    }
  } catch (e) {}
}

//  ACCOUNT NUMBER INPUT 
document.getElementById("accountnumber").addEventListener("input", function () {
  accountnumber = this.value.replace(/\D/g, "").slice(0, 10)
  this.value = accountnumber

  hideErr("acctError")
  this.classList.remove("nb-input-ok", "nb-input-err")
  document.getElementById("receiverBox").classList.remove("show")
  receiverConfirmed = false
  updateSummary()

  clearTimeout(acctTimer)
  if (accountnumber.length === 10) {
    acctTimer = setTimeout(() => lookupAccount(accountnumber), 600)
  }
})

async function lookupAccount(acct) {
  try {
    const res = await fetch(`${BASE_URL}/transfer/account-name?accountnumber=${acct}`, {
      // I CREATED A FUNCTION FOR MY TOKEN
      headers: { "Authorization": "Bearer " + token() }
    })
    const data = await res.json()
    const input = document.getElementById("accountnumber")

    if (data.success) {
      const name = data.data.name
      document.getElementById("receiverName").textContent = name
      document.getElementById("receiverAvatar").textContent = name.charAt(0).toUpperCase()
      document.getElementById("receiverBox").classList.add("show")
      input.classList.add("nb-input-ok")
      receiverConfirmed = true
      updateSummary()
    } else {
      showErr("acctError", data.message || "Account not found")
      input.classList.add("nb-input-err")
    }
  } catch (e) {
    showErr("acctError", "Network error. Try again.")
  }
}

//  UPDATE SUMMARY 
function updateSummary() {
  const amtVal = document.getElementById("amount").value
  const name = document.getElementById("receiverName").textContent

  if (receiverConfirmed && amtVal && Number(amtVal) > 0) {
    document.getElementById("summaryTo").textContent = name
    document.getElementById("summaryAmount").textContent = fmt(amtVal)
    document.getElementById("transferSummary").classList.add("show")
  } else {
    document.getElementById("transferSummary").classList.remove("show")
  }
}

//  SHOW PIN MODAL 
function showPinModal() {
  hideErr("acctError")
  hideErr("amountError")

  amount = document.getElementById("amount").value

  if (!receiverConfirmed) {
    showErr("acctError", "Please enter a valid 10-digit account number")
    return
  }

  if (!amount || Number(amount) <= 0) {
    showErr("amountError", "Please enter a valid amount")
    return
  }

  const name = document.getElementById("receiverName").textContent
  document.getElementById("confirmName").textContent = name
  document.getElementById("confirmAmount").textContent = fmt(amount)

  document.getElementById("transferSection").classList.add("nb-hidden")
  document.getElementById("pinSection").classList.remove("nb-hidden")
  document.getElementById("pin").value = ""
  hideErr("pinError")
  document.getElementById("pin").focus()
}

//  HIDE PIN MODAL 
function hidePinModal() {
  document.getElementById("pinSection").classList.add("nb-hidden")
  document.getElementById("transferSection").classList.remove("nb-hidden")
}

// CONFIRM TRANSFER 
async function confirmTransfer() {
  pin = document.getElementById("pin").value
  hideErr("pinError")

  if (!pin || pin.length < 4) {
    showErr("pinError", "PIN must be at least 4 digits")
    return
  }

  document.getElementById("pinSection").classList.add("nb-hidden")
  document.getElementById("loadingSection").classList.remove("nb-hidden")

  // animate loading steps
  animateLoadingSteps()

  // wait 3 seconds then send
  setTimeout(async () => {
    try {
      const res = await fetch(BASE_URL + "/transfer/transfer", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          accountnumber,
          amount: Number(amount),
          pin
        })
      })

      const data = await res.json()
      document.getElementById("loadingSection").classList.add("nb-hidden")

      if (!res.ok) {
        // show error back on right screen
        if (data.message && data.message.toLowerCase().includes("pin")) {
          document.getElementById("pinSection").classList.remove("nb-hidden")
          showErr("pinError", data.message)
        } else if (data.message && data.message.toLowerCase().includes("balance")) {
          document.getElementById("transferSection").classList.remove("nb-hidden")
          showErr("amountError", data.message)
        } else {
          document.getElementById("transferSection").classList.remove("nb-hidden")
          showErr("acctError", data.message || "Transfer failed. Please try again.")
        }
        return
      }

      // SUCCESS
      const name = document.getElementById("receiverName").textContent
      document.getElementById("successAmount").textContent = fmt(amount)
      document.getElementById("successName").textContent = name
      document.getElementById("successBalance").textContent = fmt(data.newBalance)
      document.getElementById("successDate").textContent = new Date().toLocaleDateString("en-NG", {
        day: "numeric", month: "short", year: "numeric"
      })
      document.getElementById("successSection").classList.remove("nb-hidden")
      document.getElementById("balanceDisplay").textContent = fmt(data.newBalance)

    } catch (err) {
      document.getElementById("loadingSection").classList.add("nb-hidden")
      document.getElementById("transferSection").classList.remove("nb-hidden")
      showErr("acctError", "Network error. Check your connection and try again.")
    }
  }, 3000)
}

// MY LOADING ANIMATION 
function animateLoadingSteps() {
  const msgs = [
    "Connecting to payment network...",
    "Processing your payment...",
    "Confirming transfer..."
  ]
  const steps = ["step1", "step2", "step3"]

  steps.forEach(id => {
    const el = document.getElementById(id)
    el.classList.remove("active", "done")
    el.querySelector(".nb-step-dot").className = "nb-step-dot"
  })

  let current = 0

  function activate(i) {
    if (i > 0) {
      document.getElementById(steps[i - 1]).classList.remove("active")
      document.getElementById(steps[i - 1]).classList.add("done")
    }
    document.getElementById(steps[i]).classList.add("active")
    document.getElementById("loadingMsg").textContent = msgs[i]
  }

  activate(0)
  setTimeout(() => activate(1), 1000)
  setTimeout(() => activate(2), 2000)
}

// RESET 
function resetAll() {
  document.getElementById("successSection").classList.add("nb-hidden")
  document.getElementById("transferSection").classList.remove("nb-hidden")
  document.getElementById("accountnumber").value = ""
  document.getElementById("amount").value = ""
  document.getElementById("pin").value = ""
  document.getElementById("receiverBox").classList.remove("show")
  document.getElementById("transferSummary").classList.remove("show")
  document.getElementById("accountnumber").classList.remove("nb-input-ok", "nb-input-err")
  hideErr("acctError"); hideErr("amountError"); hideErr("pinError")
  accountnumber = ""; amount = ""; pin = ""
  receiverConfirmed = false
  loadBalance()
}

// INIT 
loadBalance()
checkPinStatus()