import express from "express";
import bodyParser from "body-parser";
import db from "./database.js";
import { promises as fsPromises } from "fs";
import { default as cors } from "cors";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// App Config
const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 8001;

// Functions
const listDirectoryFiles = async (path) => {
  try {
    const files = await fsPromises.readdir(path);
    const mp4Files = files.filter((file) => file.endsWith(".mp4"));

    // filter only mp4 files
    return mp4Files;
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


app.get("/api/media/courses", async (req, res) =>{
  // read media directory
  const mediaPath = path.resolve("./media");
  const courses = await fsPromises.readdir(mediaPath);
  const directories = courses.filter((course) => course.indexOf(".") === -1);

  const coursesWithVideos = [];
  for (const directory of directories) {
    const videos = await listDirectoryFiles(`${mediaPath}/${directory}`);
    const files = await fsPromises.readdir(`${mediaPath}/${directory}`);
    const jpg = files.find((file) => file.endsWith(".jpg"));
    
    coursesWithVideos.push({
      id: uuidv4(),
      name: directory,
      videos,
      img: jpg
    });
  }

  res.json(coursesWithVideos);

});

app.post("/api/courses", (req, res) => {
  const { name, path, description } = req.body;
  const createdAt = new Date();
  const updatedAt = new Date();
  const image = `http://localhost:8001/images/${req.body.image}`;

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
            const videoUrl = `http://localhost:8001/videos/${name}/${video}`
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
// Get course's videos
app.get("/api/courses/:id/videos", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM videos WHERE course_id = ?`;
  db.all(sql, [id], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(
      rows
    );
  });
});

const storage = multer.diskStorage({
  destination: "./media",
  filename: (_req, file, cb) => {
    cb(null, file.originalname); // Use the original filename
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    // Access the uploaded file's information
    const { originalname, filename, path } = req.file;
    console.log("Original Name:", originalname);
    console.log("Stored Filename:", filename);
    console.log("File Path:", path);

    // File was successfully uploaded
    return res.status(200).send("File uploaded successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
});

app.get("/images/:coursename/:filename", (req, res) => {
  const { filename, coursename } = req.params;
  const imagePath = path.resolve(`./media/${coursename}`, filename);

  res.sendFile(imagePath); 
});

app.get("/videos/:courseName/:videoId", (req, res) => {
  const { courseName, videoId } = req.params;
  const videoPath = path.resolve("./media", courseName, videoId);

  res.sendFile(videoPath);
});


app.put("/course/video", (req, res) => {
  const { courseId, videoId, watched } = req.body
  const sql = `UPDATE videos SET watched = ? WHERE id = ? and course_id = ?`;

  console.log(courseId, videoId, watched);
  db.run(sql, [watched, videoId, courseId], function (err, result) {
    if (!err) {
      res.json({
        id: this.lastID,
        watched,
      });
    } else {
      console.log(err);
    }
  });

});

// Listener
app.listen(port, () => console.log(`listening on localhost: ${port}`));
