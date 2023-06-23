import { useRef } from "react";
import { default as axios } from "axios";

export default function Modal({ visible, onClose }) {
  if (!visible) return null;

  const inputPath = useRef(null);
  const inputName = useRef(null);
  const inputDesc = useRef(null);
  const inputImage = useRef(null);

  function handledClick() {
    const files = inputPath.current.value;
    const name = inputName.current.value;
    const desc = inputDesc.current.value;
    const image = inputImage.current.files[0];

    const formData = new FormData();
    formData.append("image", image);

    try {
      fetch('http://localhost:8001/api/upload', {
      method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error(error);
    }

    axios
      .post("http://localhost:8001/api/courses", {
        name: name,
        description: desc,
        path: files,
        image: image.name,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-2 rounded w-72">
        <h1 className="font-semibold text-center text-xl text-gray-700">
          New Course
        </h1>
        <div>
          <label
            htmlFor="coursePath"
            className="block text-xs font-medium text-gray-700"
          >
            Path
          </label>

          <input
            type="text"
            id="courscoursePathName"
            placeholder="i.e. /home/user/rocket-science-101"
            className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
            ref={inputPath}
          />
        </div>

        <div>
          <label
            htmlFor="courseName"
            className="block text-xs font-medium text-gray-700"
          >
            Name
          </label>

          <input
            type="text"
            id="courseName"
            placeholder="i.e. Rocket Science 101"
            className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
            ref={inputName}
          />
        </div>
        <div>
          <label
            htmlFor="courseImage"
            className="block text-xs font-medium text-gray-700"
          >
            Image
          </label>

          <input
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            id="courseImage"
            type="file"
            ref={inputImage}
          />
        </div>

        <div>
          <label
            htmlFor="courseDescription"
            className="block text-xs font-medium text-gray-700"
          >
            Description (optional)
          </label>
          <input
            type="text"
            id="courseDescription"
            placeholder="i.e. Learn the basics of rocket science."
            className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
            ref={inputDesc}
          />
        </div>

        <button
          onClick={() => {
            handledClick();
            onClose();
          }}
          className="bg-blue-500 hover:bg-blue-500 text-white font-bold py-2 px-4 border border-blue-500 rounded"
        >
          {" "}
          Save{" "}
        </button>
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-500 text-white font-bold py-2 px-2 border border-blue-500 rounded"
        >
          {" "}
          Cancel{" "}
        </button>
      </div>
    </div>
  );
}
