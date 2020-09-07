const express = require('express');
const bodyParser = require('body-parser');
const { initDB } = require('./db');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const db = initDB();

const PORT = process.env.PORT || 4001;

const { quotes } = require('./data');
const { getRandomElement } = require('./utils');

app.get("/users", (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            res.status(500).json({"error": err.message});
        } else {
            res.json({users: rows})
        }
    });
});

app.get("/users/:id", (req, res) => {
    const { id } = req.params;
    db.all("SELECT * FROM users where id is (?)", [id], (err, rows) => {
        if (err) {
            res.status(500).json({"error": err.message});
        } else if (rows.length === 0) {
            res.json({user: {}})
        } else {
            res.json({user: rows[0]})
        }
    })
});

app.post("/users", (req, res) => {
    const { user: { username, password} } = req.body;
    const insertStmt = "INSERT INTO users(username,password) VALUES (?,?)";
    db.run(insertStmt, [username, password], function(err, result) {
        if (err) {
            res.status(500).json({ "error": err.message });
        } else {
            res.json({
                id: this.lastID,
                username,
                password
            })
        }
    })
});

// GET a random Quote.
app.get('/api/quotes/random', (req, res) => {
    const randomQuote = getRandomElement(quotes);
    res.send({ quote: randomQuote });
});

app.get('/api/quotes', (req, res) => {
    const sortQuotes = quotes.filter(quote => {
        return quote.person === req.query.person;
    });
    if (req.query.person) {
        res.send({ quotes: sortQuotes });
    } else {
        res.send({ quotes: quotes});
    }
});

app.post('/api/quotes', (req, res) => {
    // console.log(req.query);  // logs { quote: 'You can do it', person: 'rob' }
    
    const newPost = req.query.quote;
    const person = req.query.person;

    // console.log(person); // logs name
    // console.log(newPost); // logs quote
    
    if (newPost && person) {
        quotes.push({ quote: newPost, person: person });
        // quotes.push(postObj);
        res.send({ quote: { quote: newPost, person: person } });
    } else {
        res.status(400).send();
    }
});


app.listen(PORT, () => console.log("Simple server running on http://localhost:4001"));

