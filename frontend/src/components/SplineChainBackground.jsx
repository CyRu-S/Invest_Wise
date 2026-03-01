import { useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';

export default function SplineChainBackground() {
  const splineRef = useRef(null);
  const chainObjRef = useRef(null);
  const cleanupRef = useRef(null);

  function onLoad(splineApp) {
    splineRef.current = splineApp;

    // Stop all built-in Spline animations so the scene doesn't auto-spin
    splineApp.stop();

    // Grab the first object in the scene to rotate
    const allObjects = splineApp.getAllObjects();
    if (allObjects.length > 0) {
      chainObjRef.current = allObjects[0];
      // Store the initial rotation so we add scroll rotation on top
      chainObjRef.current._baseRotationY = chainObjRef.current.rotation.y;
    }

    // Scroll-driven rotation handler
    const handleScroll = () => {
      if (!chainObjRef.current) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

      // Map 0–100% scroll to 0–360° (2π radians)
      const baseY = chainObjRef.current._baseRotationY || 0;
      chainObjRef.current.rotation.y = baseY + progress * Math.PI * 2;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Set initial position

    cleanupRef.current = () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  return (
    <div className="spline-chain-bg" aria-hidden="true">
      <Spline
        scene="https://prod.spline.design/ihJ2q6TwwKCGmWy9/scene.splinecode"
        onLoad={onLoad}
      />
    </div>
  );
}
