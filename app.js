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

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});


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
    db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, filename TEXT, displayname TEXT, colourway TEXT, brand TEXT, type TEXT)");
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

app.get('/fitter', (req, res) => {
    res.render('fitter');
});

app.get('/random-image/:type', (req, res) => {
    const type = req.params.type;
    // Filter items by type and get a random item
    const filteredItems = items.filter(item => item.type === type);
    const randomItem = filteredItems[Math.floor(Math.random() * filteredItems.length)];
    if (randomItem) {
        res.json({ imageUrl: `/uploads/${randomItem.filename}` });
    } else {
        res.json({ imageUrl: null });
    }
});

app.post('/upload', upload.single('image'), (req, res) => {
    const filename = req.file.filename;
    const originalname = req.file.originalname;
    const displayname = originalname.substring(0, originalname.lastIndexOf('.')); // Remove file extension
    db.run("INSERT INTO items (filename, displayname) VALUES (?, ?)", [filename, displayname], (err) => {
        if (err) {
            console.error('Error inserting item into database:', err.message);
            return res.status(500).send('Error uploading item');
        }
        // Reload items from the database
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
    res.render('item', { itemId: id, item, imageUrl: `/uploads/${item.filename}` }); // Pass the image URL to the template
});


app.get('/', (req, res) => {
    console.log(items); // Log the items array
    res.render('index', { items });
});

app.post('/set-info/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { brand, colourway, displayname, type } = req.body;
    const item = items.find(item => item.id === id);
    if (!item) {
        return res.status(404).send('Item not found');
    }
    // Update item in database
    db.run("UPDATE items SET brand = ?, type = ?, colourway = ?, displayname = ? WHERE id = ?", [brand, type, colourway, displayname, id], (err) => {
        if (err) {
            console.error('Error updating item in database:', err.message);
            return res.status(500).send('Error updating item');
        }
        item.colourway = colourway;
        item.displayname = displayname;
        item.brand = brand;
        item.type = type;
        res.redirect('/');
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
