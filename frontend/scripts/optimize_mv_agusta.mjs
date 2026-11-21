import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.resolve(projectRoot, 'public');

console.log('Optimizing MV Agusta GLB: stripping textures, extensions, stand, and Draco compressing...');

const inputPath = process.argv[2] || process.env.INPUT_GLB || path.resolve(publicDir, 'models/raw_source.glb');
const intermediatePath = path.resolve(publicDir, 'mv_agusta_untextured.glb');
const outputPath = path.resolve(publicDir, 'models/mv_agusta_optimized.glb');

if (!fs.existsSync(inputPath)) {
  console.log(`Input source GLB not found at ${inputPath}. Pass path via CLI: node scripts/optimize_mv_agusta.mjs <file.glb>`);
  process.exit(0);
}

// Read raw GLB
const buf = fs.readFileSync(inputPath);
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));

// 1. Clean all materials: remove all texture bindings, extensions (specular, clearcoat, etc.)
if (gltf.materials) {
  gltf.materials.forEach(mat => {
    mat.pbrMetallicRoughness = {
      baseColorFactor: [0.08, 0.08, 0.1, 1.0],
      metallicFactor: 0.5,
      roughnessFactor: 0.5
    };
    mat.alphaMode = 'OPAQUE';
    delete mat.normalTexture;
    delete mat.occlusionTexture;
    delete mat.emissiveTexture;
    delete mat.extensions;
  });
}

// 2. Remove embedded images, textures, and samplers
delete gltf.images;
delete gltf.textures;
delete gltf.samplers;

// Filter extensionsUsed and extensionsRequired
if (gltf.extensionsUsed) {
  gltf.extensionsUsed = gltf.extensionsUsed.filter(e => !e.startsWith('KHR_materials_'));
}
if (gltf.extensionsRequired) {
  gltf.extensionsRequired = gltf.extensionsRequired.filter(e => !e.startsWith('KHR_materials_'));
}

// 3. Remove Stand Nodes
const standNodes = [];
if (gltf.nodes) {
  gltf.nodes.forEach((n, idx) => {
    if (n.name && (n.name.toLowerCase().includes('stand') || n.name.toLowerCase().includes('paddock'))) {
      standNodes.push(idx);
    }
  });
}
console.log('Identified stand nodes to detach:', standNodes);

// Remove stand nodes from scene roots
if (gltf.scenes) {
  gltf.scenes.forEach(s => {
    if (s.nodes) {
      s.nodes = s.nodes.filter(nodeIdx => !standNodes.includes(nodeIdx));
    }
  });
}

// 4. Write intermediate stripped GLB
const binChunkOffset = 20 + jsonLen;
const binChunkLen = buf.readUInt32LE(binChunkOffset);
console.log(`Binary chunk len: ${binChunkLen}`);

const newJsonStr = JSON.stringify(gltf);
const jsonPaddingLen = (4 - (newJsonStr.length % 4)) % 4;
const paddedJsonStr = newJsonStr + ' '.repeat(jsonPaddingLen);
const newJsonByteLen = Buffer.byteLength(paddedJsonStr, 'utf8');

const totalLen = 12 + 8 + newJsonByteLen + (buf.length - binChunkOffset);
const outBuf = Buffer.alloc(totalLen);

// Header
outBuf.write('glTF', 0, 4, 'utf8');
outBuf.writeUInt32LE(2, 4);
outBuf.writeUInt32LE(totalLen, 8);

// JSON Chunk
outBuf.writeUInt32LE(newJsonByteLen, 12);
outBuf.write('JSON', 16, 4, 'utf8');
outBuf.write(paddedJsonStr, 20, newJsonByteLen, 'utf8');

// Copy binary chunk directly
buf.copy(outBuf, 20 + newJsonByteLen, binChunkOffset);

fs.writeFileSync(intermediatePath, outBuf);
console.log(`Intermediate GLB written: ${(outBuf.length / 1024 / 1024).toFixed(2)} MB`);

// 5. Run Draco Compression via gltf-pipeline
try {
  console.log('Running Draco mesh compression...');
  execSync(`npx gltf-pipeline -i "${intermediatePath}" -o "${outputPath}" -d`, { stdio: 'inherit' });
  const finalStat = fs.statSync(outputPath);
  console.log(`Final Draco Compressed GLB written to: ${outputPath} (${(finalStat.size / 1024 / 1024).toFixed(2)} MB)`);
  
  // Clean up intermediate
  if (fs.existsSync(intermediatePath)) fs.unlinkSync(intermediatePath);
} catch (e) {
  console.error('Draco compression failed:', e);
}
