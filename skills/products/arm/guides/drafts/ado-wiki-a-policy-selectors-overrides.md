---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Architecture/Selectors & Overrides"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FArchitecture%2FSelectors%20%26%20Overrides"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> General Availability

## Introduction
Selectors and overrides are additional properties that can be configured on exemptions and assignments. 

Selectors provide functionality to roll out an assignment or exemption based on conditions, like locations or resource types.

Overrides provide functionality to make the policy behave in a different way than the one it is configured, like using another effect instead of the one that is provided on the definition. They can be used together with selectors so that the override is applied only to the users affected by the selector.

- See [[LEARN] Azure Policy assignment structure - Resource selectors](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/assignment-structure#resource-selectors) for information on how to use **selectors** on **policy assignments**.
- See [[LEARN] Azure Policy assignment structure - Overrides](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/assignment-structure#overrides) for information on how to use **overrides** on **policy assignments**.
- See [[LEARN] Azure Policy exemption structure - Resource selectors (preview)](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/exemption-structure#resource-selectors) for information on how to use **selectors** on **policy exemptions**.
