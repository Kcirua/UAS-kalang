// src/game/useGameAssets.js
import { useState, useEffect, useRef } from 'react';

function useGameAssets(mapImageSrc, characterImageSrc) {
  const [mapImage, setMapImage] = useState(null);
  const [characterImage, setCharacterImage] = useState(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const [isCharacterImageLoaded, setIsCharacterImageLoaded] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);

  // Menggunakan ref untuk image object agar tidak memicu re-render yang tidak perlu saat src sama
  const mapImageRef = useRef(new Image());
  const characterImageRef = useRef(new Image());

  useEffect(() => {
    const mapImg = mapImageRef.current;
    mapImg.src = mapImageSrc;
    mapImg.onload = () => {
      setMapDimensions({ width: mapImg.width, height: mapImg.height });
      setMapImage(mapImg); // Set image object setelah load
    };
    mapImg.onerror = () => {
      console.error("Gagal memuat gambar peta:", mapImageSrc);
      setMapDimensions({ width: 0, height: 0 }); // Reset jika error
      setMapImage(null);
    };
  }, [mapImageSrc]);

  useEffect(() => {
    setIsCharacterImageLoaded(false); // Reset status
    const charImg = characterImageRef.current;
    charImg.src = characterImageSrc;
    charImg.onload = () => {
      setIsCharacterImageLoaded(true);
      setCharacterImage(charImg); // Set image object setelah load
    };
    charImg.onerror = () => {
      console.error("Gagal memuat gambar karakter:", characterImageSrc);
      setIsCharacterImageLoaded(false);
      setCharacterImage(null);
    };
  }, [characterImageSrc]);

  useEffect(() => {
    if (mapImage && isCharacterImageLoaded && mapDimensions.width > 0) {
      setAssetsReady(true);
    } else {
      setAssetsReady(false);
    }
  }, [mapImage, isCharacterImageLoaded, mapDimensions]);


  return { mapImage, characterImage, mapDimensions, isCharacterImageLoaded, assetsReady };
}

export default useGameAssets;