import React from 'react';
import '../style.css';
import { Link } from 'react-router-dom';
import Cloud from '../components/Cloud';
import Star from '../components/Star';
import cloud1 from '../assets/cloud 1.png';
import cloud2 from '../assets/cloud 2.png';
import cloud3 from '../assets/cloud 3.png';
import cloud4 from '../assets/cloud 4.png';
import cloud5 from '../assets/cloud 5.png';
import cloud6 from '../assets/cloud 6.png';

const cloudImages = [cloud1, cloud2, cloud3, cloud4, cloud5, cloud6];

function CreditsPage() {
  const clouds = Array.from({ length: 10 }, (_, i) => {
    const img = cloudImages[Math.floor(Math.random() * cloudImages.length)];
    return <Cloud key={i} src={img} alt={`Cloud ${i + 1}`} />;
  });

  return (
    <div className="container-fluid p-0 page-fade">
      <div id="stars">
        {Array.from({ length: 50 }, (_, i) => <Star key={i} />)}
      </div>

      {clouds}

      <div className="row g-0">
        <div className="col-12">
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="title-box">
              <h1 className="animated-title">CREDITS</h1>
              <div style={{color: '#4a3000', marginTop: '5px', textAlign: 'center', fontSize: '1rem'}}>
                <p><strong>Game Development:</strong><br/>Team Katak Petualang 2025</p>
                <p><strong>Programer:</strong><br/>Aurick Tantyrone<br/>Peter Juan Purnama<br/>Kevin Alif</p>
                <p><strong>Art & Assets:</strong><br/>Peter Juan Purnama<br/>Melvern Dio Matthew</p>
                <p><strong>Special Thanks:</strong><br/>Bapak Alexander Waworuntu<br/>Bryan Richie Irawan<br/>Jimmy Wijaya Tandra</p>
                <p><strong>Music & Sound:</strong><br/>Eric Matyas (soundimage.org)</p>
                <p><strong>Universitas Multimedia Nusantara</strong></p>
              </div>
            </div>

            <Link to="/" className="start-button" style={{marginTop: '20px'}}>
              BACK
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreditsPage;