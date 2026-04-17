---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/How Tos/Find The Service Team Owner of a Blade or Extension_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Advisor/How%20Tos/Find%20The%20Service%20Team%20Owner%20of%20a%20Blade%20or%20Extension_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Summary
Not all blades inside Azure Advisor are owned by the Azure Advisor team, especially the Recommendation blade. Some blades/extensions are owned by the respective Service team and Advisor just calls that blade.

## Instructions
1. Open the Azure Advisor blade
2. Navigate to the blade you want to find the owner of by clicking on the recommendation
3. Press **Ctrl+Alt+D**
4. The yellow box will indicate the owner of the blade

## Key Point
Support for these blades is owned by the team that currently supports the service (e.g., Security team owns and supports the Security blade).
