const BASE_URL = window.location.origin + '/api/v1'

document.getElementById('depositForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const amount = document.getElementById('amount').value
    const description = document.getElementById('description').value
    const resultDiv = document.getElementById('result')
    const btnText = document.getElementById('btnText')
    const loader = document.getElementById('loader')

    if (!amount || amount < 100) {
        showResult('Minimum deposit is ₦100', 'error')
        return
    }

    // Show loading
    btnText.style.display = 'none'
    loader.style.display = 'inline'

    try {
        // Initialize payment
        const response = await fetch(`${BASE_URL}/deposit/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ amount: parseInt(amount) })
        })

        const data = await response.json()

        if (!response.ok) {
            showResult(data.message || 'Payment initialization failed', 'error')
            btnText.style.display = 'inline'
            loader.style.display = 'none'
            return
        }

        // Redirect to Paystack
        if (data.data && data.data.authorization_url) {
            window.location.href = data.data.authorization_url
        } else {
            showResult('Failed to get payment URL', 'error')
            btnText.style.display = 'inline'
            loader.style.display = 'none'
        }

    } catch (error) {
        showResult('Error: ' + error.message, 'error')
        btnText.style.display = 'inline'
        loader.style.display = 'none'
    }
})

function showResult(message, type) {
    const resultDiv = document.getElementById('result')
    resultDiv.textContent = message
    resultDiv.className = 'result ' + type
    
    setTimeout(() => {
        resultDiv.className = 'result'
    }, 5000)
}



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