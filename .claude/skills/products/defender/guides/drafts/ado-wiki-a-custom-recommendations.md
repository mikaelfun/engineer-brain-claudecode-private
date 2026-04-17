---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations Platform/[Product Knowledge] - Custom recommendations"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20Platform%2F%5BProduct%20Knowledge%5D%20-%20Custom%20recommendations"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Defender for Cloud Custom Recommendations Management

## Summary

MDC custom recommendations feature launched April 2023. Initially available for AWS and GCP, now expanded to Azure.

## Key Points

- Custom recommendations allow tailoring security recommendations to specific organizational needs
- Useful for multi-cloud environments (AWS, GCP, Azure)
- Enhances security posture management with organization-specific standards

## Training Resources

| Date | Training | Doc | Presenter |
|------|----------|-----|-----------|
| 2023-04-04 | Deep Dive - MDC Custom Recommendations | [Create custom recommendations and security standards](https://learn.microsoft.com/azure/defender-for-cloud/create-custom-recommendations) | Yael Genut (PM) |

## Important Notes

- Custom recommendation data is NOT available in Azure Resource Graph (ARG)
- Cannot query this specific table from Azure Support Center
- If assisting a customer on a support case, export relevant results on DTM
- Related table: RawEntityMetadata

## Related Articles

- [Custom Recommendations - Create Or Update (REST API)](https://learn.microsoft.com/en-us/rest/api/defenderforcloud/custom-recommendations/create-or-update)
- [Creating custom recommendations & standards (Tech Community)](https://techcommunity.microsoft.com/blog/microsoftdefendercloudblog/creating-custom-recommendations--standards-for-your-workloads-with-microsoft-def/3810248)
