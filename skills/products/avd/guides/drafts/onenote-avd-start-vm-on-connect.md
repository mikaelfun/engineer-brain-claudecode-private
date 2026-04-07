# AVD Start Virtual Machine on Connect

**Source**: OneNote Lab Verification (Susan, 2021-11)
**Status**: Draft — pending SYNTHESIZE review

## Overview

Start Virtual Machine on Connect allows deallocated session hosts to automatically start when a user attempts to connect, reducing costs by keeping VMs stopped when not in use.

## Configuration

1. Navigate to Host Pool > Properties
2. Enable "Start VM on connect"
3. Assign the "Desktop Virtualization Power On Contributor" role to the Azure Virtual Desktop service principal on the resource group containing session hosts

## Behavior

- When all VMs in the host pool are deallocated and a user connects, one VM will automatically start
- The user may experience a brief wait while the VM starts
- Once the VM is running, the user connects normally

## Prerequisites

- Azure Virtual Desktop ARM-based deployment
- Proper RBAC: Azure Virtual Desktop service principal needs "Desktop Virtualization Power On Contributor" role
- Reference: [Start virtual machine connect](https://docs.microsoft.com/en-us/azure/virtual-desktop/start-virtual-machine-connect)

## Notes

- This feature helps optimize costs for dev/test or low-usage scenarios
- Works with both personal and pooled host pools
- VM start time depends on the VM size and OS
