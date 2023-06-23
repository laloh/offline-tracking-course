"use client";

import "vidstack/styles/defaults.css";
import "vidstack/styles/community-skin/video.css";

import {
  MediaCommunitySkin,
  MediaOutlet,
  MediaPlayer,
} from "@vidstack/react";

export default function VideoPlayer({
  video,
  videoName = "Default Name Video",
}) {
  return (
    <>
      <h1 className="text-2x font-bold text-gray-900 sm:text-3xl">{videoName}</h1>

      <MediaPlayer
        title="Sprite Fight"
        src="http://localhost:8001/videos/TheFullStackCourse/lesson12.mp4"
        crossorigin=""
      >
        <MediaOutlet/>
        <MediaCommunitySkin />
      </MediaPlayer>
      <div className="flex">
        <button
          className="block rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-700 focus:outline-none focus:ring mr-2"
          type="button"
        >
          Mark as Done
        </button>

        <button
          className="block rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring"
          type="button"
        >
          Next Video
        </button>
      </div>
    </>
  );
}
