// src/components/mainPage/ActionPanel.js
import React from 'react';

const ActionPanel = React.memo(({ 
  onMakan, onBermain, onTidur, onBersih, 
  showTidurButton, showBersihButton,
  // Props untuk interaksi peta
  currentMapKey,
  availableInteractionType,
  onEnterHouse,
  onExitHouse,
  onEnterSwamp,
  onExitSwamp,
  onEnterCave,
  onExitCave,
  onEnterBathroom,
  onExitBathroom,
  onSleepInBed,
  onMakanAtTable 
}) => {

  // Pastikan ada keyword 'return' sebelum blok JSX
  return (
    <div>
      <div className="action-buttons mb-4">
        <h5 className="text-white mb-3">Actions</h5>
        {(availableInteractionType === 2 || availableInteractionType === 3 || availableInteractionType === 4 || availableInteractionType === 5 || availableInteractionType === 99 || availableInteractionType === 98) && (
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
          {/* Keluar Rawa */}
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
          {/* Keluar Gua */}
          {availableInteractionType === 2 && currentMapKey === 'caves' && (
            <div className="p-1">
              <button className="btn btn-primary w-100 mb-2" onClick={onExitCave}>Keluar Gua</button>
            </div>
          )}
          {/* Masuk Kamar Mandi */}
          {availableInteractionType === 5 && currentMapKey === 'house' && (
             <div className="p-1">
              <button className="btn btn-info w-100 mb-2" onClick={onEnterBathroom}>Masuk Kamar Mandi</button>
            </div>
          )}
          {/* Keluar Kamar Mandi */}
          {availableInteractionType === 5 && currentMapKey === 'bathroom' && (
             <div className="p-1">
              <button className="btn btn-info w-100 mb-2" onClick={onExitBathroom}>Keluar Kamar Mandi</button>
            </div>
          )}
          {/* Tidur di Kasur */}
          {availableInteractionType === 99 && (
            <div className="p-1">
              <button className="btn btn-primary w-100 mb-2" onClick={onSleepInBed}>Tidur di Kasur</button>
            </div>
          )}
          {availableInteractionType === 98 && (
            <div className="p-1">
              <button className="btn btn-success w-100 mb-2" onClick={onMakanAtTable}>Makan</button>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
});

export default ActionPanel;