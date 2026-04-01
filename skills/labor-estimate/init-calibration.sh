#!/bin/bash
# Initialize calibration.json if it doesn't exist
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CAL_FILE="$SCRIPT_DIR/calibration.json"

if [ ! -f "$CAL_FILE" ]; then
  cat > "$CAL_FILE" << 'CALEOF'
{
  "adjustments": {
    "troubleshooting": { "multiplier": 1.0, "samples": 0 },
    "email": { "multiplier": 1.0, "samples": 0 },
    "research": { "multiplier": 1.0, "samples": 0 },
    "notes": { "multiplier": 1.0, "samples": 0 },
    "remote_session": { "multiplier": 1.0, "samples": 0 },
    "internal_consult": { "multiplier": 1.0, "samples": 0 },
    "analysis": { "multiplier": 1.0, "samples": 0 }
  },
  "history": [],
  "lastUpdated": ""
}
CALEOF
  echo "calibration.json created at $CAL_FILE"
else
  echo "calibration.json already exists at $CAL_FILE"
fi
