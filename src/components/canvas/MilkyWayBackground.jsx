// MilkyWayBackground.jsx
import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

// Swirling particle disc for the Milky Way
function GalaxyPoints() {
  const geometryRef = useRef();

  const { positions, colors, radii, angles, offsets, params } = useMemo(() => {
    const particles = 10000;   // dense
    const radius = 28;         // galaxy radius
    const arms = 6;            // spiral arms
    const randomnessBase = 0.28;
    const spin = 1.6;          // a bit tighter spiral

    const positions = new Float32Array(particles * 3);
    const colors = new Float32Array(particles * 3);
    const radii = new Float32Array(particles);
    const angles = new Float32Array(particles);
    const offsets = new Float32Array(particles * 3);

    const coreColor = new THREE.Color("#fff7e8"); // warm core
    const armColor = new THREE.Color("#7fb1ff");  // bluish outskirts
    const tmpColor = new THREE.Color();

    for (let i = 0; i < particles; i++) {
      const i3 = i * 3;

      // bias radius a bit towards the outer parts so arms are more visible
      const r = Math.pow(Math.random(), 0.7) * radius; // exp<1 => more outer stars
      const branchAngle = ((i % arms) / arms) * Math.PI * 2;
      const baseAngle = branchAngle + r * spin;

      // make randomness slightly weaker in outer regions to keep arms sharp
      const randomness = randomnessBase * (0.6 + 0.4 * (r / radius));

      const randomX = (Math.random() - 0.5) * randomness * r * 0.8;
      const randomY = (Math.random() - 0.5) * randomness * 0.35; // thinner disc
      const randomZ = (Math.random() - 0.5) * randomness * r * 0.8;

      radii[i] = r;
      angles[i] = baseAngle;

      offsets[i3 + 0] = randomX;
      offsets[i3 + 1] = randomY;
      offsets[i3 + 2] = randomZ;

      positions[i3 + 0] = Math.cos(baseAngle) * r + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(baseAngle) * r + randomZ;

      const t = r / radius; // 0 = core, 1 = edge
      tmpColor.copy(coreColor).lerp(armColor, t);

      colors[i3 + 0] = tmpColor.r;
      colors[i3 + 1] = tmpColor.g;
      colors[i3 + 2] = tmpColor.b;
    }

    return {
      positions,
      colors,
      radii,
      angles,
      offsets,
      params: { particles, radius }
    };
  }, []);

  useFrame((_, delta) => {
    const geometry = geometryRef.current;
    if (!geometry) return;

    const posAttr = geometry.attributes.position;
    const posArray = posAttr.array;
    const { particles, radius } = params;

    // spiral orbit update
    for (let i = 0; i < particles; i++) {
      const i3 = i * 3;
      const r = radii[i];
      let angle = angles[i];

      // inner stars rotate faster than outer ones
      const speed = 0.45 * (1.1 - r / radius);
      angle += delta * speed;
      angles[i] = angle;

      const offsetX = offsets[i3 + 0];
      const offsetY = offsets[i3 + 1];
      const offsetZ = offsets[i3 + 2];

      posArray[i3 + 0] = Math.cos(angle) * r + offsetX;
      posArray[i3 + 1] = offsetY;
      posArray[i3 + 2] = Math.sin(angle) * r + offsetZ;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        sizeAttenuation
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Warm glowing core
function GalaxyCore() {
  const coreRef = useRef();

  useFrame((_, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y -= delta * 0.25;
    }
  });

  return (
    <mesh ref={coreRef}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshBasicMaterial color="#ffe7c0" transparent opacity={0.95} />
    </mesh>
  );
}

// Whole galaxy group: ~30° tilt + slow spin
function Galaxy() {
  const group = useRef();

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group
      ref={group}
      // ~30 degrees tilt around X axis (π/6 ≈ 0.523), with a small yaw/roll tweak
      rotation={[Math.PI / 12, 0, 0]}
      position={[0, 4, 0]} 
    >
      <GalaxyPoints />
      <GalaxyCore />
    </group>
  );
}

// Background component to be placed inside your Skills section
export default function MilkyWayBackground() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        background:
          "radial-gradient(circle at center, #050816 0, #090917 55%, #090917 100%)"
      }}
    >
      <Canvas camera={{ position: [0, 14, 40], fov: 55 }}>
        {/* distant background stars */}
        <Stars
          radius={200}
          depth={80}
          count={2500}
          factor={4.5}
          saturation={0}
          fade
        />

        <ambientLight intensity={0.25} />
        <Galaxy />
      </Canvas>
    </div>
  );
}
