const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com" 
};

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.redirect(`/urls`);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  const newID = randString();
  urlDatabase[newID] = req.body.longURL;
  res.redirect(`/urls/${newID}`);
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