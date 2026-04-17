#!/bin/bash
# agent-cache-check.sh — Pre-check cache for teams-search and onenote-case-search
# Usage: bash agent-cache-check.sh <caseDir> [teamsSearchCacheHours] [projectRoot]
# Output: JSON with spawn decisions
#   {"teams":{"spawn":true,"reason":"EXPIRED(2h30m)"},"onenote":{"spawn":true,"reason":"SOURCE_NEWER"}}
#   {"teams":{"spawn":false,"reason":"CACHED(1h15m)"},"onenote":{"spawn":false,"reason":"CACHED"}}

set -euo pipefail
CD="${1:?Usage: agent-cache-check.sh <caseDir> [cacheHours] [projectRoot]}"
CACHE_HOURS="${2:-8}"
PROJECT_ROOT="${3:-$(cd "$(dirname "$0")/../../.." && pwd)}"
NOW=$(date +%s)

# ======= Teams Search Cache =======
TEAMS_SPAWN="true"
TEAMS_REASON="NO_CACHE"

CACHE_FILE="$CD/teams/_cache-epoch"
if [ -f "$CACHE_FILE" ]; then
  CACHE_EPOCH=$(cat "$CACHE_FILE")
  AGE_SECS=$((NOW - CACHE_EPOCH))
  AGE_H=$((AGE_SECS / 3600))
  AGE_M=$(( (AGE_SECS % 3600) / 60 ))
  THRESHOLD=$((CACHE_HOURS * 3600))
  if [ "$AGE_SECS" -lt "$THRESHOLD" ]; then
    TEAMS_SPAWN="false"
    TEAMS_REASON="CACHED(${AGE_H}h${AGE_M}m)"
  else
    TEAMS_REASON="EXPIRED(${AGE_H}h${AGE_M}m)"
  fi
fi

# ======= OneNote Case Search Cache =======
ONENOTE_SPAWN="true"
ONENOTE_REASON="NO_NOTES"

NOTES_FILE="$CD/onenote/personal-notes.md"
if [ -f "$NOTES_FILE" ]; then
  # Get personal-notes.md write time (epoch)
  NOTES_EPOCH=$(stat -c %Y "$NOTES_FILE" 2>/dev/null || stat -f %m "$NOTES_FILE" 2>/dev/null || echo 0)

  # Read onenote-export config to find source notebook dir
  # Convert POSIX path for python3 on Windows (Git Bash)
  PR_WIN=$(cygpath -w "$PROJECT_ROOT" 2>/dev/null || echo "$PROJECT_ROOT")
  ONENOTE_CONFIG="$PROJECT_ROOT/.claude/skills/onenote/config.json"
  OC_WIN=$(cygpath -w "$ONENOTE_CONFIG" 2>/dev/null || echo "$ONENOTE_CONFIG")
  CFG_WIN=$(cygpath -w "$PROJECT_ROOT/config.json" 2>/dev/null || echo "$PROJECT_ROOT/config.json")
  if [ -f "$ONENOTE_CONFIG" ]; then
    OUTPUT_DIR_RAW=$(python3 -c "import json; print(json.load(open(r'$OC_WIN')).get('outputDir',''))" 2>/dev/null || echo "")
    PERSONAL_NB=$(python3 -c "import json; c=json.load(open(r'$CFG_WIN')); print(c.get('onenote',{}).get('personalNotebook',''))" 2>/dev/null || echo "")

    # Resolve relative outputDir against project root
    if [[ "$OUTPUT_DIR_RAW" == ../* ]] || [[ "$OUTPUT_DIR_RAW" == ./* ]]; then
      OUTPUT_DIR="$(cd "$PROJECT_ROOT" && cd "$OUTPUT_DIR_RAW" 2>/dev/null && pwd)" || OUTPUT_DIR=""
    else
      OUTPUT_DIR="$OUTPUT_DIR_RAW"
    fi

    if [ -n "$OUTPUT_DIR" ] && [ -n "$PERSONAL_NB" ] && [ -d "$OUTPUT_DIR/$PERSONAL_NB" ]; then
      # Find newest .md file in personal notebook source (cross-platform)
      NEWEST_SOURCE=$(find "$OUTPUT_DIR/$PERSONAL_NB" -name "*.md" -type f -exec stat -c %Y {} \; 2>/dev/null | sort -rn | head -1 || find "$OUTPUT_DIR/$PERSONAL_NB" -name "*.md" -type f -exec stat -f %m {} \; 2>/dev/null | sort -rn | head -1 || echo 0)
      NEWEST_SOURCE_INT=${NEWEST_SOURCE%.*}

      if [ "$NOTES_EPOCH" -ge "$NEWEST_SOURCE_INT" ] 2>/dev/null; then
        ONENOTE_SPAWN="false"
        ONENOTE_REASON="CACHED(notes unchanged)"
      else
        ONENOTE_REASON="SOURCE_NEWER"
      fi
    else
      ONENOTE_REASON="NO_CONFIG"
    fi
  else
    ONENOTE_REASON="NO_ONENOTE_CONFIG"
  fi
fi

# Output JSON
echo "{\"teams\":{\"spawn\":$TEAMS_SPAWN,\"reason\":\"$TEAMS_REASON\"},\"onenote\":{\"spawn\":$ONENOTE_SPAWN,\"reason\":\"$ONENOTE_REASON\"}}"
