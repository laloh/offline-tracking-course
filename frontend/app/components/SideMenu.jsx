"use client";

import axios from "axios";
import { useState, useEffect } from "react";

export default function SideMenu({ courseId, course, onVideoSelection }) {
  const [videoStatus, setVideoStatus] = useState({});

  const onVideoSelected = (videoUrl, videoName) => {
    onVideoSelection(videoUrl, videoName);
  };

  const fetchData = async () => {
    return axios.get(`http://localhost:8001/api/courses/${courseId}/videos`);
  };

  const handleCheckboxChange = (index, videoId, courseId, section) => {
    // Create a deep copy of the videoStatus state
    let newVideoStatus = JSON.parse(JSON.stringify(videoStatus));
  
    // Update the watched status
    newVideoStatus[section][index].watched = !newVideoStatus[section][index].watched;
  
    // Change db record to true or false
    const watched = newVideoStatus[section][index].watched;
  
    axios.put(`http://localhost:8001/course/video`, {
      courseId: courseId,
      videoId: videoId,
      watched: watched ? 1 : 0,
    });

    // update progress column in courses table
    
  
    // Update the state with the new object
    setVideoStatus(newVideoStatus);
  };

  const directoryVideos = (videos, index, section) => {
    return (
      <div className="px-4 py-6" key={index}>
        <h2 className="text-3xl font-bold text-gray-900 sm:text-3xl">
          Section {index}
        </h2>
        <p>{section}</p>
        <ul className="mt-6 space-y-1">
          {videos.map((video, videoIndex) => (
            <li key={videoIndex}>
              <div className="flex items-center pl-4 border border-gray-200 rounded dark:border-gray-700">
                <input
                  id={`checkbox-${videoIndex}`}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  checked={video.watched ? true : false}
                  onChange={() =>
                    handleCheckboxChange(videoIndex, video.id, video.course_id, section)
                  }
                />
                <label
                  htmlFor={`checkbox-${videoIndex}`}
                  className="w-full py-2 ml-1 text-sm font-medium text-gray-900 dark:text-black-300"
                >
                  <a
                    href="#"
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    onClick={() => onVideoSelected(video.url, video.title)}
                  >
                    {video.title}
                  </a>
                </label>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    fetchData().then((res) => {
  
      let dataGrouped = {};
      res.data.forEach((video) => {
        const section = video.section;
        // Initialize the array for this section if it does not exist yet
        if (!dataGrouped[section]) {
          dataGrouped[section] = [];
        }
        // Add the video to its section
        dataGrouped[section].push(video);
      });
  
      // Use the function to sort the dataGrouped object by keys and titles
      const sortedData = sortByKeyAndTitle(dataGrouped);
  
      setVideoStatus(sortedData);
  
    });
  }, [courseId]);
  
  const sortByKeyAndTitle = (data) => {
    const sortedKeys = Object.keys(data).sort((a, b) => {
      const numA = parseInt(a.match(/\d+/));
      const numB = parseInt(b.match(/\d+/));
      return numA - numB;
    });
  
    return sortedKeys.reduce((sortedData, key) => {
      sortedData[key] = data[key].sort((a, b) => {
        const numA = parseInt(a.title.match(/\d+/));
        const numB = parseInt(b.title.match(/\d+/));
        return numA - numB;
      });
      return sortedData;
    }, {});
  };
  

  return (
    <div className="flex h-screen flex-col justify-between border-e bg-white overflow-y-scroll">
      <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
        {Object.keys(videoStatus).map((section, index) =>
          directoryVideos(videoStatus[section], index, section)
        )}
      </div>
    </div>
  );
}
