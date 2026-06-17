import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight interactive 3D hero element built on Three.js.
 *
 * Performance notes (per project brief):
 *  - Three.js is loaded LAZILY (dynamic import) so it never blocks first paint.
 *  - On small screens / reduced-motion / no-WebGL we render NOTHING extra
 *    (a CSS gradient fallback is shown by the parent), keeping mobile fast.
 *  - The renderer is paused when the tab/section is not visible.
 */
export default function Hero3D() {
  const mountRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Quick WebGL capability check
    let hasWebGL = false;
    try {
      const c = document.createElement('canvas');
      hasWebGL = !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch { hasWebGL = false; }

    if (isMobile || reduced || !hasWebGL) return; // mobile/fallback: skip 3D
    setEnabled(true);

    let renderer, frameId, cleanup = () => {};
    let disposed = false;

    (async () => {
      const THREE = await import('three');
      if (disposed || !mountRef.current) return;

      const el = mountRef.current;
      const width = el.clientWidth;
      const height = el.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 0, 6);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);

      // A polished metallic "fabricated steel" knot — evokes welded metalwork.
      const geometry = new THREE.TorusKnotGeometry(1.4, 0.42, 180, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0xb8b8c0,
        metalness: 1.0,
        roughness: 0.28,
      });
      const knot = new THREE.Mesh(geometry, material);
      scene.add(knot);

      // Warm "forge" key light + cool rim light + ambient
      const key = new THREE.PointLight(0xff7a18, 60, 100); key.position.set(5, 5, 5);
      const rim = new THREE.PointLight(0x4a6cf7, 40, 100); rim.position.set(-5, -3, 4);
      const amb = new THREE.AmbientLight(0x404048, 1.2);
      scene.add(key, rim, amb);

      // Subtle parallax on pointer move
      let targetX = 0, targetY = 0;
      const onMove = (e) => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 0.6;
        targetY = (e.clientY / window.innerHeight - 0.5) * 0.6;
      };
      window.addEventListener('pointermove', onMove);

      let running = true;
      const io = new IntersectionObserver(
        ([entry]) => { running = entry.isIntersecting; if (running) loop(); },
        { threshold: 0.05 }
      );
      io.observe(el);

      const onResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth, h = mountRef.current.clientHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      const loop = () => {
        if (!running || disposed) return;
        knot.rotation.x += 0.004;
        knot.rotation.y += 0.006;
        knot.rotation.x += (targetY - knot.rotation.x * 0) * 0; // keep spin
        camera.position.x += (targetX * 2 - camera.position.x) * 0.05;
        camera.position.y += (-targetY * 2 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(loop);
      };
      loop();

      cleanup = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('resize', onResize);
        io.disconnect();
        geometry.dispose(); material.dispose();
        renderer.dispose();
        if (renderer.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      };
    })();

    return () => { disposed = true; cleanup(); };
  }, []);

  if (!enabled) return null;
  return <div ref={mountRef} className="absolute inset-0 z-10" aria-hidden="true" />;
}
