import Cards from "./components/Cards";


export default function HomePage() {
  
  const courses = Array(10).fill({
    "id": 123,
    "name": "Rocket Science 101",
    "description": "Learn the basics of rocket science.",
    "path": "/Users/lalo/Documents/TheFullStackCourse"
  })

  return (
    <>
      <div className="container m-auto grid grid-cols-3 gap-4">

        {courses.map((course) => (
          <Cards key={course.id} {...course}/>
      ))}

      </div>
    </>
  );
}