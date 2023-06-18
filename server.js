import express from 'express';
import sqlite3 from 'sqlite3';

// App Config
const app = express();
const port = process.env.PORT || 8001;

// Middlewares

// DB Config
const DBSOURCE = 'database.sqlite';
const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    } else {
        console.log("Connected to the SQLite database.")
        // Create table
        db.run(`CREATE TABLE courses (
                    id INT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP)`,
            (err) => {
                if (err) {
                   console.log("Table already created.");
                } 
            });
        
        db.run(`CREATE TABLE videos(
                    id INT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    url VARCHAR(255) NOT NULL,
                    course_id INT NOT NULL,
                    FOREIGN KEY (course_id) REFERENCES courses(id))`,
            (err) => {
                if (err) {
                    console.log("Table already created.");
                } 
            });
    };
});

// Course Reader


// API Endpoints
app.get('/', (req, res) => res.status(200).send('Hello World'));

// Listener
app.listen(port, () => console.log(`listening on localhost: ${port}`));