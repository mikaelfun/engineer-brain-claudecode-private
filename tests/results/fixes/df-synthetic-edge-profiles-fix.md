# Fix Report: df-synthetic-edge-profiles

**Test ID:** df-synthetic-edge-profiles
**Fix Type:** 45
**Description:** e2e-runner.sh multi-line output truncation
**Modified Files:** Removed '| tail -1' from both bash_command step output capture lines in e2e-runner.sh (lines 753, 824). Root cause: multi-line bash step output was truncated to last line only, causing text_contains assertions against earlier lines to always fail.
**Fixed At:** 2026-03-31T23:04:07Z
**Recipe Used:** none

## What Was Fixed

e2e-runner.sh multi-line output truncation

## Modified Files

- `Removed'|tail-1'frombothbash_commandstepoutputcapturelinesine2e-runner.sh(lines753`
- `824).Rootcause:multi-linebashstepoutputwastruncatedtolastlineonly`
- `causingtext_containsassertionsagainstearlierlinestoalwaysfail.`

## Diff

No git diff captured (files may not be tracked or no changes)
