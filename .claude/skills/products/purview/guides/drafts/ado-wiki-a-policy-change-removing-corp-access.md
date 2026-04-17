---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Tools/Security Policies & AME  requirements for CSS delivery/Policy Change - Removing Corp Access to Geneva Actions"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTools%2FSecurity%20Policies%20%26%20AME%20%20requirements%20for%20CSS%20delivery%2FPolicy%20Change%20-%20Removing%20Corp%20Access%20to%20Geneva%20Actions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# dSTS Enforcement to Block Corp Access
Production Access Standard requires all access paths to be from secure identities like *ME/Torus. Secure Identity, Device and Network (Secure IDN) is a key principle of this standard requiring use of production identities and SAW devices for all access paths.

In light of the recent security incident [Midnight Blizzard](https://www.microsoft.com/security/blog/2024/01/25/midnight-blizzard-guidance-for-responders-on-nation-state-attack/), dSTS service will be blocking dSTS claims access for all Corp account (Microsoft.com). This dSTS enforcement roll out for Geneva Actions is planned to begin **3/31/2024** and complete by **4/30/2024** in all the dSTS Cloud environments noted below.

The enforcement will impact all Geneva Actions (GA) customers for all environments.

# What this Change means?
Every engineer who are identified as a user who has used dSTS claim using Corp account to execute one or more Geneva Actions operations in past 90 days OR you are the owner of an extension published in Geneva Actions. This will be impacting your use of Corp credentials to receive dSTS claim.

# What does this mean? What are the impacted scenarios?

This change is going to be enforced at the dSTS service level. Once enforced, dSTS will not issue any tokens to Corp credentials.

- Publishing new Geneva Actions Extensions packages with Corp credentials will be blocked for all Geneva Actions environments.
- Any Geneva Actions operation using Corp credentials will fail as dSTS will not provide tokens in the Geneva Actions environments.
- Users will be required to use production identities like *ME or Torus to publish new packages and receive claims to run existing operations since these production identities enforce SAW device, you will need to procure SAW machines for Geneva Actions operation execution.

## Geneva Actions environments in scope for this enforcement

Configurations for dSTS enforcement across various cloud environments (Test, Prod, Fairfax, MoonCake), with corresponding dSTS endpoints and Geneva Actions environments.

# What action is needed from me as Geneva Actions Extension owner?

Extension owners need to remove Corp Claim mappings for GA dSTS service accounts by 3/31 in dSCM.

# What action is needed from me as Geneva Actions user executing an operation?

After Corp claim mappings are removed, all Geneva Actions user will require production identities (*ME/Torus) with a SAW device to execute Geneva Actions operations.

# Support Contacts

For E+D services and users: Joel Hendrickson, Harry Kaur
For C+AI CSS / support scenarios: Chris Geisbush, Alok Kumar
For dSTS support questions: Krishan Veer, Thomas Knudson
For Azure Core services and dependencies: Sandeep Ramatarak

# Reference
- SAW / SAVM
- AME Access
