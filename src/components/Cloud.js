import React from 'react';

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function Cloud({ src, alt }) {
  // Randomize top position (5% to 45%), duration (16s to 28s), and delay (0s to 10s)
  const style = {
    top: `${getRandom(5, 45)}%`,
    left: '-35vw',
    animationDuration: `${getRandom(16, 28)}s`,
    animationDelay: `${getRandom(0, 10)}s`,
  };

  return <img src={src} alt={alt} className="cloud" style={style} />;
}

export default Cloud;