export const GOOGLE_DRIVE_PATENTS_LINK = "https://drive.google.com/drive/folders/1Mt3-kgL56WaZsB3JA_qXO4s9jQzX5CFN?usp=drive_link";

const getResumePdfPath = () => {
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/portfolio")) {
    return "/portfolio/Rohan_Lodaya_ATS_Resume.pdf";
  }
  if (process.env.PUBLIC_URL && process.env.PUBLIC_URL !== ".") {
    return `${process.env.PUBLIC_URL}/Rohan_Lodaya_ATS_Resume.pdf`;
  }
  return "./Rohan_Lodaya_ATS_Resume.pdf";
};

export const RESUME_PDF_PATH = getResumePdfPath();

// 1. Core Competencies & Technical Skills (Replacing the experience cards in section 01)
export const coreCompetencies = [
  {
    id: "comp-systems",
    index: "01",
    code: "VISA / ARCH",
    title: "Systems Engineering & VISA Architecture",
    tagline: "V-Model Lifecycle & 6-ECU Multi-Domain Integration",
    highlight: "6 Domain ECUs",
    stat: "6 ECUs",
    statLabel: "Cross-Functional Integration",
    skills: [
      "V-Model Requirements Cascading (Vehicle Intent → Functional → System → Software)",
      "Vehicle Integration & System Architecture (VISA) across 6 ECUs (BMS, DTU, BCU, VIC, OBC, ABS)",
      "Interface Control Documents (ICD) & Master CAN Matrix Architecture",
      "Failsafe System Design (HARA, ASIL Principles & Limp-Home Modes)",
      "12-Mode Vehicle Operational State Machine & Supervisory Torque Arbitration",
      "Unified CAN Network Management (NM), Heartbeats & Auto-Recovery"
    ]
  },
  {
    id: "comp-mbse",
    index: "02",
    code: "MBSE / CALIB",
    title: "Powertrain Sizing, MBSE & Model-Based Calibration",
    tagline: "1D Digital Twins & Multi-Speed Geared EV Drivetrain Optimization",
    highlight: "+65% Efficiency",
    stat: "65%",
    statLabel: "Energy Efficiency Gain",
    skills: [
      "1D Vehicle Plant Digital Twins in MATLAB/Simulink (0.01s fixed-step, 1RC/2RC ECM)",
      "Multi-Speed Geared EV Drivetrain Sizing (>520 Nm rear wheel torque, ≥22° gradability)",
      "Urban Drive Cycle Synthesis from 1,070+ km road telemetry (Micro-trips, Speed Index, SAFD)",
      "Empirical C-Rate Histograms proving 95.5% of urban riding operates below 1C discharge",
      "Motor FOC Torque Maps, Flux Weakening & Multi-Gear Regenerative Braking Calibration",
      "Active speed-rate-of-change damper (<40 ms) via OTA eliminating clutch disengagement rev-flare"
    ]
  },
  {
    id: "comp-bms",
    index: "03",
    code: "BMS / CONTROLS",
    title: "Battery Algorithms, Controls & Diagnostics",
    tagline: "State Estimation, Dynamic Derating & Redundant Plausibility",
    highlight: "±2.0% SoC",
    stat: "±2.0%",
    statLabel: "SoC Lifetime Accuracy",
    skills: [
      "Authored MMW-SE-REQ-1002-V1.0 for SoC (±2.0% accuracy, IR/temperature compensation, rest OCV)",
      "SoH Tracking & Dynamic SoP Current Derating Maps across -20°C to +59°C envelope",
      "Dual-Redundant Speed Plausibility Logic (Motor Resolver vs. Bosch ABS wheel speeds)",
      "Remaining Drivable Range (RDR) & Time-to-Charge (TTC) predictive algorithms",
      "UDS on CAN Diagnostics, Master DTC/DID Dictionary & Factory EOL Commissioning",
      "Over-The-Air (OTA) firmware deployment and flashing suppression protocols"
    ]
  },
  {
    id: "comp-edge",
    index: "04",
    code: "EDGE / A-FTA",
    title: "Connected Vehicle, Edge Compute & Cloud Diagnostics",
    tagline: "Automated Fault Tree Analysis & Big Data Telematics",
    highlight: "<3 min MTTD",
    stat: "<3 min",
    statLabel: "Automated Root-Cause Isolation",
    skills: [
      "In-Vehicle Edge Compute Architecture (STK-EDGE-STRSUP) with intelligent stream suppression",
      "Slashing cellular SIM bandwidth and cloud data ingestion costs by 75%",
      "Circular RAM buffer capturing [-60s pre-fault, +10s post-fault] DTC evidence packages",
      "On-Edge 6-Axis IMU Semantic Classification (Parked, Riding, Leaning, Falling, Tow/Theft)",
      "Authored A-FTA Specification (MMW-TF-SOR-0001-V1.0) & built Databricks Delta Lake engine",
      "Analyzed 2M+ fleet km, 180,000+ customer rides, and 560,000+ gear shifts across India"
    ]
  },
  {
    id: "comp-testing",
    index: "05",
    code: "TEST / HOMOLOG",
    title: "Testing, Proving Grounds & AIS Homologation",
    tagline: "Dyno Loss Walks, Runway Coastdown & Proving Ground Trials",
    highlight: "170+ km Range",
    stat: "170+ km",
    statLabel: "AIS-040 Certified Range",
    skills: [
      "Chassis Dyno driveline loss walks achieving <3% simulation correlation",
      "12 bidirectional runway coastdown runs at Dhana Airstrip to derive road load coefficients (A, B, C)",
      "60-min continuous WOT endurance trials at NATRAX HST (105-112 km/h) validating thermal equilibrium",
      "Secured AIS-040 Range Certification (170 km+) and AIS-039 Energy Consumption Homologation",
      "Authored 14-SOP Field Engineering Manual for nationwide HV safety and field triage"
    ]
  },
  {
    id: "comp-mech",
    index: "06",
    code: "CAD / FEA",
    title: "Chassis Engineering & Mechanical Architecture",
    tagline: "Structural Dual Cradle Frame, Powertrain Packaging & Durability",
    highlight: "Granted Patent",
    stat: "14",
    statLabel: "Patents (2 Granted)",
    skills: [
      "Co-inventor of Granted Patent: 'A Dual Cradle Frame for an Electric Vehicle'",
      "3D CAD design, static, modal, and fatigue FEA for chassis, swingarm, and cast wheels",
      "Packaging mid-drive geared powertrain and liquid-cooled battery enclosure for torsional rigidity",
      "Vehicle target matrices, physical teardown, and chassis dyno benchmarking at ARAI Pune",
      "Pre-PLM Engineering Bill of Materials (EBOM), 2D GD&T drawings, and tooling sign-offs"
    ]
  }
];

// 2. Compact Professional Experience (For the dedicated section after Projects)
export const professionalExperience = [
  {
    period: "AUG 2022 — PRESENT",
    role: "Lead Engineer — System Engineering, Vehicle Calibration & Fleet Reliability",
    company: "Matter Motor Works",
    location: "Ahmedabad, India",
    type: "Full-Time · Production & Next-Gen EV Platforms",
    description:
      "Core technical architect for India’s first 4-speed geared electric motorcycle platform. Directed end-to-end V-model systems requirements across 6 domain ECUs, master CAN/UDS communications, 1D MATLAB/Simulink plant digital twins, motor FOC calibration (+65% efficiency), Databricks Delta Lake cloud diagnostics (A-FTA <3 min MTTD), and 2M+ km fleet analytics pipelines.",
    tags: ["V-Model", "6-ECU Architecture", "CAN / UDS", "MATLAB / Simulink", "FOC Calibration", "A-FTA", "Databricks Delta Lake"]
  },
  {
    period: "JUN 2019 — JUL 2022",
    role: "Senior Engineer — Vehicle Engineering & Mechanical Architecture",
    company: "Matter Motor Works",
    location: "Ahmedabad, India",
    type: "Full-Time · Ground-Up EV Architecture",
    description:
      "Spearheaded clean-sheet mechanical and structural development for Matter's flagship electric vehicle platform. Led 3D CAD and ANSYS FEA optimization of the patented dual cradle tubular motorcycle frame, swingarm, and wheel assemblies. Directed ARAI benchmarking, vehicle target matrices, pre-PLM EBOM releases, and tier-1 supplier tooling sign-offs.",
    tags: ["Chassis FEA", "Dual Cradle Frame (Patent)", "ARAI Benchmarking", "SolidWorks", "ANSYS", "GD&T", "EBOM"]
  }
];

// 3. Projects Details
export const projectDetails = [
  {
    id: "proj-01",
    number: "01",
    tag: "02 — SELECTED WORK · POWERTRAIN & SYSTEMS",
    title: "4-Speed Electric Motorcycle",
    subtitle: "Core Technical Architecture · Production Platform",
    stat: "65%",
    statLabel: "energy efficiency gain",
    scope: "India's First 4-Speed Geared Electric Motorcycle Platform",
    overview:
      "Engineered the core technical architecture for India's first multi-speed geared production electric motorcycle, integrating a mid-drive motor, 4-speed sequential gearbox, and liquid-cooled battery pack to achieve sports-grade dynamic performance with mass-market efficiency.",
    metrics: [
      { value: "65%", label: "Efficiency Improvement" },
      { value: "170+ km", label: "Certified AIS-040 Range" },
      { value: ">520 Nm", label: "Rear-Wheel Torque" },
      { value: "≥22°", label: "Starting Gradability" }
    ],
    highlights: [
      "V-Model Systems Architecture connecting 6 domain ECUs (BMS, DTU, BCU, VIC, OBC, ABS) with unified CAN Matrix.",
      "Master Torque Arbitration & 12-mode operational state machine with active clutch-slip protection.",
      "1D MATLAB/Simulink plant digital twin (0.01s fixed-step) with <3% chassis dynamometer driveline loss correlation.",
      "Active speed-rate-of-change damper (<40 ms) deployed over-the-air (OTA) to eliminate high-speed clutch disengagement rev-flare.",
      "Endurance validated at NATRAX HST (60-minute continuous full-throttle testing at 105–112 km/h) confirming liquid-cooling thermal equilibrium."
    ],
    techStack: ["V-Model", "MATLAB/Simulink", "Stateflow", "CANoe", "UDS Diagnostics", "FOC Calibration", "AIS-040 / AIS-039"]
  },
  {
    id: "proj-02",
    number: "02",
    tag: "02 — SELECTED WORK · CLOUD DIAGNOSTICS",
    title: "A-FTA Cloud Diagnostics",
    subtitle: "Databricks Delta Lake · 60+ CAN Signals",
    stat: "<3 min",
    statLabel: "automated fault isolation",
    scope: "Edge-to-Cloud Automated Fault Tree Analysis Inference Engine",
    overview:
      "Architected and deployed an automated, real-time diagnostic engine on Databricks Delta Lake that continuously ingests 60+ CAN signals from 5 ECUs to isolate root causes in under 3 minutes with >96% accuracy.",
    metrics: [
      { value: "<3 min", label: "Root-Cause Isolation" },
      { value: "48h → 3m", label: "MTTD Reduction" },
      { value: ">96%", label: "Diagnostic Accuracy" },
      { value: "60+", label: "CAN Signals Processed" }
    ],
    highlights: [
      "Authored Statement of Requirements (MMW-TF-SOR-0001-V1.0) establishing causality graphs and multi-ECU symptom trees.",
      "Engineered automated edge circular RAM buffer capturing [-60s pre-fault, +10s post-fault] high-resolution telemetry upon DTC triggers.",
      "Built distributed Databricks Delta Lake ingestion pipelines processing multi-frequency telemetry over MQTT / TLS 1.3.",
      "Eliminated dependency on physical technician triage for electrical, communication, and thermal subsystem failures.",
      "Integrated automated incident dispatch directly into service engineering fleet operations."
    ],
    techStack: ["Databricks Delta Lake", "PySpark", "Python", "MQTT / TLS 1.3", "CAN Telemetry", "ClickHouse", "Automated FTA"]
  },
  {
    id: "proj-03",
    number: "03",
    tag: "02 — SELECTED WORK · BIG DATA & TELEMATICS",
    title: "Fleet Intelligence Layer",
    subtitle: "Python / PySpark / MATLAB · 2M+ Fleet KM",
    stat: "75%",
    statLabel: "telematics cost reduction",
    scope: "Big Data Telematics Pipeline & Edge Stream Suppression",
    overview:
      "Designed an intelligent in-vehicle edge computing framework and cloud big data pipeline analyzing 2M+ real-world kilometers, 180,000+ customer rides, and 560,000+ gear shifts to validate supervisory vehicle calibrations.",
    metrics: [
      { value: "75%", label: "Bandwidth & Cloud Cost Cut" },
      { value: "2M+", label: "Fleet KM Analyzed" },
      { value: "180k+", label: "Customer Rides Processed" },
      { value: "560k+", label: "Gear Shifts Evaluated" }
    ],
    highlights: [
      "Architected edge specification (STK-EDGE-STRSUP) with event-driven stream suppression and dynamic sampling.",
      "On-edge 6-axis IMU semantic state classification identifying Parked, Riding, Leaning, Falling, and Tow/Theft states.",
      "Extracted 21.4% seasonal energy sensitivity (summer vs. winter) to fine-tune supervisory battery derating maps.",
      "Synthesized empirical C-rate histograms proving 95.5% of urban riding operates below 1C discharge rate.",
      "Built production dashboards for fleet battery degradation, rider shift habits, and energy consumption indices."
    ],
    techStack: ["Python", "PySpark", "MATLAB", "Delta Lake", "Edge Computing", "IMU Classification", "Bytebeam IoT"]
  },
  {
    id: "proj-04",
    number: "04",
    tag: "02 — SELECTED WORK · CHASSIS & FEA",
    title: "Vehicle Architecture & Dual Cradle Frame",
    subtitle: "Dual Cradle Frame · Chassis FEA · Granted Patent",
    stat: "14",
    statLabel: "automotive patents (2 granted)",
    scope: "Structural EV Chassis Engineering & High-Speed Dynamic Validation",
    overview:
      "Engineered the ground-up mechanical architecture and dual cradle tubular chassis (Granted Patent) specifically designed for EV structural loads, powertrain packaging, and certified road safety.",
    metrics: [
      { value: "2 Granted", label: "Patents Co-Invented" },
      { value: "12 Published", label: "Patents Co-Invented" },
      { value: "<3%", label: "CAE to Dyno Correlation" },
      { value: "112 km/h", label: "NATRAX HST High Speed" }
    ],
    highlights: [
      "Co-invented Granted Patent: 'A Dual Cradle Frame for an Electric Vehicle' optimized for torsional rigidity.",
      "Integrated mid-drive geared powertrain, liquid-cooled battery enclosure, and custom cast aluminum components.",
      "Conducted 12 bidirectional runway coastdown runs at Dhana Airstrip to calibrate precise road load coefficients (A, B, C).",
      "Directed full vehicle benchmarking and physical teardown at ARAI Pune to establish industry-leading targets.",
      "Executed 60-minute wide-open throttle (WOT) continuous endurance trials at NATRAX HST at 105–112 km/h."
    ],
    techStack: ["ANSYS FEA", "SolidWorks", "Autodesk Inventor", "ARAI Benchmarking", "NATRAX Proving Ground", "GD&T", "Dyno Loss Walk"]
  }
];

// 4. 14 Patents Details
export const patentDetails = {
  title: "14 Automotive Patents",
  tag: "INNOVATION ARCHIVE · INTELLECTUAL PROPERTY",
  subtitle: "Co-Inventor · 2 Granted Patents, 12 Published Patents",
  driveLink: GOOGLE_DRIVE_PATENTS_LINK,
  summary:
    "Co-inventor of 14 proprietary automotive patents spanning mechanical chassis architecture, connected geofencing, advanced battery power flow, predictive range algorithms, and cloud-based automated fault diagnostics.",
  stats: [
    { stat: "2", label: "Granted Patents" },
    { stat: "12", label: "Published Patents" },
    { stat: "100%", label: "Production & Platform Impact" }
  ],
  granted: [
    {
      number: "01",
      title: "A Dual Cradle Frame for an Electric Vehicle",
      status: "GRANTED",
      category: "Mechanical Architecture & Packaging",
      description:
        "High-rigidity dual cradle tubular motorcycle frame housing a mid-drive multi-speed powertrain and liquid-cooled battery pack, engineered for superior torsional stiffness, road durability, and crash load distribution.",
      driveLink: GOOGLE_DRIVE_PATENTS_LINK
    },
    {
      number: "02",
      title: "Method and System for Geofencing of Electric Vehicle Technical Field",
      status: "GRANTED",
      category: "Connected Telematics & Security",
      description:
        "Connected telematics edge-to-cloud system enabling dynamic boundary tracking, automated speed governing, geofence intrusion alerts, and remote anti-theft immobilization.",
      driveLink: GOOGLE_DRIVE_PATENTS_LINK
    }
  ],
  published: [
    {
      number: "03",
      title: "System and Method to Control Power Flow of Batterypack(s)",
      status: "PUBLISHED",
      category: "Powertrain, Range & Controls",
      description: "Dynamic multi-pack current distribution, active cell balancing, and safe discharge arbitration across operating thermal envelopes."
    },
    {
      number: "04",
      title: "Method for Recommending Gear Shift",
      status: "PUBLISHED",
      category: "Powertrain, Range & Controls",
      description: "Real-time gear shift advisory algorithm optimizing electric motor efficiency contours against rider torque demand."
    },
    {
      number: "05",
      title: "Method for Computing Remaining Drivable Range (RDR / DTE)",
      status: "PUBLISHED",
      category: "Powertrain, Range & Controls",
      description: "Dynamic distance-to-empty algorithm compensating for battery polarization, internal resistance, and ambient temperature."
    },
    {
      number: "06",
      title: "Automated Deactivation of Turn Indicators of Vehicle",
      status: "PUBLISHED",
      category: "Controls & Algorithms",
      description: "Intelligent turn indicator cancellation based on IMU roll angle recovery, steering trajectory, and speed."
    },
    {
      number: "07",
      title: "Method and System for Charging an Electric Vehicle",
      status: "PUBLISHED",
      category: "Powertrain, Range & Controls",
      description: "IS17017-1 standard charging protocol implementation with CP/PP handshakes and thermal derating protection."
    },
    {
      number: "08",
      title: "Crash and Fall Detection System",
      status: "PUBLISHED",
      category: "Safety, Diagnostics & Telematics",
      description: "Multi-axis IMU acceleration and tilt algorithms triggering rapid high-voltage contactor cutoff."
    },
    {
      number: "09",
      title: "Method and System for Crash Detection of Electric Vehicle(s)",
      status: "PUBLISHED",
      category: "Safety, Diagnostics & Telematics",
      description: "Sensor fusion uniting edge CAN telemetry, accelerometer thresholds, and HVIL circuit integrity."
    },
    {
      number: "10",
      title: "Fault Diagnostics System for Drive-train Unit",
      status: "PUBLISHED",
      category: "Safety, Diagnostics & Telematics",
      description: "In-vehicle and cloud fault isolation for electric motor FOC controls, inverter power stages, and transmission sensors."
    },
    {
      number: "11",
      title: "Fault Diagnostics System for On-Board Charger (OBC)",
      status: "PUBLISHED",
      category: "Safety, Diagnostics & Telematics",
      description: "Detection and isolation of AC mains supply irregularities, DC conversion faults, and thermal drift."
    },
    {
      number: "12",
      title: "Method and System for Fault Diagnosis of Components of Electric Vehicle",
      status: "PUBLISHED",
      category: "Safety, Diagnostics & Telematics",
      description: "Cloud-based Automated Fault Tree Analysis (A-FTA) causality engine for multi-ECU root-cause isolation."
    },
    {
      number: "13",
      title: "Method and System for Fault Diagnostics of Vehicle Instrument Cluster",
      status: "PUBLISHED",
      category: "Safety, Diagnostics & Telematics",
      description: "Display, tell-tale, and UI fault verification with CAN fallback messaging and watchdog supervisor."
    },
    {
      number: "14",
      title: "Method and System for Fault Diagnostics of Passive Keyless Entry (PKE) System",
      status: "PUBLISHED",
      category: "Safety, Diagnostics & Telematics",
      description: "Low-frequency antenna triangulation and cryptographic authentication fault isolation."
    }
  ]
};

// 5. Regulatory Standards (Interactive, non-boring badge wall)
export const regulatoryCategories = [
  {
    category: "Range, Efficiency & Powertrain",
    standards: [
      { code: "AIS-040", name: "Range Measurement", detail: "170+ km certified range validation under standard urban & highway cycles" },
      { code: "AIS-039", name: "Energy Consumption", detail: "Certified electrical energy consumption per kilometer" },
      { code: "AIS-041", name: "Net & 30-Min Continuous Power", detail: "Motor peak and sustained thermal continuous power ratings" },
      { code: "AIS-003", name: "Starting Gradeability", detail: "≥22° starting gradeability on certified test inclines" },
      { code: "AIS-049", name: "EV Type Approval", detail: "Comprehensive motor vehicle type approval requirements" }
    ]
  },
  {
    category: "Battery & High-Voltage Safety",
    standards: [
      { code: "AIS-156", name: "REESS Safety Requirements", detail: "Thermal propagation, water immersion, overcharge & vibration safety" },
      { code: "AIS-123", name: "Electric Propulsion Systems", detail: "Safety requirements for high-voltage drive systems" },
      { code: "IS 17017-1", name: "EV Conductive Charging", detail: "CP/PP communication handshake and safe disconnection sequencing" }
    ]
  },
  {
    category: "Cybersecurity, Software & Telematics",
    standards: [
      { code: "AIS-189", name: "Cybersecurity & CSMS", detail: "Vehicle cyber security management systems & encrypted communications" },
      { code: "AIS-190", name: "Software Updates & SUMS", detail: "Secure over-the-air (OTA) updates and execution verification" }
    ]
  },
  {
    category: "Vehicle Controls, Ergonomics & Dynamics",
    standards: [
      { code: "AIS-071", name: "Control Location & Operation", detail: "Ergonomic placement and tactile operation of rider controls" },
      { code: "AIS-126", name: "Tell-Tales & Indicators", detail: "Instrument cluster warning symbology & tell-tale status indicators" },
      { code: "AIS-146", name: "Stands & Interlocks", detail: "Side stand deployment motor-cutoff and anti-rideaway interlocks" },
      { code: "AIS-148", name: "Footrest Requirements", detail: "Rider & pillion ergonomic strength standards" },
      { code: "AIS-173", name: "AVAS Acoustic Alerting", detail: "Acoustic vehicle alerting systems for pedestrian safety at low speeds" },
      { code: "IS 10278", name: "Maximum Speed Verification", detail: "Certified top speed measurement protocol" },
      { code: "IS 10407", name: "Acceleration Performance", detail: "Standing start sprint and rolling acceleration benchmarks" },
      { code: "IS 3028", name: "Pass-By Noise Measurement", detail: "Acoustic emission levels during maximum acceleration" }
    ]
  }
];

// 6. Education & Collegiate Honors
export const educationData = [
  {
    degree: "Bachelor of Technology (B.Tech) in Mechanical Engineering",
    institution: "Pandit Deendayal Petroleum University (PDPU)",
    location: "Gandhinagar, Gujarat",
    year: "2019",
    score: "CGPA: 8.8 / 10.0",
    honors: "Team Lead, Simulation & Virtual Validation — BAJA SAEINDIA 2018 (Team CAZR). Led FEA topology optimization reducing unsprung wheel hub mass while increasing factor of safety by 25%."
  },
  {
    degree: "Diploma in Mechanical Engineering",
    institution: "Gujarat Technological University (GTU)",
    location: "Ahmedabad, Gujarat",
    year: "2016",
    score: "CGPA: 9.4 / 10.0",
    honors: "Ranked among top graduates with specialized focus on mechanical design, thermodynamics, and manufacturing automation."
  }
];

export const academicPublications = [
  {
    title: "Bearing Fault Diagnosis using EEMD, CMSE, J48 Decision Trees & ANN",
    domain: "Signal Processing & Machine Learning",
    summary: "Ensemble empirical mode decomposition (EEMD) and composite multiscale sample entropy (CMSE) for automated rotational bearing fault isolation."
  },
  {
    title: "Residential Building Heating & Cooling Load Prediction using SVM & Isotonic Regression",
    domain: "Predictive Analytics & Energy Modeling",
    summary: "Support Vector Machines combined with non-parametric isotonic regression to model dynamic thermal transfer loads."
  }
];
