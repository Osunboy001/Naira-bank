const BASE_URL = "http://localhost:3000/api/v1";
const urlParams = new URLSearchParams(window.location.search)
const transactionId = urlParams.get("id")

async function getSingleHistory(transactionId) {
  try {
    const response = await fetch(`${BASE_URL}/transfer/user/history/${transactionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    const data = await response.json()
    if(!response.ok) {
      throw new Error(data.message)
    }
    
    console.log("Receipt data:", data)
    displayReceipt(data.user)  
    
  } catch(err) {
    console.log("failed to:", err)
  }
}

function displayReceipt(transaction) {
  // Fill in the values
  document.getElementById('amount').textContent = `₦${transaction.amount.toLocaleString()}`
  document.getElementById('transactionLabel').textContent = 
  
    transaction.direction === 'debit' 
      ? `Transfer to ${transaction.counterParty.name}` 
      : `Received from ${transaction.counterParty.name}`
  
  document.getElementById('reference').textContent = transaction._id
  document.getElementById('dateTime').textContent = new Date(transaction.createdAt).toLocaleString()
  document.getElementById('status').textContent = ` ${transaction.status}`
  document.getElementById('type').textContent = 'Bank Transfer'
  
  
  // From/To
  if(transaction.direction === 'debit') {
    document.getElementById('fromName').textContent = transaction.userId.name
    document.getElementById('fromAccount').textContent = transaction.userId.accountnumber
    document.getElementById('toName').textContent = transaction.counterParty.name
    document.getElementById('toAccount').textContent = transaction.counterParty.accountnumber
    document.getElementById('transactionType').textContent = 'Money sent'
  } else {
    document.getElementById('fromName').textContent = transaction.counterParty.name
    document.getElementById('fromAccount').textContent = transaction.counterParty.accountnumber
    document.getElementById('toName').textContent = transaction.userId.name
    document.getElementById('toAccount').textContent = transaction.userId.accountnumber
    document.getElementById('transactionType').textContent = 'Money Received'
  }
  
  document.getElementById('txId').textContent = transaction._id
}

getSingleHistory(transactionId)
