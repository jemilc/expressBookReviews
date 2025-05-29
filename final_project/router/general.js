const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books, null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  let isbn=req.params.isbn
  
  return res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author= req.params.author
  const booksByAuthor = Object.values(books).filter(book => book.author === author);

  // Verificamos si se encontraron libros para ese autor
  if (booksByAuthor.length > 0) {
    // Si hay libros, enviamos la lista de libros como respuesta JSON (código 200 OK)
    return res.status(200).json(booksByAuthor);
  } else {
    // Si no se encontraron libros para el autor, enviamos un mensaje y un código 404 Not Found
    return res.status(404).json({ message: "No books found for this author." });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title
  const booksByTitle= Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase())

  if (booksByTitle.length > 0) {
    // Si hay libros, enviamos la lista de libros como respuesta JSON (código 200 OK)
    return res.status(200).json(booksByTitle);
  } else {
    // Si no se encontraron libros para el autor, enviamos un mensaje y un código 404 Not Found
    return res.status(404).json({ message: "No books found for this title." });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book){
    const reviews= book.reviews;

    if (Object.keys(reviews).length>0) {
        return res.status(200).json (reviews);
    } else {
        return res.status(400).json({message: `No reviews found by the isbn = ${isbn}.`});
    }

  } else {
    return res.status(400).json({message: `Book no found by the isbn ${isbn}.`});
  }
  
  return res.status(200).json(books[book].review);
});

module.exports.general = public_users;