# Specification: WebUI Draft Rich HTML Copy + Edit

**Track ID:** draft-rich-copy_20260331
**Type:** Feature
**Created:** 2026-03-31
**Status:** Draft
**Issue:** ISS-192

## Summary

Add Rich HTML clipboard copy and inline editing to the WebUI email draft cards, so pasting into New Outlook preserves formatting (bold, lists, links).

## User Story

As an Azure Support Engineer, I want to copy email drafts from the WebUI and paste them into Outlook with formatting preserved, so I don't have to manually re-format bold text, lists, and links every time.

## Acceptance Criteria

- [ ] Copy button copies HTML rich text to clipboard (text/html MIME type) — pasting into New Outlook preserves bold, lists, links
- [ ] Copy also includes text/plain fallback for Ctrl+Shift+V plain paste
- [ ] Edit button toggles inline markdown editor (textarea) for each draft
- [ ] Save persists edits to the .md file on disk via API
- [ ] Cancel discards edits and returns to rendered view
- [ ] Copy after editing uses the modified content
- [ ] Both CaseDetail DraftCard and DraftsPage DraftCard share the same behavior

## Dependencies

- Existing: react-markdown, remark-gfm (already in project)
- New: `marked` library for md→HTML conversion at copy time (lightweight, well-maintained)

## Out of Scope

- CLI display changes
- email-drafter agent changes
- .md file format changes
- Direct Outlook draft creation via MCP

## Technical Notes

- Use `marked` (not react-markdown) for copy because we need an HTML string, not React elements
- `navigator.clipboard.write()` with `ClipboardItem` containing both `text/html` and `text/plain` blobs
- Backend needs a PUT endpoint to save edited draft content back to disk
- DraftCard component exists in both CaseDetail.tsx and DraftsPage.tsx — extract shared logic into a reusable component or utility
