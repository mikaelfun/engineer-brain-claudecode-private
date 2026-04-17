---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Conditional Access Bootstrap Scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FConditional%20Access%20Bootstrap%20Scenarios"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Summary

There are specific authentication flows that due to its nature, are required to be exempted from CA policies to prevent a circular dependency (chicken-and-egg scenario) that would not be possible to surpass.
Such scenarios include:

**Device registration** (Azure AD Device Registration. Application ID 01cb2876-7ebd-4aa4-9cc9-d28bd4d359a9)

**Microsoft Mobile Application Management** (MAM setup related. Application ID 0a5f63c0-b750-4f38-a71c-4fc0d58b89e2 OR Application ID b642c013-22f8-419d-af11-8f0e05b795e6)

**Intune Check-In** (Intune Specific service. Application ID 26a4ae64-5862-427f-a9b0-044e62572a4f)

**Multi-Factor Auth Connector** (Application ID 1f5530b3-261a-47a9-b357-ded261e17918)

Aside from the above bootstrap scenarios, there is also a list of other exemptions that can occur based on the Client App, Resource Scopes and CA Controls.

Such scenarios are defined under ESTS Configuration Settings and the details can be found under the setting:
**MapOfApplicationToScopesPerResourceThatCanSkipConditionalAccessControls**

The format of the settings is:
| **Client App ID** | **Resource App ID** | **"Item1"** which contains the scopes exempted | **"Item2"** which contains the CA controls exempted |

Example:
**"dd47d17a-3194-4d86-bfd5-c6ae6f5651e3"**: {
  **"a0e84e36-b067-4d5c-ab4a-3db38e598ae2"**: {"Item1":["events.write", "openid", "profile", "offline_access"], "Item2":["RequireApprovedApp", "RequireCompliantApp", "RequireCompliantDevice"]},
  "3afd41a1-c4e5-4e8f-b733-dab74edb2add": {"Item1":["events.write", "openid", "profile", "offline_access"], "Item2":["RequireApprovedApp", "RequireCompliantApp", "RequireCompliantDevice"]},
  "ea2d4f09-38ea-4322-9669-bd94a93d400a": {"Item1":["events.write", "openid", "profile", "offline_access"], "Item2":["RequireApprovedApp", "RequireCompliantApp", "RequireCompliantDevice"]},
  "d5956d1e-7a1d-4986-ab77-775c7d437352": {"Item1":["events.write", "openid", "profile", "offline_access"], "Item2":["RequireApprovedApp", "RequireCompliantApp", "RequireCompliantDevice"]},
  "e724aa31-0f56-4018-b8be-f8cb82ca1196": {"Item1":["heartbeat.write", "openid", "profile", "offline_access"], "Item2":["RequireApprovedApp", "RequireCompliantApp"]}
}

Explanation:
- **dd47d17a-3194-4d86-bfd5-c6ae6f5651e3** — Client App "Microsoft Defender for Mobile" is exempted when calling the following Resource
- **a0e84e36-b067-4d5c-ab4a-3db38e598ae2** — "Xplat Broker GCC-Moderate" Resource exempted
- **"events.write", "openid", "profile", "offline_access"** — Scopes exempted
- **"RequireApprovedApp", "RequireCompliantApp", "RequireCompliantDevice"** — CA Controls exempted

## How to identify a Bootstrap scenario?

If any of the identified applications are being used, most likely we're in the presence of a bootstrap scenario. In addition logging insights can be very helpful:

**a)** Under "CA Diagnostic (New)" Tab (ASC Troubleshooter) an entry will exist stating:
"**Skipping conditional access evaluation for token audience: <AppID>, because <Scenario> is considered a bootstrap scenario**"
The same information will also be available under Diagnostic Traces logs.

**b)** Under **PerRequestLogs** and **Diagnostic Traces** it's possible to observe that "**MultiCAEvaluationLog:**" and "**Multi CA Policy evaluation log:**" respectively will not present any information (will be empty or non-existent).

## What should we do in a Bootstrap scenario?

If we are working on a Customer's incident, we should explain that under such scenarios it's expected that no Conditional Access policies will be evaluated nor applicable to avoid user's being blocked even before they're capable of complying with the requirements established by the Conditional Access policy controls. Since such scenarios are related to initial setup, the impacts related to security posture are neutral.
