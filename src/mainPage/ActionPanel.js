// src/components/mainPage/ActionPanel.js
import React from 'react';

const ActionPanel = ({ onMakan, onBermain, onTidur, onBersih, showTidurButton, showBersihButton }) => (
  <div className="action-buttons mb-4">
    <h5 className="text-white mb-3">Actions</h5>
    {showTidurButton && ( // Ganti nama prop agar lebih jelas
      <div className="p-1" id="containerTombolTidur">
        <button className="btn btn-primary w-100 mb-2" id="tombolTambahTidur" onClick={onTidur}>Tidur</button>
      </div>
    )}
    {showBersihButton && ( // Ganti nama prop agar lebih jelas
      <div className="p-1" id="containerTombolBersihBersih">
        <button className="btn btn-primary w-100 mb-2" id="tombolBersihBersih" onClick={onBersih}>Bersih-bersih</button>
      </div>
    )}
    <div className="p-1">
      <button className="btn btn-primary w-100 mb-2" id="tombolMakan" onClick={onMakan}>Makan</button>
    </div>
    <div className="p-1">
      <button className="btn btn-primary w-100 mb-2" id="tombolBermain" onClick={onBermain}>Bermain</button>
    </div>
  </div>
);

export default ActionPanel;