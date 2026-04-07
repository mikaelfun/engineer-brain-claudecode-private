---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DFSR/Workflow: DFSR: Unknown Solution Investigation"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDFSR%2FWorkflow%3A%20DFSR%3A%20Unknown%20Solution%20Investigation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# DFSR Unknown Solution Investigation — Troubleshooting Methodology

## Overview

Comprehensive troubleshooting methodology for DFSR (Distributed File System Replication) issues, including scoping, data collection, and step-by-step analysis.

## Data Collection

Collect TSS SDP data on members of the replication group. If many members, select a few with issues and a few without.

Deeper analysis may require:
- Increasing debug log severity to level 5
- Collecting performance logs
- Collecting network traces between members
- Collecting process dumps of dfsrs.exe (only with EE/SME direction)
- Collecting full memory dumps (only with EE/SME direction)

> **WARNING**: Do NOT just reset DFSR databases. Absent quantified data indicating database issues (2104 events with extended errors), resetting is not warranted. It can have devastating consequences. This last resort needs qualification by debug log analysis. If running out of ideas, engage a DFSR SME.

## Step 1: Is DFSR Service Running?

Ensure the DFSR service is running. If it cannot start or starts with errors/warnings, resolve that first.

## Step 2: SYSVOL or Other RG/RF?

Determine if the issue is in SYSVOL or another Replication Group/Replicated Folder. SYSVOL requires special treatment.

## Step 3: SYSVOL Troubleshooting

SYSVOL contains GPT (Group Policy Template) part of all GPOs, replicated among all DCs.

**Common symptoms:**

1. **Group Policy application failure** — error message suggests missing files:
   ```
   The processing of Group Policy failed. Windows attempted to read the file
   \\company.com\SysVol\company.com\Policies\{GUID}\gpt.ini from a domain controller
   and was not successful.
   ```

2. **Incorrect policy settings** — policies applied but settings wrong or missing.

**Data collection for both symptoms:**
- Network trace, Process Monitor log, gpsvc debug log while running `gpupdate /force`
- For symptom 2: additionally collect gpresult log

**Analysis steps:**
1. Determine the DC the client connects to
2. Compare SYSVOL folder contents across DCs using Robocopy:
   ```
   ROBOCOPY \\FileShare\SourceFolder \\FileShare\ComparisonFolder /e /l /ns /njs /njh /ndl /fp /log:reconcile.txt
   ```
3. Check that DC's AD replication — always resolve AD replication issues before DFSR
4. If AD replication good and SYSVOL inconsistent → continue to Step 5

## Step 4: Other RG/RF Troubleshooting

For non-SYSVOL replication groups:

1. Clarify the RG, RF, and servers involved
2. Ensure DFSR service is running on all servers
3. Fix any AD replication issues in the domain
4. Run `dfsrdiag.exe pollad` to trigger DFSR config sync from AD
5. If needed, manually check DFSR-related containers in AD via ADSIedit

## Step 5: DFSR Replication Issue Analysis

### 5.1 Clarify Scope

Determine how many servers are involved and what the topology is.

For SYSVOL: start from PDCe and its direct replication partners, then check partners' partners until all DCs are verified.

Create test files in RF on each server, follow topology to check replication direction and identify failure points.

### 5.2 Check RF State on Each Server

**CMD:**
```
Wmic /namespace:\\root\microsoftdfs path dfsrreplicatedfolderinfo get replicationgroupname,replicatedfoldername,state
```

**PowerShell:**
```powershell
Get-WmiObject -Namespace "root\MicrosoftDFS" -Class DfsrReplicatedFolderInfo |
  Select-Object ReplicatedFolderName,ReplicationGroupName,state
```

**SYSVOL query all DCs (Server 2025+):**
```powershell
foreach ($s in (dsquery server -o rdn)) {
  Get-CimInstance -ComputerName $s -Namespace root\MicrosoftDFS -ClassName DfsrReplicatedFolderInfo |
    Where-Object {$_.ReplicatedFolderName -eq 'SYSVOL share'} |
    Select-Object @{Name='Server';Expression={$s}}, ReplicationGroupName, ReplicatedFolderName, State
}
```

**SYSVOL query all DCs (Pre-2025):**
```
For /f %i IN ('dsquery server -o rdn') do @echo %i && @wmic /node:"%i" /namespace:\\root\microsoftdfs path dfsrreplicatedfolderinfo WHERE replicatedfoldername='SYSVOL share' get replicationgroupname,replicatedfoldername,state
```

- State not 4 on any server → check latest DFSR debug log and event log
- State 4 on all servers → follow DFSR replication logic below

### 5.3 DFSR Replication Logic

When a new file is added to RF on upstream server:

1. Upstream: USN journal updated, file gets fid, uid, gvsn
2. Downstream: sends request for pending updates
3. Upstream: receives request
4. Downstream: receives update list (uid, gvsn, filename, csName)
5. Downstream: requests each file via RPC
6. Upstream: stages file, sends to downstream
7. Downstream: receives, stages → installing → destination
8. Downstream: updates USN journal

Analyze DFSR debug logs from both upstream and downstream to determine which step fails.

## Reference

- [Understanding DFSR Debug Logging](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/understanding-dfsr-debug-logging-part-1-logging-levels-log/ba-p/396126)
