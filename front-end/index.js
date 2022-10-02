const calculator = document.querySelector('.calculator');
// form elements
const date = document.getElementById('birth');
const state = document.getElementById('state');
const plan = document.getElementById('plan');
const age = document.getElementById('age');
const submitBtn = document.getElementById('submit');
// extra elements
const period = document.getElementById('period');
const premiumList = document.querySelector('.premium-list');
const updaterBtn = document.getElementById('edit');
//updater elements
const updater = document.querySelector('.updater');
const backBtn = document.getElementById('back');
const saveBtn = document.getElementById('save');
const table = document.querySelector('.data');

let premiums = [];

const api = 'http://localhost:3000/api/v1'; // Link to API, in case is deployed elsewhere

// helper functions

function calculateAge(date) {
  [year, month, day] = date.split('-');

  const today = new Date();
  let ageValue = today.getFullYear() - year;

  if(today.getMonth() + 1 === parseInt(month)) {
    if(today.getDate() < parseInt(day)) ageValue -= 1;
  } else if(today.getMonth() + 1 < parseInt(month)) {
    ageValue -= 1;
  }

  return ageValue;
}

function stateNameFormatter(name) {
  let [postal, newName] = name.split('-');
  newName = newName.replace(/([A-Z])/g, ' $1').trim().substring(0, 12);

  return `${postal} - ${newName}`;
}

function MonthNameOrNumber(month) {
  if(typeof(month) === 'number'){ // Return name if parameter is a number
    const date = new Date();
  date.setMonth(month - 1);
  return date.toLocaleString('en-US', {month: 'long'});
  } else if(typeof(month) === 'string'){ // Return a number if the parameter is a name
    return new Date(Date.parse(mon + "1, 2000")).getMonth() + 1;
  }
}

function addState(stateName) { // Adds the option to the dropdown menu
  if(stateName !== '0'){
    state.innerHTML += `<option value="${stateName}">${stateNameFormatter(stateName)}</option>`;
  }
}

function addPremium(premium) { // Adds the premium to the result list
  premiumList.innerHTML += `
    <li class="item">
      <p>${premium.carrier}</p>
      <p>${premium.premium}</p>
      <p>${(premium.premium * period.value).toFixed(2)}</p>
      <p>${(premium.premium * period.value / 12).toFixed(2)}</p>
    </li>
  `
}

function updatePremiumList() {
  premiumList.innerHTML = '';
  premiums.forEach((premium) => {
    addPremium(premium);
  });
}

function addTableRows(data) {

  table.innerHTML = `
    <tr>
      <th>State</th>
      <th>Plan</th>
      <th>Month Of Birth</th>
      <th colspan="2">Age Range</th>
      <th>Premium</th>
      <th>Carrier</th>
    </tr>`;

  for (const [stateName, object] of Object.entries(data)) {
    for (const [planType, array] of Object.entries(object)) {
      array.map((premium) => {
        table.innerHTML += `
          <tr>
            <td contenteditable>${stateName !== '0' ? stateNameFormatter(stateName) : 'ANY'}</td>
            <td contenteditable>${planType}</td>
            <td contenteditable>${premium[0] !== 0 ? MonthNameOrNumber(premium[0]) : 'ANY'}</td>
            <td contenteditable>${premium[1]}</td>
            <td contenteditable>${premium[2]}</td>
            <td contenteditable>${premium[3]}</td>
            <td contenteditable>${premium[4]}</td>
          </tr>
        `;
      })
    }
  }
}

// API interactions

function getStates() {
  fetch(`${api}/states`,
  { method: 'GET',
    headers: { 'Content-type': 'application/json'},
  })
    .then((response) => response.json())
    .then((data) => data.forEach(state => {
      addState(state);
    }));
};

function getPremiums() {
  fetch(`${api}/states/${state.value}&${plan.value}&${date.value}&${age.value}`,
  { method: 'GET',
    headers: { 'Content-type': 'application/json'},
  })
    .then((response) => response.json())
    .then((data) => {
      period.disabled = false
      premiums = data;
      updatePremiumList();
    });
};

function getFullDatabase() {
  fetch(api,
    { method: 'GET',
      headers: { 'Content-type': 'application/json'},
    })
      .then((response) => response.json())
      .then((data) => {
        addTableRows(data);
        backBtn.disabled = false;
      })
}

// Event listeners

date.addEventListener('change', () => {
  ageValue = calculateAge(date.value);

  if (ageValue < 18){
    submitBtn.disabled = true
    age.classList.add('error');
    age.value = 'You need to be older than 18';
  }  else {
    state.value ? submitBtn.disabled = false : submitBtn.disabled = true
    age.classList.remove('error');
    age.value = ageValue;
  }
});

submitBtn.addEventListener('click', (e) => {
  e.preventDefault();
  getPremiums();
});

period.addEventListener('change', () => {
  updatePremiumList();
});

updaterBtn.addEventListener('click', () => {
  getFullDatabase();
  calculator.classList.add('hidden');
  updater.classList.remove('hidden');
});

backBtn.addEventListener('click', () => {
  calculator.classList.remove('hidden');
  updater.classList.add('hidden');
});

document.addEventListener('DOMContentLoaded', () => {
  getStates();
});
