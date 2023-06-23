"use client";

import axios from "axios";
import { useState, useEffect } from "react";

export default function SideMenu({ courseId }) {
  const [videos, setVideos] = useState([]);
  useEffect(() => {}, []);

  const fetchData = async () => {
    return axios.get(`http://localhost:8001/api/courses/${courseId}/videos`);
  };

  useEffect(() => {
    fetchData().then((res) => {
      setVideos(
        res.data.sort((a, b) => {
          let stringA = String(a.title);
          let stringB = String(b.title);

          // Extract the numbers from the filenames
          let numA = parseInt(stringA.match(/\d+/));
          let numB = parseInt(stringB.match(/\d+/));

          // Compare the numbers
          return numA - numB;
        })
      );
    });
  }, []);

  return (
    <div className="flex h-screen flex-col justify-between border-e bg-white">
      <div className="px-4 py-6">
        <ul className="mt-6 space-y-1">
          {videos.map((video, index) => (
            <li key={index}>
              <div className="flex items-center pl-4 border border-gray-200 rounded dark:border-gray-700">
                <input
                  id="bordered-checkbox-1"
                  type="checkbox"
                  value=""
                  name="bordered-checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="bordered-checkbox-1"
                  className="w-full py-2 ml-1 text-sm font-medium text-gray-900 dark:text-black-300"
                >
                  {video.title}
                </label>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
        <a
          href="#"
          className="flex items-center gap-2 bg-white p-4 hover:bg-gray-50"
        >
          <img
            alt="Man"
            src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
            className="h-10 w-10 rounded-full object-cover"
          />

          <div>
            <p className="text-xs">
              <strong className="block font-medium">Lalo Carrera</strong>

              <span> lalocarrerahuerta@gmail.com</span>
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}
