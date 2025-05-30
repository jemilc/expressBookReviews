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

function getBooksAsync(callback) {
    
    setTimeout(() => {
       callback(null, books); // null para error (no hubo), y 'books' como los datos
    }, 3000); 
  }

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  
  getBooksAsync ((error, data) => {
    if (error){
        console.error("Error al obtener los libros");
        return res.status(500).json({message: "Error al obtener los libros"})
    } else {

        return res.status(200).send(JSON.stringify(data,null,4));
    }
    })
});

function getBooksByIdPromise(isbn) {
    return new Promise ((resolve, reject)=>{
    
    setTimeout(() => {
        const book = books[isbn];
        if (book){
            resolve (book);
        } else {
            reject(new Error(`Book with ISBN ${isbn} not found`),null);
        }
       
    }, 3000); 
  })
}
// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  //Write your code here
  const isbn=req.params.isbn
  try {
    book = await getBooksByIdPromise (isbn);
    return res.status(200).json(book); 
  } catch (error) {
    console.error("Error al obtener el libro:", error.message);
    return res.status(404).json({ message: error.message });
  }
 });

 function getBooksByAuthorPromise(author) {
    return new Promise((resolve, reject) => {
      // Simulamos un retraso, como si estuviéramos buscando en una base de datos
      setTimeout(() => {
        const booksByAuthor = Object.values(books).filter(book => book.author === author);
  
        if (booksByAuthor.length > 0) {
          resolve(booksByAuthor); 
        } else {
             reject(new Error(`No books found for author: ${author}.`));
        }
      }, 1000); 
    });
  }
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  //Write your code here
  const author= req.params.author;

  try{
    const booksByAuthor = await getBooksByAuthorPromise(author);
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: "No books found for this author." });
  }
});

// Get all books based on title
function getBooksByTitlePromise(title) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());
  
        if (booksByTitle.length > 0) {
          resolve(booksByTitle);
        } else {
          reject(new Error(`No books found for title: ${title}.`));
        }
      }, 500);
    });
  }
  
  public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
  
    try {
      const filteredBooks = await getBooksByTitlePromise(title); 
      return res.status(200).json(filteredBooks);
    } catch (error) {
      return res.status(404).json({ message: error.message });
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