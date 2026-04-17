# Check if VM Has Been Migrated During Planned Maintenance

**Source**: MCVKB 5.1 | **Product**: VM | **ID**: vm-onenote-139

## Purpose
Verify whether a VM has been live-migrated to a Windows Server 2016 node during planned maintenance events.

## Steps

### 1. Get VM Tenant Info from Jarvis
- For ARM VM: Query Jarvis with VM resource info
- Result contains Cluster name and Tenant name

### 2. Check Node via Fcshell
- Login to the VM's Cluster in Fcshell
- Query the Node hosting the VM

### 3. Check Node OS Version
- Inspect the Node OS information:
  - **WS16H** = Node has been upgraded to Windows Server 2016
  - **WS12H** = Node has NOT been upgraded yet

## Applicability
- Mooncake (21Vianet) environment
- Planned maintenance / node upgrade scenarios
