---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/w365/First Laucn Behavior"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/In-Development%20Content/Outdated%3F%20-%20Needs%20review%20if%20still%20useful/w365/First%20Laucn%20Behavior"
importDate: "2026-04-06"
type: troubleshooting-guide
note: "Marked as Outdated - Needs review if still useful. Original title has typo: 'Laucn' instead of 'Launch'."
---

# W365 App First Launch Behavior

When user opens the app for the first time, they will get a prompt.

## Authentication & Connection Flow

1. User opens the W365 app.
1. User signs into W365 — this authenticates against **Graph API** to get the Cloud PC. This is a **different endpoint** from the AVD feed.
1. User hits **Connect** — downloads the web feed.
1. Connection starts.

## Key Technical Notes

- When the user hits the Connect button, the URI is constructed at that point (or just before).
- The app then calls **msrdcw.exe** with the AVD `.avd` file.
- The W365 app uses the AVD `.avd` file launch mechanism (similar to URI launcher) to initiate the remote session.
