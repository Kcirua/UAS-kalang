import React from 'react';
import Cloud from './Cloud';
import cloud1 from '../assets/cloud 1.png';
import cloud2 from '../assets/cloud 2.png';
import cloud3 from '../assets/cloud 3.png';
import cloud4 from '../assets/cloud 4.png';
import cloud5 from '../assets/cloud 5.png';
import cloud6 from '../assets/cloud 6.png';

const cloudImages = [cloud1, cloud2, cloud3, cloud4, cloud5, cloud6];

function CloudBackground() {
  const clouds = Array.from({ length: 10 }, (_, i) => {
    const img = cloudImages[Math.floor(Math.random() * cloudImages.length)];
    return <Cloud key={i} src={img} alt={`Cloud ${i + 1}`} />;
  });

  return (
    <div className="lobby-cloud-container">
      {clouds}
    </div>
  );
}

export default React.memo(CloudBackground); 