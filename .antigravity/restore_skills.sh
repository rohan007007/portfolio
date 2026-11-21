#!/usr/bin/env bash
# Antigravity Skills Restoration Script (macOS / Linux)
# Restores bundled project skills into your local Antigravity environment

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_SKILLS="${SCRIPT_DIR}/skills"
TARGET_SKILLS="${HOME}/.gemini/antigravity/skills"

echo "=========================================================="
echo " Antigravity Skills Restoration (macOS / Linux)"
echo "=========================================================="

if [ ! -d "${SOURCE_SKILLS}" ]; then
    echo "Error: Source skills directory not found: ${SOURCE_SKILLS}" >&2
    exit 1
fi

mkdir -p "${TARGET_SKILLS}"

for skill_path in "${SOURCE_SKILLS}"/*; do
    if [ -d "${skill_path}" ]; then
        skill_name="$(basename "${skill_path}")"
        dest="${TARGET_SKILLS}/${skill_name}"
        echo "Restoring skill: ${skill_name} -> ${dest}"
        mkdir -p "${dest}"
        cp -R "${skill_path}/"* "${dest}/"
    fi
done

echo ""
echo "All skills successfully restored to ${TARGET_SKILLS}"
echo "Restart Antigravity or start a new chat session to activate restored skills."
