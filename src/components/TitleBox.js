import React from 'react';

function TitleBox(props) {
  return (
    <div className="title-box">
      <div className="corner top-left"></div>
      <div className="corner top-right"></div>
      <div className="corner bottom-left"></div>
      <div className="corner bottom-right"></div>

      <div className="leaf leaf-topleft"></div>
      <div className="leaf leaf-topright"></div>
      <div className="leaf leaf-bottomright"></div>

      {props.children}
    </div>
  );
}

export default TitleBox;