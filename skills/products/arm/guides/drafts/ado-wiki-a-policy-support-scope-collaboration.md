---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Process/Support scope and collaboration scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FProcess%2FSupport%20scope%20and%20collaboration%20scenarios"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Support scope
Azure Policy support team scope includes:
- Azure Policy portal blades*.
- Policy evaluation engine.
- Policy dataplane engine.
- Policy definitions, assignments, exemptions and initiatives.
- Remediation tasks.
- Microsoft.PolicyInsights RP.
- Policy assignment managed identities.
- PowerShell cmdlets, CLI commands, SDKs and REST APIs for all the above.

 > (*) Compliance details blade for Guest Configuration policies is supported by the Guest Configuration team.

# Collaboration scenarios
## Products with integration to Azure Policy
There are a few teams with collaboration scenarios to consider:
- [Microsoft Defender for Cloud](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623672/)
- [Azure Kubernetes Services and Azure ARC enabled Kubernetes](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623664/)
- [Azure Key Vault](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623669/)
- [Guest Configuration policies (supported by the Azure Monitor pod)](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623668/)
- [Azure Virtual Network Manager](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623667/)

## Common resource provider collaboration scenarios
### Policy authoring
There will be scenarios when authoring a custom policy, where we are not sure what values a specific property supports, or if the property is valid under certain scenarios or how to map the UI behavior to the API behavior. The authoring of the policy still belongs to the Azure Policy team, but if you have any questions about how a specific RP behaves, feel free to engage them on a collaboration to ask any questions.

### Compliance
Azure Policy determines compliance based on what the resource provider returns, (see [[ARCH] How effects work](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623661/)), therefore if their API is not returning the expected payload, we would need to engage the RP CSS team so they can escalate the issue to their PG.

### Aliases
Policy generates aliases based on what RPs declare on their swaggers. On most of the cases we will open an IcM so that Policy PG can tell us what is missing on the RP side, and that IcM might get transferred directly to the RP, but if it is a known issue and we know why the alias does not exist, there is no point in escalating to Policy PG, we can open a collaboration with the affected product directly.

> Collaboration is not limited to the scenarios described here, other teams might collaborate with us for scenarios beyond the ones described above, or we might need to collaborate with them for other scenarios. This is meant to be a guide only.
