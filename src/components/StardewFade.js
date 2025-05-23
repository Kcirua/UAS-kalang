import React, { useEffect, useState } from 'react';

function StardewFade({ logoSrc, secondLogoSrc }) {
  const [firstLogoState, setFirstLogoState] = useState('fadein'); // 'fadein', 'fadeout', 'hidden'
  const [secondLogoState, setSecondLogoState] = useState('hidden'); // 'hidden', 'fadein', 'fadeout'
  const [hideOverlay, setHideOverlay] = useState(false);
  const [overlayClass, setOverlayClass] = useState('');

  useEffect(() => {
    // First logo fades in (3s) and stays visible (1s)
    const firstLogoFadeOut = setTimeout(() => {
      setFirstLogoState('fadeout');
      
      // After first logo fades out (2s), show second logo
      setTimeout(() => {
        setFirstLogoState('hidden');
        setSecondLogoState('fadein');
        
        // After second logo fades in (2s) and stays visible (1s), fade it out
        setTimeout(() => {
          setSecondLogoState('fadeout');
          
          // After second logo fades out (2s), start final overlay fade
          setTimeout(() => {
            setOverlayClass('hide'); // Start the smooth overlay fade
            // Hide the component after overlay fade completes
            setTimeout(() => {
              setHideOverlay(true);
            }, 2000);
          }, 2000);
        }, 3000);
      }, 2000);
    }, 4000);

    return () => clearTimeout(firstLogoFadeOut);
  }, []);

  return (
    !hideOverlay && (
      <div className={`stardew-fade-overlay ${overlayClass}`}>
        {logoSrc && firstLogoState !== 'hidden' && (
          <img
            src={logoSrc}
            alt="First Logo"
            className={firstLogoState === 'fadeout' ? "stardew-logo-fadeout" : "stardew-logo-fadein"}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '400px',
              maxWidth: '80vw',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        )}
        {secondLogoSrc && secondLogoState !== 'hidden' && (
          <img
            src={secondLogoSrc}
            alt="Second Logo"
            className={secondLogoState === 'fadeout' ? "second-logo-fadeout" : "second-logo-fadein"}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '400px',
              maxWidth: '80vw',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        )}
      </div>
    )
  );
}

export default StardewFade;
