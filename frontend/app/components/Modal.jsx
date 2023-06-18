export default function Modal({ visible, onClose }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-2 rounded w-72">
        <h1 className="font-semibold text-center text-xl text-gray-700">
          New Course
        </h1>

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
          />
        </div>

        <div>
          <label
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            for="file_input"
          >
            Upload file
          </label>
          <input
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            aria-describedby="file_input_help"
            id="folderInput" webkitdirectory directory multiple
            type="file"
          />
          <p
            class="mt-1 text-sm text-gray-500 dark:text-gray-300"
            id="file_input_help"
          >
            SVG, PNG, JPG or GIF (MAX. 800x400px).
          </p>
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
          />
        </div>

        <button
          onClick={onClose}
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
