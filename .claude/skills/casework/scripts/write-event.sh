#!/usr/bin/env bash
# write-event.sh — atomic event writer for .casework/events/*.json
#
# Usage: write-event.sh <file> <json-content>
#
# Implementation notes (from spike-notes.md):
#  - Uses "${FILE}.tmp.$BASHPID.$RANDOM" for the staging name.
#    $$ is NOT safe in backgrounded subshells: children inherit the parent
#    PID and will collide when many writers race the same file.
#  - Writes content, then mv into place. mv on the same filesystem is atomic,
#    so file-watchers never observe a partially written JSON document.
set -euo pipefail

FILE="${1:?file required}"
CONTENT="${2:?content required}"

mkdir -p "$(dirname "$FILE")"
TMP="${FILE}.tmp.$BASHPID.$RANDOM"
printf '%s' "$CONTENT" > "$TMP"
mv "$TMP" "$FILE"
