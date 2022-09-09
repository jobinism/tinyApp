const express = require("express");
const app = express();
const port = 3005; // default port 8080
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const { urlOfUsers, getUserByUsername, generateRandomString } = require('./helper.js');
const bcrypt = require('bcryptjs');
// const methodOverride = require('method-override');


//middleware ---

app.use(morgan('dev'));
app.use(cookieSession({
  name: 'tinyApp',
  keys: [generateRandomString],
}));
app.use(express.urlencoded({extended: true}));

//Database ---------
const urlDatabase = {
  "b2xVn2": {id: "b2xVn2", longURL: "http://www.lighthouselabs.ca", userId: "9kl6d",},
  "9sm5xK": {id: "9sm5xK", longURL: "http://www.google.com", userId: "b762d",}
};

const users = {
  "b762d": {id: "b762d", screenName: 'goldenEraFan', password: 'tupac1995'},
  "h8i35": {id: "h8i35", screenName: 'newGuy56', password: 'imNewHere'},
  "9kl6d": {id: "9kl6d", screenName: 'eaglesFan', password: 'phillySB2017'},
};

// const urlOfUsers = function (userId, urls) {
//   const output = {}
//     for (shortId in urls) {
//       if (urls[shortId].userId === userId) {
//         output[shortId] = urls[shortId]
//       }
//     }
//     return output;
// }

app.set("view engine", "ejs");

//Get ----------------------------------------

app.get("/", (req, res) => {
  res.redirect('/urls')
})

app.get("/urls", (req, res) => {
  const userId = req.session.userId
  const myUrls = urlOfUsers(userId, urlDatabase);
  const templateVars = { 
    urls: myUrls,
    user: users[userId],
  }
  res.cookie('first_timer', `${generateRandomString()}`)
  console.log(req.session)
  res.render('urls_index', templateVars)
});

app.get("/urls/new", (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.session.userId],
  }
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
    user: users[req.session.userId],
   };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  if (req.session.userId) {
    return res.redirect('/urls');
  }
  res.render('register')
});

app.get("/login", (req, res) => {
  if (req.session.userId) {
    return res.redirect('/urls');
  }
  res.render('login')
});
//Helper code -----------
// const getUserByUsername = (screenName) => {
//   console.log("inside the function:", users, screenName)
//   for (const userId in users) {
//     const user = users[userId];
   

//     if (user.screenName === screenName) {
//       return user;
//     }
//   }

//   return null;
// };

app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  const id = generateRandomString()
  const longURL = req.body.longURL
  urlDatabase[id] = {longURL: longURL, userId: req.session.userId };

  console.log(urlDatabase[id])
  res.redirect(`/urls/${id}`)
});
app.post("/register", (req, res) => {
  const id = generateRandomString()
  const screenName = req.body.screenName;
  const password = req.body.password;

    if (!screenName || !password) {
      return res.status(400).send('Please enter a valid username and password!');
    }

    const user = getUserByUsername(screenName);

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
  users[id] = newUser;
  // console.log(newUser)
  res.redirect('/login')
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log("login:", req.body)
  if (!username || !password) {
    return res.status(400).send('Please fill all fields.');
  }
  const user = getUserByUsername(username);

  if (!user) {
    return res.status(400).send('Username does not match!');
  }

  const result = bcrypt.compareSync(password, user.password);
  
  if (!result) {
    return res.status(400).send('Password incorrect!');
  }

  req.session.userId = user.id;
  res.redirect('/');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/')
});

app.get("/u/:id", (req, res) => {
  const shortUrl = req.params.id
  const longURL = urlDatabase[shortUrl].longURL;
  console.log("id? :", shortUrl)
  console.log("urlDatabase", urlDatabase)
  res.redirect(longURL);
});

// function generateRandomString() {
//   let value = Math.random().toString(36).substring(2, 7);
//   // console.log("Value: ", value);
//   return value;
// };

//Delete / Edit / 404 -----------------------

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
})
app.post("/urls/:id/edit", (req, res) => {
  const shortUrl = req.params.id;
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  urlDatabase[shortUrl].longURL = req.body.newLongUrl;
  res.redirect('/urls')
})

app.get('*', (req, res) => {
  res.status(404).redirect('https://http.dog/404.jpg')
})

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
