import * as THREE from 'three';
import fs from 'fs';

console.log('Analyzing tire coordinates and orientation...');

const buf = fs.readFileSync('D:/Matter Work Porfolio/Matter Aera 3D Model/mv-agusta-brutale-extracted/source/88741s98.glb');
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));

// Find accessors for tyre_front and tyre_rear
gltf.meshes.forEach((m, idx) => {
  if (m.name.includes('tyre') || m.name.includes('wheel') || m.name.includes('stand')) {
    console.log(`Mesh [${idx}]: "${m.name}"`);
    m.primitives.forEach((p, pIdx) => {
      const posAccessorIdx = p.attributes.POSITION;
      const acc = gltf.accessors[posAccessorIdx];
      console.log(`   Prim ${pIdx} POSITION: min=${JSON.stringify(acc.min)}, max=${JSON.stringify(acc.max)}`);
    });
  }
});
