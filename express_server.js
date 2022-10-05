const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com" 
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const getUserByEmail = function(email) {
  for (let individual of Object.keys(users)) {
    if (users[individual].email === email) {
      return users[individual];
    }
  }
  return null;
};

app.get('/', (req, res) => {
  res.redirect(`/urls`);
});

app.get('/urls', (req, res) => {
  const lookup = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    user: users[lookup],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (req.cookies.user_id === undefined) {
    return res.redirect('/login');
  }
  const lookup = req.cookies["user_id"];
  const templateVars = {
    user: users[lookup],
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const lookup = req.cookies["user_id"];
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    user: users[lookup],
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL === undefined) {
    return res.send(`${req.params.id} is not in the database...`);
  }
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  if (req.cookies.user_id !== undefined) {
    return res.redirect('/urls');
  }
  const lookup = req.cookies["user_id"];
  const templateVars = {
    user: users[lookup],
  };
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  if (req.cookies.user_id !== undefined) {
    return res.redirect('/urls');
  }
  const lookup = req.cookies["user_id"];
  const templateVars = {
    user: users[lookup],
  };
  res.render('urls_login', templateVars);
});

app.post('/urls', (req, res) => {
  if (req.cookies.user_id === undefined) {
    return res.send('You cannot shorten URLs unless you are logged in.\n')
  }
  const newID = randString();
  urlDatabase[newID] = req.body.longURL;
  res.redirect(`/urls/${newID}`);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id/update', (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email);
  if (user === null || user.password !== req.body.password) {
    return res.sendStatus(403).send('please include email and password');
  }
  res.cookie("user_id", user.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '' || getUserByEmail(req.body.email) !== null) {
    res.sendStatus(400);
  } else {
    const userID = randString();
    users[userID] = {};
    users[userID].id = userID;
    users[userID].email = req.body.email;
    users[userID].password = req.body.password;
    res.cookie("user_id", userID);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  
});

const randString = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    if (Math.random() > 0.5) {
      result += chars.charAt(Math.floor(Math.random() * chars.length)).toLowerCase();
    } else {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
}