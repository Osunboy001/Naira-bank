const BASE_URL = window.location.origin + '/api/v1'

// ── STATE ──
let pin = []
let confirmPin = []
let stage = 'pin' // 'pin' | 'confirm'

let accountNumberValue = ''  // raw account number for copy
let balanceValue = 0         // raw balance for show/hide
let balanceShown = false

// ── ACCOUNT INFO CARD ──
function formatNaira(amount) {
  const n = Number(amount) || 0
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getInitials(name) {
  if (!name) return '--'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] || ''
  const second = parts[1]?.[0] || ''
  return (first + second).toUpperCase() || '--'
}

async function loadAccountInfo() {
  try {
    const res = await fetch(BASE_URL + '/dashboard', { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to load account')
    const data = await res.json()

    accountNumberValue = data.accountnumber || ''
    balanceValue = data.balance || 0

    document.getElementById('acctName').textContent = data.name || 'NairaBank User'
    document.getElementById('acctRole').textContent = data.role || 'user'
    document.getElementById('acctEmail').textContent = data.email || '—'
    document.getElementById('acctNumber').textContent = accountNumberValue || '—'

    // Avatar: profile picture if present, otherwise initials
    const avatar = document.getElementById('acctAvatar')
    if (data.profilePicture) {
      avatar.innerHTML = `<img src="${data.profilePicture}" alt="Profile picture" />`
    } else {
      avatar.textContent = getInitials(data.name)
    }
  } catch (err) {
    document.getElementById('acctName').textContent = 'Could not load account'
  }
}

// ── PROFILE PICTURE UPLOAD ──
function setAvatarImage(src) {
  const avatar = document.getElementById('acctAvatar')
  avatar.innerHTML = `<img src="${src}" alt="Profile picture" />`
}

function setAvatarHint(msg, isError) {
  const hint = document.getElementById('avatarHint')
  hint.textContent = msg || ''
  hint.className = 'nb-avatar-hint' + (isError ? ' nb-err' : '')
}

async function uploadProfilePicture(file) {
  if (!file) return

  if (!file.type.startsWith('image/')) {
    setAvatarHint('Please choose an image file.', true)
    return
  }
  // Limit to 5MB so we don't try to upload huge files
  if (file.size > 5 * 1024 * 1024) {
    setAvatarHint('Image is too large. Max size is 5MB.', true)
    return
  }

  const avatar = document.getElementById('acctAvatar')
  avatar.classList.add('nb-uploading')
  setAvatarHint('Uploading…', false)

  // Show an instant local preview while the upload is in flight
  const previewUrl = URL.createObjectURL(file)
  setAvatarImage(previewUrl)

  const formData = new FormData()
  formData.append('profilePicture', file)

  try {
    const res = await fetch(BASE_URL + '/profile-picture', {
      method: 'PUT',
      credentials: 'include',
      body: formData
    })
    const data = await res.json()

    if (!res.ok) {
      setAvatarHint(data.message || 'Upload failed. Try again.', true)
      avatar.classList.remove('nb-uploading')
      loadAccountInfo() // restore previous avatar
      return
    }

    setAvatarImage(data.profilePicture)
    setAvatarHint('Profile picture updated', false)
    setTimeout(() => setAvatarHint('', false), 2500)
  } catch (err) {
    setAvatarHint('Network error. Try again.', true)
    loadAccountInfo()
  } finally {
    avatar.classList.remove('nb-uploading')
    URL.revokeObjectURL(previewUrl)
  }
}

// Copy account number to clipboard
async function copyAccountNumber() {
  if (!accountNumberValue) return
  const btn = document.getElementById('copyAcctBtn')
  try {
    await navigator.clipboard.writeText(accountNumberValue)
  } catch {
    // Fallback for older browsers / non-secure contexts
    const tmp = document.createElement('textarea')
    tmp.value = accountNumberValue
    document.body.appendChild(tmp)
    tmp.select()
    document.execCommand('copy')
    document.body.removeChild(tmp)
  }
  btn.classList.add('copied')
  setTimeout(() => btn.classList.remove('copied'), 1200)
}

// Show / hide balance
function toggleBalance() {
  balanceShown = !balanceShown
  const el = document.getElementById('acctBalance')
  const eye = document.getElementById('eyeIcon')
  if (balanceShown) {
    el.textContent = formatNaira(balanceValue)
    // eye-off icon
    eye.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
  } else {
    el.textContent = '••••••'
    // eye icon
    eye.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
  }
}

// ── HELPERS ──
function showErr(msg) {
  const el = document.getElementById('pinError')
  el.textContent = msg
  el.classList.add('show')
}

function hideErr() {
  document.getElementById('pinError').classList.remove('show')
}

function setMatchHint(msg, type) {
  const hint = document.getElementById('matchHint')
  hint.textContent = msg
  hint.className = 'nb-match-hint' + (type ? ' ' + type : '')
}

// ── DOT RENDERING ──
function renderDots(displayId, filledCount) {
  const dots = document.querySelectorAll(`#${displayId} .nb-dot`)
  dots.forEach((dot, i) => {
    if (i < filledCount) {
      dot.classList.add('nb-filled')
    } else {
      dot.classList.remove('nb-filled')
    }
  })
}

function updateDisplays() {
  const pinDisplay = document.getElementById('pinDisplay')
  const confirmDisplay = document.getElementById('confirmDisplay')

  renderDots('pinDisplay', pin.length)
  renderDots('confirmDisplay', confirmPin.length)

  // Active / done states
  if (stage === 'pin') {
    pinDisplay.classList.add('nb-active')
    pinDisplay.classList.remove('nb-done')
    confirmDisplay.classList.remove('nb-active', 'nb-done')
  } else {
    pinDisplay.classList.remove('nb-active')
    pinDisplay.classList.add('nb-done')
    confirmDisplay.classList.add('nb-active')
    confirmDisplay.classList.remove('nb-done')
  }
}

// ── KEYPAD HANDLER ──
function handleKey(key) {
  hideErr()

  if (key === 'back') {
    if (stage === 'pin') {
      pin.pop()
    } else {
      if (confirmPin.length === 0) {
        // Go back to PIN stage
        stage = 'pin'
        setMatchHint('', '')
      } else {
        confirmPin.pop()
      }
    }
    updateDisplays()
    return
  }

  // Digit key
  if (stage === 'pin') {
    if (pin.length >= 4) return
    pin.push(key)
    updateDisplays()

    if (pin.length === 4) {
      // Weak PIN check early (optional UX)
      const weak = ['1234','0000','1111','2222','3333','4444','5555','6666','7777','8888','9999']
      if (weak.includes(pin.join(''))) {
        showErr('This PIN is too easy to guess. Please choose a different PIN.')
        pin = []
        updateDisplays()
        return
      }
      // Advance to confirm stage
      setTimeout(() => {
        stage = 'confirm'
        updateDisplays()
      }, 180)
    }
  } else {
    if (confirmPin.length >= 4) return
    confirmPin.push(key)
    updateDisplays()

    if (confirmPin.length === 4) {
      if (confirmPin.join('') === pin.join('')) {
        setMatchHint('PINs match', 'ok')
      } else {
        setMatchHint('PINs do not match', 'no')
        // Shake effect then reset confirm
        shakeDisplay('confirmDisplay')
        setTimeout(() => {
          confirmPin = []
          updateDisplays()
          setMatchHint('', '')
        }, 500)
      }
    } else {
      setMatchHint('', '')
    }
  }
}

function shakeDisplay(id) {
  const el = document.getElementById(id)
  el.style.transition = 'transform 0.08s'
  const steps = [6, -6, 4, -4, 2, -2, 0]
  let i = 0
  const next = () => {
    if (i >= steps.length) { el.style.transform = ''; return }
    el.style.transform = `translateX(${steps[i]}px)`
    i++
    setTimeout(next, 60)
  }
  next()
}

// ── BIND KEYPAD ──
document.getElementById('keypad').addEventListener('click', (e) => {
  const btn = e.target.closest('.nb-key')
  if (!btn) return

  const key = btn.dataset.key
  if (!key) return

  // Press animation
  btn.classList.add('nb-press')
  setTimeout(
    
    () => btn.classList.remove('nb-press'), 120)

  handleKey(key)
})

// ── CHANGE PIN ──
async function changePin() {
  hideErr()
  setMatchHint('', '')

  const password = document.getElementById('passwordInput').value.trim()

  if (!password) {
    showErr('Please enter your account password to confirm your identity.')
    return
  }

  if (pin.length < 4) {
    showErr('Please enter a new 4-digit PIN.')
    return
  }

  if (confirmPin.length < 4 || confirmPin.join('') !== pin.join('')) {
    showErr('Please confirm your new PIN before continuing.')
    return
  }

  document.getElementById('formSection').classList.add('nb-hidden')
  document.getElementById('loadingSection').classList.remove('nb-hidden')

  try {
    const res = await fetch(BASE_URL + '/transactions/change-pin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, newPin: pin.join('') })
    })

    const data = await res.json()
    document.getElementById('loadingSection').classList.add('nb-hidden')

    if (!res.ok) {
      document.getElementById('formSection').classList.remove('nb-hidden')
      showErr(data.message || 'Failed to update PIN. Try again.')
      return
    }

    document.getElementById('successSection').classList.remove('nb-hidden')

  } catch (err) {
    document.getElementById('loadingSection').classList.add('nb-hidden')
    document.getElementById('formSection').classList.remove('nb-hidden')
    showErr('Network error. Check your connection and try again.')
  }
}

// ── NAVIGATION ──
function goToTransfer() {
  window.location.href = 'transaction.html'
}

function goToDashboard() {
  window.location.href = 'transaction.html'
}

// ── SIDEBAR TOGGLE ──
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar')
  const overlay = document.getElementById('overlay')
  if (!sidebar || !overlay) return
  sidebar.classList.toggle('active')
  overlay.classList.toggle('active')
}

document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 768) toggleSidebar()
  })
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const sidebar = document.getElementById('sidebar')
    const overlay = document.getElementById('overlay')
    if (sidebar) sidebar.classList.remove('active')
    if (overlay) overlay.classList.remove('active')
  }
})

// ── KEYBOARD SUPPORT (physical keyboard) ──
// Only drive the keypad when the password field is NOT focused,
// so typing the password doesn't fill the PIN dots.
document.addEventListener('keydown', (e) => {
  if (document.activeElement === document.getElementById('passwordInput')) return
  if (e.key >= '0' && e.key <= '9') handleKey(e.key)
  if (e.key === 'Backspace') handleKey('back')
})

// ── ACCOUNT CARD BINDINGS ──
document.getElementById('copyAcctBtn').addEventListener('click', copyAccountNumber)
document.getElementById('toggleBalanceBtn').addEventListener('click', toggleBalance)

// Profile picture: button opens the hidden file input, then upload on pick
document.getElementById('avatarEditBtn').addEventListener('click', () => {
  document.getElementById('avatarInput').click()
})
document.getElementById('avatarInput').addEventListener('change', (e) => {
  const file = e.target.files[0]
  uploadProfilePicture(file)
  e.target.value = '' // allow re-picking the same file
})

// ── INIT ──
updateDisplays()
loadAccountInfo()
