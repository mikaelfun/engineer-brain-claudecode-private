---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/Archived Content/Overview/Where things happen"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/Archived%20Content/Overview/Where%20things%20happen"
importDate: "2026-04-05"
type: reference-guide
---

# Windows 365 Link - Where Things Happen (OOBE Flow)

## Out of Box Experience (OOBE)

### 1. Authenticate & Join (Entra)
- Interactive Auth with Device Registration
- Service obtains Token for user
- Conditional Access evaluation

### 2. Enroll in Management (Intune)
- MDM enrollment

### 3. Connect to W365 Infrastructure (Entra)
- Non-interactive auth with Gateway and Broker services
- Reuses login token

### 4. Connect to Cloud PC (W365)
- RDP, Reverse Connect
- SSO to Cloud PC
