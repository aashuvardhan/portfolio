// src/components/canvas/MeteorShowerBackground.jsx
import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Trail, Points, PointMaterial, Preload } from "@react-three/drei";
import styled from "styled-components";
import * as THREE from "three";

// Background wrapper (use fixed for full page, absolute for section-only)
const MeteorCanvasWrapper = styled.div`
  position: fixed;        /* change to 'absolute' if you want it only in a section */
  inset: 0;
  z-index: -2;
  pointer-events: none;
`;

// ---------- Static starry sky behind the meteors ----------
const StarField = ({ count = 1500, radius = 14 }) => {
  const pointsRef = useRef();

  const positions = useMemo(() => {
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      pts[i * 3 + 0] = x;
      pts[i * 3 + 1] = y;
      pts[i * 3 + 2] = z;
    }
    return pts;
  }, [count, radius]);

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#edf904ff"
        size={0.01}
        sizeAttenuation
        depthWrite={false}
        opacity={0.9}
      />
    </Points>
  );
};

// ---------- Meteor logic ----------

// Random initial spawn for one meteor
const spawnMeteor = () => ({
  x: THREE.MathUtils.randFloat(-7, 7),   // spread across the sky
  y: THREE.MathUtils.randFloat(5, 9),    // start high above
  z: THREE.MathUtils.randFloat(-4, -1),  // slight depth variation
  speed: THREE.MathUtils.randFloat(2, 4)
});

const Meteor = ({ direction }) => {
  const headRef = useRef();
  const state = useRef(spawnMeteor());

  useFrame((_, delta) => {
    const s = state.current;

    // Move along the shared direction vector
    s.x += direction.x * s.speed * delta;
    s.y += direction.y * s.speed * delta;
    s.z += direction.z * s.speed * delta;

    if (headRef.current) {
      headRef.current.position.set(s.x, s.y, s.z);
    }

    // When it leaves the view, respawn up top
    if (s.y < -5 || s.x < -9) {
      const n = spawnMeteor();
      state.current = n;
      if (headRef.current) {
        headRef.current.position.set(n.x, n.y, n.z);
      }
    }
  });

  const { x, y, z } = state.current;

  return (
    <Trail
      width={1}                // tail thickness
      length={4}                  // how long the tail is
      decay={1}                   // how fast the trail fades
      color="#edf904ff"             // tail colour
      attenuation={(t) => t * t}  // fade out towards the end
    >
      {/* bright meteor head */}
      <mesh ref={headRef} position={[x, y, z]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#edf904ff" />
      </mesh>
    </Trail>
  );
};

const Meteors = ({ count = 6 }) => {
  // Shared direction so they all "rain" the same way
  const dir = useMemo(
    () => new THREE.Vector3(0.15, -1.0, 0).normalize(), // slight diagonal
    []
  );

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Meteor key={i} direction={dir} />
      ))}
    </>
  );
};

// ---------- Main background component ----------

const MeteorShowerBackground = () => {
  return (
    <MeteorCanvasWrapper>
      <Canvas camera={{ position: [0, 0, 6], fov: 55 }}>
        <Suspense fallback={null}>
          {/* Night-sky colour similar to your refs */}
          <color attach="background" args={["#090917"]} />

          {/* Soft lighting so the streak heads pop slightly */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[3, 5, 6]} intensity={0.7} />

          <group position={[0, 0, -3]} scale={1}>
            <StarField />
            <Meteors count={6} />
          </group>
            
          <Preload all />
        </Suspense>
      </Canvas>
    </MeteorCanvasWrapper>
  );
};

export default MeteorShowerBackground;
