# RPC Errors Affecting Entra Connect

Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/rpc-errors-affecting-aadconnect

## Overview

RPC errors can break multiple Entra Connect features (PHS, sync, writeback). The issue is typically not caused by Connect itself but by underlying network/AD infrastructure.

## Investigation Steps

1. Check Application event log on Connect server
2. Identify the RPC system error code from the event details
3. Target troubleshooting based on the specific error code

## Common RPC Error Patterns

### RPC 1722 - The RPC server is unavailable
- **Affected feature**: Password Hash Sync (Event ID 611)
- **Root cause**: Network issue - TCP port 135 blocked to destination DC
- **Resolution**: Check network traces for retransmit packets on port 135; fix firewall/network rules
- **Data collection**: Use Network Monitor with scheduled task triggered by Event ID to capture intermittent issues

### RPC 8453 - Replication access was denied
- **Affected feature**: Password Hash Sync
- **Root cause**: AD DS Connector Account lacks replication permissions
- **Resolution**: Grant "Replicating Directory Changes" + "Replicating Directory Changes All" to connector account

### General RPC Troubleshooting
- Reference: Microsoft docs "Troubleshoot TCP/IP RPC Errors"
- Reference: System Error Codes 1700-3999
- Use Event Viewer Application log to determine exact error
- Install Network Monitor for automated trace collection on error events
