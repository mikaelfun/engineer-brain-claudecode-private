# Decoding SPAM Agent Message Data

> Source: OneNote — Decoding SPAM agent message data
> Status: draft (pending SYNTHESIZE review)

## Overview

In Extended Message Trace, the `custom_data` field contains encoded SPAM agent data with abbreviated field names. A decoding script translates these into human-readable values.

## Script Location

**Script**: [decodingspamagentdata.ps1 - Mooncake CodeRepo](https://dev.azure.com/CSS-Mooncake/SupportTools/_git/MooncakeCodeRepo?path=/VM/eopscripts/decodingspamagentdata.ps1)

## Usage

1. Copy the entire `custom_data` value from Extended Message Trace (SPAM agent row)
2. Assign to variable:
   ```powershell
   $data = "<paste copied data here>"
   ```
3. Run script:
   ```powershell
   ./decodingspamagentdata.ps1 $data
   ```
4. Output: decoded field names with human-readable descriptions

## When to Use

- Investigating spam verdicts in Extended Message Trace
- Decoding SPAM agent `custom_data` fields that contain short/abbreviated names
- Need to understand which specific spam filters or rules triggered on a message
