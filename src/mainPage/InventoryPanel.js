// src/mainPage/InventoryPanel.js
import React from 'react';
// DIUBAH: Impor gambar makanan
import food1Image from '../assets/food1.png';

// DIUBAH: Peta gambar untuk item makanan
const itemImageMap = {
  food1: food1Image,
};

// DIUBAH: Terima prop onUseItem
const InventoryPanel = React.memo(({ inventory, onUseItem }) => {
  const slots = Array(4).fill(null);
  inventory.forEach((item, index) => {
    if (index < slots.length) {
      slots[index] = item;
    }
  });

  return (
    <div className="inventory-section mt-3">
      <h5 className="text-white mb-2">Invetory</h5>
      <div className="inventory-grid">
        {slots.map((item, index) => (
          // DIUBAH: Tambahkan event onClick
          <div 
            key={index} 
            className="inventory-slot"
            onClick={() => item && onUseItem(index)} // Panggil onUseItem dengan index slot
            title={item ? `Gunakan ${item.name}` : 'Slot kosong'} // Tambahkan tooltip
          >
            {item && (
              <>
                <img src={itemImageMap[item.id]} alt={item.name} className="inventory-item-image" />
                <span className="inventory-item-quantity">{item.quantity}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default InventoryPanel;