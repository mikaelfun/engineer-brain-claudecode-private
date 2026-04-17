---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Process Documentation/Global Processes/Migration to Incident Management (IcM)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FProcess%20Documentation%2FGlobal%20Processes%2FMigration%20to%20Incident%20Management%20(IcM)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Migration to Incident Management (IcM)

## Overview

The Migration involves transitioning from Azure DevOps (ADO) to the Incident Management (IcM) tool. This migration aims to enhance security, streamline processes, and align with Microsoft's broader strategy.

**DO NOT COMMENT ON ANY BUG, OR ADO, RAISE BY PG!!! ALL COMMUNICATION RELATED TO THE ISSUE ARE DONE WITHIN IcM RAISED BY SUPPORT**

## Purpose of Migration
### Escalation Tool Migration

- **Azure DevOps (ADO) to IcM**: The shift to IcM is designed to enhance security protocols and better protect customer information during escalations.
- **Enhanced Security**: Moving to IcM will streamline our escalation processes, making them more efficient and effective for team collaboration.
- **Alignment with Strategy**: This transition aligns with Microsoft's broader strategy to phase out ADO from customer escalation management for improved service.

## Migration Details
### Migration Date
- The migration to IcM will officially begin on **April 1st, 2025**. This date marks a significant change in our escalation process.

### Handling Escalations
- Starting April 1st, 2025, all new escalations will be managed using the IcM v2 system.
- All communication and information will be managed in IcM v2 only.
- Do not change the severity of the escalations.
- For more details on how to raise escalation in MDO please follow the Escalation Guide for Engineers.

### Escalation Paths Available in IcM
- **Exchange Online/MDO Escalations [CFL/PSI/CRITSIT ONLY]**: Severity 2 IcM
- **Exchange Online/MDO Escalations [ISSUE/RFC/DCR]**: Severity 3 IcM
- **Exchange Online/Analysts (FPFN)**: Severity 2 (CFL/PSI/CRITSIT ONLY) and Severity 3 IcMs (ISSUE/RFC/DCR)

**Note:** In Assist 365 we will continue to go to EXCHANGE ONLINE. Example: Exchange Online/MDO Escalations [CFL/PSI/CRITSIT ONLY]

The severity is initially set to the IcM depending on the chosen path. EEE and/or Engineering teams will triage and assign all MDO Escalations. There will be no migration from ADO to IcM for previous escalations. Current escalations will continue to be managed within the ADO environment, ensuring they are monitored until they are resolved.

## How to Raise Severity for Ongoing Escalations

1. **Approval from Technical Advisor**: Obtain necessary approval from a Technical Advisor to escalate the issue to CFL (or PSI if impacting multiple Tenants).

2. **Create CFL Escalation**: Once approval is secured, create a new Incident Management escalation at Severity 2 (CFL) to address the Critical Functionality Loss. Mention the previous IcM on the CFL and close the previous IcM mentioning the CFL IcM.

### Manual IcM Raising Severity 3 Escalations

- When addressing FP/FN cases, Antispam Analysts can manually raise an IcM in the system for resolution.
- The research team is capable of handling escalations 24/7, hence they are available to address any high-impact escalation.
