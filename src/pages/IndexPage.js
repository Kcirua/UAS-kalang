// src/pages/IndexPage.js
import React, { useRef } from 'react';
import '../style.css';
import Cloud from '../components/Cloud';
import { Link } from 'react-router-dom';
import cloud1 from '../assets/cloud 1.png';
import cloud2 from '../assets/cloud 2.png';
import cloud3 from '../assets/cloud 3.png';
import cloud4 from '../assets/cloud 4.png';
import cloud5 from '../assets/cloud 5.png';
import cloud6 from '../assets/cloud 6.png';
import Star from '../components/Star';
import TitleBox from '../components/TitleBox';

const cloudImages = [cloud1, cloud2, cloud3, cloud4, cloud5, cloud6];

function IndexPage() {
  const starsContainerRef = useRef(null);

  const clouds = Array.from({ length: 10 }, (_, i) => {
    const img = cloudImages[Math.floor(Math.random() * cloudImages.length)];
    return <Cloud key={i} src={img} alt={`Cloud ${i + 1}`} />;
  });

  return (
    <div className="container-fluid p-0 page-fade">
      <div id="stars" ref={starsContainerRef}>
        {Array.from({ length: 50 }, (_, i) => <Star key={i} />)}
      </div>

      {clouds}

      {/* Floating leaves */}
      <div className="floating-leaf" style={{ left: '10%' }} />
      <div className="floating-leaf" style={{ left: '80%' }} />

      <div className="row g-0">
        <div className="col-12">
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <TitleBox>
              <h1 className="animated-title">KATAK<br />PETUALANG</h1>
            </TitleBox>

            <Link to="/lobby" className="start-button">
              START
            </Link>

            {/* Tooltip below button */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IndexPage;
