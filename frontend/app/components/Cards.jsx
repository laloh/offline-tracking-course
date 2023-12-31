import Link from "next/link";
import axios from "axios";
import { useEffect } from "react";

export default function Cards({ course }) {
  const courseHref = `/course/${course.id}`;
  const courseImg = course.img;

  useEffect(() => {
    axios.put("http://localhost:8001/api/course/progress", {
        course_id: course.id,
    }).then((res) => {
      console.log(res.data);
    })
  }, [])

  return (
    <Link
      href={courseHref}
      className="block rounded-lg p-4 shadow-sm shadow-indigo-100"
    >
      <img
        alt="Course"
        src={courseImg}
        className="h-56 w-full rounded-md object-cover"
      />

      <div className="mt-2">
        <div>
          <dd className="font-medium">{course.course}</dd>
        </div>
        <div>
          <div>
            <span id="ProgressLabel" className="sr-only">
              Loading
            </span>

            <span
              role="progressbar"
              aria-labelledby="ProgressLabel"
              className="block rounded-full bg-gray-200"
            >
              <span
                className="block h-3 rounded-full bg-green-500"
                style={{ width: `${course.progress}%` }}
              ></span>
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-8 text-xs">
          <div className="sm:inline-flex sm:shrink-0 sm:items-center sm:gap-2">
            <svg
              className="h-4 w-4 text-indigo-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
              />
            </svg>

            <div className="mt-1.5 sm:mt-0">
              <p className="text-gray-500">Progress</p>
              <p className="font-medium">{course.progress}%</p>
            </div>
          </div>

          <div className="sm:inline-flex sm:shrink-0 sm:items-center sm:gap-2">
            <svg
              className="h-4 w-4 text-indigo-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>

            <div className="mt-1.5 sm:mt-0">
              <p className="text-gray-500">Videos</p>

              <p className="font-medium">{course.content}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
