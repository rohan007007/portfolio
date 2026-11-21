import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import fs from 'fs';

console.log('Inspecting 88741s98.glb...');

const glbBuffer = fs.readFileSync('D:/Matter Work Porfolio/Matter Aera 3D Model/mv-agusta-brutale-extracted/source/88741s98.glb');
const arrayBuffer = glbBuffer.buffer.slice(glbBuffer.byteOffset, glbBuffer.byteOffset + glbBuffer.byteLength);

const loader = new GLTFLoader();

loader.parse(
  arrayBuffer,
  '',
  (gltf) => {
    console.log('GLB parsed successfully!');
    const scene = gltf.scene;

    const box = new THREE.Box3().setFromObject(scene);
    console.log('Bounding Box Min:', box.min);
    console.log('Bounding Box Max:', box.max);
    console.log('Bounding Box Size:', box.getSize(new THREE.Vector3()));
    console.log('Bounding Box Center:', box.getCenter(new THREE.Vector3()));

    console.log('\n--- Object Hierarchy & Meshes ---');
    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        const geom = child.geometry;
        const triCount = geom.index ? geom.index.count / 3 : (geom.attributes.position ? geom.attributes.position.count / 3 : 0);
        const childBox = new THREE.Box3().setFromObject(child);
        meshes.push({
          name: child.name,
          parent: child.parent ? child.parent.name : null,
          triangles: Math.round(triCount),
          boxMin: childBox.min,
          boxMax: childBox.max,
          material: child.material ? (Array.isArray(child.material) ? child.material.map(m => m.name) : child.material.name) : null
        });
      }
    });

    console.log(`Total Meshes found: ${meshes.length}`);
    meshes.forEach((m, i) => {
      console.log(`[${i}] "${m.name}" (Parent: "${m.parent}") - Tris: ${m.triangles} - Mat: ${JSON.stringify(m.material)}`);
      console.log(`    Y bounds: [${m.boxMin.y.toFixed(3)}, ${m.boxMax.y.toFixed(3)}], Z bounds: [${m.boxMin.z.toFixed(3)}, ${m.boxMax.z.toFixed(3)}], X bounds: [${m.boxMin.x.toFixed(3)}, ${m.boxMax.x.toFixed(3)}]`);
    });
  },
  (err) => {
    console.error('Error parsing GLB:', err);
  }
);
