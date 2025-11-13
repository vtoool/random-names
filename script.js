// nameData is defined in names.js
const regionSelect = document.getElementById('region');
const refreshBtn = document.getElementById('refresh');
const container = document.getElementById('name-container');
const qKey = document.getElementById('q-key');
const tsaToggle = document.getElementById('tsa-toggle');
const kayakResults = document.getElementById('kayak-results');
const kayakForm = document.getElementById('kayak-form');
const kayakUrl = document.getElementById('kayak-url');
const kayakFlexSelect = document.getElementById('kayak-flex');
const kayakError = document.getElementById('kayak-error');
const tabButtons = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const historyBtn = document.getElementById('history-btn');
const historyDialog = document.getElementById('history-dialog');
const historyList = document.getElementById('history-list');
const closeHistoryBtn = document.getElementById('close-history');
const clearHistoryBtn = document.getElementById('clear-history');
const HISTORY_KEY = 'nameHistory';
const NUM_PILLS = 9;
let currentPeople = [];

sanitizeNameData(nameData);

function sanitizeNameData(data) {
  // Remove diacritics and restrict to English letters.
  const ascii = /^[A-Z' -]+$/;
  Object.values(data).forEach(region => {
    ['M', 'F'].forEach(gender => {
      region.first[gender] = region.first[gender]
        .map(name =>
          name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase()
        )
        .filter(name => ascii.test(name));
    });
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

function loadHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
}

function saveHistory(arr) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
}

function addHistory(name) {
  const arr = loadHistory();
  arr.push(name);
  saveHistory(arr);
}

function showHistory() {
  const arr = loadHistory();
  historyList.innerHTML = '';
  if (arr.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No names copied yet.';
    historyList.appendChild(li);
  } else {
    arr.forEach(n => {
      const li = document.createElement('li');
      li.textContent = n;
      historyList.appendChild(li);
    });
  }
  historyDialog.showModal();
}

const TSA_MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MIN_AGE = 13;
const MAX_AGE = 90;

function randomBirthdate() {
  const today = new Date();
  const maxDate = new Date(Date.UTC(today.getUTCFullYear() - MIN_AGE, today.getUTCMonth(), today.getUTCDate()));
  maxDate.setUTCDate(maxDate.getUTCDate() - 1);
  const minDate = new Date(Date.UTC(today.getUTCFullYear() - MAX_AGE, today.getUTCMonth(), today.getUTCDate()));
  const diff = maxDate.getTime() - minDate.getTime();
  const randomTime = minDate.getTime() + Math.random() * diff;
  return new Date(randomTime);
}

function formatTsaDate(date) {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = TSA_MONTHS[date.getUTCMonth()];
  const year = String(date.getUTCFullYear()).slice(-2);
  return `${day}${month}${year}`;
}

function generatePerson(regionKey, index) {
  const data = nameData[regionKey];
  if (!data) {
    throw new Error(`Unknown region: ${regionKey}`);
  }
  const genderOptions = ['M', 'F'].filter(g => data.first[g] && data.first[g].length > 0);
  if (genderOptions.length === 0) {
    throw new Error(`No first names configured for region: ${regionKey}`);
  }
  const gender = randomFrom(genderOptions);
  const first = randomFrom(data.first[gender]);
  const last = randomFrom(data.last);
  const birthDate = randomBirthdate();
  const tsaDate = formatTsaDate(birthDate);
  return {
    first,
    last,
    gender,
    baseName: `-${last}/${first}`,
    tsaName: `3DOCSA/DB/${tsaDate}/${gender}/${last}/${first}-${index + 1}.1`
  };
}

function createPill(text, extraClass = '') {
  const pill = document.createElement('div');
  pill.className = extraClass ? `pill ${extraClass}` : 'pill';
  pill.textContent = text;
  pill.dataset.name = text;
  pill.addEventListener('click', () => handleCopy(pill));
  return pill;
}

function equalizePillSizes(pills) {
  if (!pills.length) return;
  const maxWidth = Math.max(...pills.map(p => p.offsetWidth));
  const maxHeight = Math.max(...pills.map(p => p.offsetHeight));
  pills.forEach(p => {
    p.style.width = `${maxWidth}px`;
    p.style.height = `${maxHeight}px`;
  });
}

function renderNames(showTsa = tsaToggle ? tsaToggle.checked : false) {
  if (!currentPeople.length) return;
  container.innerHTML = '';
  const basePills = [];
  const tsaPills = [];
  currentPeople.forEach(person => {
    const row = document.createElement('div');
    row.className = showTsa ? 'pill-row double' : 'pill-row single';
    const basePill = createPill(person.baseName);
    row.appendChild(basePill);
    basePills.push(basePill);
    if (showTsa) {
      const tsaPill = createPill(person.tsaName, 'tsa');
      row.appendChild(tsaPill);
      tsaPills.push(tsaPill);
    }
    container.appendChild(row);
  });
  if (showTsa) {
    equalizePillHeights([...basePills, ...tsaPills]);
  } else {
    equalizePillSizes(basePills);
  }
}

function equalizePillHeights(pills) {
  if (!pills.length) return;
  const maxHeight = Math.max(...pills.map(p => p.offsetHeight));
  pills.forEach(p => {
    p.style.height = `${maxHeight}px`;
  });
}

function generateNames() {
  currentPeople = [];
  for (let i = 0; i < NUM_PILLS; i++) {
    currentPeople.push(generatePerson(regionSelect.value, i));
  }
  renderNames(tsaToggle ? tsaToggle.checked : false);
}

function handleCopy(pill) {
  const name = pill.dataset.name;
  navigator.clipboard.writeText(name).then(() => {
    pill.textContent = '✓ Copied';
    pill.classList.add('copied', 'copied-anim');
    pill.addEventListener('animationend', () => pill.classList.remove('copied-anim'), { once: true });
    setTimeout(() => {
      pill.textContent = name;
    }, 700);
    addHistory(name);
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

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

if (kayakForm) {
  kayakForm.addEventListener('submit', e => {
    e.preventDefault();
    kayakError.textContent = '';
    const url = kayakUrl.value.trim();
    const flex = parseInt(kayakFlexSelect.value, 10);
    if (isNaN(flex) || flex < 1 || flex > 7) {
      kayakError.textContent = 'Flex must be between 1 and 7.';
      return;
    }
    try {
      const data = kayakFlex(url, flex);
      renderKayak(data);
    } catch (err) {
      kayakError.textContent = 'Could not parse URL.';
    }
  });
}

if (historyBtn) {
  historyBtn.addEventListener('click', showHistory);
}
if (closeHistoryBtn) {
  closeHistoryBtn.addEventListener('click', () => historyDialog.close());
}
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener('click', () => {
    saveHistory([]);
    historyList.innerHTML = '';
  });
}

function formatDM(dateStr) {
  const d = new Date(dateStr + 'T00:00');
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function dateRange(dateStr, flex) {
  const base = new Date(dateStr + 'T00:00');
  const arr = [];
  for (let i = -flex; i <= flex; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return [...new Set(arr)];
}

function replaceDates(baseUrl, newDates) {
  const u = new URL(baseUrl);
  let i = 0;
  const path = u.pathname.replace(/\d{4}-\d{2}-\d{2}/g, () => newDates[i++]);
  return `${u.origin}${path}${u.search}`;
}

function generateCombinations(arrays, idx = 0, curr = [], out = []) {
  if (idx === arrays.length) {
    out.push([...curr]);
    return out;
  }
  arrays[idx].forEach(val => {
    curr[idx] = val;
    generateCombinations(arrays, idx + 1, curr, out);
  });
  return out;
}

function kayakFlex(url, flex) {
  const u = new URL(url);
  const dates = u.pathname.match(/\d{4}-\d{2}-\d{2}/g);
  if (!dates) throw new Error('No dates in URL');
  const options = dates.map(d => dateRange(d, flex));
  return { url, dates, options };
}

function addHoverHighlights(table) {
  const cells = table.querySelectorAll('tbody td');
  cells.forEach(td => {
    td.addEventListener('mouseenter', () => {
      const col = td.cellIndex;
      table.querySelectorAll('tr').forEach(row => {
        if (row.contains(td)) row.classList.add('hover-row');
        const cell = row.children[col];
        if (cell) cell.classList.add('hover-col');
      });
    });
    td.addEventListener('mouseleave', () => {
      table.querySelectorAll('.hover-row').forEach(r => r.classList.remove('hover-row'));
      table.querySelectorAll('.hover-col').forEach(c => c.classList.remove('hover-col'));
    });
  });
}

function renderKayak(data) {
  kayakResults.innerHTML = '';
  const { url, dates, options } = data;
  const info = document.createElement('p');
  info.textContent = `Current dates: ${formatDM(dates[0])} - ${formatDM(dates[dates.length - 1])}`;
  kayakResults.appendChild(info);
  if (dates.length === 2) {
    const [outOpts, retOpts] = options;
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.appendChild(document.createElement('th'));
    retOpts.forEach(d2 => {
      const th = document.createElement('th');
      th.textContent = formatDM(d2);
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    outOpts.forEach(d1 => {
      const tr = document.createElement('tr');
      const rowHead = document.createElement('th');
      rowHead.textContent = formatDM(d1);
      tr.appendChild(rowHead);
      retOpts.forEach(d2 => {
        const td = document.createElement('td');
        const a = document.createElement('a');
        a.href = replaceDates(url, [d1, d2]);
        a.target = '_blank';
        a.textContent = '•';
        a.setAttribute('aria-label', `${formatDM(d1)} - ${formatDM(d2)}`);
        a.title = `${formatDM(d1)} - ${formatDM(d2)}`;
        td.appendChild(a);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    kayakResults.appendChild(table);
    addHoverHighlights(table);
  } else {
    const combos = generateCombinations(options);
    const list = document.createElement('ul');
    combos.forEach(combo => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = replaceDates(url, combo);
      a.target = '_blank';
      a.textContent = combo.map(formatDM).join(' - ');
      li.appendChild(a);
      list.appendChild(li);
    });
    kayakResults.appendChild(list);
  }
}

refreshBtn.addEventListener('click', generateNames);
regionSelect.addEventListener('change', generateNames);
if (tsaToggle) {
  tsaToggle.addEventListener('change', () => renderNames());
}
// Wait for fonts to load so the pill dimensions are accurate on first render
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(generateNames);
} else {
  window.addEventListener('load', generateNames);
}

const tickerPill = document.getElementById('ticker-pill');
if (tickerPill) {
  const updateTicker = () => {
    const person = generatePerson(regionSelect.value, 0);
    tickerPill.textContent = person.baseName;
  };
  updateTicker();
  // Update ticker every 0.1 seconds
  setInterval(updateTicker, 100);
}

