

const BASE_URL = 'http://localhost:3000/api/v1'







async function loadTransactionHistory() {

  try {
const sections = document.querySelector('.section')
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



     
  await data.transactions.forEach(transaction => {


   console.log('my trans',transaction.amount)
   console.log('my trans',transaction.date)
   console.log('trans', transaction.direction)





   
   console.log('my trans',transaction.userId.name)
  
   console.log('my trans',transaction.amount)
   console.log('my trans',transaction.date)
   console.log('trans', transaction.direction)
// Adding boolean value to both credit and debit side
let message ;
let amount;
if(transaction.direction === 'debit') {
  message = `Transfer ₦${transaction.amount} to ${transaction.counterParty.name.toUpperCase()}`
}
 if ( transaction.direction === 'credit')  {
message = `Received ₦${transaction.amount} from ${transaction.counterParty.name}`
}
 


//Debit amount
if(transaction.direction === 'debit') {
   amount = `-#${transaction.amount}`

}
 if ( transaction.direction === 'credit')  {
amount = `+#${transaction.amount}`
}



    sections.innerHTML += `
    
    <a class="view" style="font-size: 8px;"href="/transaction-detail.html?id=${transaction.transactionId}">View</a>

   <div class="toAmount">
    
   <h5> ${message}</h5>


     <h3 >${amount}</h3>
   </div>

    <div class="dateStatus">
     <h5 class="date">${new Date(transaction.date).toLocaleString()}</h5>
     <h4 class="status">${transaction.status}</h4>

     
    </div>`
})




// 
}
catch (error) {
  console.error("Error fetching transactions:", error);
  sections.innerHTML = `<p>Error loading transactions   ${error.message}</p>`
}





  }
 
  loadTransactionHistory()


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