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

console.log('Inspecting tire nodes in:', targetFile);
gltf.nodes.forEach((n, idx) => {
  if (n.name && (n.name.toLowerCase().includes('tyre') || n.name.toLowerCase().includes('tire') || n.name.toLowerCase().includes('wheel'))) {
    console.log(`Node ${idx}: ${n.name}`, n.translation || [0,0,0]);
  }
});
