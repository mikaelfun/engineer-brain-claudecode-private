# AVD W365 Government (GCC/GCCH) - Quick Reference

**Entries**: 11 | **21V**: partial
**Keywords**: aadj, anc, autopatch, brazil-south, byon, capacity, connectivity, cookies
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Cannot enroll AVD session hosts to Microsoft Intune in Azure Mooncake (China). I... | Microsoft Intune management for AVD session hosts is only supported in Azure Pub... | No officially supported method in Mooncake. Unsupported workaround: manually dis... | 🟢 8.5 | OneNote |
| 2 📋 | Cannot purchase or activate W365 FedRAMP licenses after removing GCC licenses; C... | Mutual exclusivity of GCC and FedRAMP offerings at tenant level; Commerce system... | Wait 72+ hours after GCC license deletion. Verify GCC licenses fully removed. Pu... | 🔵 7.5 | ADO Wiki |
| 3 📋 | GCCH government customers using web clients (especially Safari) cannot connect t... | microsoft.us cookies are treated as third-party cookies in web browsers. Safari ... | Work with administrator to unblock 3rd party cookies for microsoft.us domain at ... | 🔵 6.0 | ADO Wiki |
| 4 📋 | Windows 365 Government Cloud PCs cannot be configured on Microsoft Dev Box | Dev Box is an unsupported environment for Windows 365 Government offerings | Dev Box is not supported for Government Cloud PCs. This is documented at https:/... | 🔵 6.0 | ADO Wiki |
| 5 📋 | W365 Enterprise for GCC customers see Autopatch/Additional Services UX in provis... | Autopatch/MMD only supports commercial licenses and tenants; not applicable for ... | Select 'None' for Additional Services option to continue creating the provisioni... | 🔵 6.0 | ADO Wiki |
| 6 📋 | Logs too large for ICM attachment limit when working with Government Cloud PCs; ... | ICM has attachment size limits; PG does not have DFM access | Add PG/Dev directly to DTM workspace and share DTM URL in ICM. See guides/drafts... | 🔵 6.0 | ADO Wiki |
| 7 📋 | GCC customer reports loss of access to Windows 365 Portal (IWP) | Windows 365 Portal deprecated for GCC, GCC support now built into Windows App | Expected planned deprecation. Use Windows App instead. No migration required. | 🔵 6.0 | ADO Wiki |
| 8 📋 | Customer requests Windows 365 Cloud PC provisioning in Brazil South region but r... | Brazil South is a restricted region for Windows 365; provisioning requires Busin... | Direct customer to their Microsoft Account Team for approval process. If custome... | 🔵 6.0 | ADO Wiki |
| 9 📋 | Windows 365 customer wants to deploy Cloud PCs in a restricted region (e.g., US ... | Certain regions are restricted for Windows 365 provisioning; MHN deployments are... | Option 1 (ANC/BYON): If customer has existing resources in the restricted region... | 🔵 6.0 | ADO Wiki |
| 10 📋 | Windows 365 provisioning fails in West Europe with error: Please use only suppor... | West Europe data center capacity restrictions due to physical space limitations ... | 1) New customers: MHN policy hides WEU region; ANC referencing WEU shows Unsuppo... | 🔵 6.0 | ADO Wiki |
| 11 📋 | Unable to get federation from any specified endpoint when connecting to GCCH Kus... | Missing PME account setup, YubiKey not configured, Windows Hello not set up, or ... | Ensure: 1) PME account with YubiKey configured, 2) Windows Hello set up on physi... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: Microsoft Intune management for AVD session hosts `[Source: OneNote]`
2. Check: Mutual exclusivity of GCC and FedRAMP offerings at `[Source: ADO Wiki]`
3. Check: microsoft.us cookies are treated as third-party co `[Source: ADO Wiki]`
4. Check: Dev Box is an unsupported environment for Windows `[Source: ADO Wiki]`
5. Check: Autopatch/MMD only supports commercial licenses an `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-government.md#troubleshooting-flow)
