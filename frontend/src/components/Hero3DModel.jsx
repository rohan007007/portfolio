import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/**
 * Creates a high-contrast studio environment map procedurally
 * gives metallic chrome & obsidian surfaces crisp studio light reflections
 */
function createStudioEnvMap(renderer) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(90, 1, 0.1, 100);

  // Studio light strips
  const stripMat1 = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const strip1 = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 0.2), stripMat1);
  strip1.position.set(0, 5, 2);
  strip1.rotation.x = Math.PI / 4;
  scene.add(strip1);

  const stripMat2 = new THREE.MeshBasicMaterial({ color: 0xe0e8ff });
  const strip2 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 0.2), stripMat2);
  strip2.position.set(-4, 3, -3);
  strip2.rotation.y = Math.PI / 3;
  scene.add(strip2);

  const stripMat3 = new THREE.MeshBasicMaterial({ color: 0xd9ff3f });
  const strip3 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 0.2), stripMat3);
  strip3.position.set(4, -2, -2);
  scene.add(strip3);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const renderTarget = pmremGenerator.fromScene(scene);
  return renderTarget.texture;
}

/**
 * Eliminates commuter-specific geometry artifacts from the base mesh & wheels
 * (Tall bug mirrors, rear mudguard stalk, paddock stand, passenger grab rails)
 * by collapsing matching triangle indices so GPU rasterizer discards them.
 */
function clipCommuterTriangles(mesh) {
  const name = (mesh.name || "").toLowerCase();
  // Never clip tire rubber, headlights, or indicators
  if (name.includes("tyre") || name.includes("headlight") || name.includes("indicator")) return;

  const geom = mesh.geometry;
  if (!geom || !geom.attributes.position) return;
  const pos = geom.attributes.position;
  mesh.updateWorldMatrix(true, false);
  const worldMat = mesh.matrixWorld;

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();

  const isCommuterPoint = (v) => {
    const wx = v.x;
    const wy = v.y;
    const wz = v.z;

    // 1. Paddock stand: ground tubes, lever handle, and side swingarm support legs outside tire
    if (wy < 0.055 && wz < 0.1 && (name.includes("wheel") || name.includes("base"))) return true;
    if (Math.abs(wx) >= 0.082 && wy < 0.34 && wz > -0.76 && wz < -0.28 && (name.includes("wheel") || name.includes("base"))) return true;
    if (wz < -0.62 && wy < 0.26 && (name.includes("wheel") || name.includes("base"))) return true;
    if (wz < -0.68 && wy > 0.38 && (name.includes("wheel") || name.includes("base"))) return true;

    // 2. Tall commuter mirrors: wy > 0.93, abs(wx) > 0.06, wz between 0.25 and 0.65
    if (wy > 0.93 && Math.abs(wx) > 0.06 && wz > 0.25 && wz < 0.65) return true;

    // 3. Long commuter rear mudguard / number plate holder: wz < -0.68 and wy < 0.60, abs(wx) < 0.09
    if (wz < -0.68 && wy < 0.60 && Math.abs(wx) < 0.09) return true;

    // 4. Passenger commuter grab rail & luggage rack: wz between -0.40 and -0.82, wy > 0.72
    if (wz < -0.40 && wz > -0.82 && wy > 0.72) return true;

    return false;
  };

  let collapsedCount = 0;
  if (geom.index) {
    const idx = geom.index;
    const triCount = idx.count / 3;
    for (let t = 0; t < triCount; t++) {
      const iA = idx.getX(3 * t);
      const iB = idx.getX(3 * t + 1);
      const iC = idx.getX(3 * t + 2);

      vA.set(pos.getX(iA), pos.getY(iA), pos.getZ(iA)).applyMatrix4(worldMat);
      vB.set(pos.getX(iB), pos.getY(iB), pos.getZ(iB)).applyMatrix4(worldMat);
      vC.set(pos.getX(iC), pos.getY(iC), pos.getZ(iC)).applyMatrix4(worldMat);

      if (isCommuterPoint(vA) || isCommuterPoint(vB) || isCommuterPoint(vC)) {
        idx.setX(3 * t, 0);
        idx.setX(3 * t + 1, 0);
        idx.setX(3 * t + 2, 0);
        collapsedCount++;
      }
    }
    idx.needsUpdate = true;
    console.error(`[CLIP-COUNT] "${mesh.name}": collapsed ${collapsedCount} / ${triCount} triangles`);
  }

  geom.computeVertexNormals();
  geom.computeBoundingBox();
}

/**
 * Builds the Concept Electric Hyperbike Aerodynamic Aero Kit:
 * - Solid carbon turbofan aero-discs on front and rear wheels with cyber neon rings
 * - Low forward-swept aerodynamic nose cowl & tinted racing canopy
 * - Dual MotoGP-spec aerodynamic downforce winglets (canards) with neon leading edges
 * - Streamlined monocoque cyber-spine top bodywork replacing the commuter tank
 * - Sharp single-seater racing aero-tail with razor-thin LED light blade
 * - Lower aerodynamic ground-effect belly pan & battery diffuser
 */
function createConceptHyperbikeAeroKit(materials) {
  const group = new THREE.Group();
  group.name = "Concept_Aero_Kit";

  const {
    carbonAeroMaterial,
    glossObsidianMaterial,
    satinObsidianMaterial,
    acidLedMaterial,
    brakeLedMaterial,
    titaniumMaterial,
    tintedCanopyMaterial,
  } = materials;

  // 1. FRONT WHEEL TURBOFAN AERO-DISCS (Center: 0, 0.30, 0.755)
  const frontDiscRadius = 0.265;
  const frontDiscZ = 0.755;
  const frontDiscY = 0.30;

  [-0.052, 0.052].forEach((xSide) => {
    // Carbon aerodynamic disc plate
    const discGeom = new THREE.CylinderGeometry(frontDiscRadius, frontDiscRadius, 0.014, 40);
    discGeom.rotateZ(Math.PI / 2);
    const discMesh = new THREE.Mesh(discGeom, carbonAeroMaterial);
    discMesh.position.set(xSide, frontDiscY, frontDiscZ);
    group.add(discMesh);

    // Outer cyber neon perimeter ring
    const ringGeom = new THREE.RingGeometry(frontDiscRadius * 0.88, frontDiscRadius * 0.96, 40);
    ringGeom.rotateY(xSide > 0 ? Math.PI / 2 : -Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeom, acidLedMaterial);
    ringMesh.position.set(xSide + (xSide > 0 ? 0.008 : -0.008), frontDiscY, frontDiscZ);
    group.add(ringMesh);

    // Center lock titanium hub
    const hubGeom = new THREE.CylinderGeometry(0.048, 0.048, 0.024, 24);
    hubGeom.rotateZ(Math.PI / 2);
    const hubMesh = new THREE.Mesh(hubGeom, titaniumMaterial);
    hubMesh.position.set(xSide + (xSide > 0 ? 0.006 : -0.006), frontDiscY, frontDiscZ);
    group.add(hubMesh);
  });

  // 2. REAR WHEEL TURBOFAN AERO-DISCS (Center: 0, 0.35, -0.595)
  const rearDiscRadius = 0.275;
  const rearDiscZ = -0.595;
  const rearDiscY = 0.35;

  [-0.058, 0.058].forEach((xSide) => {
    // Carbon aerodynamic disc plate
    const discGeom = new THREE.CylinderGeometry(rearDiscRadius, rearDiscRadius, 0.016, 40);
    discGeom.rotateZ(Math.PI / 2);
    const discMesh = new THREE.Mesh(discGeom, carbonAeroMaterial);
    discMesh.position.set(xSide, rearDiscY, rearDiscZ);
    group.add(discMesh);

    // Outer cyber neon perimeter ring
    const ringGeom = new THREE.RingGeometry(rearDiscRadius * 0.88, rearDiscRadius * 0.96, 40);
    ringGeom.rotateY(xSide > 0 ? Math.PI / 2 : -Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeom, acidLedMaterial);
    ringMesh.position.set(xSide + (xSide > 0 ? 0.009 : -0.009), rearDiscY, rearDiscZ);
    group.add(ringMesh);

    // Center lock titanium hub
    const hubGeom = new THREE.CylinderGeometry(0.052, 0.052, 0.026, 24);
    hubGeom.rotateZ(Math.PI / 2);
    const hubMesh = new THREE.Mesh(hubGeom, titaniumMaterial);
    hubMesh.position.set(xSide + (xSide > 0 ? 0.007 : -0.007), rearDiscY, rearDiscZ);
    group.add(hubMesh);
  });

  // 3. AGGRESSIVE AERODYNAMIC FRONT NOSE COWL & WIND SPLITTER
  // Forward-swept aerodynamic nose cone enclosing commuter headlight
  const noseGeom = new THREE.ConeGeometry(0.18, 0.44, 4);
  noseGeom.rotateX(Math.PI / 2);
  noseGeom.rotateZ(Math.PI / 4); // diamond cross-section
  const noseMesh = new THREE.Mesh(noseGeom, carbonAeroMaterial);
  noseMesh.scale.set(1.1, 0.65, 1.0);
  noseMesh.position.set(0, 0.77, 0.72);
  group.add(noseMesh);

  // Aerodynamic wind canopy / visor
  const canopyGeom = new THREE.ConeGeometry(0.14, 0.38, 4);
  canopyGeom.rotateX(Math.PI / 2.3);
  canopyGeom.rotateZ(Math.PI / 4);
  const canopyMesh = new THREE.Mesh(canopyGeom, tintedCanopyMaterial);
  canopyMesh.scale.set(0.95, 0.45, 0.9);
  canopyMesh.position.set(0, 0.85, 0.64);
  group.add(canopyMesh);

  // Front Cyber Neon LED Light Blade (Razor horizontal projector)
  const frontLightGeom = new THREE.BoxGeometry(0.24, 0.016, 0.035);
  const frontLightMesh = new THREE.Mesh(frontLightGeom, acidLedMaterial);
  frontLightMesh.position.set(0, 0.765, 0.88);
  group.add(frontLightMesh);

  // Lower aerodynamic nose splitter blade
  const splitterGeom = new THREE.BoxGeometry(0.28, 0.012, 0.16);
  const splitterMesh = new THREE.Mesh(splitterGeom, carbonAeroMaterial);
  splitterMesh.position.set(0, 0.66, 0.76);
  splitterMesh.rotation.x = 0.12;
  group.add(splitterMesh);

  // Dual MotoGP-Style Downforce Winglets (Canards)
  [-1, 1].forEach((dir) => {
    const wingGeom = new THREE.BoxGeometry(0.12, 0.008, 0.14);
    const wingMesh = new THREE.Mesh(wingGeom, carbonAeroMaterial);
    wingMesh.position.set(dir * 0.18, 0.74, 0.67);
    wingMesh.rotation.z = -dir * 0.18;
    wingMesh.rotation.y = dir * 0.15;
    group.add(wingMesh);

    // Glowing acid-yellow leading edge on winglet
    const wingEdgeGeom = new THREE.BoxGeometry(0.122, 0.01, 0.012);
    const wingEdgeMesh = new THREE.Mesh(wingEdgeGeom, acidLedMaterial);
    wingEdgeMesh.position.set(dir * 0.18, 0.742, 0.738);
    wingEdgeMesh.rotation.z = -dir * 0.18;
    wingEdgeMesh.rotation.y = dir * 0.15;
    group.add(wingEdgeMesh);
  });

  // 4. STREAMLINED MONOCOQUE CYBER-SPINE (TOP FUEL-CELL / INVERTER SHELL)
  // Low-slung, continuous muscular spine replacing commuter tank and flap
  const spineGeom = new THREE.BoxGeometry(0.25, 0.12, 0.62);
  const spineMesh = new THREE.Mesh(spineGeom, carbonAeroMaterial);
  spineMesh.position.set(0, 0.89, 0.22);
  spineMesh.rotation.x = -0.08;
  group.add(spineMesh);

  // Top digital HUD / telemetry glass canopy
  const hudGlassGeom = new THREE.BoxGeometry(0.14, 0.015, 0.28);
  const hudGlassMesh = new THREE.Mesh(hudGlassGeom, glossObsidianMaterial);
  hudGlassMesh.position.set(0, 0.955, 0.26);
  hudGlassMesh.rotation.x = -0.08;
  group.add(hudGlassMesh);

  // Longitudinal Cyber Accent Light Strips along the shoulders
  [-1, 1].forEach((dir) => {
    const stripGeom = new THREE.BoxGeometry(0.008, 0.008, 0.58);
    const stripMesh = new THREE.Mesh(stripGeom, acidLedMaterial);
    stripMesh.position.set(dir * 0.122, 0.945, 0.22);
    stripMesh.rotation.x = -0.08;
    group.add(stripMesh);
  });

  // 5. SINGLE-SEATER RACE AERO-TAIL UNIT
  // Sleek, tapered aerodynamic carbon tail cowl
  const tailGeom = new THREE.ConeGeometry(0.18, 0.56, 4);
  tailGeom.rotateX(-Math.PI / 2.1);
  tailGeom.rotateZ(Math.PI / 4); // Diamond / faceted wedge profile
  const tailMesh = new THREE.Mesh(tailGeom, carbonAeroMaterial);
  tailMesh.scale.set(1.1, 0.45, 1.0);
  tailMesh.position.set(0, 0.81, -0.46);
  group.add(tailMesh);

  // Alcantara single-seat racing pad
  const seatGeom = new THREE.BoxGeometry(0.17, 0.025, 0.26);
  const seatMesh = new THREE.Mesh(seatGeom, satinObsidianMaterial);
  seatMesh.position.set(0, 0.81, -0.16);
  seatMesh.rotation.x = 0.05;
  group.add(seatMesh);

  // Rear Cyber LED Light Blade (Razor tail-light strip at trailing edge)
  const tailLightGeom = new THREE.BoxGeometry(0.16, 0.014, 0.025);
  const tailLightMesh = new THREE.Mesh(tailLightGeom, brakeLedMaterial);
  tailLightMesh.position.set(0, 0.835, -0.72);
  group.add(tailLightMesh);

  // Dual Rear Aero Diffuser Fins under the tail
  [-1, 1].forEach((dir) => {
    const finGeom = new THREE.BoxGeometry(0.008, 0.08, 0.24);
    const finMesh = new THREE.Mesh(finGeom, carbonAeroMaterial);
    finMesh.position.set(dir * 0.09, 0.72, -0.56);
    finMesh.rotation.z = dir * 0.12;
    group.add(finMesh);
  });

  // 6. LOWER GROUND-EFFECT BELLY PAN & BATTERY DIFFUSER
  // Low-slung aerodynamic carbon underbody keel hugging the frame and battery
  const bellyGeom = new THREE.BoxGeometry(0.24, 0.12, 0.78);
  const bellyMesh = new THREE.Mesh(bellyGeom, carbonAeroMaterial);
  bellyMesh.position.set(0, 0.24, 0.08);
  bellyMesh.rotation.x = 0.05;
  group.add(bellyMesh);

  // Lower neon ground-effect ambient illumination tubes
  [-1, 1].forEach((dir) => {
    const underGlowGeom = new THREE.BoxGeometry(0.008, 0.008, 0.62);
    const underGlowMesh = new THREE.Mesh(underGlowGeom, acidLedMaterial);
    underGlowMesh.position.set(dir * 0.122, 0.185, 0.08);
    group.add(underGlowMesh);
  });

  return group;
}

export function Hero3DModel() {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  // References to communicate with the render loop without re-renders
  const animState = useRef({
    // Mouse tracking for cursor lean/pitch
    mouseNormX: 0,
    mouseNormY: 0,
    targetLeanZ: 0,
    targetPitchX: 0,
    targetSteerY: 0,
    currentLeanZ: 0,
    currentPitchX: 0,
    currentSteerY: 0,

    // Click & drag 3D rotation
    isDragging: false,
    lastX: 0,
    lastY: 0,
    dragRotY: 0.65, // default beauty 3/4 angle
    dragRotX: 0.08,
    targetDragRotY: 0.65,
    targetDragRotX: 0.08,
    velX: 0,
    velY: 0,

    // Pivot & Model groups
    pivotGroup: null,
    bikeGroup: null,
    resetToDefault: false,
  });

  const handleReset = useCallback(() => {
    animState.current.targetDragRotY = 0.65;
    animState.current.targetDragRotX = 0.08;
    animState.current.velX = 0;
    animState.current.velY = 0;
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    let width = container.clientWidth || window.innerWidth * 0.6;
    let height = container.clientHeight || window.innerHeight * 0.8;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 3.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Studio Environment Reflections
    const envMap = createStudioEnvMap(renderer);
    scene.environment = envMap;

    // Lighting (Studio Rim & Key Setup inspired by the humanoid robot reference)
    // 1. Soft cool ambient
    const ambientLight = new THREE.AmbientLight(0x181a20, 1.6);
    scene.add(ambientLight);

    // 2. Main Key Light (Top-Front-Right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    // 3. High-Contrast Specular Rim Light (Top-Rear-Left)
    // Catches the sharp edges of black-on-black surfaces
    const rimLight1 = new THREE.DirectionalLight(0xffffff, 4.5);
    rimLight1.position.set(-5, 4, -4);
    scene.add(rimLight1);

    // 4. Acid-Yellow Cyber Glow Backlight
    const acidLight = new THREE.DirectionalLight(0xd9ff3f, 2.2);
    acidLight.position.set(2, -2, -3);
    scene.add(acidLight);

    // 5. Fill Light from below
    const fillLight = new THREE.DirectionalLight(0x2a2d35, 1.4);
    fillLight.position.set(0, -3, 2);
    scene.add(fillLight);

    // Model Hierarchy:
    // scene -> pivotGroup (handles user click-drag rotation) -> bikeGroup (handles cursor lean/pitch/idle) -> gltfScene
    const pivotGroup = new THREE.Group();
    const bikeGroup = new THREE.Group();
    pivotGroup.add(bikeGroup);
    scene.add(pivotGroup);

    animState.current.pivotGroup = pivotGroup;
    animState.current.bikeGroup = bikeGroup;

    // ─────────────────────────────────────────────────────────────
    // Bespoke Robot-Inspired Materials (Murdered-Out Cyber Stealth)
    // ─────────────────────────────────────────────────────────────
    // 1. Satin Deep Obsidian Black (Main Body panels)
    const satinObsidianMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0c0d10),
      metalness: 0.22,
      roughness: 0.38,
      clearcoat: 0.45,
      clearcoatRoughness: 0.2,
      reflectivity: 0.8,
      envMapIntensity: 1.4,
    });

    // 2. High-Gloss Obsidian Mirror Black (Visor / Fairing accents)
    const glossObsidianMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x040507),
      metalness: 0.15,
      roughness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.95,
      envMapIntensity: 2.0,
    });

    // 3. Polished Gunmetal / Dark Chrome (Mechanical powertrain, frame, swingarm, motor)
    const gunmetalChromeMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1b1f),
      metalness: 0.94,
      roughness: 0.18,
      envMapIntensity: 2.2,
    });

    // 4. Billet Dark Titanium Aluminum (Auxiliary brackets, pegs, hardware)
    const titaniumMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x18191d),
      metalness: 0.86,
      roughness: 0.28,
      envMapIntensity: 1.6,
    });

    // 5. Vulcanized Matte Black Rubber (Tires)
    const tireRubberMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0a0b0d),
      roughness: 0.85,
      metalness: 0.02,
    });

    // 6. Forged Gloss Black / Gunmetal Alloy (Wheels)
    const forgedWheelMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0d0e11),
      metalness: 0.92,
      roughness: 0.15,
      envMapIntensity: 2.0,
    });

    // 7. Cyber Neon Acid-Yellow LED (Headlight / Projectors / DRL)
    const acidLedMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd9ff3f),
      emissive: new THREE.Color(0xd9ff3f),
      emissiveIntensity: 3.8,
      roughness: 0.1,
    });

    // 8. Smoked Crimson LED (Brake light)
    const brakeLedMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xff1e38),
      emissive: new THREE.Color(0xff1e38),
      emissiveIntensity: 3.0,
      roughness: 0.2,
    });

    // 9. Aerodynamic Carbon Fiber Shell (Hyperbike Bodywork & Aero-Discs)
    const carbonAeroMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0c0d10),
      metalness: 0.35,
      roughness: 0.25,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
      reflectivity: 0.9,
      envMapIntensity: 2.2,
    });

    // 10. Tinted Racing Visor & HUD Glass Canopy
    const tintedCanopyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x020304),
      metalness: 0.15,
      roughness: 0.04,
      transmission: 0.82,
      transparent: true,
      opacity: 0.9,
      ior: 1.5,
      reflectivity: 0.95,
      clearcoat: 1.0,
      envMapIntensity: 2.4,
    });

    // Load Model with Draco decompression support
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    dracoLoader.preload();

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    const modelUrl = `${process.env.PUBLIC_URL || ""}/models/concept_bike.glb`;

    loader.load(
      modelUrl,
      (gltf) => {
        const root = gltf.scene;

        root.updateWorldMatrix(true, true);
        root.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;

            const name = (node.name || "").toLowerCase();
            const matName = (node.material?.name || "").toLowerCase();

            // 1. Hide any retail Matter 5000 branding / garnish / showroom elements
            if (
              name.includes("5000") ||
              name.includes("garnish") ||
              name.includes("spinner") ||
              name.includes("lookat") ||
              matName.includes("spinner")
            ) {
              node.visible = false;
              return;
            }

            // 2. Hide commuter tank & charging flap (replaced by sleek monocoque cyber-spine)
            if (name.includes("tank") || name.includes("flap")) {
              node.visible = false;
              return;
            }

            // 3. Ground shadow plane
            if (name.includes("shadow") || matName.includes("shadow")) {
              node.material = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.45,
              });
              return;
            }

            // 4. Eliminate commuter geometry artifacts (tall bug mirrors, rear mudguard stalk, paddock stand)
            clipCommuterTriangles(node);

            // 5. Headlights & LED lights
            if (
              name.includes("headlight") ||
              matName.includes("headlight") ||
              name.includes("indicator") ||
              name.includes("cell") ||
              matName.includes("indicator")
            ) {
              node.material = acidLedMaterial;
              return;
            }

            // 6. Brake light
            if (name.includes("brake") || matName.includes("brake")) {
              node.material = brakeLedMaterial;
              return;
            }

            // 7. Tires
            if (name.includes("tyre") || matName.includes("tyre")) {
              node.material = tireRubberMaterial;
              return;
            }

            // 8. Wheels
            if (name.includes("wheel") || matName.includes("wheel")) {
              node.material = forgedWheelMaterial;
              return;
            }

            // 9. Mechanicals / Powertrain / Frame / Drivetrain (Base mesh)
            if (
              name.includes("base mesh") ||
              name.includes("gearbox") ||
              matName.includes("combined") ||
              matName.includes("mataux")
            ) {
              node.material = gunmetalChromeMaterial;
              return;
            }

            // 10. Remaining main body panels -> Satin Obsidian
            if (name.includes("body") || matName.includes("body")) {
              node.material = satinObsidianMaterial;
              return;
            }

            // Default fallback for any remaining meshes: Titanium Gunmetal
            node.material = titaniumMaterial;
          }
        });

        // Attach Concept Hyperbike Aero Kit (Aero-Discs, Nose Cowl, Cyber-Spine, Race Tail, Belly Pan)
        const aeroKit = createConceptHyperbikeAeroKit({
          carbonAeroMaterial,
          glossObsidianMaterial,
          satinObsidianMaterial,
          acidLedMaterial,
          brakeLedMaterial,
          titaniumMaterial,
          tintedCanopyMaterial,
        });
        root.add(aeroKit);

        // Compute Bounding Box & Center the model
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        root.position.x = -center.x;
        root.position.y = -center.y - 0.05; // slight ground baseline
        root.position.z = -center.z;

        // Scale to fit hero viewport perfectly
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = 2.45 / maxDim;
        root.scale.setScalar(targetScale);

        bikeGroup.add(root);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.warn("Failed to load concept_bike.glb, loading fallback...", err);
        // Fallback loader if path was different
        loader.load(
          `${process.env.PUBLIC_URL || ""}/models/Matter_AERA_Cosmic_Black_BikeOnly.glb`,
          (fallbackGltf) => {
            const root = fallbackGltf.scene;
            root.traverse((node) => {
              if (node.isMesh) {
                const name = (node.name || "").toLowerCase();
                if (name.includes("5000") || name.includes("spinner") || name.includes("lookat")) {
                  node.visible = false;
                } else if (name.includes("headlight") || name.includes("indicator")) {
                  node.material = acidLedMaterial;
                } else if (name.includes("tyre")) {
                  node.material = tireRubberMaterial;
                } else if (name.includes("wheel")) {
                  node.material = forgedWheelMaterial;
                } else if (name.includes("body") || name.includes("tank")) {
                  node.material = satinObsidianMaterial;
                } else {
                  node.material = gunmetalChromeMaterial;
                }
              }
            });

            const box = new THREE.Box3().setFromObject(root);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            root.position.x = -center.x;
            root.position.y = -center.y - 0.05;
            root.position.z = -center.z;
            const targetScale = 2.45 / Math.max(size.x, size.y, size.z);
            root.scale.setScalar(targetScale);

            bikeGroup.add(root);
            setLoading(false);
          }
        );
      }
    );

    // ─────────────────────────────────────────────────────────────
    // Mouse Tracking (Pitch In / Out, Lean Left / Right)
    // ─────────────────────────────────────────────────────────────
    const onWindowPointerMove = (e) => {
      // Normalized screen coordinates: -0.5 to +0.5
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;

      animState.current.mouseNormX = nx;
      animState.current.mouseNormY = ny;

      // Lean Left / Lean Right (Roll along Z, subtle Steer along Y)
      // Moving mouse right banks the bike to the right into the turn
      animState.current.targetLeanZ = -nx * 0.42; // ~24 deg lean
      animState.current.targetSteerY = nx * 0.22;

      // Pitch In / Pitch Out (tilt forward/backward along X)
      animState.current.targetPitchX = -ny * 0.3; // ~17 deg pitch
    };

    window.addEventListener("pointermove", onWindowPointerMove, { passive: true });

    // ─────────────────────────────────────────────────────────────
    // Click and Drag 3D Rotation Interaction
    // ─────────────────────────────────────────────────────────────
    const domEl = renderer.domElement;

    const onPointerDown = (e) => {
      animState.current.isDragging = true;
      animState.current.lastX = e.clientX;
      animState.current.lastY = e.clientY;
      animState.current.velX = 0;
      animState.current.velY = 0;
      setIsInteracting(true);
      domEl.style.cursor = "grabbing";
    };

    const onPointerMove = (e) => {
      if (!animState.current.isDragging) return;
      const dx = e.clientX - animState.current.lastX;
      const dy = e.clientY - animState.current.lastY;

      const rotSpeedX = 0.0075;
      const rotSpeedY = 0.0055;

      animState.current.targetDragRotY += dx * rotSpeedX;
      animState.current.targetDragRotX += dy * rotSpeedY;

      // Clamp vertical pitch so user doesn't flip the bike upside down
      animState.current.targetDragRotX = Math.max(-0.65, Math.min(0.65, animState.current.targetDragRotX));

      animState.current.velX = dx * rotSpeedX;
      animState.current.velY = dy * rotSpeedY;

      animState.current.lastX = e.clientX;
      animState.current.lastY = e.clientY;
    };

    const onPointerUp = () => {
      animState.current.isDragging = false;
      setIsInteracting(false);
      domEl.style.cursor = "grab";
    };

    const onDblClick = () => {
      animState.current.targetDragRotY = 0.65;
      animState.current.targetDragRotX = 0.08;
      animState.current.velX = 0;
      animState.current.velY = 0;
    };

    domEl.style.cursor = "grab";
    domEl.addEventListener("pointerdown", onPointerDown);
    domEl.addEventListener("dblclick", onDblClick);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    domEl.addEventListener("pointerleave", onPointerUp);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth * 0.6;
      height = container.clientHeight || window.innerHeight * 0.8;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", onResize);

    // ─────────────────────────────────────────────────────────────
    // Main 60fps Animation Loop
    // ─────────────────────────────────────────────────────────────
    let reqId;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const state = animState.current;

      // 1. Smoothly interpolate cursor lean & pitch
      state.currentLeanZ += (state.targetLeanZ - state.currentLeanZ) * 0.07;
      state.currentPitchX += (state.targetPitchX - state.currentPitchX) * 0.07;
      state.currentSteerY += (state.targetSteerY - state.currentSteerY) * 0.07;

      // 2. Drag rotation with momentum damping
      if (!state.isDragging) {
        state.targetDragRotY += state.velX;
        state.targetDragRotX += state.velY;
        state.targetDragRotX = Math.max(-0.65, Math.min(0.65, state.targetDragRotX));
        state.velX *= 0.93;
        state.velY *= 0.93;
      }

      state.dragRotY += (state.targetDragRotY - state.dragRotY) * 0.12;
      state.dragRotX += (state.targetDragRotX - state.dragRotX) * 0.12;

      // 3. Subtle organic idle suspension breathing
      const idleFloat = Math.sin(time * 1.6) * 0.02;
      const idlePitch = Math.cos(time * 1.3) * 0.012;

      // 4. Apply 3D transformations
      if (state.pivotGroup) {
        // User drag rotates around 3D axes
        state.pivotGroup.rotation.y = state.dragRotY;
        state.pivotGroup.rotation.x = state.dragRotX;
      }

      if (state.bikeGroup) {
        // Cursor lean, pitch, and idle float inside the pivot
        state.bikeGroup.rotation.z = state.currentLeanZ;
        state.bikeGroup.rotation.x = state.currentPitchX + idlePitch;
        state.bikeGroup.rotation.y = state.currentSteerY;
        state.bikeGroup.position.y = idleFloat;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      domEl.removeEventListener("pointerdown", onPointerDown);
      domEl.removeEventListener("dblclick", onDblClick);
      domEl.removeEventListener("pointerleave", onPointerUp);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      dracoLoader.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="hero-3d-wrapper" data-testid="hero-3d-model-container">
      {/* 3D Canvas Mounting Node */}
      <div ref={mountRef} className="hero-3d-canvas" />

      {/* Atmospheric Ambient Depth Glow */}
      <div className="hero-3d-ambient-glow" aria-hidden="true" />

      {/* Clean, Non-intrusive Loading Indicator */}
      {loading && (
        <div className="hero-3d-loader">
          <div className="hero-3d-spinner" />
        </div>
      )}
    </div>
  );
}
