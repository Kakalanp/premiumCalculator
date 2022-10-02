const data = require("./premiumList.json");

const express = require("express");
const app = express();

const cors = require("cors");

const corsOptions = {
   origin:'*', 
   credentials:true,
   optionSuccessStatus:200,
}

app.use(cors(corsOptions));

app.use(express.json());

function ageCalculator(date) {
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

//Routes

app.get("/", (req, res) => {
  res.send("go to /api/v1/states to see the list of states available");
});

app.get("/api/v1/states", (req, res) => {
  res.send(Object.keys(data));
});

app.get("/api/v1/states/:state&:plan&:date&:age", (req, res) => {
  const options = [];

  data[`${req.params.state}`][`${req.params.plan}`]
    .concat(data["0"][`${req.params.plan}`])
    .map((option) => {
      if(parseInt(req.params.age) === ageCalculator(req.params.date)) {
        const month = parseInt((req.params.date).substring(5,2));

        if (option[0] === month || option[0] === 0) {
          (parseInt(req.params.age) >= option[1] && parseInt(req.params.age) <= option[2]) &&
          options.push({
            "carrier": option[4],
            "premium": option[3]
          });
        }
      } else {
        res.status(403).send('Date and age do not match');
      }
    });

  res.send(options);
});

const port = process.env.port || 3000;
app.listen(port, () => console.log(`Listening to ${port}`));
