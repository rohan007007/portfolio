import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, ShieldCheck, FileText, CheckCircle2, Cpu } from "lucide-react";

export function DetailModal({ isOpen, onClose, data, type }) {
  const scrollRef = useRef(null);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Direct mouse wheel scroll guarantee: stops propagation to Lenis & moves scrollTop smoothly
  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.stopPropagation();
      // Directly adjust scroll position smoothly if parent stops it
      if (e.deltaY) {
        el.scrollTop += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isOpen]);

  if (!isOpen || !data) return null;

  return (
    <AnimatePresence>
      <div className="modal-root" data-testid="detail-modal-root" data-lenis-prevent="true">
        {/* Backdrop */}
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div
          className="modal-wrapper"
          data-lenis-prevent="true"
          onClick={onClose}
          onWheel={(e) => e.stopPropagation()}
        >
          <motion.div
            className="modal-card"
            data-testid="detail-modal-card"
            data-lenis-prevent="true"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Top Bar with Tag and Close Button */}
            <div className="modal-topbar">
              <span className="modal-tag">
                {data.tag ||
                  (type === "COMPETENCY"
                    ? "01 — CORE COMPETENCY"
                    : type === "PATENTS"
                    ? "INNOVATION ARCHIVE · INTELLECTUAL PROPERTY"
                    : "02 — SELECTED WORK")}
              </span>
              <button
                className="modal-close-btn"
                data-testid="modal-close-button"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Header Content */}
            <div className="modal-header">
              <h2 className="modal-title">{data.title || data.role}</h2>
              <div className="modal-meta-row">
                {data.company && <span className="modal-company">{data.company} · {data.location}</span>}
                {data.period && <span className="modal-period">{data.period}</span>}
                {data.tagline && <span className="modal-subtitle">{data.tagline}</span>}
                {data.subtitle && <span className="modal-subtitle">{data.subtitle}</span>}
                {data.highlight && <span className="modal-badge">{data.highlight}</span>}
              </div>
            </div>

            {/* Scrollable Body with direct hardware compositing */}
            <div
              ref={scrollRef}
              className="modal-body"
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
            >
              {/* Quick Stats Bar */}
              {(data.stats || data.metrics) && (
                <div className="modal-stats-grid">
                  {(data.stats || data.metrics).map((item, idx) => (
                    <div key={idx} className="modal-stat-box">
                      <strong className="modal-stat-val">{item.stat || item.value}</strong>
                      <span className="modal-stat-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Overview */}
              {(data.overview || data.summary) && (
                <div className="modal-overview-section">
                  <span className="modal-section-label">// SYSTEM OVERVIEW</span>
                  <p className="modal-overview-text">{data.overview || data.summary}</p>
                </div>
              )}

              {/* Core Competency Deep-Dive */}
              {type === "COMPETENCY" && data.skills && (
                <div className="modal-sections-list">
                  <div className="modal-sub-section">
                    <h4 className="modal-sub-title">
                      <span className="accent-bar" />
                      Key Capabilities & Deliverables
                    </h4>
                    <ul className="modal-bullet-list">
                      {data.skills.map((skill, idx) => (
                        <li key={idx} className="modal-bullet-item">
                          <span className="bullet-dot">›</span>
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Project Details View */}
              {type === "PROJECT" && (
                <div className="modal-sections-list">
                  {data.highlights && (
                    <div className="modal-sub-section">
                      <h4 className="modal-sub-title">
                        <span className="accent-bar" />
                        Key Engineering Highlights & Systems Integration
                      </h4>
                      <ul className="modal-bullet-list">
                        {data.highlights.map((item, idx) => (
                          <li key={idx} className="modal-bullet-item">
                            <span className="bullet-dot">›</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {data.techStack && (
                    <div className="modal-sub-section">
                      <h4 className="modal-sub-title">
                        <span className="accent-bar" />
                        Core Tools, Standards & Architecture Stack
                      </h4>
                      <div className="modal-tech-stack">
                        {data.techStack.map((tech, idx) => (
                          <span key={idx} className="modal-tech-pill">
                            <Cpu size={12} className="tech-icon" />
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Patent Archive Details View (Per Request 8: No Drive banner; clicking granted patents opens Drive) */}
              {type === "PATENTS" && (
                <div className="modal-patents-container">
                  {/* Granted Patents Section */}
                  <div className="patent-block">
                    <div className="patent-block-header">
                      <span className="patent-status-badge granted">
                        <ShieldCheck size={14} /> 2 GRANTED PATENTS
                      </span>
                      <span className="patent-block-note">Click to open official filing in Google Drive</span>
                    </div>

                    <div className="patent-cards-grid granted-grid">
                      {data.granted.map((patent) => (
                        <a
                          key={patent.number}
                          href={patent.driveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="patent-item-card is-granted"
                          data-testid={`patent-granted-${patent.number}`}
                          title="Open official granted patent filing in Google Drive"
                        >
                          <div className="patent-card-top">
                            <span className="patent-num">PATENT #{patent.number}</span>
                            <span className="patent-pill-granted">
                              <CheckCircle2 size={12} /> GRANTED
                            </span>
                          </div>
                          <h4 className="patent-item-title">{patent.title}</h4>
                          <span className="patent-item-cat">{patent.category}</span>
                          <p className="patent-item-desc">{patent.description}</p>
                          <div className="patent-drive-link-cta">
                            <span>Open in Google Drive</span>
                            <ArrowUpRight size={14} />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Published Patents Section (Non-clickable informational cards) */}
                  <div className="patent-block">
                    <div className="patent-block-header">
                      <span className="patent-status-badge published">
                        <FileText size={14} /> 12 PUBLISHED PATENTS
                      </span>
                      <span className="patent-block-note">Powertrain, Range, Safety & Diagnostics</span>
                    </div>

                    <div className="patent-cards-grid published-grid">
                      {data.published.map((patent) => (
                        <div
                          key={patent.number}
                          className="patent-item-card is-published"
                          data-testid={`patent-published-${patent.number}`}
                        >
                          <div className="patent-card-top">
                            <span className="patent-num">PATENT #{patent.number}</span>
                            <span className="patent-pill-published">PUBLISHED</span>
                          </div>
                          <h4 className="patent-item-title">{patent.title}</h4>
                          <span className="patent-item-cat">{patent.category}</span>
                          <p className="patent-item-desc">{patent.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <span className="modal-footer-caption">ROHAN LODAYA · AUTOMOTIVE SYSTEMS & CALIBRATION</span>
              <button className="modal-footer-close" onClick={onClose}>
                CLOSE
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
