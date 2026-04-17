---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Beta Resources - Pre-GA/Deployment/Integrated Virtual (PP2)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Beta%20Resources%20-%20Pre-GA/Deployment/Integrated%20Virtual%20%28PP2%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Integrated Virtual Deployment (HCI + Winfield) — PP2

Reference docs:
- SP folder: [Winfield-HCI-Integration](https://microsoft.sharepoint.com/:f:/r/teams/ASZ886/Shared%20Documents/Winfield-HCI-Integration)
- Solution and networking: [WinfiledOnAzureStackHCI.docx](https://microsoft.sharepoint.com/:w:/r/teams/ASZ886/Shared%20Documents/Winfield-HCI-Integration/WinfiledOnAzureStackHCI.docx)
- High-level steps: [Winfield and HCI.docx](https://microsoft.sharepoint.com/:w:/r/teams/ASZ/Shared%20Documents/Arc-A/Winfield%20and%20HCI.docx)
- HCI Changes deck: [Azure Stack HCI Changes.pptx](https://microsoft.sharepoint.com/:p:/r/teams/ASZ886/Shared%20Documents/Winfield-HCI-Integration/Azure%20Stack%20HCI%20Changes.pptx)
- ADO WI Query: [WinfiledHCIDeploymentIntegration](https://msazure.visualstudio.com/One/_queries/query/02f8dc94-6ef3-486f-881f-91dfbf3425cc)

## Standard 23H2 HCI Deployment Steps

1. Prerequisites
2. Prepare Active Directory
3. Download Azure Stack HCI
4. Install OS
5. Register servers with Arc (via registration script)
   - Downloads/installs extensions: Device Manager, Diagnostic/Telemetry, LCM Extension, Remote Support
   - First targeted node becomes seed node (usually node1)
   - Run Validator action plan
6. Deploy the cluster via ARM (portal or template) — runs same action plan either way

## Winfield Deltas (Changes on top of standard HCI)

Reference: [Winfield and HCI bootstrapping.pptx](https://microsoft-my.sharepoint-df.com/:p:/r/personal/hafianba_microsoft_com/Documents/Winfield%20and%20HCI%20bootstrapping.pptx)

Most changes occur in **Steps 4 and 5** above:

### 1. Prepare HCI
- DC Integration
- Identity Checklist
- Setup HCI Nodes

### 2. Deploy Winfield
- Acquire Winfield via Azure Portal
- Prepare HCI Seed Node
- Configure & Integrate Winfield

### 3. Deploy HCI Cluster
- Initialize HCI Nodes
- Create HCI Cluster
- View HCI Cluster in portal

### 4. Operate
- Enable users
- Operations
- User Scenarios
