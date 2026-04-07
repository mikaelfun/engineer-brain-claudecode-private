---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Processes/ICM Data Handling"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Engineer%20Reference/Processes/ICM%20Data%20Handling"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Escalation Data Handling Directives

## Purpose

Alignment between CSS and PG on PII data handling and sharing in relation to customer-related ICM incidents.

*Content reviewed and approved by: Larry Block and John Arnold*

---

## Data within the ICM Tool — Commercial & GCC Customers

Support escalations to Intune Engineering must route through ICM and include support data critical for the investigation. Including support data in an ICM raised through Intune is covered under the **Incident Response & Investigations variant of GDPR compliance**.

### Engineers ARE authorized to post support data in ICM for commercial/GCC tenant customers.
> National clouds (GCC-H/DoD/Fairfax) are **EXCLUDED** from the variant.

### Self-imposed restrictions — Do NOT post for ANY customer:
- Customer Personal Information (e.g. Address, Phone Number, Date of Birth)
- Fiscal Information (e.g. Bank details, payment card information)
- Passwords or authentication tokens of any kind *(exception: .HAR files are allowed zipped as attachments)*
- User Principal Name (UPN) *(must NOT be in ICM summary/discussion; efforts should be made to exclude from attachments; single UPN in logs or screen recording is an acceptable exception)*

### ICM child/parent scenarios
Data for a specific customer should stay within the ICM created for that customer, even if it becomes a child of another ICM.

### If not comfortable sharing data under the variant:
1. File the ICM without the concerning data points.
2. Reach out to your manager for further direction.

### Sharing files that cannot/should not be uploaded to ICM (Commercial & GCC):
Direct the PG engineer to access files through the **DTM workspace in DfM via the JIT process**.

> **Do NOT** share customer support files via: ODfB, Teams, screensharing, or any other vector than DTM.
> **Do NOT** add Intune PG members as contacts to support cases to make external DTM accessible.

### JIT Reference Links for PG:
- [JIT in DfM Summary](https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/471/JIT-JEA-in-DfM)
- [JIT Approver FAQ](https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/541/JIT-Approver-guide)
- [JIT Requestor FAQ](https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/617/JIT-Requester-guide)

---

## Data Handling for GCC-H/DoD/Fairfax Customers

### ICM data handling rules:
- **No attachments at all**
- **No UPNs**
- GUIDs are allowed (policyID, userID, deviceID, etc.)
- **Data redaction is the responsibility of the customer** — data sent to us should already be redacted before upload
- If data is sent directly to the service, send it back to the customer for redaction before engineering accesses it from DTM

### File storage and access:
- **DTM is the only approved tool** for storing customer support files for GCC-H cases
- DTM must not be bypassed to provide files to Engineering
- Engineering must have access to DTM or leverage the [GCC-H escort process](https://o365exchange.visualstudio.com/Enterprise%20Cloud/_wiki/wikis/Enterprise%20Cloud.wiki/352/O365-Escort-Policy-Procedure)
- **Do not use Teams, OneDrive, email, or any other vector than DTM to share files**

---

## References
- [Support Data in IcM's](https://supportability.visualstudio.com/ModernStack/_wiki/wikis/CSSUpdates/660925/Support-Data-in-IcM's)
- [Business Rule: Apps & Infra: Data Handling for Commercial Customer Scenarios](https://internal.evergreen.microsoft.com/en-us/topic/d0aee0c3-a98d-478f-9a4b-4b459a141f54)
