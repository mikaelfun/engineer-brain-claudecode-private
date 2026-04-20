---
title: "How to Run Packet Capture on Azure Host via Escort Session"
source: onenote
sourceRef:
  - "MCVKB/Net/=======10.Tools=======/10.21 [NET] how to run the packet capture on Azure.md"
  - "MCVKB/Net/=======10.Tools=======/10.21 [NET] how to run the packet capture on Azure/Psaw+CME.md"
product: networking
tags: [host-capture, escort, jit, netsh-trace, vmswitch, vfp, mooncake, jumpbox, psaw]
21vApplicable: true
---

# How to Run Packet Capture on Azure Host via Escort Session

## Overview
When guest-level packet capture is insufficient, you may need host-level capture (vmswitch/VFP layer) to diagnose packet drops or routing issues. This requires physical node access via JIT Escort session in Mooncake.

## Prerequisites
- Active ICM ticket or case justification
- VM topology info: Cluster, NodeId, ContainerId (use ARR script or Kusto)
- SAW or CORP VPN access

## Method 1: Traditional Escort (MSFT Account)

### Step 1: Prepare VM Info
Query cluster and NodeId for the target VM. Example output:
- Cluster: ZQZ20PrdApp01, Region: ChinaNorth3
- NodeId: cc14d16d-..., NodeIp: 10.145.24.204
- ContainerId: 48bb868b-..., MAC: 0017FA068F95

### Step 2: Apply First JIT (MSFT Account)
Apply Escort JIT to RDP the jumpbox. Reference the standard Escort JIT procedure.

### Step 3: Apply Second JIT (21V CME Account)
After connecting to jumpbox, apply new JIT at https://jitaccess.security.core.chinacloudapi.cn/WorkFlowTempAccess.aspx with the 21V escort engineer's CME account.

### Step 4: Prepare Capture Command
```cmd
netsh trace start provider=Microsoft-Windows-Hyper-V-Vmswitch capture=yes capturetype=both provider=Microsoft-Windows-Hyper-V-Vfpext tracefile=.\capture.etl persistent=yes report=dis corr=dis overwrite=yes maxSize=2048 PacketTruncateBytes=300
```

### Step 5: Access Target Node
Download RDP + RDG files after JIT approval. 21V engineer logs into jumpbox, copy RDG file, open with RDCMAN to connect to target node.

### Step 6: Run Capture
Create working folder (e.g., D:\temp\<alias>), run the netsh trace command.

### Step 7: Stop and Collect
```cmd
netsh trace stop
netsh trace convert   # if VFP trace needed
```

### Step 8: Upload Logs
- Uncheck "Clipboard" in RDP Local Resources for drive sharing
- xcopy files to jumpbox via tsclient share
- Upload from jumpbox to local PC via file server or storage account
- Delete logs from jumpbox after upload

## Method 2: PSAW + CME (No Escort Shadow Needed)

If you have a SAW machine, you can login with CME account directly:

1. Login SAW with CME account
2. Apply JIT at MC JIT portal with CME account (Direct mode, 8 hours)
3. Download jumpbox RDP + target node RDG files
4. Connect to Pulse VPN for Mooncake endpoint
5. RDP to jumpbox, then RDCMAN to target node
6. Remaining steps same as Method 1

## Notes
- capturetype options: Physical (NIC only), VMSwitch (switch extension), Both (combined)
- Adjust maxSize and PacketTruncateBytes based on scenario
- Large captures may impact host performance
