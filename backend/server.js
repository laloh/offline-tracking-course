import express from "express";
import bodyParser from "body-parser";
import db from "./database.js";
import { promises as fsPromises } from "fs";

// App Config
const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 8001;

// Functions
const listDirectoryFiles = async (path) => {
  try {
    const files = await fsPromises.readdir(path);
    return files;
  } catch (err) {
    console.error("Unable to read directory:", err);
    throw err;
  }
};

// API Endpoints
app.get("/api/courses", (req, res) => {
  const sql = `SELECT * FROM courses`;

  // return rows in json
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

app.post("/api/courses", (req, res) => {
  const { name, path, description } = req.body;
  const createdAt = new Date();
  const updatedAt = new Date();

  const sql = `INSERT INTO courses (name, path, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`;
  const params = [name, path, description, createdAt, updatedAt];

  db.run(sql, params, async function (err, result) {
    if (!err) {
      res.json({
        id: this.lastID,
        name,
        path,
        description,
        createdAt,
        updatedAt,
      });

      try {
        const videos = await listDirectoryFiles(path);
        const insertSql = `INSERT INTO videos (title, url, course_id) VALUES (?, ?, ?)`;

        for (const video of videos) {
          await new Promise((resolve, reject) => {
            const videoUrl = `${path}/${video}`;
            db.run(insertSql, [video, videoUrl, this.lastID], (err, result) => {
              if (!err) {
                console.log(`video ${video} added to database`);
                resolve();
              } else {
                console.log(err);
                reject();
              }
            });
          });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log(err);
    }
  });
});

// Listener
app.listen(port, () => console.log(`listening on localhost: ${port}`));
