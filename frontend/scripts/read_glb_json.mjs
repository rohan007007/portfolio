import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const defaultInput = path.resolve(projectRoot, 'public/models/mv_agusta_optimized.glb');
const targetFile = process.argv[2] || defaultInput;

if (!fs.existsSync(targetFile)) {
  console.log(`Target GLB not found at ${targetFile}`);
  process.exit(0);
}

const buffer = fs.readFileSync(targetFile);
const jsonLen = buffer.readUInt32LE(12);
const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + jsonLen));

console.log('GLTF JSON extracted:');
console.log('Scenes:', gltf.scenes?.length || 0);
console.log('Nodes:', gltf.nodes?.length || 0);
console.log('Meshes:', gltf.meshes?.length || 0);
