import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Rotate3d, Compass, Cpu, ShieldCheck, Zap, Gauge } from "lucide-react";

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

        // Traverse and customize materials to completely transform the appearance
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

            // 2. Ground shadow plane
            if (name.includes("shadow") || matName.includes("shadow")) {
              node.material = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.45,
              });
              return;
            }

            // 3. Headlights & LED lights
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

            // 4. Brake light
            if (name.includes("brake") || matName.includes("brake")) {
              node.material = brakeLedMaterial;
              return;
            }

            // 5. Tires
            if (name.includes("tyre") || matName.includes("tyre")) {
              node.material = tireRubberMaterial;
              return;
            }

            // 6. Wheels
            if (name.includes("wheel") || matName.includes("wheel")) {
              node.material = forgedWheelMaterial;
              return;
            }

            // 7. Mechanicals / Powertrain / Frame / Drivetrain (Base mesh)
            if (
              name.includes("base mesh") ||
              name.includes("gearbox") ||
              matName.includes("combined") ||
              matName.includes("mataux")
            ) {
              // High-tech gunmetal chrome
              node.material = gunmetalChromeMaterial;
              return;
            }

            // 8. Tank & Flap glossy carbon inserts
            if (name.includes("tank") || name.includes("flap")) {
              node.material = glossObsidianMaterial;
              return;
            }

            // 9. Main Body panels -> Satin Obsidian Black
            if (name.includes("body") || matName.includes("body")) {
              node.material = satinObsidianMaterial;
              return;
            }

            // Default fallback for any remaining meshes: Titanium Gunmetal
            node.material = titaniumMaterial;
          }
        });

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

    domEl.style.cursor = "grab";
    domEl.addEventListener("pointerdown", onPointerDown);
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

      {/* Futuristic Background Atmospheric Glow */}
      <div className="hero-3d-ambient-glow" aria-hidden="true" />

      {/* Loading Skeleton */}
      {loading && (
        <div className="hero-3d-loader">
          <div className="hero-3d-spinner" />
          <span>INITIALIZING 3D CONCEPT PLATFORM...</span>
        </div>
      )}

      {/* Floating Capability Pills (Inspired by the robot reference image) */}
      {!loading && (
        <>
          <div className="hero-3d-badge badge-top-left" title="India's First 4-Speed Geared EV Platform">
            <Zap size={13} className="badge-icon" />
            <span>4-Speed Geared EV</span>
          </div>

          <div className="hero-3d-badge badge-top-right" title="Certified Range Validation">
            <Gauge size={13} className="badge-icon" />
            <span>170+ km Certified Range</span>
          </div>

          <div className="hero-3d-badge badge-mid-left" title="Co-Invented Granted Patent">
            <ShieldCheck size={13} className="badge-icon" />
            <span>Dual Cradle Frame · Patent</span>
          </div>

          <div className="hero-3d-badge badge-mid-right" title="V-Model Architecture & Telematics">
            <Cpu size={13} className="badge-icon" />
            <span>6 Domain ECUs &amp; A-FTA</span>
          </div>

          {/* Interactive User Control Pill Bar */}
          <div className="hero-3d-controls-bar">
            <div className="hero-3d-hint">
              <Rotate3d size={13} className="hint-icon" />
              <span>DRAG TO ROTATE 3D</span>
              <span className="hint-divider">·</span>
              <Compass size={13} className="hint-icon" />
              <span>MOVE CURSOR TO LEAN &amp; PITCH</span>
            </div>
            <button
              type="button"
              className="hero-3d-reset-btn"
              onClick={handleReset}
              title="Reset 3D camera to default beauty angle"
            >
              ↺ RESET
            </button>
          </div>
        </>
      )}
    </div>
  );
}
