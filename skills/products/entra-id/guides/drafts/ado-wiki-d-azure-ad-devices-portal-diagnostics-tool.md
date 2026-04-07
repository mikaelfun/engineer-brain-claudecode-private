---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Azure AD Devices Portal Diagnostics Tool"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FAzure%20AD%20Devices%20Portal%20Diagnostics%20Tool"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD Devices Portal Diagnostics Tool

**Tags**: AAD, AAD-Devices, AAD-Workflow, AzureAD

## Summary

The **Windows 10 device registration troubleshooter** is available under **Azure Active Directory → Devices → [Diagnose and solve problems](https://portal.azure.com/#view/Microsoft_AAD_Devices/DevicesMenuBlade/~/SupportTroubleshoot/menuId~/null)** blade.

The tool instructs customers on how to collect client logs, analyze them, and suggests remediation steps for device-related issues.

## Customer Flow

1. Click **Windows 10 released issue** tile
2. Click the *instructions* link to open fly-out panel with steps to download and collect Auth.zip logs
   - Auth.zip contains `start-auth.ps1` and `stop-auth.ps1` scripts
   - Results packaged into `.cab` file in `.\authlogs` folder
3. Click **Browse** → select the `.cab` file → **Open** to upload
   - **NOTE**: File uploads > 150 MB will fail
4. Back-end service evaluates the logs and returns results

## Support Incident Integration

When customer creates a support request under **Devices** → *Azure\Azure Active Directory Directories, Domains, and Objects\Devices*:
- Troubleshooter appears under **Recommended solutions**
- Selecting **Windows 10+** from OS drop-down exposes the same auth log collection flow
- If logs were submitted via Diagnose & Solve, customer will be prompted: *"We see that you just uploaded your logs... Would you like to use those logs for your support request?"*

## Teams Support Channel

For queries: [Cloud Identity - Authentication - Device Registration](https://teams.microsoft.com/l/channel/19%3A6a1fbf7b37bb407fa092ae6ebfff16a5%40thread.skype/Device%20Registration?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

Also email: DevicesInAADCore@microsoft.com

## Retrieving Diagnostics from ASC (for Support Engineers)

When customers run the device registration troubleshooter during support incident creation:

1. In ASC → select **Devices** → **Customer Run Diagnostics**
2. Click **Run** to retrieve a table of all instances run in the last 30 days
3. Download results via the **Download link** under the **LogFile** column

## ICM Path

If the script does not accurately detect something, or if there are issues with diagnostic log collection through the portal:

- Use [this ICM template](https://portal.microsofticm.com/imp/v3/incidents/cri?tmpl=J181X1) to create an ICM for TA review
- **Owning Service**: ADRS
- **Owning Team**: Triage

## Training

- **Title**: Deep Dive 06412 - Windows 10 Troubleshooter
- **Course ID**: S9244774
- **Format**: Self-paced eLearning, 58 minutes
- **Link**: [SuccessFactors](https://aka.ms/AAhvlxb)
