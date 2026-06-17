const API_BASE_URL = window.location.origin + "/api/v1"

// ── Transfer state ──
let recipientAccountNumber = ""
let transferAmount = ""
let transferPin = ""
let isRecipientVerified = false
let accountLookupTimer = null

// ── Helpers ──
function getEl(id) {
  return document.getElementById(id)
}

function showFieldError(fieldId, message) {
  const errorEl = getEl(fieldId)
  errorEl.textContent = message
  errorEl.classList.add("show")
}

function hideFieldError(fieldId) {
  getEl(fieldId).classList.remove("show")
}

function formatNaira(value) {
  return "₦" + Number(value).toLocaleString("en-NG", { minimumFractionDigits: 2 })
}

// Wraps fetch with the shared JSON + cookie settings every endpoint needs.
function apiRequest(path, options = {}) {
  return fetch(API_BASE_URL + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  })
}

// ── Load balance ──
async function loadBalance() {
  try {
    const res = await apiRequest("/dashboard")
    const data = await res.json()
    getEl("balanceDisplay").textContent = formatNaira(data.balance)
    getEl("acctDisplay").textContent = "Acct: " + data.accountnumber
  } catch (error) {
    getEl("balanceDisplay").textContent = "ERROR"
  }
}

// ── Quick send (recent recipients) ──
async function loadQuickSend() {
  const list = getEl("quickSendList")
  try {
    const res = await apiRequest("/transactions/history")
    const data = await res.json()
    const transactions = (data && data.transactions) || []

    // Most recent people we SENT money to, de-duplicated by account number.
    const seenAccounts = new Set()
    const recentRecipients = []
    for (const txn of transactions) {
      if (txn.direction !== "debit" || !txn.counterParty) continue
      const accountNumber = txn.counterParty.accountnumber
      if (!accountNumber || seenAccounts.has(accountNumber)) continue
      seenAccounts.add(accountNumber)
      recentRecipients.push({
        name: txn.counterParty.name || "User",
        accountnumber: accountNumber,
      })
      if (recentRecipients.length === 5) break
    }

    if (recentRecipients.length === 0) {
      list.innerHTML = `<div class="nb-quick-empty">No recent recipients yet.</div>`
      return
    }

    list.innerHTML = recentRecipients
      .map(recipient => `
        <button class="nb-quick-item" onclick="quickSend('${recipient.accountnumber}')">
          <span class="nb-quick-avatar">${recipient.name.charAt(0).toUpperCase()}</span>
          <span class="nb-quick-name">${recipient.name.split(" ")[0]}</span>
        </button>
      `)
      .join("")
  } catch (error) {
    list.innerHTML = `<div class="nb-quick-empty">Couldn't load recipients.</div>`
  }
}

// Prefill the account number from a quick-send button and trigger the lookup.
function quickSend(accountNumber) {
  const input = getEl("accountnumber")
  input.value = accountNumber
  input.dispatchEvent(new Event("input"))
  input.scrollIntoView({ behavior: "smooth", block: "center" })
}

// ── Check PIN status ──
async function checkPinStatus() {
  try {
    const res = await apiRequest("/transactions/check-pin")
    const data = await res.json()
    const info = getEl("pinInfo")
    const title = getEl("pinTitle")
    const subtitle = getEl("pinSubtitle")

    if (data.hasPin) {
      title.textContent = "Enter your transfer PIN"
      subtitle.textContent = "Confirm your identity to proceed"
      info.className = "nb-pin-info info show"
      info.textContent = "Enter your 4–6 digit transfer PIN to send money"
    } else {
      title.textContent = "Create a transfer PIN"
      subtitle.textContent = "You need a PIN to send money"
      info.className = "nb-pin-info warn show"
      info.textContent = "You don't have a PIN yet. Create one now — you'll use it for all future transfers."
    }
  } catch (error) {
    // Leave the default PIN copy in place if the check fails.
  }
}

// ── Account number input ──
getEl("accountnumber").addEventListener("input", function () {
  recipientAccountNumber = this.value.replace(/\D/g, "").slice(0, 10)
  this.value = recipientAccountNumber

  hideFieldError("acctError")
  this.classList.remove("nb-input-ok", "nb-input-err")
  getEl("receiverBox").classList.remove("show")
  isRecipientVerified = false
  updateSummary()

  clearTimeout(accountLookupTimer)
  if (recipientAccountNumber.length === 10) {
    accountLookupTimer = setTimeout(() => lookupAccount(recipientAccountNumber), 600)
  }
})

async function lookupAccount(accountNumber) {
  try {
    const res = await apiRequest(`/transactions/account-name?accountnumber=${accountNumber}`)
    const data = await res.json()
    const input = getEl("accountnumber")

    if (data.success) {
      const recipientName = data.data.name
      getEl("receiverName").textContent = recipientName
      getEl("receiverAvatar").textContent = recipientName.charAt(0).toUpperCase()
      getEl("receiverBox").classList.add("show")
      input.classList.add("nb-input-ok")
      isRecipientVerified = true
      updateSummary()
    } else {
      showFieldError("acctError", data.message || "Account not found")
      input.classList.add("nb-input-err")
    }
  } catch (error) {
    showFieldError("acctError", "Network error. Try again.")
  }
}

// ── Transfer summary ──
function updateSummary() {
  const amountValue = getEl("amount").value
  const recipientName = getEl("receiverName").textContent

  if (isRecipientVerified && amountValue && Number(amountValue) > 0) {
    getEl("summaryTo").textContent = recipientName
    getEl("summaryAmount").textContent = formatNaira(amountValue)
    getEl("transferSummary").classList.add("show")
  } else {
    getEl("transferSummary").classList.remove("show")
  }
}

// ── PIN modal ──
function showPinModal() {
  hideFieldError("acctError")
  hideFieldError("amountError")

  transferAmount = getEl("amount").value

  if (!isRecipientVerified) {
    showFieldError("acctError", "Please enter a valid 10-digit account number")
    return
  }

  if (!transferAmount || Number(transferAmount) <= 0) {
    showFieldError("amountError", "Please enter a valid amount")
    return
  }

  const recipientName = getEl("receiverName").textContent
  getEl("confirmName").textContent = recipientName
  getEl("confirmAmount").textContent = formatNaira(transferAmount)

  getEl("transferSection").classList.add("nb-hidden")
  getEl("pinSection").classList.remove("nb-hidden")
  getEl("pin").value = ""
  hideFieldError("pinError")
  getEl("pin").focus()
}

function hidePinModal() {
  getEl("pinSection").classList.add("nb-hidden")
  getEl("transferSection").classList.remove("nb-hidden")
}

// ── Confirm transfer ──
async function confirmTransfer() {
  transferPin = getEl("pin").value
  hideFieldError("pinError")

  if (!transferPin || transferPin.length < 4) {
    showFieldError("pinError", "PIN must be at least 4 digits")
    return
  }

  getEl("pinSection").classList.add("nb-hidden")
  getEl("loadingSection").classList.remove("nb-hidden")
  animateLoadingSteps()

  // Give the loading animation time to play before sending the request.
  setTimeout(async () => {
    try {
      const res = await apiRequest("/transactions/transfer", {
        method: "POST",
        body: JSON.stringify({
          accountnumber: recipientAccountNumber,
          amount: Number(transferAmount),
          pin: transferPin,
        }),
      })

      const data = await res.json()
      getEl("loadingSection").classList.add("nb-hidden")

      if (!res.ok) {
        showTransferError(data.message)
        return
      }

      showTransferSuccess(data)
    } catch (error) {
      getEl("loadingSection").classList.add("nb-hidden")
      getEl("transferSection").classList.remove("nb-hidden")
      showFieldError("acctError", "Network error. Check your connection and try again.")
    }
  }, 3000)
}

// Route a failed transfer back to the screen/field that caused it.
function showTransferError(message) {
  const lowerMessage = (message || "").toLowerCase()

  if (lowerMessage.includes("pin")) {
    getEl("pinSection").classList.remove("nb-hidden")
    showFieldError("pinError", message)
  } else if (lowerMessage.includes("balance")) {
    getEl("transferSection").classList.remove("nb-hidden")
    showFieldError("amountError", message)
  } else {
    getEl("transferSection").classList.remove("nb-hidden")
    showFieldError("acctError", message || "Transfer failed. Please try again.")
  }
}

function showTransferSuccess(data) {
  const recipientName = getEl("receiverName").textContent
  getEl("successAmount").textContent = formatNaira(transferAmount)
  getEl("successName").textContent = recipientName
  getEl("successBalance").textContent = formatNaira(data.newBalance)
  getEl("successDate").textContent = new Date().toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  })
  getEl("successSection").classList.remove("nb-hidden")
  getEl("balanceDisplay").textContent = formatNaira(data.newBalance)
  loadQuickSend()
}

// ── Loading animation ──
function animateLoadingSteps() {
  const messages = [
    "Connecting to payment network...",
    "Processing your payment...",
    "Confirming transfer...",
  ]
  const stepIds = ["step1", "step2", "step3"]

  stepIds.forEach(id => {
    const stepEl = getEl(id)
    stepEl.classList.remove("active", "done")
    stepEl.querySelector(".nb-step-dot").className = "nb-step-dot"
  })

  function activateStep(index) {
    if (index > 0) {
      getEl(stepIds[index - 1]).classList.remove("active")
      getEl(stepIds[index - 1]).classList.add("done")
    }
    getEl(stepIds[index]).classList.add("active")
    getEl("loadingMsg").textContent = messages[index]
  }

  activateStep(0)
  setTimeout(() => activateStep(1), 1000)
  setTimeout(() => activateStep(2), 2000)
}

// ── Reset back to a fresh transfer ──
function resetAll() {
  getEl("successSection").classList.add("nb-hidden")
  getEl("transferSection").classList.remove("nb-hidden")
  getEl("accountnumber").value = ""
  getEl("amount").value = ""
  getEl("pin").value = ""
  getEl("receiverBox").classList.remove("show")
  getEl("transferSummary").classList.remove("show")
  getEl("accountnumber").classList.remove("nb-input-ok", "nb-input-err")
  hideFieldError("acctError")
  hideFieldError("amountError")
  hideFieldError("pinError")

  recipientAccountNumber = ""
  transferAmount = ""
  transferPin = ""
  isRecipientVerified = false
  loadBalance()
}

// ── Init ──
loadBalance()
checkPinStatus()
loadQuickSend()

// ── Sidebar (mobile) ──
function toggleSidebar() {
  getEl("sidebar").classList.toggle("active")
  getEl("overlay").classList.toggle("active")
}

// Close the sidebar after tapping a menu item on mobile.
document.querySelectorAll(".menu-item").forEach(item => {
  item.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      toggleSidebar()
    }
  })
})

// Close the sidebar with the Escape key.
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    getEl("sidebar").classList.remove("active")
    getEl("overlay").classList.remove("active")
  }
})
