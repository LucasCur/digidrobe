const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to SQLite database
const db = new sqlite3.Database('digidrobe.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the digidrobe database.');
    }
});

// Create table for items if it doesn't exist
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, filename TEXT, brand TEXT, type TEXT)");
});

// Sample data (replace with actual data from database)
let items = [];

// Load items from database
db.all("SELECT * FROM items", (err, rows) => {
    if (err) {
        console.error('Error fetching items from database:', err.message);
    } else {
        items = rows;
    }
});

app.get('/', (req, res) => {
    res.render('index', { items });
});

app.post('/upload', upload.single('image'), (req, res) => {
    const filename = req.file.filename;
    const newItem = { filename };
    // Insert item into database
    db.run("INSERT INTO items (filename) VALUES (?)", [filename], (err) => {
        if (err) {
            console.error('Error inserting item into database:', err.message);
            return res.status(500).send('Error uploading item');
        }
        // Reload items from database
        db.all("SELECT * FROM items", (err, rows) => {
            if (err) {
                console.error('Error fetching items from database:', err.message);
                return res.status(500).send('Error fetching items');
            }
            items = rows;
            res.redirect('/');
        });
    });
});


app.get('/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
        const filename = items[index].filename;
        fs.unlinkSync(`./public/uploads/${filename}`);
        items.splice(index, 1);
        // Delete item from database
        db.run("DELETE FROM items WHERE id = ?", [id], (err) => {
            if (err) {
                console.error('Error deleting item from database:', err.message);
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

app.get('/item/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = items.find(item => item.id === id);
    if (!item) {
        return res.status(404).send('Item not found');
    }
    res.render('item', { itemId: id, item });
});

app.get('/', (req, res) => {
    console.log(items); // Log the items array
    res.render('index', { items });
});

app.post('/set-info/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { brand, type } = req.body;
    const item = items.find(item => item.id === id);
    if (!item) {
        return res.status(404).send('Item not found');
    }
    // Update item in database
    db.run("UPDATE items SET brand = ?, type = ? WHERE id = ?", [brand, type, id], (err) => {
        if (err) {
            console.error('Error updating item in database:', err.message);
        }
        item.brand = brand;
        item.type = type;
        res.redirect('/');
    });
});

// Start server on a random port if port 3000 is already in use
app.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is already in use. Trying another port...`);
        port++;
        startServer();
    } else {
        console.error('Server error:', err.message);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
