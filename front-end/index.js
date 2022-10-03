const calculator = document.querySelector('.calculator'); //page container
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
// updater elements
const updater = document.querySelector('.updater'); //page container
const backBtn = document.getElementById('back');
const saveBtn = document.getElementById('save');
const table = document.getElementById('table');
// new premium form elements
const newState = document.getElementById('newState');
const newPlanContainer = document.querySelector('.plans');
const newAPlan = document.getElementById('newAPlan');
const newBPlan = document.getElementById('newBPlan');
const newCPlan = document.getElementById('newCPlan');
const newMonth = document.getElementById('newMonth');
const minAge = document.getElementById('minAge');
const maxAge = document.getElementById('maxAge');
const newPremium = document.getElementById('newPremium');
const newCarrier = document.getElementById('newCarrier');
const newPremiumBtn = document.getElementById('createPremium');

let premiums = [];
let db = {}; //only used if user goes to edit db page

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
    return new Date(Date.parse(month + "1, 2000")).getMonth() + 1;
  }
}

function addState(stateName) { // Adds the option to the dropdown menu
  if(stateName !== '0'){
    state.innerHTML += `<option value="${stateName}">${stateNameFormatter(stateName)}</option>`;
    newState.innerHTML += `<option value="${stateNameFormatter(stateName)}">`
  }
}

function addPremium(premium) { // Adds the premium to the premiums list
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

function addTableRows() {  //on the edit db page

  table.innerHTML = `
    <tr>
      <th>State</th>
      <th>Plan</th>
      <th>Month Of Birth</th>
      <th colspan="2">Age Range</th>
      <th>Premium</th>
      <th>Carrier</th>
    </tr>`;

  for (const [stateName, object] of Object.entries(db)) {
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

function newPremiumValidation() {
  if(!newState.value) {
    newState.classList.add('error');
  } else if(!(newAPlan.checked || newBPlan.checked || newCPlan.checked)) {
    newState.classList.remove('error');
    newPlanContainer.classList.add('error');
  } else if (!minAge.value || parseInt(minAge.value) < 18) {
    newPlanContainer.classList.remove('error');
    minAge.classList.add('error');
  } else if (!maxAge.value || parseInt(maxAge.value) < parseInt(minAge.value)) {
    minAge.classList.remove('error');
    maxAge.classList.add('error');
  } else if (!newPremium.value) {
    maxAge.classList.remove('error');
    newPremium.classList.add('error');
  } else if (!newCarrier.value) {
    newPremium.classList.remove('error');
    newCarrier.classList.add('error');
  } else {
    newCarrier.classList.remove('error');
    return true
  }
  return false
}

function premiumToDB(itemPlan) {
  const item = [parseInt(newMonth.value), parseInt(minAge.value),parseInt(maxAge.value),parseInt(newPremium.value),newCarrier.value];
  const itemState = newState.value === 'ANY' ? '0' : `${newState.value.split(' ').join('')}`
  db[itemState][`${itemPlan}`].push(item);
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
        db = data;
        addTableRows();
        backBtn.disabled = false;
        console.log(data)
      })
}

function uploadNewData(ModifiedData){
  fetch(api,
    { method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json'
      },
      body: JSON.stringify(ModifiedData)
    })
      .then((response) => response.json())
      .then((data) => {console.log(data)})
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

  newMonth.innerHTML = `<option value="0">ANY</option>`;
  for(let i = 0; i < 12; i++) {
    newMonth.innerHTML += `<option value="${i + 1}">${MonthNameOrNumber(i + 1)}</option>`;
  }
});

newPremiumBtn.addEventListener('click', () => {
  if(newPremiumValidation()) {
    newAPlan.checked && premiumToDB('A');
    newBPlan.checked && premiumToDB('B');
    newCPlan.checked && premiumToDB('C');
    addTableRows();
  }
});

backBtn.addEventListener('click', () => {
  calculator.classList.remove('hidden');
  updater.classList.add('hidden');
});

saveBtn.addEventListener('click', () => {
  const newDB = {};
  const dbArray = Array.from(document.querySelectorAll('td'));
  for(let i = 0; i < dbArray.length; i++){
    if((i + 1) % 7 === 0){
      const newDBState = `${(dbArray[i - 6].childNodes[0].nodeValue) !== 'ANY' ? `${dbArray[i - 6].childNodes[0].nodeValue}`.split(' ').join('') : '0'}`;
      if(newDB[`${newDBState}`] === undefined){
        newDB[`${newDBState}`] = {'A': [], 'B':[], 'C':[]};
      }

      const dbPremium = []
      for(let inversePosition = 5; inversePosition > 0; inversePosition--){
        if (dbPremium.length <= 0){
          if(`${dbArray[i - inversePosition + 1].childNodes[0].nodeValue}` === 'ANY'){
            dbPremium.push(0)
          } else dbPremium.push(MonthNameOrNumber(dbArray[i - inversePosition + 1].childNodes[0].nodeValue));
        }else dbPremium.push(dbArray[i - inversePosition + 1].childNodes[0].nodeValue);
      }

      newDB[`${newDBState}`][`${dbArray[i - 5].childNodes[0].nodeValue}`].push(dbPremium);
    }
  }
  console.log(newDB)
  uploadNewData(newDB)
});

document.addEventListener('DOMContentLoaded', () => {
  getStates();
});
