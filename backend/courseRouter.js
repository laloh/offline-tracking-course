import express from "express";
import db from "./database.js";
import path from "path";
import { promises as fsPromises } from "fs";
import fs from "fs";

const router = express.Router();

// Functions
const listDirectoryFiles = async (path) => {
  try {
    const files = await fsPromises.readdir(path);
    const formats = [".mp4", ".mkv", ".mov", ".webm", ".flv"];
    const videoFiles = files.filter((file) =>
      formats.some((format) => file.endsWith(format))
    );

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

    const formats = [".jpg", ".png", ".gif", ".bmp"];
    const imgFile =
      files.find((file) => formats.some((format) => file.endsWith(format))) ||
      "cover.png";

    const coursePathName = path.resolve("./media", directory);
    const description = "";

    let image = `http://localhost:8001/images/${directory}/${imgFile}`;
    if (imgFile === "cover.png") {
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
    }

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

const MEDIA_PATH = "./media";

// List of video file extensions you want to include
const VIDEO_EXTENSIONS = [".mp4", ".avi", ".mov", ".mkv"];

function isVideoFile(filename) {
  return VIDEO_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

router.get("/folders", async (req, res) => {
  // Read the directories in the MEDIA_PATH
  // Filter out any items that are not directories
  const courseDirs = fs.readdirSync(MEDIA_PATH).filter((item) => {
    const itemPath = path.join(MEDIA_PATH, item);
    return fs.lstatSync(itemPath).isDirectory();
  });
  

  // Map each course directory to a course object
  const courses = courseDirs.map((courseDir) => {
    const coursePath = path.join(MEDIA_PATH, courseDir);
    const sections = [];

    const sectionDirs = fs.readdirSync(coursePath);
    sectionDirs.forEach((sectionDir) => {
      const sectionPath = path.join(coursePath, sectionDir);

      // Check if the item is a directory
      if (fs.lstatSync(sectionPath).isDirectory()) {
        // If it's a directory, it's a named section
        // Filter the files in the directory to only include video files
        const videos = fs.readdirSync(sectionPath).filter(isVideoFile);

        // Add a section with the directory's name and videos
        sections.push({ name: sectionDir, videos: videos });
      } else {
        // If it's not a directory, it's a video in the default section
        // Ignore system files and non-video files
        if (!sectionDir.startsWith(".") && isVideoFile(sectionDir)) {
          // Look for the default section in the sections array
          const defaultSection = sections.find((s) => s.name === "default");

          // If the default section exists, add the video to it
          // If it doesn't, create it with the video
          if (defaultSection) {
            defaultSection.videos.push(sectionDir);
          } else {
            sections.push({
              name: "default",
              videos: [sectionDir],
            });
          }
        }
      }
    });

    // Return a course object with the directory's name and sections
    return {
      course: courseDir,
      sections: sections,
    };
  });

  // Send the courses as the response
  for (const course in courses) {
    
    // order names
    courses[course].sections = courses[course].sections.sort((a, b) => {
      let numA = parseInt(a.name.match(/\d+/));
      let numB = parseInt(b.name.match(/\d+/));
      return numA - numB;
    });

    for (const section in courses[course].sections) {
      courses[course].sections[section].videos = 
        courses[course].sections[section].videos.sort((a, b) => {
          let numA = parseInt(a.match(/\d+/));
          let numB = parseInt(b.match(/\d+/));
          return numA - numB;
        });
    }
  }

  res.json(courses);
});

export default router;
