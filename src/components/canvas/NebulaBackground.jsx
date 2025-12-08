// src/components/canvas/NebulaBackground.jsx
import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Preload } from "@react-three/drei";
import styled from "styled-components";

// Fullscreen fixed background
const NebulaCanvasWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: -2;          /* Behind content, above page background */
  pointer-events: none; /* Don't block clicks/scrolls */
`;

// One colored, breathing point cloud
const NebulaLayer = ({
  color,
  count = 1500,
  radius = 3,
  rotationSpeed = 0.05,
  pulseSpeed = 0.5,
  size = 0.05,
  opacity = 0.4,
}) => {
  const groupRef = useRef();

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

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const t = state.clock.getElapsedTime();

    groupRef.current.rotation.y += delta * rotationSpeed;
    groupRef.current.rotation.x += delta * rotationSpeed * 0.6;

    const s = 1 + Math.sin(t * pulseSpeed) * 0.08;
    groupRef.current.scale.set(s, s, s);
  });

  return (
    <group ref={groupRef}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={color}
          size={size}
          sizeAttenuation
          depthWrite={false}
          opacity={opacity}
        />
      </Points>
    </group>
  );
};

// Big starfield around everything
const StarField = ({ count = 4000, radius = 10 }) => {
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
  
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.01;
    pointsRef.current.rotation.x -= delta * 0.005;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.015}
        sizeAttenuation
        depthWrite={false}
        opacity={0.9}
      />
    </Points>
  );
};


const NebulaBackground = () => {
  return (
    <NebulaCanvasWrapper>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <Suspense fallback={null}>
          {/* Deep space background */}
          <color attach="background" args={["#090917"]} />

          {/* Soft global light so the planet is visible */}
          <ambientLight intensity={0.5} />

          {/* A gentle warm light near the "sun" */}
          <pointLight
            position={[0, 0, 2]}
            intensity={0.6}
            color={"#ffddaa"}
            distance={10}
          />

          {/* Make whole nebula + planet slightly smaller & further back if you liked that */}
          <group scale={0.8} position={[0, 0, -4]}>
            {/* === Central soft "sun" / planet === */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.4, 32, 32]} />
              <meshStandardMaterial
                color="#ffdd99"
                emissive="#ffcc66"
                emissiveIntensity={0.35} // subtle glow
                roughness={0.4}
                metalness={0.1}
              />
            </mesh>

            {/* Multicolour nebula - 3 overlapping layers */}
            <NebulaLayer
              color="#ff6fd8"
              radius={2.5}
              count={1800}
              rotationSpeed={0.03}
              pulseSpeed={0.4}
              size={0.06}
              opacity={0.5}
            />
            <NebulaLayer
              color="#3813c2"
              radius={3.2}
              count={1600}
              rotationSpeed={0.02}
              pulseSpeed={0.3}
              size={0.07}
              opacity={0.35}
            />
            <NebulaLayer
              color="#00f5d4"
              radius={3.8}
              count={1200}
              rotationSpeed={0.015}
              pulseSpeed={0.6}
              size={0.055}
              opacity={0.3}
            />

            <StarField />
          </group>

          <Preload all />
        </Suspense>
      </Canvas>
    </NebulaCanvasWrapper>
  );
};

export default NebulaBackground;
