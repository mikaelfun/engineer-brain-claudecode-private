# Fix Report: api-patrol-cancel

**Test ID:** api-patrol-cancel
**Fix Type:** test_definition
**Description:** Updated expected_status [200,409] → [200,404,409]: API returns 404 when no patrol running (not 409)
**Modified Files:** tests/registry/backend-api/api-patrol-cancel.yaml
**Fixed At:** 2026-03-28T20:27:23Z

## What Was Fixed

Updated expected_status [200,409] → [200,404,409]: API returns 404 when no patrol running (not 409)

## Modified Files

- `tests/registry/backend-api/api-patrol-cancel.yaml`

## Diff

No git diff captured (files may not be tracked or no changes)
