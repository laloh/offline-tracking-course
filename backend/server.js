import express from "express";
import bodyParser from "body-parser";
import db from "./database.js";
import { promises as fsPromises } from "fs";
import {default as cors} from "cors";
import multer from 'multer';
import path from 'path';


// App Config
const app = express();
app.use(bodyParser.json());
app.use(cors());

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

const absolutePath = path.resolve('./media');
app.post("/api/courses", (req, res) => {
  const { name, path, description } = req.body;
  const createdAt = new Date();
  const updatedAt = new Date();
  const image = `${absolutePath}/${req.body.image}`;


  const sql = `INSERT INTO courses (name, path, description, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [name, path, description, image, createdAt, updatedAt];

  db.run(sql, params, async function (err, result) {
    if (!err) {
      res.json({
        id: this.lastID,
        name,
        path,
        description,
        image,
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

const storage = multer.diskStorage({
  destination: './media',
  filename: (_req, file, cb) => {
    cb(null, file.originalname); // Use the original filename
  },
});

const upload = multer({ storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    // Access the uploaded file's information
    const { originalname, filename, path } = req.file;
    console.log('Original Name:', originalname);
    console.log('Stored Filename:', filename);
    console.log('File Path:', path);

    // File was successfully uploaded
    return res.status(200).send('File uploaded successfully');
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
});

// Listener
app.listen(port, () => console.log(`listening on localhost: ${port}`));

