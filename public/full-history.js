const BASE_URL = window.location.origin + '/api/v1'

// Should show ID, NOT undefined!
let allTransactions = []

// FILTER FUNCTION
function filterTransactions(type, event) {
  let filtered = allTransactions

  if(type === 'sent') {
    filtered = allTransactions.filter((t) => t.direction === 'debit')
  } else if(type === 'received') {
    filtered = allTransactions.filter((t) => t.direction === 'credit')
  }
  // if type === 'all', show everything

  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active')
  })
  event.target.classList.add('active')

  // Display filtered
  displayTransactions(filtered)
}

// DISPLAY FUNCTION
function displayTransactions(transactions) {
  const sections = document.querySelector('.section')
  sections.innerHTML = ""

  if(transactions.length === 0) {
    sections.innerHTML = "<p style='text-align:center;color:#999;padding:20px;'>No transactions found</p>"
    return
  }

  transactions.forEach(transaction => {
    let message
    let amount

    if(transaction.direction === 'debit') {
      message = `Transfer ₦${transaction.amount} to ${transaction.counterParty.name.toUpperCase()}`
      amount = `-₦${transaction.amount}`
    } else if(transaction.direction === 'credit') {
      message = `Received ₦${transaction.amount} from ${transaction.counterParty.name}`
      amount = `+₦${transaction.amount}`
    }

    sections.innerHTML += `
      <div class="toAmount">
        <div>
          <a class="view" href="/transaction-detail.html?id=${transaction.transactionId}">View</a>
         

          <h5>${message}</h5>
        </div>
        <h3>${amount}</h3>
      </div>
      <div class="dateStatus">
        <h5 class="date">${new Date(transaction.date).toLocaleString()}</h5>
        <h4 class="status">${transaction.status}</h4>
      </div>
      <hr style="margin: 15px 0; border: none; border-top: 1px solid #eee;">
    `
  })
}

// MONEY FLOW DONUT (Received vs Sent)
const DONUT_CIRC = 2 * Math.PI * 80 // r = 80  →  ~502.65

function renderMoneyFlow(transactions) {
  let received = 0
  let sent = 0

  transactions.forEach(t => {
    const amt = Number(t.amount) || 0
    if (t.direction === 'credit') received += amt
    else if (t.direction === 'debit') sent += amt
  })

  const total = received + sent
  const receivedPct = total ? (received / total) * 100 : 0
  const sentPct = total ? (sent / total) * 100 : 0

  // Arc lengths along the circle
  const receivedLen = (receivedPct / 100) * DONUT_CIRC
  const sentLen = (sentPct / 100) * DONUT_CIRC

  const arcReceived = document.getElementById('arcReceived')
  const arcSent = document.getElementById('arcSent')

  // Received arc starts at the top
  arcReceived.style.strokeDasharray = `${receivedLen} ${DONUT_CIRC}`
  // Sent arc starts right after the received arc ends
  arcSent.style.strokeDasharray = `${sentLen} ${DONUT_CIRC}`
  arcSent.style.strokeDashoffset = `-${receivedLen}`

  // Center (inside the ring) shows the % share; legend (outside) shows the amounts
  document.getElementById('centerReceived').textContent = `${Math.round(receivedPct)}%`
  document.getElementById('centerSent').textContent = `${Math.round(sentPct)}%`
  document.getElementById('legendReceived').textContent = formatNaira(received)
  document.getElementById('legendSent').textContent = formatNaira(sent)
}

function formatNaira(value) {
  return '₦' + Number(value).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// LOAD TRANSACTIONS
async function loadTransactionHistory() {
  try {
    const sections = document.querySelector('.section')

    const res = await fetch(BASE_URL + "/transactions/history", {
      credentials: "include",
      headers: {
        contentType: "application/json",
      }
    })

    if(!res.ok) {
      sections.innerHTML = "<p>Error loading transactions</p>"
      return
    }

    const data = await res.json()

    if(data.transactions.length === 0) {
      sections.innerHTML = "<p>No transactions found</p>"
      return
    }

    // STORE ALL
    allTransactions = data.transactions

    // DISPLAY ALL BY DEFAULT
    displayTransactions(allTransactions)

    // DRAW MONEY FLOW DONUT
    renderMoneyFlow(allTransactions)

  } catch (error) {
    console.error("Error:", error)
    const sections = document.querySelector('.section')
    sections.innerHTML = `<p>Error loading transactions</p>`
  }
}

// Load when page opens
loadTransactionHistory()

// SIDEBAR TOGGLE
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