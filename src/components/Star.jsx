import React from 'react';

function Star() {
  const size = Math.random() * 2 + 1;
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 40}%`,
    animationDelay: `${Math.random() * 3}s`,
  };

  return <div className="star" style={style} />;
}

export default Star;