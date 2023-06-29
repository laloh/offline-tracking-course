"use client";

import Cards from "./components/Cards";
import { useEffect, useState } from "react";
import axios from "axios";

export default function HomePage() {
  const [courses, setCourses] = useState([]);

  const fetchData = async () => {
    return await axios.get("http://localhost:8001/api/courses");
  };

  useEffect(() => {
    fetchData().then((res) => {
      setCourses(res.data);
    });
  }, []);

  return (
    <>
      <div className="container m-auto grid grid-cols-3 gap-4">
        {courses.map((course) => (
          <Cards key={course.id} course={course} />
        ))}
      </div>
    </>
  );
}
