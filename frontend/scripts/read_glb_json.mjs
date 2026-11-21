import fs from 'fs';

console.log('Reading GLB JSON chunk...');

const buffer = fs.readFileSync('D:/Matter Work Porfolio/Matter Aera 3D Model/mv-agusta-brutale-extracted/source/88741s98.glb');

const magic = buffer.toString('utf8', 0, 4);
const version = buffer.readUInt32LE(4);
const length = buffer.readUInt32LE(8);
const jsonLength = buffer.readUInt32LE(12);
const jsonType = buffer.toString('utf8', 16, 20);

console.log(`GLB Magic: ${magic}, Version: ${version}, Total Length: ${length}, JSON Length: ${jsonLength}, Type: ${jsonType}`);

const jsonString = buffer.toString('utf8', 20, 20 + jsonLength);
const gltf = JSON.parse(jsonString);

console.log('Scenes count:', gltf.scenes?.length);
console.log('Nodes count:', gltf.nodes?.length);
console.log('Meshes count:', gltf.meshes?.length);
console.log('Materials count:', gltf.materials?.length);

console.log('\n--- Node Names ---');
gltf.nodes.forEach((n, idx) => {
  if (n.mesh !== undefined || (n.name && (n.name.toLowerCase().includes('paddock') || n.name.toLowerCase().includes('stand')))) {
    console.log(`Node [${idx}] "${n.name}" -> Mesh [${n.mesh}]`);
  }
});

console.log('\n--- Mesh Names ---');
gltf.meshes.forEach((m, idx) => {
  console.log(`Mesh [${idx}] "${m.name}" - Primitives: ${m.primitives.length}`);
});

console.log('\n--- Material Names ---');
gltf.materials?.forEach((mat, idx) => {
  console.log(`Material [${idx}] "${mat.name}"`);
});
