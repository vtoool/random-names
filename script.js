// nameData is defined in names.js
const regionSelect = document.getElementById('region');
const refreshBtn = document.getElementById('refresh');
const container = document.getElementById('name-container');
const qKey = document.getElementById('q-key');
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
    pill.classList.add('copied');
    setTimeout(() => {
      pill.textContent = name;
    }, 700);
  });
}

function copyFirstAvailable() {
  const pill = container.querySelector('.pill:not(.copied)');
  if (pill) {
    handleCopy(pill);
  } else {
    generateNames();
  }
}

function animateQKey() {
  if (!qKey) return;
  qKey.classList.add('animate');
  qKey.addEventListener('animationend', () => qKey.classList.remove('animate'), { once: true });
}

document.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'q') {
    if (e.repeat) return;
    e.preventDefault();
    if (qKey) qKey.classList.add('pressed');
    copyFirstAvailable();
  }
});

document.addEventListener('keyup', e => {
  if (e.key.toLowerCase() === 'q' && qKey) {
    qKey.classList.remove('pressed');
    animateQKey();
  }
});

if (qKey) {
  qKey.addEventListener('click', () => {
    copyFirstAvailable();
  });
  qKey.addEventListener('mousedown', () => qKey.classList.add('pressed'));
  ['mouseup', 'mouseleave'].forEach(evt =>
    qKey.addEventListener(evt, () => {
      qKey.classList.remove('pressed');
      animateQKey();
    })
  );
}

refreshBtn.addEventListener('click', generateNames);
regionSelect.addEventListener('change', generateNames);
// Wait for fonts to load so the pill dimensions are accurate on first render
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(generateNames);
} else {
  window.addEventListener('load', generateNames);
}

