import express from 'express';
import db from "./database.js";
import path from "path";
import { promises as fsPromises } from "fs";

const router = express.Router();

// Functions
const listDirectoryFiles = async (path) => {
  try {
    const files = await fsPromises.readdir(path);
    const formats = ['.mp4', '.mkv', '.mov', '.webm', '.flv'];
    const videoFiles = files.filter((file) => formats.some((format) => file.endsWith(format)));

    // filter only mp4 files
    return videoFiles;
  } catch (err) {
    console.error("Unable to read directory:", err);
    throw err;
  }
};

/* --------------------------------------
  * API Endpoint
  * GET  /api/courses
  * POST /api/courses
  * GET  /api/media/courses
  * GET  /api/courses/:id/videos
  * GET  /images/:courseName/:fileName
  * GET  /videos/:courseName/:videoId
  * PUT  /course/video
 --------------------------------------*/

// API Endpoints
router.get("/api/courses", async (req, res) => {
  const sql = `SELECT * FROM courses`;

  // return rows in json
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }

    res.json(rows);
  });
});

router.get("/api/media/courses", async (req, res) => {
  const mediaPath = path.resolve("./media");
  const courses = await fsPromises.readdir(mediaPath);
  const directories = courses.filter((course) => course.indexOf(".") === -1);

  for (const directory of directories) {
    const files = await fsPromises.readdir(path.resolve("./media", directory));
   
    const formats = ['.jpg', '.png', '.gif', '.bmp'];
    const imgFile = files.find((file) => formats.some((format) => file.endsWith(format))) || 'cover.png';

    const coursePathName = path.resolve("./media", directory);
    const description = "";
    
    let image = `http://localhost:8001/images/${directory}/${imgFile}`;
    if (imgFile === 'cover.png') {
      image = `http://localhost:8001/images/default/${imgFile}`;
    }

    const createdAt = new Date();
    const updatedAt = new Date();

    const sql = `INSERT INTO courses (name, path, description, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      directory,
      coursePathName,
      description,
      image,
      createdAt,
      updatedAt,
    ];

    // review if course already exists
    const courseExists = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM courses WHERE name = ?`;
      db.get(sql, [directory], (err, row) => {
        if (!err) {
          if (row) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          reject(err);
        }
      });
    });

    if (courseExists) {
      console.log(`course ${directory} already exists`);
      continue;
    };

    db.run(sql, params, async function (err, result) {
      if (!err) {
        try {
          const videos = await listDirectoryFiles(coursePathName);
          const insertSql = `INSERT INTO videos (title, url, course_id) VALUES (?, ?, ?)`;

          for (const video of videos) {
            await new Promise((resolve, reject) => {
              const videoUrl = `http://localhost:8001/videos/${directory}/${video}`;
              db.run(
                insertSql,
                [video, videoUrl, this.lastID],
                (err, result) => {
                  if (!err) {
                    console.log(`video ${video} added to database`);
                    resolve();
                  } else {
                    console.log(err);
                    reject();
                  }
                }
              );
            });
          }
        } catch (err) {
          console.log(err);
        }
      } else {
        console.log(err);
      }
    });
  }

  res.json({ message: "success" });
});

router.get("/api/courses/:id/videos", async (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM videos WHERE course_id = ?`;
  db.all(sql, [id], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

router.get("/images/:coursename/:filename", async (req, res) => {
  const { filename, coursename } = req.params;
  const imagePath = path.resolve(`./media/${coursename}`, filename);

  res.sendFile(imagePath);
});

router.get("/videos/:courseName/:videoId", async (req, res) => {
  const { courseName, videoId } = req.params;
  const videoPath = path.resolve("./media", courseName, videoId);

  res.sendFile(videoPath);
});

router.put("/course/video", async (req, res) => {
  const { courseId, videoId, watched } = req.body;
  const sql = `UPDATE videos SET watched = ? WHERE id = ? and course_id = ?`;

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

const readNestedDirectories = async (directoryPath) => {
  try {
    const files = await fsPromises.readdir(directoryPath);
    const videoFormats = ['.mp4', '.mkv', '.mov', '.webm', '.flv'];

    const sections = [];
    const videos = [];

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const fileStats = await fsPromises.stat(filePath);

      if (fileStats.isDirectory()) {
        const sectionVideos = await readNestedDirectories(filePath);
        if (sectionVideos.length > 0) {
          sections.push({
            name: file,
            videos: sectionVideos,
          });
        }
      } else if (videoFormats.includes(path.extname(file).toLowerCase())) {
        videos.push(file);
      }
    }

    return sections.length > 0 ? sections : videos;
  } catch (error) {
    console.error("Error reading directory:", error);
    return [];
  }
};

router.get("/api/media/courses2", async (req, res) => {
  const mediaPath = path.resolve("./media");
  const courseList = [];

  try {
    const courses = await fsPromises.readdir(mediaPath);

    for (const course of courses) {
      const coursePath = path.join(mediaPath, course);
      const courseStats = await fsPromises.stat(coursePath);

      if (courseStats.isDirectory()) {
        const sectionsOrVideos = await readNestedDirectories(coursePath);

        if (sectionsOrVideos.length > 0) {
          courseList.push({
            course: course,
            sections: sectionsOrVideos,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error reading courses:", error);
  }

  res.json(courseList);
});




export default router;