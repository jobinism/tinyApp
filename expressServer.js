const express = require("express");
const app = express();
const port = 3005; // default port 8080
const morgan = require('morgan');

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Getterz ------------------------------------------------------

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});



//Userz ------------------------------------------------------------

app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

function generateRandomString() {
  let value = Math.random().toString(36).substring(2, 7);
  console.log("Value: ", value);
  return value;
}
generateRandomString();

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
