import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Color, Group, InstancedMesh, Object3D } from 'three';

function Sculpture({ broken, reduced, colors }: { broken: boolean; reduced: boolean; colors: string[] }) {
  const group = useRef<Group>(null);
  const cubes = useRef<InstancedMesh>(null);
  const time = useRef(0);
  const spread = useRef(0);
  const dummy = useMemo(() => new Object3D(), []);
  const points = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let x = -6; x <= 6; x++) for (let y = -6; y <= 6; y++) {
      if (Math.abs(x) >= 5 || Math.abs(y) >= 5) positions.push([x * .27, y * .27, Math.sin(x * 2 + y) * .045]);
    }
    return positions;
  }, []);
  useEffect(() => {
    const mesh = cubes.current;
    if (!mesh) return;
    points.forEach((_, i) => mesh.setColorAt(i, new Color(colors[i % colors.length])));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [colors, points]);
  useFrame(({ pointer }, rawDelta) => {
    const dt = Math.min(rawDelta, .05);
    if (!reduced) time.current += dt;
    spread.current += ((broken ? 1 : 0) - spread.current) * (1 - Math.exp(-2.5 * dt));
    const root = group.current; const mesh = cubes.current;
    if (!root || !mesh) return;
    root.rotation.y += ((pointer.x * .35 + .25 + Math.sin(time.current * .3) * .12) - root.rotation.y) * (1 - Math.exp(-3 * dt));
    root.rotation.x += ((-.15 + pointer.y * .2) - root.rotation.x) * (1 - Math.exp(-3 * dt));
    root.rotation.z = -.14 + Math.sin(time.current * .25) * .025;
    points.forEach(([x, y, z], i) => {
      const s = spread.current;
      dummy.position.set(x * (1 + s * .8), y * (1 + s * .6), z + Math.sin(i * 3.1) * s * 1.6);
      dummy.rotation.set(s * Math.sin(i) * 2, s * Math.cos(i) * 2, s * Math.sin(i * 4));
      dummy.scale.setScalar(.245 * (1 - s * .3)); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <group ref={group}><instancedMesh ref={cubes} args={[undefined, undefined, points.length]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial roughness={.4} metalness={.55} /></instancedMesh></group>;
}
export default function PixelFrame({ broken }: { broken: boolean }) {
  const [colors, setColors] = useState<string[]>([]);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const canvas = document.createElement('canvas'); canvas.width = 1; canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setColors(['--scene-cream', '--scene-metal', '--scene-sage'].map(token => {
      ctx.fillStyle = css.getPropertyValue(token).trim(); ctx.fillRect(0, 0, 1, 1);
      const pixel = ctx.getImageData(0, 0, 1, 1).data;
      return `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
    }));
    setReduced(matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  const cream = colors[0]; const sage = colors[2];
  if (!cream || !sage) return null;
  return <Canvas dpr={1} camera={{ position: [0, 0, 9.5], fov: 40 }} gl={{ alpha: true, antialias: true }} aria-label="Interactive three-dimensional pixel frame">
    <ambientLight intensity={.6} /><directionalLight position={[3, 5, 5]} intensity={2.5} color={cream} />
    <Environment resolution={64}><Lightformer intensity={2} position={[0, 4, 3]} scale={[8, 8, 1]} /><Lightformer intensity={1.5} color={sage} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} /></Environment>
    <Sculpture broken={broken} reduced={reduced} colors={colors} />
  </Canvas>;
}
