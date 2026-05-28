const BASE_URL = 'http://localhost:3000/api/v1'

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
          <a class="view" href="/transaction-detail.html?id=${transaction._id}">View</a>
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

// LOAD TRANSACTIONS
async function loadTransactionHistory() {
  try {
    const sections = document.querySelector('.section')

    const res = await fetch(BASE_URL + "/transfer/history", {
      headers: {
        credentials: "include",
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