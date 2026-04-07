---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Copilot/Microsoft 365 Copilot"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FCopilot%2FMicrosoft%20365%20Copilot"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Overview

Microsoft Copilot for Microsoft 365 is an AI-powered tool integrated into Microsoft 365. It utilizes artificial intelligence to understand context and user needs and provide suggestions and recommendations to boost productivity. Copilot analyzes documents, emails, meetings, and other content a user interacts with.

Key capabilities:
- **Search and retrieval** - identifies useful data and content sources
- **Natural phrasing with LLMs** - generates natural recommendations based on situation
- **Refines recommendations** - evaluates and delivers most relevant suggestions

## Manage Microsoft Copilot for Microsoft 365

Managed through the Microsoft 365 admin center Copilot page.

**Prerequisites:**
- Organization must have purchased **Copilot licenses** (admin account doesn't need one, but licenses must exist in org)
- Must be a **Global Administrator** to access the Copilot page

**Navigation:** Sign in to M365 admin center > Left navigation > Copilot

## Manage Copilot in Bing, Edge, and Windows

Copilot with commercial data protection is on by default for users with eligible licenses signed in with Entra ID accounts.

**PowerShell control steps:**
1. Download the [PowerShell script](https://download.microsoft.com/download/8/9/d/89d41212-7ece-414c-b6d3-f4ecb070c613/ConfigureM365Copilot.ps1)
2. Open Windows PowerShell as admin
3. Run: `Set-ExecutionPolicy unrestricted`
4. Run the script and follow prompts
5. Sign in with Search Admin or Global Admin Entra ID account
6. Get status: `.\ConfigureM365Copilot.ps1`
7. Enable: `.\ConfigureM365Copilot.ps1 -enable $true`
8. Disable: `.\ConfigureM365Copilot.ps1 -enable $false`

## Manage Plugins

Plugins extend Copilot by connecting to external data sources. Control via Integrated App settings in admin center.

## Licensing

Commercial data protection is available for eligible licenses:

**Enterprises:**
- Microsoft 365 E3 or E5
- Microsoft 365 F1 or F3
- Microsoft 365 Business Standard, Premium, or Basic
- Microsoft 365 Apps for enterprise or business
- Office 365 E1, E1 Plus, E3, or E5

**Education (faculty and higher ed 18+):**
- Microsoft 365 A1, A3, or A5
- Office 365 A1, A3, or A5 (A1 Plus NOT eligible due to retirement)

**Not available for:**
- Government cloud customers
- K-12 students

## Web Content Access

Separate control from commercial data protection. Allows enabling/disabling Copilot's ability to access public web for latest information in prompt responses.
