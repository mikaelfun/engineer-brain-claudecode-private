---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Process Documentation/Global Processes/Preparing for EU Data Boundary"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FProcess%20Documentation%2FGlobal%20Processes%2FPreparing%20for%20EU%20Data%20Boundary"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Requirements prior to EU Data Boundary

## What is EU Data Boundary?

European Union Data Boundary (EUDB) is being implemented for cloud services in the Commercial Support Business. As part of Microsoft's commitment to enable EU commercial and public sector customers to store and process all their data within EU boundaries.

More info: [EU Data Boundary - Microsoft Learn](https://learn.microsoft.com/en-us/privacy/eudb/eu-data-boundary-learn)

## Changes Impacting Support Engineers

1. **DfM-EU**: EU-version of DfM ensures support data is stored in the EU data boundary
2. **AVD (Azure Virtual Desktop)**: CSS employees will use EUDB AVD or SAW to access customer data
3. **Data Handling**: Support follows EUDB data handling guidelines

## How to Prepare

### Scenario 1: Connect to Assist365 using RD inside the VM

1. Request [Core Identity Access](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/eudbavd-4wsd)
2. Log out of Remote Desktop app (three dots > About > Reset)
3. Click Subscribe
4. Log in with @microsoft.com account
5. Open the EU Data Boundary VM under Microsoft Virtual Desktop

Within the VM, access DfM EU & DfM WW via Edge. For Assist365:
1. Open Remote Desktop (in the VM)
2. Subscribe with URL: `https://rdweb.wvd.microsoft.com/api/arm/feeddiscovery`
3. Log in using Modern Identity (MID) credentials & YubiKey
4. Access Gladiator and pin for easy access

### Scenario 2: Connect to Assist365 from local machine

Two Remote Desktop instances may be needed:
- 1 from app store for VMs
- 1 x64 for Assist and DfM

Rename the x64 shortcut to distinguish them.

**Important**: Cannot copy/paste from VM. Workaround: Log in to Teams & Outlook within VM using FTE account.

**Important**: Ensure Edge profile is synced with the same Microsoft account.

## Timeline

- September 30: Internal CSS Go Live & capability readiness
- November 11: External communicated EUDB effective date

## Access Issues

If unable to access DfM EU:
- **User provisioning issue**: Manager updates AMT User
- **Inactivity lockout**: Manager confirms AMT Profile
- **Other issues**: Create ticket with [EUS](https://aka.ms/EUS)
- DfM EU has same features as DfM WW; retake [core DfM trainings](https://aka.ms/dfmtraining) if needed

## Can I CC my @microsoft.com email in DfM?

Yes, you can CC your FTE alias to communicate with customers from Outlook.

## Resources

- [Session: EUDB](https://platform.qa.com/resource/european-union-data-boundary-eudb-implementation-session-2-1854/?context_id=14886)
- [CSS Planned Event - EUDB](https://microsoft.sharepoint.com/teams/CSSCommandCenter957/)
- [Training resources](https://aka.ms/eudbtraining)
- [EUDB FAQ](https://internal.evergreen.microsoft.com/en-us/topic/484ff0c9-2d7a-46cd-93cc-0f32540cc09e#bkmk_faq)
- [DfM EU FAQ](https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/563/DfM-FAQ)
