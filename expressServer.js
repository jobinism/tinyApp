const express = require("express");
const app = express();
const port = 3005; // default port 8080
const morgan = require('morgan');

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Get ----------------------------------------


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// app.get("/", (req, res) => {
//   res.render("urls_index", templateVars);
// });

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



//Use---------------------------------------------

app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  const id = generateRandomString()
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`)
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  console.log("id? :", req.params.id)
  console.log("urlDatabase", urlDatabase)
  res.redirect(longURL);
});

function generateRandomString() {
  let value = Math.random().toString(36).substring(2, 7);
  console.log("Value: ", value);
  return value;
};

//Delete -----------------------

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
})

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
