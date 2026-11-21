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

const glbBuffer = fs.readFileSync(targetFile);
const jsonLength = glbBuffer.readUInt32LE(12);
const gltf = JSON.parse(glbBuffer.toString('utf8', 20, 20 + jsonLength));

console.log('--- GLTF SUMMARY ---');
console.log('Meshes count:', gltf.meshes?.length || 0);
console.log('Materials count:', gltf.materials?.length || 0);
console.log('Extensions used:', gltf.extensionsUsed || []);
