import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.resolve(projectRoot, 'public');

console.log('Building high-efficiency lightweight 3D motorcycle model...');

// Accept input GLB path via CLI argument or env var, falling back to local source
const inputPath = process.argv[2] || process.env.INPUT_GLB || path.resolve(publicDir, 'models/raw_source.glb');
const intermediate = path.resolve(publicDir, 'temp_raw.glb');
const welded = path.resolve(publicDir, 'temp_welded.glb');
const simplified = path.resolve(publicDir, 'temp_simplified.glb');
const reordered = path.resolve(publicDir, 'temp_reordered.glb');
const finalLight = path.resolve(publicDir, 'models/mv_agusta_optimized.glb');

if (!fs.existsSync(inputPath)) {
  console.log(`Input source GLB not found at ${inputPath}.`);
  console.log('If you wish to re-optimize from a raw GLB, pass the path as an argument:');
  console.log('  node scripts/build_lightweight_model.mjs <path-to-raw.glb>');
  console.log(`Currently using pre-optimized model at: ${finalLight}`);
  process.exit(0);
}

// Step 1: Create clean untextured base from source
const buf = fs.readFileSync(inputPath);
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));

// Clean materials
if (gltf.materials) {
  gltf.materials.forEach(mat => {
    mat.pbrMetallicRoughness = {
      baseColorFactor: [0.08, 0.08, 0.1, 1.0],
      metallicFactor: 0.5,
      roughnessFactor: 0.5
    };
    mat.alphaMode = 'OPAQUE'; // ELIMINATE expensive BLEND passes on meshes
    delete mat.normalTexture;
    delete mat.occlusionTexture;
    delete mat.emissiveTexture;
    delete mat.extensions;
  });
}
delete gltf.images;
delete gltf.textures;
delete gltf.samplers;
gltf.extensionsUsed = [];
gltf.extensionsRequired = [];

// Remove stand nodes
const standNodes = [];
if (gltf.nodes) {
  gltf.nodes.forEach((n, idx) => {
    if (n.name && (n.name.toLowerCase().includes('stand') || n.name.toLowerCase().includes('paddock'))) {
      standNodes.push(idx);
    }
  });
  if (gltf.scenes) {
    gltf.scenes.forEach(s => {
      if (s.nodes) s.nodes = s.nodes.filter(nodeIdx => !standNodes.includes(nodeIdx));
    });
  }
}

const binChunkOffset = 20 + jsonLen;
const newJsonStr = JSON.stringify(gltf);
const jsonPaddingLen = (4 - (newJsonStr.length % 4)) % 4;
const paddedJsonStr = newJsonStr + ' '.repeat(jsonPaddingLen);
const newJsonByteLen = Buffer.byteLength(paddedJsonStr, 'utf8');

const totalLen = 12 + 8 + newJsonByteLen + (buf.length - binChunkOffset);
const outBuf = Buffer.alloc(totalLen);
outBuf.write('glTF', 0, 4, 'utf8');
outBuf.writeUInt32LE(2, 4);
outBuf.writeUInt32LE(totalLen, 8);
outBuf.writeUInt32LE(newJsonByteLen, 12);
outBuf.write('JSON', 16, 4, 'utf8');
outBuf.write(paddedJsonStr, 20, newJsonByteLen, 'utf8');
buf.copy(outBuf, 20 + newJsonByteLen, binChunkOffset);
fs.writeFileSync(intermediate, outBuf);

console.log('1. Base raw written:', (outBuf.length / 1024 / 1024).toFixed(2), 'MB');

// Step 2: Weld vertices
console.log('2. Running weld...');
execSync(`npx @gltf-transform/cli weld "${intermediate}" "${welded}"`, { stdio: 'inherit' });

// Step 3: Simplify geometry (ratio: 0.35, error: 0.002) - keeps 35% of vertices, reducing geometry by 65%!
console.log('3. Running simplify...');
execSync(`npx @gltf-transform/cli simplify "${welded}" "${simplified}" --ratio 0.35 --error 0.002`, { stdio: 'inherit' });

// Step 4: Reorder for GPU vertex cache
console.log('4. Running reorder...');
execSync(`npx @gltf-transform/cli reorder "${simplified}" "${reordered}"`, { stdio: 'inherit' });

// Step 5: Draco compression
console.log('5. Running Draco compression...');
execSync(`npx @gltf-transform/cli draco "${reordered}" "${finalLight}"`, { stdio: 'inherit' });

// Clean temp files
[intermediate, welded, simplified, reordered].forEach(f => {
  if (fs.existsSync(f)) fs.unlinkSync(f);
});

console.log('Done! Lightweight high-efficiency model generated:');
const s = fs.statSync(finalLight);
console.log('Final Size:', (s.size / 1024 / 1024).toFixed(2), 'MB');
