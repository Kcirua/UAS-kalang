// src/components/mainPage/ActionPanel.js
import React from 'react'; //

const ActionPanel = ({ 
  onMakan, onBermain, onTidur, onBersih, 
  showTidurButton, showBersihButton,
  // Props BARU untuk interaksi peta
  currentMapKey,
  availableInteractionType,
  onEnterHouse,
  onExitHouse,
  onEnterSwamp,
  onExitSwamp,
  onEnterCave,
  onExitCave,
  onSleepInBed
}) => (
  <div>
    <div className="action-buttons mb-4">
      <h5 className="text-white mb-3">Actions</h5>
      {(availableInteractionType === 2 || availableInteractionType === 3 || availableInteractionType === 4 || availableInteractionType === 99) && (
      <div className="map-interaction-buttons mt-3">
        {/* Masuk Rumah */}
        {availableInteractionType === 2 && currentMapKey === 'world' && (
          <div className="p-1">
            <button className="btn btn-primary w-100 mb-2" onClick={onEnterHouse}>Masuk Rumah</button>
          </div>
        )}
        {/* Keluar Rumah */}
        {availableInteractionType === 2 && currentMapKey === 'house' && (
          <div className="p-1">
            <button className="btn btn-primary w-100 mb-2" onClick={onExitHouse}>Keluar Rumah</button>
          </div>
        )}
        {/* Masuk Rawa */}
        {availableInteractionType === 3 && currentMapKey === 'world' && (
          <div className="p-1">
            <button className="btn btn-primary w-100 mb-2" onClick={onEnterSwamp}>Masuk Rawa</button>
          </div>
        )}
        {/* Keluar Rawa (menggunakan tile tipe 3) */}
        {availableInteractionType === 3 && currentMapKey === 'swamp' && (
          <div className="p-1">
            <button className="btn btn-primary w-100 mb-2" onClick={onExitSwamp}>Keluar Rawa</button>
          </div>
        )}
        {/* Masuk Gua */}
        {availableInteractionType === 4 && currentMapKey === 'world' && (
          <div className="p-1">
            <button className="btn btn-primary w-100 mb-2" onClick={onEnterCave}>Masuk Gua</button>
          </div>
        )}
        {/* Keluar Gua (menggunakan tile tipe 2) */}
        {availableInteractionType === 2 && currentMapKey === 'caves' && (
          <div className="p-1">
            <button className="btn btn-primary w-100 mb-2" onClick={onExitCave}>Keluar Gua</button>
          </div>
        )}
        {availableInteractionType === 99 && (
          <div className="p-1">
            <button className="btn btn-primary w-100 mb-2" onClick={onSleepInBed}>Tidur di Kasur</button>
          </div>
        )}
      </div>
    )}
    </div>
  </div>
);

export default ActionPanel; //