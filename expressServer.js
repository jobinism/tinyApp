const express = require("express");
const app = express();
const port = 3005; 
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const { urlOfUsers, getUserByUsername, generateRandomString } = require('./helper.js');
const { urlDatabase, users } = require('./database.js');
const bcrypt = require('bcryptjs');


//middleware 
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'tinyApp',
  keys: [generateRandomString()],
}));
app.use(express.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const myUrls = urlOfUsers(userId, urlDatabase);
  const templateVars = {
    urls: myUrls,
    user: users[userId],
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const templateVars = {
    id: shortUrl,
    longURL: urlDatabase[shortUrl].longURL,
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  res.render('register');
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  res.render('login');
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = {longURL: longURL, userId: req.session.user_id };

  res.redirect(`/urls/${id}`);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const screenName = req.body.screenName;
  const password = req.body.password;

  if (!screenName || !password) {
    return res.status(400).send('Please enter a valid username and password!');
  }

  const user = getUserByUsername(screenName, users);

  if (user) {
    return res.status(400).send('That username is already taken!');
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const newUser = {
    id: id,
    screenName: screenName,
    password: hash,
  };

  req.session.user_id = id;
  users[id] = newUser;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).send('Please fill all fields.');
  }
  const user = getUserByUsername(username, users);

  if (!user) {
    return res.status(400).send('Username does not match!');
  }

  const result = bcrypt.compareSync(password, user.password);
  
  if (!result) {
    return res.status(400).send('Password incorrect!');
  }

  req.session.user_id = user.id;
  res.redirect('/');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.get("/u/:id", (req, res) => {
  const shortUrl = req.params.id;
  const longURL = urlDatabase[shortUrl].longURL;
  res.redirect(longURL);
});

//Delete / Edit / 404

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id/edit", (req, res) => {
  const shortUrl = req.params.id;
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  urlDatabase[shortUrl].longURL = req.body.newLongUrl;
  res.redirect('/urls');
});

app.get('*', (req, res) => {
  res.status(404).redirect('https://http.dog/404.jpg');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
