// nameData is defined in names.js
const regionSelect = document.getElementById('region');
const refreshBtn = document.getElementById('refresh');
const container = document.getElementById('name-container');
const NUM_PILLS = 9;

sanitizeNameData(nameData);

function sanitizeNameData(data) {
  // Remove diacritics and restrict to English letters.
  const ascii = /^[A-Z' -]+$/;
  Object.values(data).forEach(region => {
    // Sanitize first names
    region.first = region.first
      .map(name =>
        name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase()
      )
      .filter(name => ascii.test(name));
    // Sanitize last names and strip spaces and punctuation
    region.last = region.last
      .map(name =>
        name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[-'` ]/g, '')
          .toUpperCase()
      )
      .filter(name => /^[A-Z]+$/.test(name));
  });
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(region) {
  const data = nameData[region];
  const first = randomFrom(data.first).toUpperCase();
  const last = randomFrom(data.last).toUpperCase();
  return `-${last}/${first}`;
}

function generateNames() {
  container.innerHTML = '';
  const pills = [];
  for (let i = 0; i < NUM_PILLS; i++) {
    const name = generateName(regionSelect.value);
    const pill = document.createElement('div');
    pill.className = 'pill';
    pill.textContent = name;
    pill.dataset.name = name;
    pill.addEventListener('click', () => handleCopy(pill));
    container.appendChild(pill);
    pills.push(pill);
  }
  const maxWidth = Math.max(...pills.map(p => p.offsetWidth));
  const maxHeight = Math.max(...pills.map(p => p.offsetHeight));
  pills.forEach(p => {
    p.style.width = `${maxWidth}px`;
    p.style.height = `${maxHeight}px`;
  });
}

function handleCopy(pill) {
  const name = pill.dataset.name;
  navigator.clipboard.writeText(name).then(() => {
    pill.textContent = '✓ Copied';
    setTimeout(() => {
      pill.textContent = name;
      pill.classList.add('copied');
    }, 700);
  });
}

refreshBtn.addEventListener('click', generateNames);
regionSelect.addEventListener('change', generateNames);
// Wait for fonts to load so the pill dimensions are accurate on first render
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(generateNames);
} else {
  window.addEventListener('load', generateNames);
}

// theme toggle
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  const thumb = themeToggle.querySelector('.thumb');
  const buttons = themeToggle.querySelectorAll('.icon');

  function applyTheme(theme) {
    const root = document.documentElement;
    const body = document.body;
    root.removeAttribute('data-theme');
    body.classList.remove('body--light', 'body--dark');
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      body.classList.add('body--light');
    } else if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      body.classList.add('body--dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      body.classList.add(prefersDark ? 'body--dark' : 'body--light');
    }
  }

  function moveThumb(index) {
    const segment = themeToggle.offsetWidth / buttons.length;
    thumb.style.transform = `translateX(${segment * index}px)`;
  }

  buttons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      moveThumb(index);
      applyTheme(btn.dataset.theme);
    });
  });

  window.addEventListener('load', () => {
    const activeIndex = Array.from(buttons).findIndex(b => b.classList.contains('active'));
    moveThumb(activeIndex);
    applyTheme(buttons[activeIndex].dataset.theme);
  });
}
