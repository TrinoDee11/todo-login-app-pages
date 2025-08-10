const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Middleware to serve static files
app.use(express.static('public'));

// Parse URL-encoded bodies (for form data)
app.use(bodyParser.urlencoded({ extended: true }));

// Setup session middleware
app.use(session({
  secret: 'this-is-a-secret-key', // change this to something secure in real apps
  resave: false,
  saveUninitialized: false,
}));

// Hardcoded user credentials (in real app use a database!)
const USER = {
  username: 'johndaka',
  password: '1234'
};

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next(); // user is logged in, proceed
  } else {
    res.redirect('/login'); // not logged in, redirect to login page
  }
}

// Login page
app.get('/login', (req, res) => {
  res.render('pages/login', { error: null, title: 'Login' });
});

// Handle login form submission
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username; // save user info in session
    res.redirect('/todo');
  } else {
    res.render('pages/login', { error: 'Invalid username or password', title: 'Login' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// In-memory task store for logged in user
let tasks = [];
let idCounter = 1;

// To-Do List page — protected route
app.get('/todo', isAuthenticated, (req, res) => {
  res.render('pages/todo', { user: req.session.user, tasks, title: 'Your To-Do List' });
});

// Add task
app.post('/add', isAuthenticated, (req, res) => {
  const title = req.body.title.trim();
  if (title.length > 0) {
    tasks.push({ id: idCounter++, title, completed: false });
  }
  res.redirect('/todo');
});

// Complete task
app.post('/complete/:id', isAuthenticated, (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = true;
  }
  res.redirect('/todo');
});

// Delete task
app.post('/delete/:id', isAuthenticated, (req, res) => {
  const id = Number(req.params.id);
  tasks = tasks.filter(t => t.id !== id);
  res.redirect('/todo');
});

// Redirect root to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});