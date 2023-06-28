'use client';

import { useState } from 'react'
import SideMenu from '@/app/components/SideMenu';
import VideoPlayer from '@/app/components/VideoPlayer';

export default function Course({params}) {

  const [videoUrl, setVideoUrl] = useState(null);
  const [videoName, setVideoName] = useState(null);
  const [loading, setLoading] = useState(false);
  const id = params.id;

  const handleVideoSelection = (url, name) => {
    setLoading(true);
    setTimeout(() => {
      setVideoUrl(url);
      setVideoName(name);
      setLoading(false);
    }, 2000); 
  };
  
  return (
    <div className="flex">
      <SideMenu courseId={id} course={course} onVideoSelection={handleVideoSelection}/>
      <div className="flex items-center justify-center flex-grow">
        <div className="mx-auto w-3/4 h-3/4">
          {loading ? <div>Loading...</div> : videoUrl && <VideoPlayer url={videoUrl} name={videoName}/>}
        </div>
      </div>
    </div>
  );
}
