---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Support Processes and Guidance/Processes and Collaboration/General Steps to get VM OS Dump from Azure Host (Deprecated)"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSupport%20Processes%20and%20Guidance%2FProcesses%20and%20Collaboration%2FGeneral%20Steps%20to%20get%20VM%20OS%20Dump%20from%20Azure%20Host%20(Deprecated)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# General Steps to get VM OS Dump from Azure Host (Deprecated)

## Scenario
CPC VM encounters bootup issue and customer requests RCA.

## Background
For bootup issues requiring VM OS dump analysis by Windows Guest OS team, since NMI is not available for CPC VM, VM OS dump from node is the alternative.

## Pre-requirements
1. Second DfM case for main RAVE case taken ownership
2. Customer consent to dump the Cloud PC for RCA

## Steps
1. Raise Sev 3 IcM to **Azure Incident Management/WASU** team with Node ID/Container ID/DfM case number
2. If VM not crashing, coordinate with customer to restart VM while WASU triggers dumping (remote session recommended)
3. Grant dump permission with DfM case owner and engage **WSD CFE/HCCompute-Guest OS Health** (SaaF/Dev) or **CSS Windows Support EE** (Intune Support) to analyze
