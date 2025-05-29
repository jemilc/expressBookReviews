const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();


let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
        const username = req.body.username;
        const password = req.body.password;
    
        // Check if username or password is missing
        if (!username || !password) {
            return res.status(404).json({ message: "Error logging in" });
        }
    
        // Authenticate user
        if (authenticatedUser(username, password)) {
            // Generate JWT access token
            let accessToken = jwt.sign({
                data: password
            }, 'access', { expiresIn: 60 * 60 });
    
            // Store access token and username in session
            req.session.authorization = {
                accessToken, username
            }
            return res.status(200).send("User successfully logged in");
        } else {
            return res.status(208).json({ message: "Invalid Login. Check username and password" });
        }
    });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => { // La ruta en index.js es "/customer", luego "/customer/auth/*"
    // entonces esta ruta será /customer/auth/review/:isbn
    const isbn = req.params.isbn;
    const reviewText = req.query.review; // Es común enviar la review como query parameter o en el body
    // Para simplificar, asumiremos que la review viene en el query parameter 'review'.
    // Si viene en el body, usa: const reviewText = req.body.review;

    // Asegúrate de que el usuario loggeado esté disponible de la sesión o del token
    const username = req.session.authorization?.username; // Accedemos al username de la sesión

    if (!username) {
    return res.status(403).json({ message: "User not logged in or session expired." });
    }

    // 1. Verificar si el libro existe
    if (!books[isbn]) { // 'books' viene de booksdb.js
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    // 2. Obtener el objeto del libro
    let book = books[isbn];

    // 3. Verificar si se proporcionó una review
    if (!reviewText) {
    return res.status(400).json({ message: "Review text is required." });
    }

    // 4. Añadir o actualizar la review
    // Las reviews son un objeto donde la clave es el username
    book.reviews[username] = reviewText; 

    return res.status(200).json({ message: `Review for ISBN ${isbn} by user ${username} added/updated successfully.`, reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(403).json({ message: "User not logged in or session expired." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    let book = books[isbn];

    // Verificar si el usuario tiene una review para eliminar
    if (book.reviews && book.reviews[username]) {
        delete book.reviews[username]; // Eliminar la review del usuario
        return res.status(200).json({ message: `Review by user ${username} for ISBN ${isbn} deleted successfully.`, reviews: book.reviews });
    } else {
        return res.status(404).json({ message: `No review found from user ${username} for ISBN ${isbn}.` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;