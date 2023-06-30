import sqlite3 from "sqlite3";
import fs from "fs";

const DBSOURCE = "./data/database.sqlite";
const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    // Create table
    db.run(
      `CREATE TABLE courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            path VARCHAR(255) NOT NULL,
            progress INTEGER DEFAULT 0,
            image VARCHAR(255) NOT NULL)`,
      (err) => {
        if (err) {
          console.log("Table already created.");
        }
      }
    );

    db.run(
      `CREATE TABLE videos(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(255) NOT NULL,
            section VARCHAR(255) NOT NULL,
            url VARCHAR(255) NOT NULL,
            watched BOOLEAN NOT NULL DEFAULT false,
            course_id INT NOT NULL,
            FOREIGN KEY (course_id) REFERENCES courses(id))`,
      (err) => {
        if (err) {
          console.log("Table already created.");
        }
      }
    );
  }

  const backupPath = "./data/backup.sqlite";
  fs.copyFileSync(DBSOURCE, backupPath);

});

export default db;
