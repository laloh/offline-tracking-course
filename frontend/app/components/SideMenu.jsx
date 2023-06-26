"use client";

import axios from "axios";
import { useState, useEffect } from "react";

export default function SideMenu({ courseId, onVideoSelection }) {
  const [videos, setVideos] = useState([]);
  const [checkedStatus, setCheckedStatus] = useState([]);

  const onVideoSelected = (videoUrl, videoName) => {
    // Notify the parent component
    onVideoSelection(videoUrl, videoName);
  };

  const fetchData = async () => {
    return axios.get(`http://localhost:8001/api/courses/${courseId}/videos`);
  };

  const handleCheckboxChange = (index, videoId, courseId) => {
    setCheckedStatus(
      checkedStatus.map((value, i) => (i === index ? !value : value))
    );

    // Change db record to true or false
    const watched = checkedStatus[index] ? 0 : 1;
    axios.put(`http://localhost:8001/course/video`, {
      courseId: courseId,
      videoId: videoId,
      watched: watched,
    });
  };

  const directoryVideos = (videos) => {
    return (
      <div className="px-4 py-6">
        <ul className="mt-6 space-y-1">
          {videos.map((video, index) => (
            <li key={index}>
              <div className="flex items-center pl-4 border border-gray-200 rounded dark:border-gray-700">
                <input
                  id={`checkbox-${index}`}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  checked={checkedStatus[index]}
                  onChange={() =>
                    handleCheckboxChange(index, video.id, video.course_id)
                  }
                />
                <label
                  htmlFor={`checkbox-${index}`}
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
      const sortedVideos = res.data.sort((a, b) => {
        let stringA = String(a.title);
        let stringB = String(b.title);

        // Extract the numbers from the filenames
        let numA = parseInt(stringA.match(/\d+/));
        let numB = parseInt(stringB.match(/\d+/));

        // Compare the numbers
        return numA - numB;
      });

      setVideos(sortedVideos);
      setCheckedStatus(
        sortedVideos.map((video) => (video.watched === 1 ? true : false))
      );
    });
  }, [courseId]);

  return (
    <div className="flex h-screen flex-col justify-between border-e bg-white">
      <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">

        {directoryVideos(videos)}

      </div>
    </div>
  );
}
