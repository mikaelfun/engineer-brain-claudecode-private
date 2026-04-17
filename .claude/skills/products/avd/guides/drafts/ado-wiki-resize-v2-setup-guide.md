---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Resize V2/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/Resize%20V2/Setup%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Resize V2 - High-level Steps

1. Admin selects a provisioned Cloud PC in MEM
2. Admin triggers Resize
3. Backend validates: Cloud PC state, VM generation, existing target Cloud PC conflicts
4. Resize job starts: VM shutdown → Snapshot creation → New VM creation → Extensions execution
5. On success: New Cloud PC becomes active, old resources cleaned up

## What CSS Should Verify
- Cloud PC state before resize is Provisioned
- Target SKU is valid
- Resize job transitions beyond snapshot phase

## What Good Looks Like
- Cloud PC returns to Provisioned state
- Device spec reflects target SKU
- User can sign in successfully
