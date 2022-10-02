const date = document.getElementById('birth');
const state = document.getElementById('state');
const plan = document.getElementById('plan');
const age = document.getElementById('age');
const button = document.getElementById('button');
const period = document.getElementById('period');
const premiumList = document.querySelector('.premium-list');

let premiums = [];

const api = 'http://localhost:3000/api/v1';

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

function addState(stateName) {
  if(stateName !== '0'){
    let [postal, name] = stateName.split('-');
    name = name.replace(/([A-Z])/g, ' $1').trim().substring(0, 12);

    state.innerHTML += `<option value="${stateName}">${postal} - ${name}</option>`;
  }
}

function addPremium(premium) {
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

// Event listeners

date.addEventListener('change', () => {
  ageValue = calculateAge(date.value);

  if (ageValue < 18){
    button.disabled = true
    age.classList.add('error');
    age.value = 'You need to be older than 18';
  }  else {
    state.value ? button.disabled = false : button.disabled = true
    age.classList.remove('error');
    age.value = ageValue;
  }
});

button.addEventListener('click', (e) => {
  e.preventDefault();
  getPremiums();
});

period.addEventListener('change', () => {
  updatePremiumList();
});

document.addEventListener('DOMContentLoaded', () => {
  getStates();
});
