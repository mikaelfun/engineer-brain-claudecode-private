---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Defender for AI/[TSG] - Threat Protection for AI/[Guide] - Cost Estimation for Defender for AI"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FDefender%20for%20AI%2F%5BTSG%5D%20-%20Threat%20Protection%20for%20AI%2F%5BGuide%5D%20-%20Cost%20Estimation%20for%20Defender%20for%20AI"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Cost Estimation for Defender for AI

This guide walks you through two supported methods for estimating costs when using Defender for AI.

When you run the script, it queries token consumption metrics from your existing AI resources.

## Method 1: Use the Cost Calculator

Steps:
1. Go to **Environment Settings**
   - Open the Defender for Cloud portal.
   - In the left-hand menu, select **Environment settings**.

2. Open the **Cost Calculator**
   - In the Environment Settings page, locate and click on **Cost calculator**.

3. Add assets with script
   - In the calculator, choose the option **Add assets with script** to analyze actual configuration and usage data.

4. Download the PowerShell Script
   - Click **Download**

5. Run the PowerShell Script

6. Upload the Output File
   - Return to the portal and upload this file to the **Cost Calculator** interface.

## Method 2: Run Standalone PowerShell Script

You can also estimate costs manually using a public PowerShell script:
[AI Price Estimation Script GitHub Repository](https://github.com/Azure/Microsoft-Defender-for-Cloud/tree/main/Powershell%20scripts/AI%20Price%20Estimation%20Script)

- Clone or download the script locally.
- Follow the usage instructions in the repository's README.

---
| Contributor Name | Details | Date(DD/MM/YYYY) |
|--|--|--|
| Niv Azriel | Created | 07/07/2025 |
