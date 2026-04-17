---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Defender for DevOps/[Product Knowledge] - Overview of Defender for DevOps"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FDefender%20for%20DevOps%2F%5BProduct%20Knowledge%5D%20-%20Overview%20of%20Defender%20for%20DevOps"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview of Microsoft Defender for DevOps

## Overview

Microsoft Defender for DevOps, available in Microsoft Defender for Cloud (MDC), empowers security teams to manage DevOps security across multi-pipeline environments (GitHub, Azure DevOps).

Key capabilities:
- **Unified visibility** into DevOps inventory and security posture of pre-production application code (code, secret, OSS dependency vulnerability scans).
- **IaC and container image security** to minimize cloud misconfigurations reaching production.
- **Pull Request annotations** and developer ownership assignment for prioritized remediation.

Reference: [Overview of Microsoft Defender for DevOps](https://learn.microsoft.com/azure/defender-for-cloud/defender-for-devops-introduction)

## CSS Engagement Process

1. For DevOps connector: [DevOps extension](https://marketplace.visualstudio.com/items?itemName=ms-securitydevops.microsoft-security-devops-azdevops) is required.
2. For GitHub connector: [GitHub Action](https://github.com/microsoft/security-devops-action) is required.
3. MDC Environment connector is required.
4. Connector authorization is required with customer credentials.
5. **Recommendations are NOT Policy based — they are API based.**
6. Default escalation: Use the standard IcM template (creates IcM with the right template for the larger team).
7. If issue is specifically with Defender for DevOps **Clients**: escalate to "Microsoft Defender for Cloud/Guardians" using [this template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=V1x254).
   - For Extension/Action issues: request Build Logs and attach to IcM.

## CSS Training

| Date | Session recording | Documentation | Presenters |
|---|---|---|---|
| Sep 27, 2023 | Deep Dive - DevOps Hardening for ADO and GitHub | DevOps Hardening Overview CSS.pptx | Lara Godstein |
| Oct 6, 2022 | Microsoft Defender for DevOps CSS training | CSS Documentation of Defender for DevOps.docx | Sukhandeep Singh, George Wilburn |
