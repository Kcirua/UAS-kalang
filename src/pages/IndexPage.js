import React, { useEffect, useRef } from 'react';
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

function IndexPage() {

  const starsContainerRef = useRef(null);

  useEffect(() => {
    const starsContainer = starsContainerRef.current;
    if (!starsContainer) return;
  }, []);

  return (
    <div className="container-fluid p-0">
      <div id="stars" ref={starsContainerRef}>
        {Array.from({ length: 50 }, (_, i) => <Star key={i} />)}
      </div>

      <Cloud src={cloud1} alt="Cloud 1" />
      <Cloud src={cloud2} alt="Cloud 2" />
      <Cloud src={cloud6} alt="Cloud 3" />
      <Cloud src={cloud4} alt="Cloud 4" />
      <Cloud src={cloud5} alt="Cloud 5" />
      <Cloud src={cloud3} alt="Cloud 6" />

      <div className="row g-0">
        <div className="col-12">
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <TitleBox>
              <h1>KATAK<br />PETUALANG</h1>
            </TitleBox>

            <Link to="/lobby" className="start-button">START</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IndexPage;