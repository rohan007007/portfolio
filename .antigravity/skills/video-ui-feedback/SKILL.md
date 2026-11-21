---
name: video-ui-feedback
description: Automatically activate this skill whenever the user provides or references a screen recording or video file (.mp4, .webm, .mov, .mkv) with or without voiceover to review website or web app UI, layout, animations, CSS transitions, hover states, cursor interactions, or visual bugs in any workspace. Analyzes spoken instructions and sub-second visual motion using Gemini, maps issues to project code, validates via live browser inspection, and implements verified frontend fixes.
---

# Video UI Feedback Skill

This global skill equips Antigravity to analyze screen recordings with voiceover across **any** project workspace. It extracts spoken design instructions and pinpoint motion/layout flaws, maps them directly to the active project's codebase, verifies the interactions in a live browser session, and implements precise code fixes.

---

## Architecture: Two-Pass Analysis

The analysis uses `~/.gemini/antigravity/skills/video-ui-feedback/scripts/analyze_ui_video.py` powered by the official `google-genai` SDK:
- **Pass 1 (Full Audio + 1 FPS Scan):** Transcribes voiceover, tracks cursor activity, and catalogs every distinct issue with timestamps, UI region, trigger action, and desired end state.
- **Pass 2 (High-FPS Motion Deep-Dive):** Samples short motion windows at 8+ FPS (up to 24 FPS) over the same uploaded video to analyze frame-by-frame easing, micro-stutters, z-index clipping, layout reflows, and CSS/JS root causes.
- **Cloud Hygiene:** Remote video files on Gemini Files API are automatically deleted immediately after analysis completes.

---

## 6-Step Agent Execution Workflow

Follow these steps sequentially whenever the user provides a video file for UI feedback:

1. **Preflight Check:**
   - Resolve video path (relative to active workspace or absolute).
   - Verify self-contained `.venv` at `~/.gemini/antigravity/skills/video-ui-feedback/.venv`.
   - Verify `GEMINI_API_KEY` (env, active workspace `.env`, or `~/.gemini/antigravity/skills/video-ui-feedback/.env`).
2. **Run Two-Pass Video Analysis:**
   - Execute `~/.gemini/antigravity/skills/video-ui-feedback/scripts/analyze_ui_video.py "<video_path>"` using the `.venv` Python interpreter.
3. **Map Findings to Active Workspace Codebase:**
   - Locate affected components, CSS classes, animation hooks, or event handlers in the project.
4. **Live Browser Inspection (No Guessing):**
   - For issues marked `Needs High-FPS / Live Inspection: Yes`, open the project's local dev server in Antigravity's browser tool, reproduce the trigger interaction, and inspect computed styles and DOM behavior.
5. **Present a Concise Fix Plan:**
   - Present issue ID, target files, root cause, and proposed changes to the user for approval.
6. **Implement & Verify in Browser:**
   - Apply minimal scoped fixes, re-test the interaction in the live browser session, and confirm the fix.
