---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/UES Disks automatically expand/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FIn-Development%20Content%2FUES%20Disks%20automatically%20expand%2FSetup%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# UES Disks Automatically Expand - Setup Guide

## Setup Steps

1. Admin creates or edits a UES-enabled policy
2. Enable User Experience Sync
3. Select user storage type:
   - **Automatic storage expansion** (recommended)
   - Fixed-size storage
4. If automatic expansion is selected:
   - Verify maximum size is configured (default 64 GB)
5. Save the configuration

## What CSS Should Verify

- Policy is successfully applied to users
- User storage type reflects expected configuration in User Storage (PAMO view)
- Initial disk size starts at 4 GB for new users

## What "Good" Looks Like

- User disk grows automatically as usage increases
- No user-facing prompts or session interruptions occur during expansion
