/* eslint-disable no-else-return */
// import express module
const express = require('express');
// create an express app
const app = express();
// require express middleware body-parser
const bodyParser = require('body-parser');
// require express session
const session = require('express-session');
const cookieParser = require('cookie-parser');


// set the view engine to ejs
app.set('view engine', 'ejs');
// set the directory of views
app.set('views', './views');
// specify the path of static directory
app.use(express.static(`${__dirname}/public`));

// use body parser to parse JSON and urlencoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// use cookie parser to parse request headers
app.use(cookieParser());
// use session to store user data between HTTP requests
app.use(session({
  secret: 'cmpe_273_secure_string',
  resave: false,
  saveUninitialized: true,
}));

// Only user allowed is admin
const Users = [{
  username: 'admin',
  password: 'admin',
}];
// By Default we have 3 books
const books = [
  { BookID: '1', Title: 'Book 1', Author: 'Author 1' },
  { BookID: '2', Title: 'Book 2', Author: 'Author 2' },
  { BookID: '3', Title: 'Book 3', Author: 'Author 3' },
];

const findBook = (bookID) => books.find((book) => book.BookID === bookID);

const hasEmptyContent = (...inputs) => inputs.some((input) => input.trim().length < 1);

// route to root
app.get('/', (req, res) => {
  // check if user session exits
  if (req.session.user) {
    res.redirect('/home');
  } else res.render('login');
});

app.post('/login', (req, res) => {
  if (req.session.user) {
    res.render('/home');
  } else {
    console.log('Inside Login Post Request');
    console.log('Req Body : ', req.body);
    // eslint-disable-next-line array-callback-return
    Users.filter((user) => {
      if (user.username === req.body.username && user.password === req.body.password) {
        req.session.user = user;
        res.redirect('/home');
      } else res.render('login', { error_msg: 'Username or password is invalid' });
    });
  }
});

app.get('/home', (req, res) => {
  if (!req.session.user) {
    res.redirect('/');
  } else {
    console.log('Session data : ', req.session);
    res.render('home', {
      books,
    });
  }
});

app.get('/create', (req, res) => {
  if (!req.session.user) {
    res.redirect('/');
  } else {
    res.render('create', { error_msg: null });
  }
});

// eslint-disable-next-line consistent-return
app.post('/create', (req, res) => {
  if (!req.session.user) {
    res.redirect('/');
  } else {
    const newBook = req.body;
    if (hasEmptyContent(newBook.Title, newBook.BookID, newBook.Author)) {
      return res.render('create', {
        error_msg: 'All fields are mandatory',
      });
    }
    if (!findBook(newBook.BookID)) {
      books.push(newBook);
      return res.render('home', {
        books,
      });
    } else {
      return res.render('create', {
        error_msg: 'BookID exists, Please create a new ID',
      });
    }
  }
});

app.get('/delete', (req, res) => {
  console.log('Session Data : ', req.session.user);
  if (!req.session.user) {
    res.redirect('/');
  } else {
    res.render('delete', { error_msg: null });
  }
});

// eslint-disable-next-line consistent-return
app.post('/delete', (req, res) => {
  const bookID = req.body.BookID;
  if (bookID) {
    const book = findBook(bookID);
    if (book) {
      console.log(books.splice(books.indexOf(book), 1));
      console.log('books count-', books.length);
      return res.redirect('home');
    }
    return res.render('delete', { error_msg: `Cannot find the book ID: ${bookID}` });

  // eslint-disable-next-line no-else-return
  } else {
    res.render('delete', { error_msg: 'No id given' });
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
