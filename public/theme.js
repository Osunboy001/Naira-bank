
let darkmode = localStorage.getItem('darkmode');

function applyTheme() {
  document.body.classList.toggle('darkmode', darkmode === 'active');
}
applyTheme();

const themeSwitch = document.querySelector('.themeSwitch');
if (themeSwitch) {
  const lastSvg = themeSwitch.querySelector("svg:last-of-type");
  const firstSvg = themeSwitch.querySelector("svg:first-of-type");

  function syncIcons() {
    lastSvg.style.display = darkmode === 'active' ? "block" : "none";
    firstSvg.style.display = darkmode === 'active' ? "none" : "block";
  }
  syncIcons();

themeSwitch.addEventListener('click', () => {
  if (darkmode === 'active') {
    darkmode = null;
  } else {
    darkmode = 'active';
  }

  if (darkmode) {
    localStorage.setItem('darkmode', 'active');
  } else {
    localStorage.removeItem('darkmode');
  }



  applyTheme();
  syncIcons();
});
}


