import {useRef} from "react";
import { default as axios } from "axios";

export default function Modal({ visible, onClose }) {
  if (!visible) return null;
  
  const inputPath = useRef(null);
  const inputName = useRef(null);
  const inputDesc = useRef(null);

  function handledClick() {
    const files = inputPath.current.value;
    const name = inputName.current.value;
    const desc = inputDesc.current.value;
    
    axios.post("http://localhost:8001/api/courses", {
      name: name,
      description: desc,
      path: files,
    }).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    })
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-2 rounded w-72">
        <h1 className="font-semibold text-center text-xl text-gray-700">
          New Course
        </h1>
        <div>
          <label
            for="coursePath"
            class="block text-xs font-medium text-gray-700"
          >
            Path
          </label>

          <input
            type="text"
            id="courscoursePathName"
            placeholder="i.e. /home/user/rocket-science-101"
            class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
            ref={inputPath}
          />
        </div>

        <div>
          <label
            for="courseName"
            class="block text-xs font-medium text-gray-700"
          >
            Name
          </label>

          <input
            type="text"
            id="courseName"
            placeholder="i.e. Rocket Science 101"
            class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
            ref={inputName}
          />
        </div>

        <div>
          <label
            for="courseDescription"
            class="block text-xs font-medium text-gray-700"
          >
            Description (optional)
          </label>
          <input
            type="text"
            id="courseDescription"
            placeholder="i.e. Learn the basics of rocket science."
            class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
            ref={inputDesc}
          />
        </div>

        <button
          onClick={() => {handledClick(); onClose();}}
          class="bg-blue-500 hover:bg-blue-500 text-white font-bold py-2 px-4 border border-blue-500 rounded"
        >
          {" "}
          Save{" "}
        </button>
        <button
          onClick={onClose}
          class="bg-red-500 hover:bg-red-500 text-white font-bold py-2 px-2 border border-blue-500 rounded"
        >
          {" "}
          Cancel{" "}
        </button>
      </div>
    </div>
  );
}
