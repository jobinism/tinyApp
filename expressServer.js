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
//Getters below. rendering homepage, urls page, registration page and login page.
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const myUrls = urlOfUsers(userId, urlDatabase);
  const templateVars = {
    urls: myUrls,
    user: users[userId],
  };
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
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
  if (!req.session.user_id) {
    return res.redirect('/login');
  }

  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  res.render('register', templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  res.render('login', templateVars);
});

//Code for creating and posting below e.g. creating an account, logging in, creating a new url

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = {longURL: longURL, userId: req.session.user_id };

  res.redirect(`/urls/${id}`);
});
//REGISTRATION - We are using encryption on the newly created account's password for safety, and we are passing that to the object, as well as creating a new cookie session.
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

// LOGIN - We are taking in the the password from the user, checking it with the encrypted password which is being run through decryption and if it passes and the user name exists, the user can officially access user only areas of the site.

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

//Delete / Edit / 404 - below we are running code to delete urls, edit urls and a 404 for url paths that don't match our accepted paths.

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  if (req.session.user_id !== urlDatabase.userId) {
    res.status(404).redirect('https://http.dog/403.jpg')
   }
  res.redirect('/urls');
});

app.post("/urls/:id/edit", (req, res) => {
  const shortUrl = req.params.id;
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  if (req.session.user_id !== urlDatabase.userId) {
    res.status(404).redirect('https://http.dog/403.jpg')
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
