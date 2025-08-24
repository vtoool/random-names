// nameData is defined in names.js
const regionSelect = document.getElementById('region');
const refreshBtn = document.getElementById('refresh');
const container = document.getElementById('name-container');
const NUM_PILLS = 9;

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(region) {
  const data = nameData[region];
  const first = randomFrom(data.first);
  const last = randomFrom(data.last);
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
  if (pill.classList.contains('copied')) return;
  const name = pill.dataset.name;
  navigator.clipboard.writeText(name).then(() => {
    pill.textContent = '✓ Copied name';
    setTimeout(() => {
      pill.textContent = name;
      pill.classList.add('copied');
    }, 1000);
  });
}

refreshBtn.addEventListener('click', generateNames);
regionSelect.addEventListener('change', generateNames);

generateNames();
