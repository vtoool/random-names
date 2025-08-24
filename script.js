// nameData is defined in names.js
const regionSelect = document.getElementById('region');
const refreshBtn = document.getElementById('refresh');
const container = document.getElementById('name-container');
const NUM_PILLS = 9;

sanitizeNameData(nameData);

function sanitizeNameData(data) {
  const regex = /^[A-Za-z]+$/;
  Object.values(data).forEach(region => {
    ['first', 'last'].forEach(list => {
      region[list] = region[list]
        .filter(name => regex.test(name))
        .map(name => name.toUpperCase());
    });
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
    pill.textContent = '✓ Copied name';
    setTimeout(() => {
      pill.textContent = name;
      pill.classList.add('copied');
    }, 700);
  });
}

refreshBtn.addEventListener('click', generateNames);
regionSelect.addEventListener('change', generateNames);

generateNames();
