import React from 'react';
import cloud1 from '../assets/cloud 1.png';
import cloud2 from '../assets/cloud 2.png';
import cloud3 from '../assets/cloud 3.png';
import cloud4 from '../assets/cloud 4.png';
import cloud5 from '../assets/cloud 5.png';
import cloud6 from '../assets/cloud 6.png';

function Background() {
  const staticClouds = [
    { src: cloud1, size: 'large', style: { top: '8%', left: '5%' } },
    { src: cloud4, size: 'large', style: { top: '15%', right: '8%' } },
    { src: cloud2, size: 'medium', style: { top: '35%', left: '15%' } },
    { src: cloud5, size: 'medium', style: { top: '40%', right: '12%' } },
  ];

  return (
    <div className="background">
      {staticClouds.map((cloud, index) => (
        <img
          key={index}
          src={cloud.src}
          alt={`Background Cloud ${index + 1}`}
          className={`background-cloud ${cloud.size}`}
          style={cloud.style}
        />
      ))}
    </div>
  );
}

export default Background; 