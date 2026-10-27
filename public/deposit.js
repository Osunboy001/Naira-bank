const BASE_URL = window.location.origin + '/api/v1'

// ── HELPERS ──
function formatNaira(amount) {
    const n = Number(amount) || 0
    return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── TODAY'S DATE ──
function setToday() {
    const el = document.getElementById('todayDate')
    if (!el) return
    const now = new Date()
    el.textContent = now.toLocaleDateString('en-NG', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
}

// ── BALANCE + EYE TOGGLE ──
let currentBalance = 0
let balanceHidden = false

function renderBalance() {
    const el = document.getElementById('balanceAmount')
    if (!el) return
    if (balanceHidden) {
        el.textContent = '₦••••••'
        el.classList.add('is-hidden')
    } else {
        el.textContent = formatNaira(currentBalance)
        el.classList.remove('is-hidden')
    }
}

async function loadBalance() {
    const el = document.getElementById('balanceAmount')
    if (!el) return
    try {
        const res = await fetch(BASE_URL + '/dashboard', { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to load balance')
        const data = await res.json()
        currentBalance = data.balance || 0
    } catch (err) {
        currentBalance = 0
    }
    renderBalance()
}

// EYE TOGGLE
const balanceEye = document.getElementById('balanceEye')
if (balanceEye) {
    balanceEye.addEventListener('click', () => {
        balanceHidden = !balanceHidden
        balanceEye.querySelector('i').className = balanceHidden ? 'fas fa-eye-slash' : 'fas fa-eye'
        balanceEye.setAttribute('aria-label', balanceHidden ? 'Show balance' : 'Hide balance')
        balanceEye.setAttribute('aria-pressed', String(balanceHidden))
        renderBalance()
    })
}

// ── AMOUNT PRESETS ──
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault()
        document.getElementById('amount').value = btn.dataset.amount
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        updateSummary()
    })
})

// ── AMOUNT INPUT CHANGE ──
document.getElementById('amount').addEventListener('input', () => {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'))
    updateSummary()
})

// ── UPDATE SUMMARY ──
function updateSummary() {
    const amount = parseFloat(document.getElementById('amount').value) || 0
    document.getElementById('summaryAmount').textContent = formatNaira(amount)
    document.getElementById('summaryTotal').textContent = formatNaira(amount)
}

// ── FORM SUBMISSION (Paystack) ──
document.getElementById('depositForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const amount = parseFloat(document.getElementById('amount').value)
    const btnText = document.getElementById('btnText')
    const loader = document.getElementById('loader')

    // Validation
    if (!amount || amount < 100) {
        showResult('Minimum deposit is ₦100', 'error')
        return
    }

    // Loading state
    btnText.style.display = 'none'
    loader.style.display = 'inline'

    try {
        const response = await fetch(`${BASE_URL}/deposit/initialize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ amount: parseInt(amount) })
        })

        const data = await response.json()

        if (!response.ok) {
            showResult(data.message || 'Payment initialization failed', 'error')
            resetButton()
            return
        }

        // Redirect to Paystack
        if (data.data && data.data.authorization_url) {
            window.location.href = data.data.authorization_url
        } else {
            showResult(data.msg || data.message || 'Failed to get payment URL', 'error')
            resetButton()
        }
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showResult('Network error. Please check your connection.', 'error')
        } else {
            showResult(error.message || 'Network error. Please check your connection.', 'error')
        }
        resetButton()
    }
})

function resetButton() {
    document.getElementById('btnText').style.display = 'inline'
    document.getElementById('loader').style.display = 'none'
}

// ── RESULT MESSAGE ──
function showResult(message, type) {
    const resultDiv = document.getElementById('result')
    resultDiv.textContent = message
    resultDiv.className = 'result-message ' + type
    setTimeout(() => {
        resultDiv.classList.remove('success', 'error')
    }, 5000)
}

// ── INIT ──
setToday()
loadBalance()
updateSummary()
