

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (!sidebar || !overlay) return;
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
}

function initSidebar() {
  // Close sidebar when clicking a menu item (mobile)
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) toggleSidebar();
    });
  });
}

// Close sidebar on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  }
});

// Fetch the sidebar markup and inject it, then wire up events.
fetch('/main-sidebar.html')
  .then(res => res.text())
  .then(html => {
    const container = document.getElementById('sidebar-container');
    if (container) {
      container.innerHTML = html;
      initSidebar();
    }
  })
  .catch(err => console.error('Failed to load sidebar:', err));


 async function loadSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  try {
    const res = await fetch('/main-sidebar.html');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const html = await res.text();
    container.innerHTML = html;
    initSidebar();
  } catch (err) {
    console.error('Failed to load sidebar:', err);
  }
}

loadSidebar();