"use client";

import { useEffect, useMemo, useRef } from "react";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface VialProps {
  introKey: string | number;
  isMobile?: boolean;
}

export function Vial({ introKey, isMobile = false }: VialProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/purepep-vial.glb");

  const centered = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    cloned.position.sub(center);
    cloned.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);

  const animRot = useRef({ x: 0, y: 0 });
  const manualRot = useRef({ x: 0, y: 0 });
  const introProgress = useRef(0);
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    introProgress.current = 0;
    animRot.current = { x: 0, y: 0 };
  }, [introKey]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as Element & { setPointerCapture?: (id: number) => void })?.setPointerCapture?.(
      e.pointerId,
    );
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    document.body.style.cursor = "grabbing";
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as Element & { releasePointerCapture?: (id: number) => void })?.releasePointerCapture?.(
      e.pointerId,
    );
    isDragging.current = false;
    document.body.style.cursor = "grab";
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    manualRot.current.y += dx * 0.005;
    manualRot.current.x += dy * 0.005;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (introProgress.current < 1) {
      introProgress.current = Math.min(1, introProgress.current + delta / 1.4);
    }
    const t = introProgress.current;
    const targetScale = (isMobile ? 0.85 : 1) * easeOutElastic(t);
    const introYRot = THREE.MathUtils.lerp(0, Math.PI * 3, easeInOutQuart(t));

    animRot.current.y += 0.003;

    groupRef.current.rotation.x = manualRot.current.x + animRot.current.x;
    groupRef.current.rotation.y =
      manualRot.current.y + animRot.current.y + introYRot;
    groupRef.current.rotation.z = 0;

    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.04;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x || 0.6, targetScale, 0.15),
    );
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOver={() => {
        if (!isDragging.current) document.body.style.cursor = "grab";
      }}
      onPointerOut={() => {
        if (!isDragging.current) document.body.style.cursor = "auto";
      }}
    >
      <primitive object={centered} />
    </group>
  );
}

function easeOutElastic(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

useGLTF.preload("/models/purepep-vial.glb");
