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

const buf = fs.readFileSync(targetFile);
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));

console.log('Meshes count in GLB:', gltf.meshes ? gltf.meshes.length : 0);
