import fs from 'fs';

const buf = fs.readFileSync('D:/Matter Work Porfolio/Matter Aera 3D Model/mv-agusta-brutale-extracted/source/88741s98.glb');
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));

console.log('Meshes reaching below Y = -0.58:');
gltf.meshes.forEach((m, idx) => {
  m.primitives.forEach((p, pIdx) => {
    const acc = gltf.accessors[p.attributes.POSITION];
    if (acc.min[1] < -0.58) {
      console.log(`Mesh [${idx}] "${m.name}" min Y: ${acc.min[1]} max Y: ${acc.max[1]} Z: [${acc.min[2]}, ${acc.max[2]}] X: [${acc.min[0]}, ${acc.max[0]}]`);
    }
  });
});
