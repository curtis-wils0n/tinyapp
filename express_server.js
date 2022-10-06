const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {};

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

const urlsForUser = function(id) {
  let result = [];
  for (let link of Object.keys(urlDatabase)) {
    if (urlDatabase[link].userID === id) {
      result.push(link);
    }
  }
  return result;
};

const getUserByEmail = function(email) {
  for (let individual of Object.keys(users)) {
    if (users[individual].email === email) {
      return users[individual];
    }
  }
  return null;
};

app.get('/', (req, res) => {
  if (req.cookies.user_id !== undefined) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render('urls_landing', templateVars);
});

app.get('/urls', (req, res) => {
  if (req.cookies.user_id === undefined) {
    return res.redirect('/');
  }
  const lookup = req.cookies["user_id"];
  let validDatabase = {};
  for (const link of urlsForUser(lookup)) {
    if (urlDatabase[link]) {
      validDatabase[link] = urlDatabase[link];
    }
  }
  const templateVars = {
    urls: validDatabase,
    user: users[lookup],
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (req.cookies.user_id === undefined) {
    return res.redirect('/');
  }
  const lookup = req.cookies["user_id"];
  const templateVars = {
    user: users[lookup],
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  if (req.cookies.user_id === undefined) {
    return res.send('You are not logged in.');
  }
  const allowedURLs = urlsForUser(req.cookies["user_id"]);
  if (!allowedURLs.includes(req.params.id)) {
    return res.send('You do not have access to that shortened URL');
  }
  const lookup = req.cookies["user_id"];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[lookup],
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
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
  if (req.cookies["user_id"] === undefined) {
    return res.send('You cannot shorten URLs unless you are logged in.\n');
  }
  const newID = randString();
  urlDatabase[newID] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  };
  res.redirect(`/urls/${newID}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const allowed = urlsForUser(req.cookies["user_id"]);
  if (req.cookies["user_id"] === undefined || !allowed.includes(req.params.id)) {
    return res.send('You are not permitted to modify this URL.');
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id/update', (req, res) => {
  const allowed = urlsForUser(req.cookies["user_id"]);
  if (req.cookies["user_id"] === undefined || !allowed.includes(req.params.id)) {
    return res.send('You are not permitted to modify this URL.');
  }
  urlDatabase[req.params.id].longURL = req.body.newURL;
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
};