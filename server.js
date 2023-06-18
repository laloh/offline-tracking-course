import express from 'express';
import bodyParser from 'body-parser';
import db from './database.js';

// App Config
const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 8001;

// Middlewares

// API Endpoints
app.get('/api/courses', (req, res) => {
    const sql = `SELECT * FROM courses`;
    
    // return rows in json
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

app.post('/api/courses', (req, res) => {
    const { name, path, description } = req.body;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const sql = `INSERT INTO courses (name, path, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`;
    const params = [name, path, description, createdAt, updatedAt];
    
    db.run(sql, params, function(err, result) {
        if (!err) {
            res.json({
                id: this.lastID,
                name,
                path,
                description,
                createdAt,
                updatedAt
            })
        }
    });
});


// Listener
app.listen(port, () => console.log(`listening on localhost: ${port}`));