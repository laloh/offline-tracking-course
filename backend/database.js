import sqlite3  from "sqlite3";

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
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(255) NOT NULL,
                    path VARCHAR(255) NOT NULL,
                    description VARCHAR(255) NOT NULL,
                    image VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP)`,
            (err) => {
                if (err) {
                   console.log("Table already created.");
                } 
            });
        
        db.run(`CREATE TABLE videos(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title VARCHAR(255) NOT NULL,
                    url VARCHAR(255) NOT NULL,
                    watched BOOLEAN NOT NULL DEFAULT false,
                    course_id INT NOT NULL,
                    FOREIGN KEY (course_id) REFERENCES courses(id))`,
            (err) => {
                if (err) {
                    console.log("Table already created.");
                } 
            });
    };
});

export default db;
