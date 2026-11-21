# Antigravity Skills Restoration Script (Windows PowerShell)
# Restores bundled project skills into your local Antigravity environment

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$sourceSkills = Join-Path $scriptDir "skills"
$targetSkills = Join-Path $HOME ".gemini\antigravity\skills"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Antigravity Skills Restoration" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $sourceSkills)) {
    Write-Error "Source skills directory not found: $sourceSkills"
    exit 1
}

if (-not (Test-Path $targetSkills)) {
    Write-Host "Creating target skills directory: $targetSkills" -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $targetSkills | Out-Null
}

$skills = Get-ChildItem -Path $sourceSkills -Directory

foreach ($skill in $skills) {
    $dest = Join-Path $targetSkills $skill.Name
    Write-Host "Restoring skill: $($skill.Name) -> $dest" -ForegroundColor Green
    Copy-Item -Path $skill.FullName -Destination $dest -Recurse -Force
}

Write-Host "`nAll skills successfully restored to $targetSkills" -ForegroundColor Cyan
Write-Host "Restart Antigravity or open a new chat to activate restored skills.`n" -ForegroundColor Green
