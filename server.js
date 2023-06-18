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
    res.status(200).send('Hello World');
});

app.post('/api/courses', (req, res) => {
    const { name, path, description } = req.body;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const sql = `INSERT INTO courses (name, path, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`;
    const params = [name, path, description, createdAt, updatedAt];
    
    db.run(sql, params);

    res.status(201).send('Hello World');
});


// Listener
app.listen(port, () => console.log(`listening on localhost: ${port}`));