const BASE_URL = window.location.origin + '/api/v1'

let currentKyc = null

const form = document.getElementById('kycForm')
const formCard = document.getElementById('formCard')
const statusCard = document.getElementById('statusCard')
const messageEl = document.getElementById('kycMessage')
const submitBtn = document.getElementById('submitBtn')
const submitLabel = submitBtn.querySelector('span')
const continueBtn = document.getElementById('continueBtn')
const steps = Array.from(document.querySelectorAll('.kyc-step'))

const fields = {
  nin: document.getElementById('nin'),
  fullName: document.getElementById('fullName'),
  dateOfBirth: document.getElementById('dateOfBirth'),
  address: document.getElementById('address'),
  documentType: document.getElementById('documentType'),
  document: document.getElementById('document'),
  selfie: document.getElementById('selfie')
}

function clearMessage() {
  messageEl.textContent = ''
  messageEl.className = 'nb-field-error'
}

function showMessage(text, isError = true) {
  messageEl.textContent = text
  messageEl.className = 'nb-field-error show' + (isError ? '' : ' kyc-ok')
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function renderSteps(status) {
  const phase = status === 'verified' || status === 'pending' ? 3 : 1

  steps.forEach((step, index) => {
    const stepNumber = index + 1
    step.classList.toggle('is-active', status !== 'verified' && stepNumber === phase)
    step.classList.toggle('is-done', status === 'verified' || stepNumber < phase)
  })
}

function renderStatus(data) {
  const status = data.status || 'unverified'

  renderSteps(status)

  if (continueBtn) {
    continueBtn.classList.toggle('nb-hidden', status !== 'verified')
  }

  if (status === 'unverified') {
    statusCard.classList.add('nb-hidden')
    formCard.classList.remove('nb-hidden')
    return
  }

  statusCard.classList.remove('nb-hidden')

  const badge = document.getElementById('statusBadge')
  badge.textContent = {
    pending: 'Under review',
    verified: 'Verified',
    rejected: 'Rejected',
    unverified: 'Not verified'
  }[status] || status
  badge.className = 'kyc-badge ' + status

  const statusText = document.getElementById('statusText')
  const statusDate = document.getElementById('statusDate')

  if (status === 'pending') {
    statusText.textContent = 'We have received your KYC details and they are waiting for an admin to review them. You will be notified once a decision is made.'
    statusDate.textContent = data.submittedAt ? 'Submitted ' + formatDate(data.submittedAt) : ''
  } else if (status === 'verified') {
    statusText.textContent = 'Your identity has been verified. You now have full access to NairaBank services.'
    statusDate.textContent = data.reviewedAt ? 'Approved ' + formatDate(data.reviewedAt) : ''
  } else if (status === 'rejected') {
    statusText.textContent = 'Your last KYC submission was rejected. Please correct the details below and upload a clearer document to try again.'
    statusDate.textContent = data.reviewedAt ? 'Reviewed ' + formatDate(data.reviewedAt) : ''
  }

  const rejectionBox = document.getElementById('rejectionBox')
  if (status === 'rejected' && data.rejectionReason) {
    document.getElementById('rejectionReason').textContent = data.rejectionReason
    rejectionBox.classList.remove('nb-hidden')
  } else {
    rejectionBox.classList.add('nb-hidden')
  }

  const documentInfo = document.getElementById('documentInfo')
  const docLink = document.getElementById('docLink')
  const selfieLink = document.getElementById('selfieLink')
  const selfieSep = document.getElementById('selfieSep')

  if (data.document) {
    docLink.href = data.document
    documentInfo.classList.remove('nb-hidden')
  } else {
    documentInfo.classList.add('nb-hidden')
  }

  if (data.selfie) {
    selfieLink.href = data.selfie
    selfieLink.classList.remove('nb-hidden')
    selfieSep.classList.remove('nb-hidden')
  } else {
    selfieLink.classList.add('nb-hidden')
    selfieSep.classList.add('nb-hidden')
  }

  // The form is only editable before submission or after a rejection.
  if (status === 'pending' || status === 'verified') {
    formCard.classList.add('nb-hidden')
  } else {
    formCard.classList.remove('nb-hidden')
  }
}

function fillForm(data) {
  fields.nin.value = data.nin || ''
  fields.fullName.value = data.fullName || ''
  fields.address.value = data.address || ''
  fields.documentType.value = data.documentType || 'nin_slip'

  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth)
    if (!isNaN(dob.getTime())) {
      fields.dateOfBirth.value = dob.toISOString().slice(0, 10)
    }
  }
}

async function loadKyc() {
  try {
    const res = await fetch(BASE_URL + '/kyc', { credentials: 'include' })

    if (res.status === 401) {
      window.location.href = '/login-user.html'
      return
    }

    const data = await res.json()

    if (!res.ok) {
      showMessage(data.msg || data.message || 'Could not load your KYC details.', true)
      return
    }

    currentKyc = data
    fillForm(data)
    renderStatus(data)
  } catch (err) {
    showMessage('Network error. Check your connection and refresh the page.', true)
  }
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading
  if (submitLabel) {
    submitLabel.textContent = isLoading ? 'Submitting…' : 'Submit for verification'
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  clearMessage()

  const nin = fields.nin.value.replace(/\s+/g, '')
  const fullName = fields.fullName.value.trim()
  const dateOfBirth = fields.dateOfBirth.value
  const address = fields.address.value.trim()
  const documentFile = fields.document.files[0]
  const selfieFile = fields.selfie.files[0]

  if (!/^\d{11}$/.test(nin)) {
    showMessage('NIN must be exactly 11 digits.', true)
    fields.nin.focus()
    return
  }

  if (fullName.length < 3) {
    showMessage('Please enter the full name on your NIN.', true)
    fields.fullName.focus()
    return
  }

  if (!dateOfBirth || new Date(dateOfBirth) >= new Date()) {
    showMessage('Please enter a valid date of birth.', true)
    fields.dateOfBirth.focus()
    return
  }

  if (address.length < 5) {
    showMessage('Please enter your residential address.', true)
    fields.address.focus()
    return
  }

  const hasExistingDocument = currentKyc && currentKyc.document
  if (!documentFile && !hasExistingDocument) {
    showMessage('Please upload a clear photo or PDF of your NIN slip or ID document.', true)
    return
  }

  const formData = new FormData()
  formData.append('nin', nin)
  formData.append('fullName', fullName)
  formData.append('dateOfBirth', dateOfBirth)
  formData.append('address', address)
  formData.append('documentType', fields.documentType.value)

  if (documentFile) formData.append('document', documentFile)
  if (selfieFile) formData.append('selfie', selfieFile)

  setLoading(true)

  try {
    const res = await fetch(BASE_URL + '/kyc', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      showMessage(data.msg || data.message || 'Could not submit your KYC. Please try again.', true)
      setLoading(false)
      return
    }

    form.reset()
    fields.documentType.value = 'nin_slip'
    document.getElementById('documentLabel').textContent = 'Tap to upload your NIN slip or ID'
    document.getElementById('selfieLabel').textContent = 'Add a selfie to speed up review'
    setLoading(false)
    await loadKyc()
  } catch (err) {
    showMessage('Network error. Check your connection and try again.', true)
    setLoading(false)
  }
})

fields.document.addEventListener('change', (event) => {
  const file = event.target.files[0]
  document.getElementById('documentLabel').textContent = file ? file.name : 'Tap to upload your NIN slip or ID'
})

fields.selfie.addEventListener('change', (event) => {
  const file = event.target.files[0]
  document.getElementById('selfieLabel').textContent = file ? file.name : 'Add a selfie to speed up review'
})

loadKyc()
