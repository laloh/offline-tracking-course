import express from "express";
import db from "./database.js";
import path from "path";
import { promises as fsPromises } from "fs";
import fs from "fs";
import axios from "axios";

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

router.get("/videos/:courseName/:section?/:videoId", async (req, res) => {
  const { courseName, section, videoId } = req.params;

  let videoPath;

  if (section) {
    videoPath = path.resolve("./media", courseName, section, videoId);
  } else {
    videoPath = path.resolve("./media", courseName, videoId);
  }

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
        videoId
      });
    } else {
      console.log(err);
    }
  });
});

const MEDIA_PATH = "./media";

// List of video file extensions you want to include
const VIDEO_EXTENSIONS = [".mp4", ".avi", ".mov", ".mkv"];
const IMAGE_EXTENSIONS = [".jpg", ".png", ".gif", ".bmp"];

function isVideoFile(filename) {
  return VIDEO_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

router.get("/api/init", async (req, res) => {
  // Read the directories in the MEDIA_PATH
  // Filter out any items that are not directories
  const courseDirs = fs.readdirSync(MEDIA_PATH).filter((item) => {
    const itemPath = path.join(MEDIA_PATH, item);
    return fs.lstatSync(itemPath).isDirectory();
  });

  // Delete default directory
  const defaultIndex = courseDirs.indexOf("default");
  if (defaultIndex > -1) {
    courseDirs.splice(defaultIndex, 1);
  }

  // Map each course directory to a course object
  const courses = courseDirs.map((courseDir) => {
    // Get the files in the course directory
    const files = fs.readdirSync(path.join(MEDIA_PATH, courseDir));

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
        sections.push({ name: sectionDir, videos: videos, path: sectionPath });
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
              path: coursePath,
            });
          }
        }
      }
    });

    // filter the first image file
    const imgFile =
      files.find((file) =>
        IMAGE_EXTENSIONS.some((extension) => file.endsWith(extension))
      ) || "cover.png";

    const url =
      imgFile === "cover.png"
        ? `http://localhost:8001/images/default/${imgFile}`
        : `http://localhost:8001/images/${courseDir}/${imgFile}`;

    // Return a course object with the directory's name and sections
    return {
      course: courseDir,
      img: url,
      sections: sections,
      path: coursePath,
    };
  });

  // insert course in database
  for (const course in courses) {
    const courseExists = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM courses WHERE name = ?`;
      db.get(sql, [courses[course].course], (err, row) => {
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
      console.log(`course ${courses[course].course} already exists`);
      continue;
    }

    const sql = `INSERT INTO courses (name, path, image) VALUES (?, ?, ?)`;
    const params = [
      courses[course].course,
      courses[course].path,
      courses[course].img,
    ];

    db.run(sql, params, function (err, result) {
      if (!err) {
        console.log(`course ${courses[course].course} added to database`);

        // insert sections in database
        for (const section in courses[course].sections) {
          for (const video of courses[course].sections[section].videos) {
            const sql = `INSERT INTO videos (title, section, url, watched, course_id) VALUES (?, ?, ?, ?, ?)`;
            const url =
              courses[course].sections[section].name === "default"
                ? `http://localhost:8001/videos/${courses[course].course}/${video}`
                : `http://localhost:8001/videos/${courses[course].course}/${courses[course].sections[section].name}/${video}`;

            const params = [
              video,
              courses[course].sections[section].name,
              url,
              false,
              this.lastID,
            ];
            db.run(sql, params, function (err, result) {
              if (!err) {
                console.log(`video ${video} added to database`);
              } else {
                console.log(err);
              }
            });
          }
        }
      } else {
        console.log(err);
      }
    });
  }

  res.json(courses);
});

router.get("/api/courses", (req, res) => {
  db.all(
    "SELECT id, name as course, path, image as img, progress FROM courses ORDER BY name",
    (err, courses) => {
      if (err) {
        return console.error(err.message);
      }
      db.all(
        "SELECT id, title as video, section as name, url, watched, course_id FROM videos ORDER BY section, title",
        (err, videos) => {
          if (err) {
            return console.error(err.message);
          }
          const output = [];

          for (const course of courses) {
            const courseVideos = videos.filter(
              (video) => video.course_id === course.id
            );
            const sectionsMap = {};

            for (const video of courseVideos) {
              if (!sectionsMap[video.name]) {
                sectionsMap[video.name] = {
                  name: video.name,
                  videos: [],
                  path: course.path,
                };
              }

              sectionsMap[video.name].videos.push(video.url);
              sectionsMap[video.name].videos.sort((a, b) =>
                a.localeCompare(b, undefined, { numeric: true })
              ); // Sorting videos
            }

            const sortedSections = Object.values(sectionsMap).sort((a, b) =>
              a.name.localeCompare(b.name, undefined, { numeric: true })
            ); // Sorting sections

            output.push({
              id: course.id,
              course: course.course,
              img: course.img,
              sections: sortedSections,
              path: course.path,
              progress: course.progress,
              content: courseVideos.length, 
            });
          }

          res.json(output);
        }
      );
    }
  );
});

router.put("/api/course/progress", (req, res) => {
  const { course_id } = req.body;

  // Use Promise.all to wait for both queries to complete
  Promise.all([
    new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as watched FROM videos WHERE course_id = ${course_id} AND watched = 1`,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.watched);
          }
        }
      );
    }),
    new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as videos FROM videos WHERE course_id = ${course_id}`,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.videos);
          }
        }
      );
    })
  ])
    .then(([watched, videos]) => {
      const progress = Math.round((watched / videos) * 100);
      db.run(
        `UPDATE courses SET progress = ${progress} WHERE id = ${course_id}`
      );
      res.json("Courses Updates Succesfully");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "An error occurred" });
    });
});



export default router;
