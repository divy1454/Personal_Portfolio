import React, { useEffect, useRef } from 'react';
import { createClayScene } from '../scene/clayScene';

// The fixed canvas behind the page. If WebGL is not available the page still works, just without the 3D.
const ClayStage = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let dispose = null;
    try {
      dispose = createClayScene(canvasRef.current);
    } catch (error) {
      console.warn('The 3D stage could not start', error);
    }
    return () => {
      if (dispose) dispose();
    };
  }, []);

  return (
    <>
      <canvas id="stage" ref={canvasRef} aria-hidden="true" />
      <div className="fade" aria-hidden="true" />
    </>
  );
};

export default ClayStage;
