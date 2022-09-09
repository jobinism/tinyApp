const express = require("express");
const app = express();
const port = 3005; // default port 8080
const morgan = require('morgan');
const cookies = require('cookie-parser')
// const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
// const methodOverride = require('method-override');


//middleware ---

app.use(morgan('dev'));
app.use(cookies());
app.use(express.urlencoded({extended: true}));

//Database ---------
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: "9kl6d",},
  "9sm5xK": {longURL: "http://www.google.com", userId: "b762d",}
};
// const randomId = generateRandomString();


// 

const users = {
  "b762d": {screenName: 'goldenEraFan', password: 'tupac1995'},
  "h8i35": {screenName: 'newGuy56', password: 'imNewHere'},
  "9kl6d": {screenName: 'eaglesFan', password: 'phillySB2017'},
};

const urlOfUsers = function (userId, urls) {
  const output = {}
    for (shortId in urls) {
      if (urls[shortId].userId === userId) {
        output[shortId] = urls[shortId]
      }
    }
    return output;
}

app.set("view engine", "ejs");

//Get ----------------------------------------

app.get("/", (req, res) => {
  res.redirect('/urls')
})

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id
  const myUrls = urlOfUsers(userId, urlDatabase);
  const templateVars = { 
    urls: myUrls,
    user: users[userId],
  }
  res.cookie('first_timer', `${generateRandomString()}`)
  console.log(req.cookies)
  res.render('urls_index', templateVars)
});
// app.get("/urls", (req, res) => {
//   const templateVars = { 
//     urls: urlDatabase,
//     user: users[req.cookies.user_id]}
//   res.render("urls_index", templateVars);
// });

// app.get("/", (req, res) => {
//   res.render("urls_index", templateVars);
// });

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    return res.redirect('/login');
  }
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id],
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
    user: users[req.cookies.user_id],
   };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  if (req.cookies.user_id) {
    return res.redirect('/urls');
  }
  res.render('register')
});

app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    return res.redirect('/urls');
  }
  res.render('login')
});
//Helper code -----------
const getUserByUsername = (screenName) => {
  for (const userId in users) {
    const user = users[userId];

    if (user.screenName === screenName) {
      return user;
    }
  }

  return null;
};

//Update----------------------

app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  const id = generateRandomString()
  const longURL = req.body.longURL
  urlDatabase[id] = {longURL: longURL, userId: req.cookies.user_id };

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
    screenName: screenName,
    password: password,
  };
  res.redirect('/login')
});
//----Login---------
app.post('/login', (req, res) => {
  for (key in users) {
    console.log('---')
    console.log(key,":")
    console.log("user:", users[key].screenName)
    if (users[key].screenName == req.body.username) {
      if (users[key].password == req.body.pass) {
        // return res.send(`Welcome back ${users[key].screenName}`)
        // res.redirect('/')
        res.cookie('user_id', key)
        res.redirect('/urls')
      } 
    }
  }
  

  return res.send('Username or Password do not match.')
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/')
});

app.get("/u/:id", (req, res) => {
  const shortUrl = req.params.id
  const longURL = urlDatabase[shortUrl].longURL;
  console.log("id? :", shortUrl)
  console.log("urlDatabase", urlDatabase)
  res.redirect(longURL);
});

function generateRandomString() {
  let value = Math.random().toString(36).substring(2, 7);
  // console.log("Value: ", value);
  return value;
};

//Delete / Edit / 404 -----------------------

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
})
app.post("/urls/:id/edit", (req, res) => {
  const shortUrl = req.params.id;
  if (!req.cookies.user_id) {
    return res.redirect('/login');
  }
  urlDatabase[shortUrl].longURL = req.body.newLongUrl;
  res.redirect('/urls')
})
// app.post("/register/:id/edit", (req, res) => {
//   users[req.params.id] = req.body.newUser
//   res.redirect('/login')
// })



app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});




// const objLoop = function(obj) {
//   let output = {}
//   for (key in obj) {
//     output[key] = obj[key].longURL
//   }
//   return 
// };
// const longURL = objLoop(urlDatabase);