
const BASE_URL = window.location.origin + '/api/v1'



async function request(endpoint, method, body) {
  try {
    const res = await fetch(BASE_URL + endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
      const err = await res.json()
      showResult(err.message || 'Something went wrong', 'error')
      return
    }
    return await res.json();
  } catch (error) {
    showResult('Error: ' + error.message, 'error');
  }
}

let currentData = null
async function loadDashboard() {
  try {

const res = await fetch(`${BASE_URL}/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
   

    })
    
  const data = await res.json()

   currentData = data
  
  const avatarName = currentData.name
  const avatarLetter = avatarName.charAt(0).toUpperCase();
  // Show the uploaded profile picture if the user has one, otherwise fall back
  // to the first letter of their name.
  setAvatar(document.getElementById("avatarInitial"), currentData.profilePicture, avatarLetter);
  setAvatar(document.getElementById("avatarInitialLg"), currentData.profilePicture, avatarLetter);

  const firstName = currentData.name.split(" ")[0];
  const greetingEl = document.getElementById("greeting");
  if (greetingEl) greetingEl.textContent = `${getGreeting()}, ${firstName}`;

  const profileNameEl = document.getElementById("profileName");
  if (profileNameEl) profileNameEl.textContent =  currentData.name;

  document.querySelector("#username").textContent = `Hi, ${ currentData.name.toUpperCase()}`;
  document.querySelector("#balance").textContent = ` #${ currentData.balance.toLocaleString()} `;
  document.querySelector("#accountnumber").textContent = `Acct No: ${ currentData.accountnumber}`;
    console.log('jjjjjjjhhhh', data)
    
      



 if(data) {
 renderDashboard()
   showBalance(data)

    }

    console.log("Dashboard data:", data);
    return data;
  } catch (error) {
    console.error("Failed to load dashboard:", error);
  }
}

loadDashboard();



 
// Render an avatar element as either the uploaded image or the name initial.
function setAvatar(el, profilePicture, letter) {
  if (!el) return;
  if (profilePicture) {
    el.innerHTML = `<img src="${profilePicture}" alt="Profile picture" />`;
  } else {
    el.textContent = letter;
  }
} 

function renderDashboard() {
  const cacheUser = JSON.parse(localStorage.getItem("user"))
  console.log('this is the cache:', cacheUser)
  if(cacheUser) {
    const user = cacheUser
console.log('this is the ddduser:', user.name)
  // const avatarName = user.name
  // const avatarLetter = avatarName.charAt(0).toUpperCase();
  // // Show the uploaded profile picture if the user has one, otherwise fall back
  // // to the first letter of their name.
  // setAvatar(document.getElementById("avatarInitial"), user.profilePicture, avatarLetter);
  // setAvatar(document.getElementById("avatarInitialLg"), user.profilePicture, avatarLetter);

  // const firstName = user.name.split(" ")[0];
  // const greetingEl = document.getElementById("greeting");
  // if (greetingEl) greetingEl.textContent = `${getGreeting()}, ${firstName}`;

  // const profileNameEl = document.getElementById("profileName");
  // if (profileNameEl) profileNameEl.textContent = user.name;

  // document.querySelector("#username").textContent = `Hi, ${user.name.toUpperCase()}`;
  // document.querySelector("#balance").textContent = ` #${user.balance.toLocaleString()} `;
  // document.querySelector("#accountnumber").textContent = `Acct No: ${user.accountnumber}`;
}
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/* Profile dropdown toggle */
document.addEventListener("click", (e) => {
  const menu = document.getElementById("profileMenu");
  if (!menu) return;
  const trigger = document.getElementById("profileTrigger");

  if (trigger && trigger.contains(e.target)) {
    const isOpen = menu.classList.toggle("open");
    trigger.setAttribute("aria-expanded", isOpen);
  } else if (!menu.contains(e.target)) {
    menu.classList.remove("open");
    trigger?.setAttribute("aria-expanded", "false");
  }
});

function showDashboard() {
//   document.getElementById("loginPage").classList.add("hidden");
//   document.getElementById("signupPage").classList.add("hidden");

    fetch('main-sidebar.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById("sidebar-container").innerHTML = data;
    });
}
  document.getElementById("dashboardPage").classList.remove("hidden")
 




async function logout() {
  await fetch(BASE_URL + "/auth/logout", {
    method: "POST",
    credentials: "include"
  })
  window.location.href = "/login-user.html"
  localStorage.removeItem("user")

}

function showResult(message, type) {
  const loginResult = document.getElementById("loginResult");
  const signupResult = document.getElementById("signupResult");

  if(loginResult) {
    loginResult.textContent = message
    loginResult.className = 'show ' + type
  }
  if(signupResult) {
    signupResult.textContent = message
    signupResult.className = 'show ' + type 
  }
}

function initapp() {
  const user = JSON.parse(localStorage.getItem("user"))
  console.log('USER:', user)
  if (user) {
    showDashboard()
    loadDashboard()
    
    
loadTransactionHistory()


  } else {
    // showLogin()
  }
}
initapp()





// TRANSACRION HISTORY
async function loadTransactionHistory() {
const sections = document.querySelector(".section")
  try {

// CALL MY API FROM ROUTER
const res = await fetch(BASE_URL + "/transactions/history", {
   credentials: "include",
  headers: {
    
    contentType: "application/json",
  }
})

if(!res.ok) { 
  //  console.error("Fetch failed:", res.status);
  //     sections.innerHTML = "<p>Error loading transactions</p>"

        renderState(sections, 'empty')
}





 const data = await res.json()


     console.log("Data received:", data.transactions); 
// CONSOLE.LOG TO DEBUG MY CODE
console.log("FULL API RESPONSE:", data) 
     sections.innerHTML = ""

     if(data.transactions.length === 0) {
     renderState(sections, 'empty')
      return
     }

// Totals for Received / Sent summary cards
let totalReceived = 0
let totalSent = 0
data.transactions.forEach(t => {
  if (t.direction === 'credit') totalReceived += Number(t.amount) || 0
  if (t.direction === 'debit')  totalSent += Number(t.amount) || 0
})

const receivedEl = document.getElementById("totalReceived")
const sentEl = document.getElementById("totalSent")
if (receivedEl) receivedEl.textContent = `₦${totalReceived.toLocaleString()}`
if (sentEl) sentEl.textContent = `₦${totalSent.toLocaleString()}`

// MONEY FLOW DONUT (percentage) — same as history page
renderMoneyFlow(totalReceived, totalSent)



     
  await data.transactions.slice(0, 3).forEach(transaction => {


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
  sections.innerHTML = `<p>Error loading transactions</p>`
}


  }
 



function renderState(container, variant) {
  const states = {
    empty: {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
               <path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v6l9 4 9-4V7"/><path d="M12 11v6"/></svg>`,
      title: 'No transactions yet',
      text: 'Once you send or receive money, your activity will show up right here.'
    },
    filter: {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
               <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`,
      title: 'Nothing here',
      text: 'No transactions match this filter. Try a different one.'
    },
    error: {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
               <circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
      title: 'Could not load transactions',
      text: 'Something went wrong on our end. Please refresh and try again.'
    }
  }

  const s = states[variant] || states.empty
  container.innerHTML = `
    <div class="empty-state empty-state--${variant}">
      <div class="empty-state__icon">${s.icon}</div>
      <h3 class="empty-state__title">${s.title}</h3>
      <p class="empty-state__text">${s.text}</p>
    </div>
  `
}



const viewBalance = document.querySelector(".vieweye")
const hideBalance = document.querySelector('.hiddeneye')
function hidebalance () {

 hideBalance.addEventListener( 'click' , () => {
balance.textContent = "****"
hideBalance.classList.add('active')
viewBalance.classList.add('active')
console.log('workng fn')
 })

}
  

  

  function showBalance() {


balance.textContent = ` #${ currentData.balance.toLocaleString()} `
  viewBalance.classList.remove('active')
  hideBalance.classList.remove('active')
  console.log('not worknfg')



  }





// SIDEBAR TOGGLEF
// SIDEBAR TOGGLEF
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar')
  const overlay = document.getElementById('overlay')
  
  sidebar.classList.toggle('active')
  overlay.classList.toggle('active')
}

//  Toogle Responsive
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






































const DONUT_CIRC = 2 * Math.PI * 80 // r = 80  →  ~502.65

function renderMoneyFlow(received, sent) {
  // Grab the two coloured arcs (green = received, red = sent).
  const arcReceived = document.getElementById('arcReceived')
  const arcSent = document.getElementById('arcSent')
  // If we're on a page that doesn't have the donut, stop early so we don't crash.
  if (!arcReceived || !arcSent) return

  // STEP 1: work out the percentages with plain math.

  const total = received + sent
  const receivedPct = total ? (received / total) * 100 : 0
  const sentPct = total ? (sent / total) * 100 : 0

  // STEP 2: turn each percentage into an actual LENGTH along the ring.
  // 75% of the ring → 0.75 × 502.65 ≈ 377px of line to draw.
  const receivedLen = (receivedPct / 100) * DONUT_CIRC
  const sentLen = (sentPct / 100) * DONUT_CIRC

  // STEP 3: draw the arcs.
  // strokeDasharray = "draw this many px, then gap the rest of the ring".
  // So `${receivedLen} ${DONUT_CIRC}` means: draw the received slice, gap everything else.
  arcReceived.style.strokeDasharray = `${receivedLen} ${DONUT_CIRC}`
  arcSent.style.strokeDasharray = `${sentLen} ${DONUT_CIRC}`
  
  arcSent.style.strokeDashoffset = `-${receivedLen}`


  document.getElementById('centerReceived').textContent = `${Math.round(receivedPct)}%`
  document.getElementById('centerSent').textContent = `${Math.round(sentPct)}%`

  const naira = (n) =>
    '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  document.getElementById('legendReceived').textContent = naira(received)
  document.getElementById('legendSent').textContent = naira(sent)
}







