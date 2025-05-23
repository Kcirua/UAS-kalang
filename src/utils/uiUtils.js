// src/utils/uiUtils.js
import React from 'react';
import Cloud from '../components/Cloud'; // Pastikan path Cloud.js benar
import cloud1 from '../assets/cloud 1.png'; // Sesuaikan path aset Anda
import cloud2 from '../assets/cloud 2.png';
import cloud3 from '../assets/cloud 3.png';
import cloud4 from '../assets/cloud 4.png';
import cloud5 from '../assets/cloud 5.png';
import cloud6 from '../assets/cloud 6.png';

export const RenderClouds = () => (
  <>
    <Cloud src={cloud1} alt="Cloud 1" />
    <Cloud src={cloud2} alt="Cloud 2" />
    <Cloud src={cloud6} alt="Cloud 3" /> {/* Dari kode asli, cloud6 jadi cloud 3 dst. */}
    <Cloud src={cloud4} alt="Cloud 4" />
    <Cloud src={cloud5} alt="Cloud 5" />
    <Cloud src={cloud3} alt="Cloud 6" />
  </>
);