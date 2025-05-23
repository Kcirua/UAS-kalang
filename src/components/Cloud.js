import React from 'react';

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function Cloud({ src, alt }) {
  // Adjust positioning to avoid center area
  const isTop = Math.random() > 0.5;
  const topPosition = isTop ? getRandom(0, 15) : getRandom(75, 90);
  
  const style = {
    top: `${topPosition}%`,
    left: '-35vw',
    animationDuration: `${getRandom(20, 35)}s`,
    animationDelay: `${getRandom(0, 10)}s`,
    opacity: isTop ? 0.6 : 0.7, // Top clouds more transparent
    transform: `scale(${isTop ? 0.9 : 1})`, // Top clouds slightly smaller
  };

  return <img src={src} alt={alt} className="cloud" style={style} />;
}

export default Cloud;