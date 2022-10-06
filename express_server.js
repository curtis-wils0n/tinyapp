//- Required packages -//
const express = require('express');
const { getUserByEmail, urlsForUser, randString } = require('./helpers');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const favicon = require('serve-favicon');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

//- Global objects -//
const urlDatabase = {};
const users = {};

//- Middleware -//
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}));
app.use("/public/images", express.static("public/images"));
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(methodOverride('_method'));

//- Main routes -//
app.get('/', (req, res) => {
  if (req.session.user_id !== undefined) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
  };
  res.render('urls_landing', templateVars);
});
//- Routes for /urls -//
app.get('/urls', (req, res) => {
  if (req.session.user_id === undefined) {
    return res.status(401).send('You must be logged in to see your shortened URLs');
  }
  const lookup = req.session.user_id;
  let validDatabase = {};
  for (const link of urlsForUser(lookup, urlDatabase)) {
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

app.post('/urls', (req, res) => {
  if (req.session.user_id === undefined) {
    return res.status(401).send('You cannot shorten URLs unless you are logged in.\n');
  }
  const newID = randString();
  urlDatabase[newID] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${newID}`);
});

app.get('/urls/new', (req, res) => {
  if (req.session.user_id === undefined) {
    return res.redirect('/login');
  }
  const lookup = req.session.user_id;
  const templateVars = {
    user: users[lookup],
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  if (req.session.user_id === undefined) {
    return res.status(401).send('You are not logged in.');
  }
  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.status(400).send(`ID '${req.params.id}' does not exists.\n`);
  }
  const allowedURLs = urlsForUser(req.session.user_id, urlDatabase);
  if (!allowedURLs.includes(req.params.id)) {
    return res.status(403).send('You do not have access to that shortened URL');
  }
  const lookup = req.session.user_id;
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[lookup],
  };
  res.render('urls_show', templateVars);
});

app.put('/urls/:id', (req, res) => {
  const allowed = urlsForUser(req.session.user_id, urlDatabase);
  if (req.session.user_id === undefined) {
    return res.status(401).send('You are not logged in.\n');
  } else if (!allowed.includes(req.params.id)) {
    return res.status(403).send('You are not permitted to modify this URL.\n');
  }
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect('/urls');
});

app.delete('/urls/:id', (req, res) => {
  const allowed = urlsForUser(req.session.user_id, urlDatabase);
  if (req.session.user_id === undefined) {
    return res.status(401).send('You are not logged in.\n');
  } else if (!allowed.includes(req.params.id)) {
    return res.status(403).send('You are not permitted to modify this URL.\n');
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
//- Route for following a shortened url -//
app.get('/u/:id', (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    return res.status(400).send(`${req.params.id} is not in the database...`);
  }
  res.redirect(urlDatabase[req.params.id].longURL);
});
//- Routes for logging in and registering -//
app.get('/login', (req, res) => {
  if (req.session.user_id !== undefined) {
    return res.redirect('/urls');
  }
  const lookup = req.session.user_id;
  const templateVars = {
    user: users[lookup],
  };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user === undefined || !bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send('Incorrect email or password.\n');
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (req.session.user_id !== undefined) {
    return res.redirect('/urls');
  }
  const lookup = req.session.user_id;
  const templateVars = {
    user: users[lookup],
  };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Values cannot be blank.\n');
  } else if (getUserByEmail(req.body.email, users) !== undefined) {
    return res.status(403).send('Already registered. Please log in.\n');
  }
  const userID = randString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[userID] = {};
  users[userID].id = userID;
  users[userID].email = req.body.email;
  users[userID].password = hashedPassword;
  req.session.user_id = userID;
  res.redirect('/urls');
});
//- Logout Route -//
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});