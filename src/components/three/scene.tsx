"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import { Vial } from "./vial";
import type { Compound } from "@/lib/compounds";

const ACCENT: Record<Compound["category"], string> = {
  regenerative: "#FF8C42",
  metabolic: "#22D3EE",
  nootropic: "#C084FC",
  longevity: "#38BDF8",
};

interface SceneProps {
  compound: Compound;
}

export function Scene({ compound }: SceneProps) {
  const accent = ACCENT[compound.category];

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 35 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ pointerEvents: "auto", touchAction: "none" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.45} />
        <spotLight
          position={[-5, 8, 5]}
          angle={0.35}
          penumbra={1}
          intensity={2.2}
          castShadow
          shadow-bias={-0.0001}
          color="#ffffff"
        />
        <spotLight
          position={[5, 0, -5]}
          angle={0.5}
          penumbra={1}
          intensity={3}
          color={accent}
        />
        <pointLight position={[-5, 0, 5]} intensity={0.6} color="#4a5568" />

        <Vial key={compound.accession} introKey={compound.accession} />

        <ContactShadows
          opacity={0.5}
          scale={6}
          blur={2.5}
          far={3}
          resolution={256}
          color="#000000"
          position={[0, -1.4, 0]}
        />
        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  );
}
