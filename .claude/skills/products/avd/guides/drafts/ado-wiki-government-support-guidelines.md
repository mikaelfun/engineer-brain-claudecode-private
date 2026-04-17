---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Government/PLEASE READ IMPORTANT: For ALL Government support"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FWindows%20365%20Government%2FPLEASE%20READ%20IMPORTANT%3A%20For%20ALL%20Government%20support"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Government Support Rules

- Enterprise only
- Until further notice Windows 10 only. No Upgrade path.

## Escort Sessions

While the rule is anyone can open an Escort session, until further notice we will send Dev the ICM to open the Escort session. Reasons:

1. **Escort Sessions are not transferrable.** If the SaFF team opens an Escort session to look at Kusto or ASC and they need to transfer the case to Dev, they cannot paste the Kusto Query or the data in the ICM. Dev would need to open an escort session and start from scratch. We will transfer an ICM that we receive to Dev and contact the OCE.
2. **Intune model.** Intune has been using this model successfully and we have opted to use their model.
3. **Data breach risk.** It is very easy to accidentally dig too far or step out of bounds which would result in a data breach. This would be very costly to Microsoft and we could lose accreditation for Gov support altogether. Gov issues are audited often and the primary thing they are looking for is data breaches.

## Kusto

- Gov Kusto queries cannot go into our Dashboard.
