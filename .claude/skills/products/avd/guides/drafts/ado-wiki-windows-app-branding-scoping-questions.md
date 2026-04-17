---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Windows App Branding/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/Windows%20App%20Branding/Scoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows App Branding - Scoping Questions

## Environment & Configuration
- Windows 365, AVD, or both?
- Branding policy in Intune (W365) or Azure Portal (AVD)?
- Policy assigned tenant-wide or to specific groups?
- Multiple branding policies targeting same user/group?

## User Scenario / UX
- Issue related to: logo, company name, colors, support info, custom URLs?
- Branding issue before or after sign-in?
- Missing completely or partially applied?
- Differs between platforms (Windows, Web, macOS, iOS, Android)?

## Policy & Conflict Validation
- W365 branding policy targeting user?
- AVD branding policies targeting same user?
- AVD policies with lower rank that could override?

## CSS Decision-Making Signals
- Configuration issue: policy targeting, conflict resolution, asset validation
- Known limitation: platform parity or preview behavior
- Potential product issue: inconsistent behavior with correct policy/assets
