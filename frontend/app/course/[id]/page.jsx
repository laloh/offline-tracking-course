import React from 'react';
import SideMenu from '@/app/components/SideMenu';
import VideoPlayer from '@/app/components/VideoPlayer';


// TODO: Add Next and Previos buttons here

export default function Course({ course }) {
  return (
    <div className="flex">
      <SideMenu />
      <div className="flex items-center justify-center flex-grow">
        <div className="mx-auto w-3/4 h-3/4">
          <VideoPlayer />
        </div>
      </div>
    </div>
  );
}
