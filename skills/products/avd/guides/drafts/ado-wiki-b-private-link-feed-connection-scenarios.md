---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/PL/Scenarios"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FSandbox%2FIn-Development%20Content%2FOutdated%3F%20-%20Needs%20review%20if%20still%20useful%2FPL%2FScenarios"
importDate: "2026-04-06"
type: troubleshooting-guide
note: "Sandbox/In-Development content — may be outdated. Review before using."
---

# AVD Private Link — Feed & Connection Scenarios Matrix

> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.

Use `IsClientPrivateLink` and `IsSessionHostPrivateLink` columns from ASC Connection Errors tab / Workspace Feed tab to determine the active scenario.

## Feed Matrix

| IsClientPrivateLink | Feed will use private link |
|--|--|
| True | YES |
| False | NO |

### Feed Scenarios

**Scenario 1: IsClientPrivateLink = True**
- The client computer can talk to AVD service using private endpoint
- If feed fails to download → create ICM

**Scenario 2: IsClientPrivateLink = False**
- The client computer cannot talk to AVD service using private endpoint
- Investigate DNS resolution and private endpoint connectivity on the client

## Connection Matrix

| IsClientPrivateLink | IsSessionHostPrivateLink | Connection will use private link |
|--|--|--|
| True | True | YES |
| True | False | NO |
| False | True | NO |
| False | False | NO |

### Connection Scenarios

**Scenario 1: Both IsClientPrivateLink AND IsSessionHostPrivateLink = True — but connection not using private link**
- If both flags are True but connection isn't using private link → **reboot VM once and retry**
- If after reboot both flags still True but connection still not using private link → **create ICM**

**Scenario 2: IsClientPrivateLink: True | IsSessionHostPrivateLink: False**
- Client can talk to AVD via private endpoint, but session host cannot
- On **session host**: verify DNS records resolve correctly
- If DNS incorrect → send collab to `Azure\Azure Private Link\Private Endpoints\Issues with connectivity and DNS configuration`

**Scenario 3: IsClientPrivateLink: False | IsSessionHostPrivateLink: True**
- Session host can talk to AVD via private endpoint, but client computer cannot
- On **client computer**: verify DNS records resolve correctly
- If DNS incorrect → send collab to `Azure\Azure Private Link\Private Endpoints\Issues with connectivity and DNS configuration`

**Scenario 4: IsClientPrivateLink: False | IsSessionHostPrivateLink: False**
- Neither client nor session host can talk to AVD via private endpoint
- **Verify host pool** has been configured with a private endpoint
- If no private endpoint configured and customer needs help setting up → send collab to `Azure\Azure Private Link\Private Endpoints\Configure, Set up, or Manage`
