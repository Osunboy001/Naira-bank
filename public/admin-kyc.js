const BASE_URL = window.location.origin + '/api/v1'

let usersById = {}
let currentReviewId = null

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar')
  const overlay = document.getElementById('overlay')

  sidebar.classList.toggle('active')
  overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none'
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('sidebar').classList.remove('active')
    document.getElementById('overlay').style.display = 'none'

    const modal = document.getElementById('kycModal')
    if (!modal.classList.contains('nb-hidden')) {
      closeKycModal()
    }
  }
})

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('us')
  window.location.href = '/index.html'
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function request(url, options = {}) {
  const res = await fetch(BASE_URL + url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options
  })

  if (res.status === 401) {
    window.location.href = '/index.html'
    return null
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.msg || data.message || 'Something went wrong')
  }

  return data
}

async function loadStats() {
  try {
    const data = await request('/kyc/admin/stats')
    if (!data) return

    document.getElementById('kycPending').textContent = data.pending
    document.getElementById('kycVerified').textContent = data.verified
    document.getElementById('kycRejected').textContent = data.rejected
    document.getElementById('kycUnverified').textContent = data.unverified
  } catch (err) {
    // Stats failing should not block the review table.
  }
}

async function loadKyc() {
  const tbody = document.getElementById('kycUsers')
  const empty = document.getElementById('kycEmpty')
  const countEl = document.getElementById('kycCount')

  tbody.innerHTML = '<tr><td colspan="7">Loading…</td></tr>'
  empty.classList.add('nb-hidden')

  try {
    const status = document.getElementById('statusFilter').value
    const query = status === 'all' ? '' : '?status=' + encodeURIComponent(status)
    const data = await request('/kyc/admin/users' + query)

    if (!data) return

    usersById = {}
    tbody.innerHTML = ''

    if (!data.users.length) {
      empty.classList.remove('nb-hidden')
      countEl.textContent = ''
      return
    }

    countEl.textContent = data.count + (data.count === 1 ? ' submission' : ' submissions')

    data.users.forEach(user => {
      usersById[user._id] = user
      const kyc = user.kyc || {}
      const status = kyc.status || 'unverified'

      const docLinks = []
      if (kyc.document) {
        docLinks.push(`<a href="${escapeHtml(kyc.document)}" target="_blank" rel="noopener">View ID document</a>`)
      }
      if (kyc.selfie) {
        docLinks.push(`<a href="${escapeHtml(kyc.selfie)}" target="_blank" rel="noopener">View selfie</a>`)
      }

      const actions = status === 'unverified'
        ? '—'
        : `<button class="btn view" onclick="openKycModal('${user._id}')">Review</button>`

      tbody.innerHTML += `
        <tr>
          <td>
            <div class="kyc-user-cell">
              <strong>${escapeHtml(user.name)}</strong>
              <span>${escapeHtml(user.email || '')}</span>
              <span>Acct: ${escapeHtml(user.accountnumber || '—')}</span>
            </div>
          </td>
          <td>${escapeHtml(kyc.nin || '—')}</td>
          <td>${formatDate(kyc.dateOfBirth)}</td>
          <td>
            <div class="kyc-doc-links">
              ${docLinks.length ? docLinks.join('') : '—'}
            </div>
          </td>
          <td>${formatDateTime(kyc.submittedAt)}</td>
          <td>
            <span class="kyc-badge ${escapeHtml(status)}">${escapeHtml(status)}</span>
            ${status === 'rejected' && kyc.rejectionReason
              ? `<span class="kyc-reason">${escapeHtml(kyc.rejectionReason)}</span>`
              : ''}
          </td>
          <td>${actions}</td>
        </tr>
      `
    })
  } catch (err) {
    tbody.innerHTML = ''
    empty.textContent = err.message || 'Could not load KYC submissions.'
    empty.classList.remove('nb-hidden')
    countEl.textContent = ''
  }
}

const DOCUMENT_LABELS = {
  nin_slip: 'NIN Slip',
  national_id: 'National ID Card',
  drivers_license: "Driver's License",
  passport: 'International Passport'
}

function renderPreview(url, label) {
  if (!url) return ''

  const safeUrl = escapeHtml(url)
  const isPdf = /\.pdf(\?|$)/i.test(url)
  const media = isPdf
    ? `<iframe src="${safeUrl}" title="${escapeHtml(label)}" loading="lazy"></iframe>`
    : `<a href="${safeUrl}" target="_blank" rel="noopener"><img src="${safeUrl}" alt="${escapeHtml(label)}" loading="lazy"></a>`

  return `
    <figure class="kyc-preview">
      <figcaption>${escapeHtml(label)}</figcaption>
      ${media}
      <a class="kyc-preview-open" href="${safeUrl}" target="_blank" rel="noopener">Open in new tab</a>
    </figure>
  `
}

function openKycModal(userId) {
  const user = usersById[userId]
  if (!user) return

  const kyc = user.kyc || {}
  const status = kyc.status || 'unverified'
  currentReviewId = userId

  document.getElementById('kycModalName').textContent = user.name || 'Applicant'
  document.getElementById('kycModalMeta').textContent = [
    user.email,
    user.accountnumber ? 'Acct: ' + user.accountnumber : ''
  ].filter(Boolean).join(' · ')
  document.getElementById('kycModalNin').textContent = kyc.nin || '—'
  document.getElementById('kycModalDob').textContent = formatDate(kyc.dateOfBirth)
  document.getElementById('kycModalDocType').textContent = DOCUMENT_LABELS[kyc.documentType] || '—'
  document.getElementById('kycModalSubmitted').textContent = formatDateTime(kyc.submittedAt)
  document.getElementById('kycModalAddress').textContent = kyc.address || '—'

  const reasonRow = document.getElementById('kycModalReasonRow')
  if (status === 'rejected' && kyc.rejectionReason) {
    document.getElementById('kycModalReason').textContent = kyc.rejectionReason
    reasonRow.classList.remove('nb-hidden')
  } else {
    reasonRow.classList.add('nb-hidden')
  }

  document.getElementById('kycModalPreviews').innerHTML =
    renderPreview(kyc.document, 'ID document') + renderPreview(kyc.selfie, 'Selfie')

  const actions = document.getElementById('kycModalActions')

  document.getElementById('kycRejectReason').value = ''

  // Verified profiles are final; unsubmitted profiles have nothing to action.
  if (status === 'verified' || status === 'unverified') {
    actions.classList.add('nb-hidden')
  } else {
    actions.classList.remove('nb-hidden')
    document.getElementById('kycApproveBtn').disabled = false
    document.getElementById('kycRejectBtn').disabled = false
  }

  document.getElementById('kycModal').classList.remove('nb-hidden')
  document.body.style.overflow = 'hidden'
}

function closeKycModal() {
  document.getElementById('kycModal').classList.add('nb-hidden')
  document.body.style.overflow = ''
  currentReviewId = null
}

function setModalLoading(isLoading) {
  document.getElementById('kycApproveBtn').disabled = isLoading
  document.getElementById('kycRejectBtn').disabled = isLoading
}

async function approveFromModal() {
  if (!currentReviewId) return

  const user = usersById[currentReviewId]
  const name = user ? user.name : 'this user'

  if (!confirm(`Approve KYC for ${name}?`)) return

  setModalLoading(true)

  try {
    await request('/kyc/admin/' + currentReviewId, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'verified' })
    })
    closeKycModal()
    loadAll()
  } catch (err) {
    alert(err.message)
    setModalLoading(false)
  }
}

async function rejectFromModal() {
  if (!currentReviewId) return

  const user = usersById[currentReviewId]
  const name = user ? user.name : 'this user'
  const reason = document.getElementById('kycRejectReason').value.trim()

  if (reason.length < 3) {
    alert('Please provide a rejection reason.')
    document.getElementById('kycRejectReason').focus()
    return
  }

  if (!confirm(`Reject KYC for ${name}?`)) return

  setModalLoading(true)

  try {
    await request('/kyc/admin/' + currentReviewId, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'rejected', rejectionReason: reason })
    })
    closeKycModal()
    loadAll()
  } catch (err) {
    alert(err.message)
    setModalLoading(false)
  }
}

function loadAll() {
  loadStats()
  loadKyc()
}

loadAll()
