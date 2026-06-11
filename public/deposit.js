const BASE_URL = window.location.origin + '/api/v1'

// TYPEWRITER ANIMATION
const typewriterTexts = [
    "Secure payment processing with 256-bit encryption",
    "Your money is protected 24/7",
    "Instant deposit - Money arrives in seconds",
    "No hidden fees - Complete transparency",
    "Bank-grade security for peace of mind"
]

let currentTextIndex = 0
let currentCharIndex = 0
let isTyping = true

function typewriter() {
    const typewriterEl = document.getElementById('typewriterText')
    const currentText = typewriterTexts[currentTextIndex]

    if (isTyping) {
        if (currentCharIndex < currentText.length) {
            typewriterEl.textContent += currentText[currentCharIndex]
            currentCharIndex++
            setTimeout(typewriter, 50)
        } else {
            // Text complete, wait before moving to next
            isTyping = false
            setTimeout(() => {
                currentTextIndex = (currentTextIndex + 1) % typewriterTexts.length
                currentCharIndex = 0
                typewriterEl.textContent = ''
                isTyping = true
                setTimeout(typewriter, 500)
            }, 3000)
        }
    }
}

// Start typewriter
typewriter()

// AMOUNT PRESETS
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault()
        const amount = btn.dataset.amount
        document.getElementById('amount').value = amount
        
        // Update active state
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        
        // Update summary
        updateSummary()
    })
})

// AMOUNT INPUT CHANGE
document.getElementById('amount').addEventListener('input', () => {
    // Remove active state from presets
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'))
    updateSummary()
})

// PAYMENT METHOD CHANGE
document.querySelectorAll('input[name="method"]').forEach(radio => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.payment-option').forEach(opt => {
            opt.classList.remove('selected')
        })
        radio.parentElement.classList.add('selected')
    })
})

// UPDATE SUMMARY
function updateSummary() {
    const amount = parseFloat(document.getElementById('amount').value) || 0
    const summaryAmount = document.getElementById('summaryAmount')
    const summaryTotal = document.getElementById('summaryTotal')

    if (amount > 0) {
        summaryAmount.textContent = '₦' + amount.toLocaleString('en-NG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
        summaryTotal.textContent = '₦' + amount.toLocaleString('en-NG', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })
    } else {
        summaryAmount.textContent = '₦0.00'
        summaryTotal.textContent = '₦0.00'
    }
}

// FORM SUBMISSION
document.getElementById('depositForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const amount = parseFloat(document.getElementById('amount').value)
    const description = document.getElementById('description').value
    const resultDiv = document.getElementById('result')
    const btnText = document.getElementById('btnText')
    const loader = document.getElementById('loader')

    // Validation
    if (!amount || amount < 100) {
        showResult('Minimum deposit is ₦100', 'error')
        return
    }

    // Show loading state
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
            body: JSON.stringify({ 
                amount: parseInt(amount),
                description: description
            })
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

// SHOW RESULT MESSAGE
function showResult(message, type) {
    const resultDiv = document.getElementById('result')
    resultDiv.textContent = message
    resultDiv.className = 'result-message ' + type
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        resultDiv.classList.remove('success', 'error')
    }, 5000)
}

// SIDEBAR FUNCTIONALITY
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar')
    const overlay = document.getElementById('overlay')
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active')
        overlay.classList.toggle('active')
    }
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
        if (sidebar && overlay) {
            sidebar.classList.remove('active')
            overlay.classList.remove('active')
        }
    }
})

// Initialize summary on page load



updateSummary()


