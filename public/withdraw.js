
const form = document.getElementById('depositForm');
const userIdInput = document.getElementById('userId');
const amountInput = document.getElementById('amount');
const result = document.getElementById('result');
const currentBalance = document.getElementById('currentBalance');

// Set userId from URL parameter if present
const urlParams = new URLSearchParams(window.location.search);
const accountNumberFromUrl = urlParams.get('accountNumber');
if (accountNumberFromUrl) {
  userIdInput.value = accountNumberFromUrl;
  fetchUserBalance(accountNumberFromUrl );
}

// My user id change fetch diplay and show user balance
userIdInput.addEventListener('change', () => {
const accountNumber = userIdInput.value.trim();
if(accountNumber) {
  fetchUserBalance(accountNumber);

}
else {
  currentBalance.textContent = 'Enter account number to see balance';
}
});

async function fetchUserBalance(accountNumber) {
  try {
    const res = await fetch(`/users/${accountNumber}`);
    if (res.ok) {
      const user = await res.json();
      currentBalance.textContent = `Current Balance: #${user.balance.toLocaleString()}`;
    } else {
      currentBalance.textContent = 'Account not found';
    }
  } catch (error) {
    currentBalance.textContent = 'Error loading account';
    console.error('Error:', error);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const accountNumber = userIdInput.value.trim();
  const amount = amountInput.value.trim();

  if (!accountNumber || !amount) {
    showResult('Please enter both account number and amount', 'error');
    return;
  }

  try {
    const res = await fetch(`/users/${accountNumber}`, 
      {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) })
    });

      const data = await res.json();
    if (res.ok) {
    
      showResult(`Withdraw Successful!\nNew Balance: #${data.balance.toLocaleString()}`, 'success');
      amountInput.value = '';
      fetchUserBalance(accountNumber);
    } else {
      showResult('Error: Account not found', 'error');
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showResult('Network error. Please check your connection.', 'error')
    } else {
        showResult(error.message || 'Network error. Please check your connection.', 'error')
    };
    console.error('Error:', error);
  }
});

function showResult(message, type) {
  result.textContent = message;
  result.className = 'show ' + type;
}    


