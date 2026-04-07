---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Business/RMM Integration"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FWindows%20365%20Business%2FRMM%20Integration"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# RMM Integration

The RMM integration with Windows 365 Business enables MSPs and customers to easily install partners RMM to their Cloud PCs. The RMM integration streamlines agent installation across new and existing Cloud PCs using Microsoft Graph APIs, reducing manual effort and enabling MSPs to manage endpoints efficiently.

## Windows 365 partner integration supported scenarios

| Partner | Supported Product | Supported service plans |
| --- | --- | --- |
| NinjaOne | NinjaOne RMM | Business |

While scenarios not listed here might still work in customers production environment, they are not supported by Microsoft.

## Set up NinjaOne RMM for Windows 365 Business

1. Fulfill requirements
2. Turn on the Citrix connector in Intune
3. Connect Microsoft Entra ID to Citrix Cloud
4. Configure Citrix Workspace
5. Connect Windows 365 to Citrix Cloud
6. Assign Citrix licenses to users
7. Provision Cloud PCs

## CSS Guideline - RMM Integration

### Potential partners wanting to integrate with Microsoft

Requirements:
1. Offer an RMM solution
2. Be in good standing (no known security breaches, good financial standing)
3. Have signed a collaboration agreement with Microsoft

Contact: bgiammona@microsoft.com

## Support Boundaries

- If customer issue is related to provisioning or there is an issue with the Business Cloud PC -> MSFT support will troubleshoot
- Case escalation for RMM integration issues -> redirect to NinjaOne support team
- If Cloud PC is provisioned, in an accessible state, and passes basic connectivity checks -> customer should open a support case with NinjaOne directly
- NinjaOne is responsible for the support experience but may reach out to Windows 365 Product via support collaboration email

## Resources
- [QA Training](https://platform.qa.com/learning-paths/windows-365-w365-feature-rmm-integration-1854-17244/)
