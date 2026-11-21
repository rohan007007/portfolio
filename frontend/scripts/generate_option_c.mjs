import * as THREE from 'three';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('Generating Option C: Modern Production Electric Superbike (.obj)...');

const bike = new THREE.Group();
bike.name = 'Option_C_Modern_Electric_Superbike';

// Helper to create and position meshes with name
function addMesh(parent, name, geometry, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.scale.set(...scale);
  parent.add(mesh);
  return mesh;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. FRONT WHEEL ASSEMBLY (Axle at z = 0.72, y = 0.30)
// ─────────────────────────────────────────────────────────────────────────────
const frontWheelGroup = new THREE.Group();
frontWheelGroup.name = 'Front_Wheel_Assembly';
frontWheelGroup.position.set(0, 0.30, 0.72);
bike.add(frontWheelGroup);

// Front Tire (120/70-ZR17 Slick)
const fTireGeom = new THREE.TorusGeometry(0.25, 0.055, 20, 48);
addMesh(frontWheelGroup, 'Front_Tire_Slick', fTireGeom, [0, 0, 0], [0, Math.PI / 2, 0]);

// Front Wheel Rim (17" Forged Light Alloy)
const fRimOuter = new THREE.CylinderGeometry(0.22, 0.22, 0.09, 32, 1, true);
addMesh(frontWheelGroup, 'Front_Rim_Barrel', fRimOuter, [0, 0, 0], [Math.PI / 2, 0, 0]);

// Front Wheel Hub
const fHub = new THREE.CylinderGeometry(0.045, 0.045, 0.11, 24);
addMesh(frontWheelGroup, 'Front_Wheel_Hub', fHub, [0, 0, 0], [Math.PI / 2, 0, 0]);

// 5-Spoke Y-Pattern Spokes
for (let i = 0; i < 5; i++) {
  const angle = (i * 2 * Math.PI) / 5;
  const spokeGeom = new THREE.BoxGeometry(0.02, 0.18, 0.018);
  const spokeY = Math.cos(angle) * 0.11;
  const spokeZ = Math.sin(angle) * 0.11;
  addMesh(frontWheelGroup, `Front_Spoke_${i + 1}`, spokeGeom, [0, spokeY, spokeZ], [angle, 0, 0]);
}

// Front Dual Ventilated Brake Discs (330mm Floating Rotors)
[-0.052, 0.052].forEach((xOffset, idx) => {
  const discGeom = new THREE.CylinderGeometry(0.165, 0.165, 0.006, 32);
  addMesh(frontWheelGroup, `Front_Brake_Disc_${idx === 0 ? 'L' : 'R'}`, discGeom, [xOffset, 0, 0], [Math.PI / 2, 0, 0]);

  // Disc Carrier Ring
  const carrierGeom = new THREE.CylinderGeometry(0.10, 0.10, 0.007, 24);
  addMesh(frontWheelGroup, `Front_Disc_Carrier_${idx === 0 ? 'L' : 'R'}`, carrierGeom, [xOffset, 0, 0], [Math.PI / 2, 0, 0]);
});

// Front Radial-Mount Monobloc Brake Calipers (Dual 4-Piston)
[-0.056, 0.056].forEach((xOffset, idx) => {
  const caliperGeom = new THREE.BoxGeometry(0.04, 0.09, 0.06);
  // Positioned at top rear of disc (~10 o'clock position: y ~ +0.12, z ~ -0.10)
  addMesh(frontWheelGroup, `Front_Brake_Caliper_${idx === 0 ? 'L' : 'R'}`, caliperGeom, [xOffset, 0.12, -0.10], [-0.5, 0, 0]);
});

// Front Axle Spindle
const fAxle = new THREE.CylinderGeometry(0.016, 0.016, 0.16, 16);
addMesh(frontWheelGroup, 'Front_Axle_Spindle', fAxle, [0, 0, 0], [Math.PI / 2, 0, 0]);

// ─────────────────────────────────────────────────────────────────────────────
// 2. FRONT SUSPENSION (Upside-Down / Inverted Telescopic Forks)
// Rake angle ~24 deg: rotated around X by ~-0.42 rad
// ─────────────────────────────────────────────────────────────────────────────
const frontForkGroup = new THREE.Group();
frontForkGroup.name = 'Front_Suspension_Forks';
frontForkGroup.position.set(0, 0.30, 0.72);
frontForkGroup.rotation.x = -0.42; // Rake angle
bike.add(frontForkGroup);

[-0.088, 0.088].forEach((xOffset, idx) => {
  const side = idx === 0 ? 'L' : 'R';

  // Lower Chrome Slider Tube
  const lowerSlider = new THREE.CylinderGeometry(0.021, 0.021, 0.32, 24);
  addMesh(frontForkGroup, `Fork_Slider_${side}`, lowerSlider, [xOffset, 0.16, 0]);

  // Axle Lug / Bottom Radial Caliper Mount Bracket
  const axleLug = new THREE.BoxGeometry(0.045, 0.07, 0.07);
  addMesh(frontForkGroup, `Fork_Axle_Lug_${side}`, axleLug, [xOffset, 0.02, -0.01]);

  // Upper Anodized Stanchion Tube (Ohlins Gold / Satin Black 48mm)
  const upperStanchion = new THREE.CylinderGeometry(0.027, 0.027, 0.42, 24);
  addMesh(frontForkGroup, `Fork_Stanchion_${side}`, upperStanchion, [xOffset, 0.48, 0]);
});

// Lower Triple Tree Clamp (Wide CNC Billet)
const lowerTripleClamp = new THREE.BoxGeometry(0.24, 0.038, 0.075);
addMesh(frontForkGroup, 'Lower_Triple_Clamp', lowerTripleClamp, [0, 0.58, 0]);

// Upper Triple Tree Clamp with Steering Stem Nut
const upperTripleClamp = new THREE.BoxGeometry(0.24, 0.028, 0.065);
addMesh(frontForkGroup, 'Upper_Triple_Clamp', upperTripleClamp, [0, 0.70, 0]);

const stemNut = new THREE.CylinderGeometry(0.022, 0.022, 0.02, 16);
addMesh(frontForkGroup, 'Steering_Stem_Nut', stemNut, [0, 0.718, 0]);

// Clip-On Racing Handlebars (Clamped to fork stanchions below top tree)
[-0.088, 0.088].forEach((xOffset, idx) => {
  const side = idx === 0 ? 'L' : 'R';
  const sign = idx === 0 ? -1 : 1;

  // Handlebar clamp
  const clampGeom = new THREE.CylinderGeometry(0.032, 0.032, 0.03, 16);
  addMesh(frontForkGroup, `ClipOn_Clamp_${side}`, clampGeom, [xOffset, 0.67, 0]);

  // Handlebar tube angling backward and down
  const barGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.22, 16);
  addMesh(frontForkGroup, `ClipOn_Bar_${side}`, barGeom, [xOffset + sign * 0.10, 0.65, -0.05], [0.15, 0, sign * 1.45]);

  // Rubber Grip
  const gripGeom = new THREE.CylinderGeometry(0.016, 0.016, 0.12, 16);
  addMesh(frontForkGroup, `Handlebar_Grip_${side}`, gripGeom, [xOffset + sign * 0.14, 0.645, -0.06], [0.15, 0, sign * 1.45]);

  // Lever (Brake on right, Regen/Clutch on left)
  const leverGeom = new THREE.BoxGeometry(0.008, 0.014, 0.12);
  addMesh(frontForkGroup, `Brake_Lever_${side}`, leverGeom, [xOffset + sign * 0.14, 0.63, 0.04], [0.2, sign * 0.3, 0]);
});

// Full Digital TFT Color Racing Dashboard Display
const tftDisplay = new THREE.BoxGeometry(0.12, 0.065, 0.02);
addMesh(frontForkGroup, 'TFT_Racing_Display', tftDisplay, [0, 0.74, 0.04], [0.4, 0, 0]);

// Front Aerodynamic Carbon Fender (Hugger)
const fFender = new THREE.CylinderGeometry(0.31, 0.31, 0.14, 24, 1, false, -1.2, 2.4);
addMesh(bike, 'Front_Aero_Fender', fFender, [0, 0.32, 0.72], [0, 0, Math.PI / 2]);

// ─────────────────────────────────────────────────────────────────────────────
// 3. FRONT AERODYNAMIC FAIRING & WINDSCREEN
// ─────────────────────────────────────────────────────────────────────────────
const fairingGroup = new THREE.Group();
fairingGroup.name = 'Aerodynamic_Fairing_Assembly';
fairingGroup.position.set(0, 0.68, 0.62);
bike.add(fairingGroup);

// Nose Cowl Central Cone/Wedge
const noseCowlGeom = new THREE.ConeGeometry(0.20, 0.42, 16);
addMesh(fairingGroup, 'Nose_Fairing_Cowl', noseCowlGeom, [0, 0.02, 0.16], [Math.PI / 2 + 0.35, 0, 0], [1.1, 0.7, 0.75]);

// Twin Aerodynamic Air Intake Scoops (Ram-Air / Cooling Ducts)
[-0.10, 0.10].forEach((xOffset, idx) => {
  const side = idx === 0 ? 'L' : 'R';
  const scoopGeom = new THREE.BoxGeometry(0.065, 0.04, 0.18);
  addMesh(fairingGroup, `Aero_Air_Scoop_${side}`, scoopGeom, [xOffset, -0.04, 0.22], [0.2, idx === 0 ? 0.2 : -0.2, 0]);
});

// High-Performance LED Projector Headlight Blade (Twin Razor LEDs)
const ledBlade = new THREE.BoxGeometry(0.18, 0.018, 0.04);
addMesh(fairingGroup, 'LED_Headlight_Blade', ledBlade, [0, -0.05, 0.32], [0.25, 0, 0]);

// Racing Aerodynamic Windscreen (Clear/Tinted Bubble)
const windscreenGeom = new THREE.CylinderGeometry(0.14, 0.20, 0.30, 16, 1, false, -Math.PI / 2, Math.PI);
addMesh(fairingGroup, 'Racing_Windscreen', windscreenGeom, [0, 0.22, 0.02], [-0.55, 0, 0]);

// MotoGP Downforce Aero Winglets (Dual Lateral Strakes)
[-0.20, 0.20].forEach((xOffset, idx) => {
  const side = idx === 0 ? 'L' : 'R';
  const sign = idx === 0 ? -1 : 1;
  const wingletGeom = new THREE.BoxGeometry(0.12, 0.016, 0.18);
  addMesh(fairingGroup, `MotoGP_Aero_Winglet_${side}`, wingletGeom, [xOffset + sign * 0.04, -0.02, 0.12], [0.15, sign * 0.25, -sign * 0.18]);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. CHASSIS (Aluminum Twin-Spar Perimeter Frame & Pivot Plates)
// ─────────────────────────────────────────────────────────────────────────────
const chassisGroup = new THREE.Group();
chassisGroup.name = 'Chassis_Twin_Spar_Frame';
bike.add(chassisGroup);

// Left & Right Aluminum Perimeter Spars (From Steering Head to Swingarm Pivot)
[-0.16, 0.16].forEach((xOffset, idx) => {
  const side = idx === 0 ? 'L' : 'R';
  const sparGeom = new THREE.BoxGeometry(0.045, 0.11, 0.65);
  // Angled from steering head (y=0.72, z=0.45) down to swingarm pivot (y=0.38, z=-0.12)
  addMesh(chassisGroup, `Twin_Spar_Frame_${side}`, sparGeom, [xOffset, 0.55, 0.18], [-0.48, 0, 0]);
});

// Steering Head Tube
const headTube = new THREE.CylinderGeometry(0.042, 0.042, 0.24, 20);
addMesh(chassisGroup, 'Steering_Head_Tube', headTube, [0, 0.72, 0.44], [-0.42, 0, 0]);

// CNC-Machined Swingarm Pivot Plates
[-0.15, 0.15].forEach((xOffset, idx) => {
  const side = idx === 0 ? 'L' : 'R';
  const plateGeom = new THREE.BoxGeometry(0.04, 0.24, 0.18);
  addMesh(chassisGroup, `Pivot_Plate_${side}`, plateGeom, [xOffset, 0.40, -0.14]);
});

// Pivot Shaft Transverse Tube
const pivotTube = new THREE.CylinderGeometry(0.03, 0.03, 0.32, 16);
addMesh(chassisGroup, 'Swingarm_Pivot_Shaft', pivotTube, [0, 0.36, -0.14], [Math.PI / 2, 0, 0]);

// ─────────────────────────────────────────────────────────────────────────────
// 5. CENTRAL STRUCTURAL HIGH-VOLTAGE BATTERY PACK & ELECTRIC DRIVE UNIT
// ─────────────────────────────────────────────────────────────────────────────
const powertrainGroup = new THREE.Group();
powertrainGroup.name = 'Electric_Powertrain_Core';
bike.add(powertrainGroup);

// Structural Battery Pack Monobloc Enclosure (Trapezoidal Stressed Member)
const batteryCasing = new THREE.BoxGeometry(0.26, 0.34, 0.48);
addMesh(powertrainGroup, 'Structural_Battery_Enclosure', batteryCasing, [0, 0.48, 0.14], [-0.25, 0, 0]);

// Lateral Battery Cooling Heat Sink Fins
for (let f = 0; f < 6; f++) {
  const finZ = 0.02 + f * 0.055;
  [-0.14, 0.14].forEach((xOffset, idx) => {
    const finGeom = new THREE.BoxGeometry(0.018, 0.26, 0.008);
    addMesh(powertrainGroup, `Battery_Cooling_Fin_${idx === 0 ? 'L' : 'R'}_${f + 1}`, finGeom, [xOffset, 0.48, finZ]);
  });
}

// High-Voltage Busbar Connector Blocks
[-0.08, 0.08].forEach((xOffset, idx) => {
  const busbarGeom = new THREE.CylinderGeometry(0.016, 0.016, 0.04, 12);
  addMesh(powertrainGroup, `HV_Busbar_Terminal_${idx === 0 ? 'Pos' : 'Neg'}`, busbarGeom, [xOffset, 0.66, 0.28], [0, 0, 0]);
});

// Electric Axial-Flux Traction Motor Unit (Mounted low near swingarm pivot)
const motorGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.22, 24);
addMesh(powertrainGroup, 'Electric_Traction_Motor', motorGeom, [0, 0.32, -0.06], [Math.PI / 2, 0, 0]);

// Silicon-Carbide (SiC) Power Inverter Unit (Mounted above motor with cooling channels)
const inverterGeom = new THREE.BoxGeometry(0.20, 0.12, 0.18);
addMesh(powertrainGroup, 'SiC_Power_Inverter', inverterGeom, [0, 0.48, -0.08]);

// Drive Sprocket & Enclosed Primary Reduction Case
const frontSprocket = new THREE.CylinderGeometry(0.052, 0.052, 0.024, 24);
addMesh(powertrainGroup, 'Front_Drive_Sprocket', frontSprocket, [-0.12, 0.32, -0.06], [Math.PI / 2, 0, 0]);

// ─────────────────────────────────────────────────────────────────────────────
// 6. BODYWORK: ERGONOMIC TOP TANK COWL, BELLY PAN & SINGLE RACING TAIL
// ─────────────────────────────────────────────────────────────────────────────
const bodyworkGroup = new THREE.Group();
bodyworkGroup.name = 'Bodywork_Panels';
bike.add(bodyworkGroup);

// Top Sculpted Faux Tank / Electronics Bay Cover (Deep Knee Indentations)
const tankCowlGeom = new THREE.BoxGeometry(0.28, 0.20, 0.52);
addMesh(bodyworkGroup, 'Top_Tank_Aero_Cowl', tankCowlGeom, [0, 0.72, 0.18], [-0.22, 0, 0]);

// Flush Top Fast-Charging Receptacle Cap (CCS2 / Type 2 Aero Flap)
const chargeCap = new THREE.CylinderGeometry(0.04, 0.04, 0.012, 20);
addMesh(bodyworkGroup, 'Fast_Charge_Port_Flap', chargeCap, [0, 0.81, 0.26], [-0.22, 0, 0]);

// Low Ground-Effect Aerodynamic Belly Pan Fairing
const bellyPanGeom = new THREE.BoxGeometry(0.24, 0.10, 0.62);
addMesh(bodyworkGroup, 'Aero_Belly_Pan', bellyPanGeom, [0, 0.22, 0.10], [0.10, 0, 0]);

// Lower Radiator / Battery Chiller Heat Exchanger
const radiatorGeom = new THREE.BoxGeometry(0.18, 0.14, 0.035);
addMesh(bodyworkGroup, 'Powertrain_Cooling_Radiator', radiatorGeom, [0, 0.38, 0.44], [-0.45, 0, 0]);

// Rider Racing Seat (Ergonomic Track Foam Pad)
const seatGeom = new THREE.BoxGeometry(0.22, 0.05, 0.30);
addMesh(bodyworkGroup, 'Rider_Racing_Seat', seatGeom, [0, 0.76, -0.16], [-0.08, 0, 0]);

// Single-Seater Racing Aero Tail Cowl (Sharp Monocoque Taper)
const tailCowlGeom = new THREE.ConeGeometry(0.16, 0.52, 16);
addMesh(bodyworkGroup, 'Single_Seater_Tail_Cowl', tailCowlGeom, [0, 0.80, -0.42], [-Math.PI / 2 + 0.32, 0, 0], [1.1, 0.65, 0.7]);

// Rear Bump-Stop Race Pad
const bumpStop = new THREE.BoxGeometry(0.16, 0.08, 0.04);
addMesh(bodyworkGroup, 'Rider_Bump_Stop_Pad', bumpStop, [0, 0.82, -0.30], [0.35, 0, 0]);

// Inset Razor-Thin Horizontal Rear LED Brake Light Blade
const tailLight = new THREE.BoxGeometry(0.14, 0.016, 0.024);
addMesh(bodyworkGroup, 'Rear_LED_Brake_Blade', tailLight, [0, 0.85, -0.66]);

// CNC Rearset Brackets & Knurled Racing Footpegs
[-0.18, 0.18].forEach((xOffset, idx) => {
  const side = idx === 0 ? 'L' : 'R';
  const sign = idx === 0 ? -1 : 1;

  // Hanger plate
  const hangerGeom = new THREE.BoxGeometry(0.018, 0.12, 0.08);
  addMesh(bodyworkGroup, `Rearset_Hanger_${side}`, hangerGeom, [xOffset, 0.42, -0.20]);

  // Knurled Footpeg
  const footpegGeom = new THREE.CylinderGeometry(0.014, 0.014, 0.11, 16);
  addMesh(bodyworkGroup, `Racing_Footpeg_${side}`, footpegGeom, [xOffset + sign * 0.055, 0.38, -0.22], [0, 0, Math.PI / 2]);
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. REAR SUSPENSION & SWINGARM ASSEMBLY
// ─────────────────────────────────────────────────────────────────────────────
const rearSuspensionGroup = new THREE.Group();
rearSuspensionGroup.name = 'Rear_Suspension_Swingarm';
bike.add(rearSuspensionGroup);

// Heavy-Duty Aluminum Double-Sided Racing Swingarm
[-0.13, 0.13].forEach((xOffset, idx) => {
  const side = idx === 0 ? 'L' : 'R';
  // Swingarm arm extending from pivot (y=0.36, z=-0.14) to rear axle (y=0.32, z=-0.72)
  const armGeom = new THREE.BoxGeometry(0.038, 0.075, 0.62);
  addMesh(rearSuspensionGroup, `Swingarm_Arm_${side}`, armGeom, [xOffset, 0.34, -0.42], [0.065, 0, 0]);
});

// Swingarm Cross Brace
const swingarmBrace = new THREE.BoxGeometry(0.24, 0.06, 0.08);
addMesh(rearSuspensionGroup, 'Swingarm_Cross_Brace', swingarmBrace, [0, 0.36, -0.28]);

// Pro-Link Progressive Rear Monoshock Suspension
const shockBody = new THREE.CylinderGeometry(0.024, 0.024, 0.24, 16);
addMesh(rearSuspensionGroup, 'Rear_Monoshock_Body', shockBody, [0, 0.50, -0.24], [-0.55, 0, 0]);

const shockSpring = new THREE.CylinderGeometry(0.036, 0.036, 0.16, 16);
addMesh(rearSuspensionGroup, 'Rear_Monoshock_Spring', shockSpring, [0, 0.49, -0.24], [-0.55, 0, 0]);

const shockReservoir = new THREE.CylinderGeometry(0.018, 0.018, 0.10, 16);
addMesh(rearSuspensionGroup, 'Piggyback_Gas_Reservoir', shockReservoir, [0.05, 0.56, -0.22], [-0.55, 0, 0]);

// Rear Hugger Aerodynamic Mudguard
const rHugger = new THREE.CylinderGeometry(0.33, 0.33, 0.19, 24, 1, false, Math.PI * 0.7, 1.8);
addMesh(rearSuspensionGroup, 'Rear_Aero_Hugger', rHugger, [0, 0.32, -0.72], [0, 0, Math.PI / 2]);

// ─────────────────────────────────────────────────────────────────────────────
// 8. REAR WHEEL ASSEMBLY (Axle at z = -0.72, y = 0.32)
// ─────────────────────────────────────────────────────────────────────────────
const rearWheelGroup = new THREE.Group();
rearWheelGroup.name = 'Rear_Wheel_Assembly';
rearWheelGroup.position.set(0, 0.32, -0.72);
bike.add(rearWheelGroup);

// Wide Rear Tire (200/55-ZR17 Racing Slick)
const rTireGeom = new THREE.TorusGeometry(0.26, 0.075, 20, 48);
addMesh(rearWheelGroup, 'Rear_Tire_Slick', rTireGeom, [0, 0, 0], [0, Math.PI / 2, 0]);

// Rear Wheel Rim (17" Forged Alloy, 6.0" width)
const rRimOuter = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 32, 1, true);
addMesh(rearWheelGroup, 'Rear_Rim_Barrel', rRimOuter, [0, 0, 0], [Math.PI / 2, 0, 0]);

// Rear Wheel Hub
const rHub = new THREE.CylinderGeometry(0.052, 0.052, 0.17, 24);
addMesh(rearWheelGroup, 'Rear_Wheel_Hub', rHub, [0, 0, 0], [Math.PI / 2, 0, 0]);

// Rear 5-Spoke Pattern
for (let i = 0; i < 5; i++) {
  const angle = (i * 2 * Math.PI) / 5;
  const spokeGeom = new THREE.BoxGeometry(0.024, 0.18, 0.022);
  const spokeY = Math.cos(angle) * 0.11;
  const spokeZ = Math.sin(angle) * 0.11;
  addMesh(rearWheelGroup, `Rear_Spoke_${i + 1}`, spokeGeom, [0, spokeY, spokeZ], [angle, 0, 0]);
}

// Large Lightweight Rear Drive Sprocket (Chain/Belt Drive)
const rSprocket = new THREE.CylinderGeometry(0.13, 0.13, 0.012, 32);
addMesh(rearWheelGroup, 'Rear_Drive_Sprocket', rSprocket, [-0.10, 0, 0], [Math.PI / 2, 0, 0]);

// Drive Chain / High-Torque Carbon Belt Loop
const driveChain = new THREE.BoxGeometry(0.016, 0.022, 0.68);
addMesh(bike, 'Carbon_Belt_Drive_Upper', driveChain, [-0.108, 0.36, -0.38], [0.03, 0, 0]);
const driveChainLower = new THREE.BoxGeometry(0.016, 0.022, 0.68);
addMesh(bike, 'Carbon_Belt_Drive_Lower', driveChainLower, [-0.108, 0.28, -0.38], [-0.03, 0, 0]);

// Rear Ventilated Brake Rotor & Caliper
const rDisc = new THREE.CylinderGeometry(0.11, 0.11, 0.006, 28);
addMesh(rearWheelGroup, 'Rear_Brake_Disc', rDisc, [0.088, 0, 0], [Math.PI / 2, 0, 0]);

const rCaliper = new THREE.BoxGeometry(0.035, 0.065, 0.05);
addMesh(rearWheelGroup, 'Rear_Brake_Caliper', rCaliper, [0.092, 0.10, -0.05], [-0.4, 0, 0]);

// Rear Axle Spindle
const rAxle = new THREE.CylinderGeometry(0.018, 0.018, 0.22, 16);
addMesh(rearWheelGroup, 'Rear_Axle_Spindle', rAxle, [0, 0, 0], [Math.PI / 2, 0, 0]);

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT TO .OBJ FORMAT
// ─────────────────────────────────────────────────────────────────────────────
bike.updateMatrixWorld(true, true);

const exporter = new OBJExporter();
const objResult = exporter.parse(bike);

console.log(`Generated .obj file with length: ${objResult.length} bytes.`);

// Save paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.resolve(projectRoot, 'public');

const targetPaths = [
  path.resolve(publicDir, 'models/option_c_superbike.obj')
];

targetPaths.forEach(p => {
  try {
    fs.writeFileSync(p, objResult, 'utf8');
    console.log(`Successfully saved OBJ to: ${p}`);
  } catch (err) {
    console.error(`Failed to save to ${p}:`, err.message);
  }
});
