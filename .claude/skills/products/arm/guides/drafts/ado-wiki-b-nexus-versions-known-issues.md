---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Tools and Processes/Nexus versions in Known Issues work items"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Tools%20and%20Processes/Nexus%20versions%20in%20Known%20Issues%20work%20items"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Nexus Versions in Known Issues Work Items

_Last update: 23/03/2026_

## Nexus Versioning Complexity

Azure Operators Nexus is composed of two main resource providers:
- **Microsoft.NetworkCloud** (aka NC)
- **Microsoft.ManagedNetworkFabric** (aka NF or NNF)

Each release includes code changes for one or more components, each with individual versions.

## Version Convention for Known Issue Work Items

When creating a new known issue work item, fill the version fields as follows:

- **Tag:** The overarching affected Nexus build version(s) as communicated to AT&T via the release notes, e.g.: **2511.1**, **2602.1**.
- **Fixed In Build:** The overarching Nexus build version as communicated to AT&T via the release notes, e.g.: **2603.1**.
- **Fixed In Version:** The detail about the component (and its version) within the Nexus build that actually contains the fix, e.g.: **NC 4.9 management bundle**, **NNF 11.0 management bundle**, **NC 4.9.2 runtime**, **NF 8.0.0 runtime**, etc.

**Note:** If the known issue has not yet been fixed, set the `Resolution Status` to either `Pending` or `On Track`, leave the `Fixed in Build` field empty and set the `Fixed In Version` to `TBD`.

## References
- [Release Versioning - Overview](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_wiki/wikis/AzureForOperatorsIndustry.wiki/10165/Release-Versioning)
