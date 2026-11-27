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

  // Studio light strips
  const stripMat1 = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const strip1 = new THREE.Mesh(new THREE.BoxGeometry(12, 3, 0.2), stripMat1);
  strip1.position.set(0, 6, 3);
  strip1.rotation.x = Math.PI / 4;
  scene.add(strip1);

  const stripMat2 = new THREE.MeshBasicMaterial({ color: 0xd0d8f0 });
  const strip2 = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 0.2), stripMat2);
  strip2.position.set(-5, 4, -3);
  strip2.rotation.y = Math.PI / 3;
  scene.add(strip2);

  const stripMat3 = new THREE.MeshBasicMaterial({ color: 0xd9ff3f });
  const strip3 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.8, 0.2), stripMat3);
  strip3.position.set(5, -1, -2);
  scene.add(strip3);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const renderTarget = pmremGenerator.fromScene(scene);
  return renderTarget.texture;
}

export function Hero3DModel() {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);

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
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    renderer.setPixelRatio(isTouchDevice ? Math.min(window.devicePixelRatio, 1.0) : Math.min(window.devicePixelRatio, 1.25));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.touchAction = "pan-y";
    container.appendChild(renderer.domElement);

    // Studio Environment Reflections
    const envMap = createStudioEnvMap(renderer);
    scene.environment = envMap;

    // Lighting (Studio Rim & Key Setup — Optimized 3-light rig)
    const ambientLight = new THREE.AmbientLight(0x22242a, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight1 = new THREE.DirectionalLight(0xffffff, 4.2);
    rimLight1.position.set(-5, 4.5, -4);
    scene.add(rimLight1);

    const acidLight = new THREE.DirectionalLight(0xd9ff3f, 2.2);
    acidLight.position.set(2, -2, -3);
    scene.add(acidLight);

    // Model Hierarchy:
    // scene -> pivotGroup (handles user click-drag rotation) -> bikeGroup (handles cursor lean/pitch/idle) -> gltfScene
    const pivotGroup = new THREE.Group();
    const bikeGroup = new THREE.Group();
    pivotGroup.add(bikeGroup);
    scene.add(pivotGroup);

    animState.current.pivotGroup = pivotGroup;
    animState.current.bikeGroup = bikeGroup;

    // ─────────────────────────────────────────────────────────────
    // High-Efficiency PBR Black Tone Materials (GPU Optimized)
    // ─────────────────────────────────────────────────────────────
    // 1. Satin Deep Obsidian Black (Main Body panels)
    const satinObsidianMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0c0d10),
      metalness: 0.25,
      roughness: 0.35,
      envMapIntensity: 1.2,
    });

    // 2. High-Gloss Obsidian Mirror Black (Tank, visor accents)
    const glossObsidianMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x040507),
      metalness: 0.20,
      roughness: 0.08,
      envMapIntensity: 1.6,
    });

    // 3. Polished Gunmetal / Dark Chrome (Mechanical powertrain, frame, swingarm, motor)
    const gunmetalChromeMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1e2026),
      metalness: 0.88,
      roughness: 0.22,
      envMapIntensity: 1.6,
    });

    // 4. Vulcanized Matte Black Rubber (Tires)
    const tireRubberMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0a0b0d),
      roughness: 0.90,
      metalness: 0.05,
    });

    // 5. Forged Gloss Black / Gunmetal Alloy (Wheels)
    const forgedWheelMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0d0e11),
      metalness: 0.90,
      roughness: 0.18,
      envMapIntensity: 1.6,
    });

    // 6. Inverted Fork Stanchions (Anodized Bronze / Ohlins Gold)
    const forkStanchionMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xcca038),
      metalness: 0.88,
      roughness: 0.20,
      envMapIntensity: 1.5,
    });

    // 7. Darkened Steel / Carbon-Ceramic Brake Discs
    const brakeDiscMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x282b33),
      metalness: 0.80,
      roughness: 0.25,
      envMapIntensity: 1.2,
    });

    // 8. Cyber Neon Acid-Yellow LED (Headlight / Projectors / DRL)
    const acidLedMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd9ff3f),
      emissive: new THREE.Color(0xd9ff3f),
      emissiveIntensity: 2.8,
      roughness: 0.2,
    });

    // 9. Smoked Crimson LED (Brake light)
    const brakeLedMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xff1e38),
      emissive: new THREE.Color(0xff1e38),
      emissiveIntensity: 2.8,
      roughness: 0.2,
    });

    // 10. Tinted Racing Visor Glass
    const tintedCanopyMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x040507),
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.65,
      envMapIntensity: 1.4,
    });

    // Load Model with Draco decompression support
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    dracoLoader.preload();

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    const modelUrl = `${process.env.PUBLIC_URL || ""}/models/mv_agusta_optimized.glb`;

    loader.load(
      modelUrl,
      (gltf) => {
        const root = gltf.scene;

        // 1. Remove & hide any stand/paddock nodes
        root.traverse((node) => {
          const n = (node.name || "").toLowerCase();
          if (n.includes("stand") || n.includes("paddock")) {
            node.visible = false;
          }
        });

        // 2. Strip all graphic decals/stickers & apply tone materials
        root.traverse((node) => {
          if (!node.isMesh) return;

          const name = (node.name || "").toLowerCase();

          // Strip any image texture maps (removes graphic stickers/liveries)
          if (node.material) {
            if (Array.isArray(node.material)) {
              node.material.forEach((m) => { if (m.map) m.map = null; });
            } else if (node.material.map) {
              node.material.map = null;
            }
          }

          // Apply component-specific black tone materials
          if (name.includes("tyre") || name.includes("tire")) {
            node.material = tireRubberMaterial;
          } else if (name.includes("brake") || name.includes("disc") || name.includes("rotor")) {
            node.material = brakeDiscMaterial;
          } else if (name.includes("forks_u") || name.includes("stanchion")) {
            node.material = forkStanchionMaterial;
          } else if (name.includes("rim") || name.includes("wheel")) {
            node.material = forgedWheelMaterial;
          } else if (name.includes("glass") || name.includes("vidros") || name.includes("windscreen")) {
            node.material = tintedCanopyMaterial;
          } else if (name.includes("taillight") || name.includes("brakelight")) {
            node.material = brakeLedMaterial;
          } else if (name.includes("headlight") || name.includes("extralight") || name.includes("dash")) {
            node.material = acidLedMaterial;
          } else if (name.includes("petroltank") || name.includes("seat")) {
            node.material = glossObsidianMaterial;
          } else if (name.includes("chassis") || name.includes("engine") || name.includes("swingarm") || name.includes("gear")) {
            node.material = gunmetalChromeMaterial;
          } else {
            node.material = satinObsidianMaterial;
          }
        });

        // 3. Facing orientation: Rotate 180 degrees so front wheel faces +Z
        root.rotation.y = Math.PI;

        // 4. Compute Bounding Box & Level/Ground the model on Y = 0
        root.updateMatrixWorld(true, true);
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Shift model so tires rest cleanly on ground plane Y = 0
        root.position.x = -center.x;
        root.position.y = -box.min.y;
        root.position.z = -center.z;

        // Scale to fit hero viewport
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = 2.45 / maxDim;
        root.scale.setScalar(targetScale);

        // Lower bike group so grounded bike sits centered vertically in hero viewport
        bikeGroup.position.y = -0.52;
        bikeGroup.add(root);

        setLoading(false);
      },
      undefined,
      (err) => {
        console.error("Failed to load mv_agusta_optimized.glb:", err);
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
      animState.current.startX = e.clientX;
      animState.current.startY = e.clientY;
      animState.current.lastX = e.clientX;
      animState.current.lastY = e.clientY;
      animState.current.velX = 0;
      animState.current.velY = 0;
      domEl.style.cursor = "grabbing";
    };

    const onPointerMove = (e) => {
      if (!animState.current.isDragging) return;
      const dx = e.clientX - animState.current.lastX;
      const dy = e.clientY - animState.current.lastY;

      // On touch devices, if the gesture is predominantly vertical, release dragging to allow native document scroll
      if (e.pointerType === "touch") {
        const totalDx = Math.abs(e.clientX - animState.current.startX);
        const totalDy = Math.abs(e.clientY - animState.current.startY);
        if (totalDy > 10 && totalDy > totalDx * 1.25) {
          animState.current.isDragging = false;
          domEl.style.cursor = "grab";
          return;
        }
      }

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
    // Viewport-Aware Animation Loop (0% GPU Load when scrolled past)
    // ─────────────────────────────────────────────────────────────
    let reqId = null;
    let isVisible = true;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);

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
      const idleFloat = Math.sin(time * 1.6) * 0.015;
      const idlePitch = Math.cos(time * 1.3) * 0.008;

      // 4. Apply 3D transformations
      if (state.pivotGroup) {
        state.pivotGroup.rotation.y = state.dragRotY;
        state.pivotGroup.rotation.x = state.dragRotX;
      }

      if (state.bikeGroup) {
        state.bikeGroup.rotation.z = state.currentLeanZ;
        state.bikeGroup.rotation.x = state.currentPitchX + idlePitch;
        state.bikeGroup.rotation.y = state.currentSteerY;
        state.bikeGroup.position.y = -0.52 + idleFloat;
      }

      renderer.render(scene, camera);
    };

    // IntersectionObserver halts WebGL rendering whenever the hero section is offscreen
    // Guaranteed 0% Three.js GPU consumption when reading lower sections
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          if (!reqId) {
            clock.start();
            reqId = requestAnimationFrame(animate);
          }
        } else {
          if (reqId) {
            cancelAnimationFrame(reqId);
            reqId = null;
          }
        }
      },
      { threshold: 0.02 }
    );
    io.observe(container);

    // Initial render start
    reqId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      io.disconnect();
      if (reqId) cancelAnimationFrame(reqId);
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
