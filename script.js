const nameData = {
  northAmerica: {
    first: [
      'James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','William','Elizabeth','David','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen','Christopher','Nancy','Daniel','Lisa','Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley','Steven','Kimberly','Paul','Emily','Andrew','Donna','Joshua','Michelle'
    ],
    last: [
      'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores'
    ]
  },
  europe: {
    first: [
      'Oliver','Amelia','Noah','Olivia','Liam','Sofia','Emma','Mia','Lucas','Ava','Hugo','Alice','Louis','Chloe','Luca','Lea','Leon','Sophie','Finn','Emily','Felix','Anna','Johan','Marie','Jan','Elise','Marek','Helena','Pietro','Giulia','Nikos','Elena','Mads','Freja','Sven','Greta','Ruben','Nora','Mateo','Iris'
    ],
    last: [
      'Smith','Jones','Taylor','Brown','Wilson','Davies','Novak','Papadopoulos','Schmidt','Muller','Rossi','Bianchi','Bernard','Dubois','Garcia','Martins','Silva','Murphy','Nielsen','Johansson','Kowalski','Horvat','Ionescu','Kuznetsov','Ivanov','Gruber','Nowak','Lefevre','Greco','Costa','Petrov','Santos','Ricci','Dimitrov','Hansen','Larsen','Becker','Fischer','Weber','Conti'
    ]
  },
  india: {
    first: [
      'Aarav','Aanya','Vivaan','Aditya','Diya','Arjun','Saanvi','Reyansh','Aadhya','Vihaan','Ananya','Ritvik','Isha','Kavya','Krishna','Rohan','Priya','Sahil','Neha','Aryan','Ishan','Pooja','Rahul','Nisha','Manish','Sneha','Kiran','Meera','Vikram','Lakshmi','Gaurav','Swati','Amit','Rina','Suresh','Ravi','Chandra','Deepa','Kunal','Sunita'
    ],
    last: [
      'Patel','Sharma','Gupta','Khan','Singh','Mehta','Jain','Agarwal','Kumar','Reddy','Mukherjee','Nair','Das','Bose','Chatterjee','Ghosh','Iyer','Joshi','Kapoor','Malhotra','Menon','Pillai','Rastogi','Saxena','Varma','Chauhan','Thakur','Yadav','Bhat','Dutta','Dwivedi','Sethi','Bajaj','Desai','Chopra','Gill','Kohli','Tandon','Bansal','Puri'
    ]
  },
  africa: {
    first: [
      'Kwame','Ama','Ade','Amina','Chidi','Fatou','Kofi','Nia','Jabari','Imani','Ahmed','Siti','Abdi','Zainab','Omar','Thandi','Sibusiso','Asha','Farida','Amara','Babatunde','Lerato','Sipho','Zola','Yara','Nyasha','Tariq','Ayodele','Yetunde','Nuru','Baraka','Moussa','Kamau','Ebony','Makena','Temba','Ekene','Halima','Zahara','Obi'
    ],
    last: [
      'Mensah','Okoye','Abebe','Diallo','Hassan','Mohamed','Adeyemi','Kamara','Ndlovu','Diop','Okoro','Abdullah','Sacko','Mbatha','Abiola','Chukwu','Traore','Osei','Njoku','Saleh','Azikiwe','Fofana','Babangida','Kone','Adeniyi','Abubakar','Fahad','Ibrahim','Issa','Jalloh','Juma','Kagiso','Katlego','Laryea','Magoro','Maphosa','Mathe','Ndour','Oluwole','Sekou'
    ]
  },
  asia: {
    first: [
      'Wei','Li','Xiao','Yuki','Haruto','Sakura','Hiro','Min','Soo','Hana','Chen','Jun','Mei','Bao','Anh','Nhi','Siti','Nur','Kaito','Rin','Tariq','Fatima','Reza','Aisha','Sanjay','Linh','Tuan','Dae','Jin','Jia','Ming','Yue','Ren','Akira','Aiko','Hye','Sun','Thuy','Kyung','Ryo'
    ],
    last: [
      'Wang','Li','Zhang','Chen','Liu','Kim','Park','Lee','Tanaka','Suzuki','Yamamoto','Nguyen','Tran','Lam','Cheng','Huang','Yang','Zhao','Wu','Lin','Khan','Hussein','Hassan','Rahman','Sato','Ito','Yoon','Choi','Lau','Kaur','Zheng','Gupta','Nakamura','Ma','Sun','Shin','Kumari','He','Hoang','Gao'
    ]
  }
};

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
