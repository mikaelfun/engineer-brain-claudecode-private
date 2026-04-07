---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Copilot/People Skills Management in MAC"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FCopilot%2FPeople%20Skills%20Management%20in%20MAC"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Feature Overview

People Skills is an AI-driven service that generates personalized skill profiles for users mapped to a customizable, built-in taxonomy. Included with **Microsoft 365 Copilot** or **Viva licenses**.

Key features:
- Personalized Skill Profiles
- AI-Driven Insights
- Skills Agent (find experts, understand colleague skills)
- Integration with Microsoft 365 and Viva

## Admin Controls in M365 Admin Center

Three management capabilities:

### 1. Turn off People Skills user experiences
- Disable for entire organization, user group subsets, or individual users
- Pilot to small group before broad rollout
- When turned off, all People Skills user experiences removed for that user

**Use cases:**
- Privacy/compliance in regulated industries or Workers Council regions
- Pilot control for limited audience
- Deployment flexibility during testing

### 2. Feature access management (no PowerShell needed)
Configurable settings in M365 Admin Center:
- **People Skills user experiences control** - on/off for selected users
- **AI inferencing control** - whether AI can generate skills for users
- **Profile visibility control** - whether skills are shared with others on M365 Profile card
- **Show AI Skills control** - whether AI-Generated Skills appear on profile
- **Show Imported Skills control** - allow/restrict imported (organization-added) skills

### 3. Import custom skills library
Upload custom Skills Library directly from local device.

## Licensing

| Service Plan | Eligible Licenses | Capabilities |
|---|---|---|
| People Skills - Foundation | M365 commercial (no Copilot license, excl. education/gov) | Search/add skills from taxonomy, profile editor. No AI inferencing. |
| People Skills - Advanced | Viva Suite, Viva Insights, Workplace Analytics, Viva Learning | Full service with AI inferencing, excl. Copilot experiences |
| M365 Copilot in Productivity Apps | M365 Copilot license (excl. education/gov) | Full service incl. AI inferencing and Copilot experiences |

## Case Handling

- **MAC management** of People Skills: supported by **M365 Identity** community
- **Feature usage/functionality**: supported by **CSS-SharePoint Online** teams
  - DfM SAP: **Microsoft Viva/People Skills**

## ICM Escalations

**Engineers:**
- Product: **M365 Admin Center**
- Team: **Manage User, Groups, and Domains**

**TA (IcM):**
- Owning Service: **Office 365 Admin Portal and Support**
- Owning Team: **Office 365 Admin**

## Public Documentation
- [Overview of People Skills](https://learn.microsoft.com/en-us/copilot/microsoft-365/people-skills-overview)
- [Set up People Skills](https://learn.microsoft.com/en-us/copilot/microsoft-365/people-skills-setup)
- [People Skills Import and Export](https://learn.microsoft.com/en-us/copilot/microsoft-365/people-skills-import-export-skills)
- [Manage your skills library](https://learn.microsoft.com/en-us/copilot/microsoft-365/people-skills-manage-skills-library)
