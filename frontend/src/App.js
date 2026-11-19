import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  ArrowUpRight,
  Download,
  Linkedin,
  Mail,
  Menu,
  X,
  ChevronLeft
} from "lucide-react";
import "@/App.css";
import { DetailModal } from "@/components/DetailModal";
import {
  coreCompetencies,
  professionalExperience,
  projectDetails,
  patentDetails,
  RESUME_PDF_PATH
} from "@/data/portfolioData";

gsap.registerPlugin(ScrollTrigger);

const bikeImage = "https://images.unsplash.com/photo-1709913472012-a0c243ca6cc9?crop=entropy&cs=srgb&fm=jpg&q=85";
const resumeUrl = RESUME_PDF_PATH;

const navItems = [
  ["01", "Home", "home"],
  ["02", "Competencies", "competencies"],
  ["03", "Projects", "projects"],
  ["04", "Experience", "experience"],
  ["05", "Standards", "standards"],
  ["06", "Contact", "contact"]
];

const skills = [
  "SYSTEMS ENGINEERING",
  "EV POWERTRAIN",
  "MODEL-BASED CALIBRATION",
  "CONNECTED VEHICLES",
  "FLEET ANALYTICS",
  "MBSE",
  "CAN / UDS",
  "MATLAB / SIMULINK",
  "A-FTA DIAGNOSTICS",
  "DATABRICKS DELTA LAKE"
];

const projects = [
  { number: "01", title: "4-speed electric motorcycle", detail: "Core technical architecture · Production platform", stat: "65%", label: "energy efficiency gain" },
  { number: "02", title: "A-FTA cloud diagnostics", detail: "Databricks Delta Lake · 60+ CAN signals", stat: "<3 min", label: "fault isolation" },
  { number: "03", title: "Fleet intelligence layer", detail: "Python / PySpark / MATLAB · 2M+ fleet km", stat: "75%", label: "telematics cost reduction" },
  { number: "04", title: "Vehicle architecture", detail: "Dual cradle frame · Chassis FEA · Granted patent", stat: "14", label: "automotive patents" },
];

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/* ───────────────────────────────────────────────────
   Section Heading with Signature Acid-Yellow Wipe Reveal
   Triggers when scrolling into view (play reverse play reverse)
   ─────────────────────────────────────────────────── */
function SectionHeadingWiped({ index, line1, line2, description, indexColor }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const wipes = el.querySelectorAll(".h-wipe-bar");
    const texts = el.querySelectorAll(".h-wipe-text");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play reverse play reverse"
      }
    });

    wipes.forEach((wipe, i) => {
      const text = texts[i];
      tl.fromTo(
        wipe,
        { scaleX: 0, transformOrigin: "left" },
        { scaleX: 1, duration: 0.38, ease: "power2.inOut" },
        i * 0.12
      )
      .set(text, { opacity: 1 }, "-=0.04")
      .to(
        wipe,
        { scaleX: 0, transformOrigin: "right", duration: 0.38, ease: "power2.inOut" }
      );
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="section-heading">
      <span className="section-index" style={indexColor ? { color: indexColor } : {}}>{index}</span>
      <h2 className="wiped-h2">
        <span className="h-wipe-slot">
          <span className="h-wipe-text" style={{ opacity: 0 }}>{line1}</span>
          <span className="h-wipe-bar" />
        </span>
        <br />
        <span className="h-wipe-slot">
          <span className="h-wipe-text" style={{ opacity: 0 }}><i>{line2}</i></span>
          <span className="h-wipe-bar" />
        </span>
      </h2>
      <p>{description}</p>
    </div>
  );
}

/* ───────────────────────────────────────────────────
   Competency Card (Matches Selected Work Card Design)
   Full vertical room so "expand" is NEVER cropped out.
   Lateral slide on scroll + in-place scroll-up on click.
   ─────────────────────────────────────────────────── */
function CompetencyCard({ comp }) {
  const [expanded, setExpanded] = useState(false);
  const backScrollRef = useRef(null);

  const toggle = useCallback((e) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  }, []);

  return (
    <div
      className={`comp-card-wrapper ${expanded ? "is-expanded" : ""}`}
      data-testid={`competency-card-${comp.id}`}
      onClick={toggle}
      title={expanded ? "Click to collapse" : "Click to expand specification"}
    >
      <div className="comp-card-inner">
        {/* Front Face — 100% matched to Selected Work project cards */}
        <div className="comp-face front">
          <div className="comp-card-top">
            <span>{comp.index}</span>
            <div className={`comp-arrow-icon ${expanded ? "is-open" : ""}`}>
              <ArrowUpRight size={20} />
            </div>
          </div>
          <h3>{comp.title}</h3>
          <p>{comp.tagline}</p>
          <div className="comp-bottom-area">
            <div className="comp-stat-row">
              <strong>{comp.stat}</strong>
              <span>{comp.statLabel}</span>
            </div>
            <div className="comp-card-cta">
              <span>{expanded ? "collapse" : "expand"}</span>
              <ArrowUpRight size={12} />
            </div>
          </div>
        </div>

        {/* Back Face — Scrolls UP into place on click */}
        <div
          className="comp-face back"
          data-lenis-prevent="true"
        >
          <div className="comp-back-topbar">
            <button
              className="cb-back-btn"
              onClick={toggle}
              aria-label="Back to summary"
            >
              <ChevronLeft size={14} />
              <span>COLLAPSE</span>
            </button>
            <span className="cb-code-pill">{comp.code}</span>
            <button
              className="cb-close-icon"
              onClick={toggle}
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          <div
            ref={backScrollRef}
            className="cb-scroll-body"
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
          >
            <h4 className="cb-heading">{comp.title}</h4>
            <div className="cb-stat-inline">
              <strong>{comp.stat}</strong>
              <span>{comp.statLabel}</span>
            </div>

            <div className="cb-specs-group">
              <span className="cb-label">// KEY CAPABILITIES & DELIVERABLES</span>
              <ul className="cb-bullets">
                {comp.skills.map((skill, idx) => (
                  <li key={idx}>
                    <span className="cb-dot">›</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
   Project Inline Expansion Panel
   Expands smoothly inline between the 4 cards and patent strip.
   ─────────────────────────────────────────────────── */
function ProjectExpandPanel({ project, isOpen, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    if (isOpen) {
      el.style.display = "block";
      el.style.height = "auto";
      const fullHeight = el.scrollHeight;
      el.style.height = "0px";
      el.style.opacity = "0";

      gsap.to(el, {
        height: fullHeight,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          el.style.height = "auto";
        }
      });
    } else {
      const currentHeight = el.scrollHeight;
      el.style.height = currentHeight + "px";

      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.38,
        ease: "power2.inOut",
        onComplete: () => {
          el.style.display = "none";
        }
      });
    }
  }, [isOpen, project]);

  if (!project) return null;

  return (
    <div
      ref={panelRef}
      className={`project-inline-panel ${isOpen ? "is-open" : ""}`}
      style={{ height: 0, opacity: 0, overflow: "hidden", display: "none" }}
      data-lenis-prevent="true"
      id="project-expand-container"
    >
      <div className="pip-container">
        {/* Neon Top Bar */}
        <div className="pip-topbar">
          <div className="pip-tag-wrap">
            <span className="pip-dot" />
            <span className="pip-tag">{project.tag}</span>
          </div>
          <button
            className="pip-close-btn"
            onClick={onClose}
            aria-label="Collapse specifications"
            title="Collapse specifications"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title and Subtitle with Reveal Wipe */}
        <div className="pip-header">
          <div className="pip-title-wrap">
            <h3 className="pip-title">{project.title}</h3>
            <span className="pip-wipe" />
          </div>
          <p className="pip-subtitle">{project.subtitle}</p>
        </div>

        {/* Dynamic Metric Boxes */}
        {project.metrics && (
          <div className="pip-stats-grid">
            {project.metrics.map((m, idx) => (
              <div key={idx} className="pip-stat-card">
                <div className="pip-stat-val-wrap">
                  <strong className="pip-stat-val">{m.value}</strong>
                  <span className="pip-wipe" />
                </div>
                <span className="pip-stat-label">{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* System Overview */}
        {project.overview && (
          <div className="pip-overview-block">
            <span className="pip-section-label">// SYSTEM ARCHITECTURE OVERVIEW</span>
            <p>{project.overview}</p>
          </div>
        )}

        {/* Key Engineering Highlights */}
        {project.highlights && (
          <div className="pip-highlights-block">
            <span className="pip-section-label">// CORE ENGINEERING HIGHLIGHTS & V-MODEL INTEGRATION</span>
            <ul className="pip-bullet-list">
              {project.highlights.map((h, idx) => (
                <li key={idx}>
                  <span className="pip-bullet">›</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Technology & Tools Stack */}
        {project.techStack && (
          <div className="pip-tech-block">
            <span className="pip-section-label">// TOOLS, STANDARDS & ARCHITECTURE STACK</span>
            <div className="pip-pills-wrap">
              {project.techStack.map((tech, idx) => (
                <span key={idx} className="pip-tech-pill">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Collapse Bar */}
        <div className="pip-footer">
          <span className="pip-footer-note">ROHAN LODAYA · SELECTED WORK SPECIFICATION</span>
          <button className="pip-footer-close" onClick={onClose}>
            collapse
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 500, damping: 35 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 35 });
  const rootRef = useRef(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLoaded(true);
    if (reduceMotion) return undefined;

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenisRef.current = lenis;

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // 1. Hero animations
      gsap.to(".hero-bike", {
        yPercent: -10,
        rotate: 2,
        ease: "none",
        scrollTrigger: { trigger: "#home", start: "top top", end: "bottom top", scrub: true }
      });
      gsap.to(".hero-grid", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: { trigger: "#home", start: "top top", end: "bottom top", scrub: true }
      });

      // 2. Lateral Slide (ON TRACK / OFF TRACK style) for 2-column card grids
      // Left cards slide in from left (x: -90), Right cards slide in from right (x: +90)
      const setupLateralCards = (selector) => {
        const container = document.querySelector(selector);
        if (!container) return;
        const cards = Array.from(container.children);
        cards.forEach((card, idx) => {
          const isLeft = idx % 2 === 0;
          gsap.fromTo(
            card,
            { x: isLeft ? -90 : 90, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                toggleActions: "play reverse play reverse"
              }
            }
          );
        });
      };

      setupLateralCards(".competencies-grid");
      setupLateralCards(".projects-grid");

      // 3. Timeline items lateral slide (Trajectory & Academics)
      gsap.utils.toArray(".trajectory-item").forEach((item) => {
        gsap.fromTo(
          item,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              toggleActions: "play reverse play reverse"
            }
          }
        );
      });
    }, rootRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Lock body scroll during modal open (Patents modal)
  useEffect(() => {
    document.body.style.overflow = activeModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeModal]);

  useEffect(() => {
    const move = (event) => {
      cursorX.set(event.clientX - 10);
      cursorY.set(event.clientY - 10);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [cursorX, cursorY]);

  const navigate = (id) => {
    setMenuOpen(false);
    scrollToId(id);
  };

  // Immediate, buttery smooth project expand & synchronized scroll
  const handleProjectClick = (idx) => {
    if (expandedProject === idx) {
      setExpandedProject(null);
    } else {
      setExpandedProject(idx);
      setTimeout(() => {
        const el = document.getElementById("project-expand-container");
        if (el) {
          if (lenisRef.current) {
            lenisRef.current.scrollTo(el, { offset: -90, duration: 0.7 });
          } else {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }
      }, 40);
    }
  };

  return (
    <div ref={rootRef} className={`portfolio ${loaded ? "is-loaded" : ""}`}>
      <motion.div className="cursor" style={{ x: springX, y: springY }} aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {/* Navigation Header — High Fashion Typography (Matches LANDO NORRIS reference, no R circle) */}
      <header className="site-nav" data-testid="site-navigation">
        <button className="brand" data-testid="brand-home-button" onClick={() => navigate("home")} aria-label="Go to home">
          <span className="brand-logo-text">
            <span className="brand-first">ROHAN</span>
            <span className="brand-last">LODAYA</span>
          </span>
        </button>
        <nav className={menuOpen ? "nav-links is-open" : "nav-links"} data-testid="primary-navigation">
          {navItems.map(([number, label, id]) => (
            <button key={id} data-testid={`nav-${id}-button`} onClick={() => navigate(id)}>
              <span>{number}</span>{label}
            </button>
          ))}
          <a data-testid="nav-resume-link" href={resumeUrl} download="Rohan_Lodaya_ATS_Resume.pdf" target="_blank" rel="noreferrer">
            Resume <ArrowUpRight size={14} />
          </a>
        </nav>
        <button className="menu-toggle" data-testid="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" className="hero section-dark" data-testid="home-section">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-topline">
            <span>INDIA</span>
            <span>rohanlodaya1997@gmail.com</span>
          </div>
          <div className="hero-copy">
            <p className="eyebrow">
              LEAD AUTOMOTIVE SYSTEMS, POWERTRAIN CALIBRATION & CONNECTED VEHICLE ENGINEER / 07+ YEARS
            </p>
            <h1 className="hero-title" data-testid="hero-headline">
              <span>BUILDING</span>
              <span className="outline">WHAT MOVES</span>
              <span>THE FUTURE<span className="accent-dot">.</span></span>
            </h1>
            <p className="hero-intro">
              I engineer the invisible systems behind extraordinary electric vehicles — from first principles to the open road.
            </p>
          </div>
          <div className="hero-visual">
            <div className="bike-halo" />
            <img className="hero-bike" data-testid="hero-bike-image" src={bikeImage} alt="Matte black sports motorcycle in a dark studio" />
            <div className="hero-caption">
              <span>4-SPEED GEARED EV PLATFORM / PRODUCTION CALIBRATION</span>
            </div>
          </div>
          <div className="hero-footer">
            <span>SCROLL TO EXPLORE</span>
            <span className="scroll-line" />
            <span>© 2026</span>
          </div>
        </section>

        {/* Section 01: Core Competencies (With Heading Wipe Reveal) */}
        <section id="competencies" className="section section-dark competencies-section" data-testid="competencies-section">
          <SectionHeadingWiped
            index="01 — CORE COMPETENCIES"
            line1="Engineering that"
            line2="delivers precision."
            description="Seven years mastering the full V-Model lifecycle — from 1D vehicle physics to real-time cloud analytics."
          />

          {/* Clean 4-Column Metrics Bar */}
          <div className="metrics" data-testid="metrics-bar">
            <div className="metric-box">
              <strong>14</strong>
              <span>AUTOMOTIVE PATENTS (2 GRANTED)</span>
            </div>
            <div className="metric-box">
              <strong>2M+</strong>
              <span>FLEET KM ANALYSED (180K+ RIDES)</span>
            </div>
            <div className="metric-box">
              <strong>170+</strong>
              <span>KM CERTIFIED RANGE (+65% EFFICIENCY)</span>
            </div>
            <div className="metric-box">
              <strong>&lt;3 min</strong>
              <span>CLOUD FAULT ISOLATION (&gt;96% ACCURACY)</span>
            </div>
          </div>

          {/* Core Competencies Bento Grid — Ample vertical space, lateral slide on scroll */}
          <div className="competencies-grid" data-testid="competencies-grid">
            {coreCompetencies.map((comp) => (
              <CompetencyCard key={comp.id} comp={comp} />
            ))}
          </div>
        </section>

        {/* Skills Marquee Ticker */}
        <div className="marquee" data-testid="skills-marquee">
          <div>
            {skills.concat(skills).map((skill, index) => (
              <span key={`${skill}-${index}`}>{skill} <b>✳</b></span>
            ))}
          </div>
        </div>

        {/* Section 02: Selected Work (With Heading Wipe Reveal) */}
        <section id="projects" className="section section-dark projects-section" data-testid="projects-section">
          <SectionHeadingWiped
            index="02 — SELECTED WORK"
            line1="Proof in"
            line2="motion."
            description="Engineering as an attitude: precise, measurable, and always moving forward."
          />

          <div className="projects-grid">
            {projects.map((project, idx) => (
              <motion.article
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className={`project-card ${expandedProject === idx ? "is-active" : ""}`}
                key={project.number}
                data-testid={`project-card-${project.number}`}
                onClick={() => handleProjectClick(idx)}
                title="Click to expand architecture details"
              >
                <div className="project-top">
                  <span>{project.number}</span>
                  <div className={`project-arrow-icon ${expandedProject === idx ? "is-open" : ""}`}>
                    <ArrowUpRight size={20} />
                  </div>
                </div>
                <h3>{project.title}</h3>
                <p>{project.detail}</p>
                <div className="project-bottom-area">
                  <div className="project-stat">
                    <strong>{project.stat}</strong>
                    <span>{project.label}</span>
                  </div>
                  <div className="project-card-cta">
                    <span>{expandedProject === idx ? "collapse" : "expand"}</span>
                    <ArrowUpRight size={12} />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Inline Expansion Panel — Expands between the 4 project cards and patent strip */}
          <ProjectExpandPanel
            project={expandedProject !== null ? projectDetails[expandedProject] : null}
            isOpen={expandedProject !== null}
            onClose={() => setExpandedProject(null)}
          />

          {/* Patent Innovation Archive Strip */}
          <div
            className="patent-strip"
            data-testid="patent-archive-strip"
            onClick={() => setActiveModal({ type: "PATENTS", data: patentDetails })}
            title="Click to view all 14 automotive patents"
          >
            <span>INNOVATION ARCHIVE</span>
            <strong>14 AUTOMOTIVE PATENTS (2 GRANTED)</strong>
            <button
              type="button"
              className="patent-strip-btn"
              data-testid="patent-archive-link"
              onClick={(e) => {
                e.stopPropagation();
                setActiveModal({ type: "PATENTS", data: patentDetails });
              }}
            >
              VIEW <ArrowUpRight size={16} />
            </button>
          </div>
        </section>

        {/* Section 03: Professional Trajectory (With Heading Wipe Reveal) */}
        <section id="experience" className="trajectory-section" data-testid="trajectory-section">
          <SectionHeadingWiped
            index="03 — PROFESSIONAL TRAJECTORY"
            indexColor="var(--acid)"
            line1="Where systems"
            line2="became reality."
            description="Hands-on engineering execution across production geared EV platforms and ground-up vehicle programs."
          />

          <div className="trajectory-timeline">
            {professionalExperience.map((exp, idx) => (
              <div key={idx} className="trajectory-item" data-testid={`trajectory-item-${idx}`}>
                <div className="trajectory-meta">
                  <span className="trajectory-period">{exp.period}</span>
                  <span className="trajectory-type">{exp.type}</span>
                </div>
                <div className="trajectory-content">
                  <h3>{exp.role}</h3>
                  <p className="trajectory-company">{exp.company} · {exp.location}</p>
                  <p className="trajectory-desc">{exp.description}</p>
                  <div className="trajectory-tags">
                    {exp.tags.map((t, tIdx) => (
                      <span key={tIdx} className="trajectory-tag">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 04: Standards & Academics (With Heading Wipe Reveal) */}
        <section id="standards" className="standards-dark-section" data-testid="standards-section">
          <SectionHeadingWiped
            index="04 — STANDARDS & FOUNDATIONS"
            indexColor="var(--acid)"
            line1="Standards &amp;"
            line2="academics."
            description="Automotive regulatory compliance and core mechanical engineering pedagogy."
          />

          {/* Part A: Regulatory Framework — Small, clean list of standards */}
          <div className="standards-compact-wrapper">
            <span className="group-eyebrow">// REGULATORY FRAMEWORKS &amp; COMPLIANCE STANDARDS</span>
            <div className="standards-compact-list">
              <div className="std-clean-row">
                <span className="std-cat-label">POWERTRAIN &amp; RANGE</span>
                <div className="std-pills-row">
                  <span className="std-pill" title="Range Measurement">AIS-040</span>
                  <span className="std-pill" title="Energy Consumption">AIS-039</span>
                  <span className="std-pill" title="Net Continuous Power">AIS-041</span>
                  <span className="std-pill" title="Gradeability ≥22°">AIS-003</span>
                  <span className="std-pill" title="EV Type Approval">AIS-049</span>
                </div>
              </div>
              <div className="std-clean-row">
                <span className="std-cat-label">BATTERY &amp; HV SAFETY</span>
                <div className="std-pills-row">
                  <span className="std-pill" title="REESS Battery Safety">AIS-156</span>
                  <span className="std-pill" title="HV Electric Propulsion">AIS-123</span>
                  <span className="std-pill" title="EV Conductive Charging">IS 17017-1</span>
                </div>
              </div>
              <div className="std-clean-row">
                <span className="std-cat-label">CYBERSECURITY &amp; OTA</span>
                <div className="std-pills-row">
                  <span className="std-pill" title="Cybersecurity & CSMS">AIS-189</span>
                  <span className="std-pill" title="Software Updates & SUMS">AIS-190</span>
                  <span className="std-pill" title="Acoustic Alerting (AVAS)">AIS-173</span>
                </div>
              </div>
              <div className="std-clean-row">
                <span className="std-cat-label">CONTROLS &amp; DYNAMICS</span>
                <div className="std-pills-row">
                  <span className="std-pill" title="Rider Controls">AIS-071</span>
                  <span className="std-pill" title="Tell-Tales & Symbology">AIS-126</span>
                  <span className="std-pill" title="Stands & Motor Cutoff">AIS-146</span>
                  <span className="std-pill" title="Max Speed Verification">IS 10278</span>
                  <span className="std-pill" title="Acceleration Performance">IS 10407</span>
                </div>
              </div>
            </div>
          </div>

          {/* Part B: Academic Foundations — Research papers integrated directly into B.Tech */}
          <div className="academics-compact-wrapper">
            <span className="group-eyebrow">// ACADEMIC FOUNDATIONS &amp; RESEARCH</span>
            <div className="trajectory-timeline">
              {/* B.Tech with BAJA & Research Papers integrated */}
              <div className="trajectory-item" data-testid="academic-btech">
                <div className="trajectory-meta">
                  <span className="trajectory-period">2015 — 2019</span>
                  <span className="edu-score-badge">CGPA: 8.8 / 10.0</span>
                </div>
                <div className="trajectory-content">
                  <h3>Bachelor of Technology (B.Tech) in Mechanical Engineering</h3>
                  <p className="trajectory-company">Pandit Deendayal Petroleum University (PDPU) · Gandhinagar</p>
                  
                  {/* BAJA SAEINDIA */}
                  <p className="trajectory-desc">
                    <strong style={{ color: "#f4f3ee" }}>BAJA SAEINDIA 2018 (Team CAZR) — Team Lead, Simulation &amp; Virtual Validation:</strong> Led chassis and wheel hub finite element analysis (FEA) and topology optimization, achieving a significant unsprung mass reduction while increasing the structural factor of safety by 25%.
                  </p>

                  {/* Research Papers Integrated */}
                  <div className="integrated-research-block">
                    <span className="ir-label">// PEER-REVIEWED RESEARCH PUBLICATIONS</span>
                    <ul className="ir-list">
                      <li>
                        <span className="ir-bullet">›</span>
                        <span><strong>Bearing Fault Diagnosis using EEMD, CMSE, J48 Decision Trees &amp; ANN:</strong> Signal processing and composite multiscale entropy for automated rotational bearing fault isolation.</span>
                      </li>
                      <li>
                        <span className="ir-bullet">›</span>
                        <span><strong>Residential Building Heating &amp; Cooling Load Prediction using SVM &amp; Isotonic Regression:</strong> Machine learning algorithms modeling multi-variable dynamic thermal transfer loads.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="trajectory-tags">
                    {["BAJA SAEINDIA 2018", "Team CAZR", "Chassis Topology Optimization", "FEA Validation", "EEMD Signal Processing", "Machine Learning ANN", "SVM Regression"].map((t, idx) => (
                      <span key={idx} className="trajectory-tag">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Diploma */}
              <div className="trajectory-item" data-testid="academic-diploma">
                <div className="trajectory-meta">
                  <span className="trajectory-period">2013 — 2016</span>
                  <span className="edu-score-badge">CGPA: 9.4 / 10.0</span>
                </div>
                <div className="trajectory-content">
                  <h3>Diploma in Mechanical Engineering</h3>
                  <p className="trajectory-company">Gujarat Technological University (GTU) · Ahmedabad</p>
                  <p className="trajectory-desc">
                    Graduated in top percentile with specialized focus on mechanical design, manufacturing automation, kinematics, and thermodynamics.
                  </p>
                  <div className="trajectory-tags">
                    {["GTU Rank Holder", "CAD / CAM", "Machine Design", "Thermodynamics", "Automation"].map((t, idx) => (
                      <span key={idx} className="trajectory-tag">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 05: Contact Section (With Heading Wipe Reveal) */}
        <section id="contact" className="contact-section section-dark" data-testid="contact-section">
          <div className="contact-orbit" aria-hidden="true" />
          <SectionHeadingWiped
            index="05 — CONTACT"
            line1="Let’s build"
            line2="what’s next."
            description="Open to ambitious EV, mobility and systems engineering challenges."
          />
          <div className="contact-actions">
            <a className="contact-link" data-testid="contact-email-link" href="mailto:rohanlodaya1997@gmail.com">
              <Mail size={19} /> rohanlodaya1997@gmail.com <ArrowUpRight size={16} />
            </a>
            <a className="contact-link" data-testid="contact-linkedin-link" href="https://linkedin.com/in/rohan-lodaya" target="_blank" rel="noreferrer">
              <Linkedin size={19} /> LinkedIn <ArrowUpRight size={16} />
            </a>
            <a className="contact-link" data-testid="contact-phone-link" href="tel:+918320683628">
              +91 83206 83628 <ArrowUpRight size={16} />
            </a>
            <a className="contact-link" data-testid="contact-resume-link" href={resumeUrl} download="Rohan_Lodaya_ATS_Resume.pdf" target="_blank" rel="noreferrer">
              <Download size={19} /> Download resume <ArrowUpRight size={16} />
            </a>
          </div>
          <footer>
            <span>ROHAN LODAYA / 2026</span>
            <span>DESIGNED FOR MOTION</span>
          </footer>
        </section>
      </main>

      {/* Uniform Detail Modal (Used for Patent Innovation Archive) */}
      <DetailModal
        isOpen={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        data={activeModal?.data}
        type={activeModal?.type}
      />
    </div>
  );
}

export default App;
