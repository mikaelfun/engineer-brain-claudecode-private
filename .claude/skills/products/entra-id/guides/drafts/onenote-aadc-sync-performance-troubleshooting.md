# AADC Sync Performance Troubleshooting Guide

**Source**: OneNote - Mooncake POD Support Notebook
**Status**: Draft (pending SYNTHESIZE review)

## Sync Workflow Overview
1. Full Import on the AD Connector
2. Full Import on the Azure Connector
3. Full sync on the AD Connector
4. Full sync on the Azure Connector
5. Export from the AD Connector
6. Export from the Azure Connector

## Common Root Causes

### 1. AD Domain Controller Availability
- Slow DC replay of changes increases end-to-end latency
- Best practice: close network proximity, fast link, minimal latency

### 2. Volume and Type of Changes
- Large change volumes (10K vs 10) significantly impact time
- Group membership changes vs new objects have different processing costs
- New object sync is usually faster than updates to existing objects

### 3. Hardware Performance
- CPU core count/speed, available memory, disk throughput
- Verify hardware meets AADC requirements for the object count

### 4. SQL Performance
- Poor SQL performance degrades throughput in sync phases
- Check SQL WID or external SQL database health

### 5. Network Latency to Azure AD
- HTTPS communication to O365 DirSync Web Service endpoints
- Higher latency = lower throughput
- Check for packet drops and retransmits

### 6. HTTPS Packet Inspection
- Intermediate devices performing HTTPS inspection can significantly slow sync

### 7. O365 Partition Throttling
- Check for Error Code 81 in event log (throttling indicator)
- Throttling is self-recovering

## Diagnostic Steps

### Step 1: Examine Synchronization Manager
- Note delta between start time and end time for each run profile step
- Focus on the phase performing slowly

### Step 2: Check Run Histories
- Run miisclient.exe to see run histories
- Check number of adds, updates, deletes
- If run histories are numerous, purge oldest to free disk space

### Step 3: Hardware Inventory
- CPU, memory, disk space
- Run perfmon during synchronizations
- Verify network link quality to DC

### Step 4: Network Performance
- Check between sync client and domain controller
- Check between sync client and Azure AD endpoint
- Look for: small packet sizes, excessive retransmits, dropped packets
