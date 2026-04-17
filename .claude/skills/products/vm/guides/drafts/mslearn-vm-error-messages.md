# Azure VM Common Error Messages Reference

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/error-messages
> Quality: guide-draft | ID: vm-mslearn-207

## Overview
Comprehensive reference of common error codes and messages encountered when creating or managing Azure VMs.

## High-Impact Error Codes

### Allocation Errors
| Code | Description |
|------|-------------|
| AllocationFailed | Try reducing VM size/count, retry later, or deploy to different Availability Set/location |
| OverConstrainedAllocationRequest | Required VM size not available in selected location |

### Provisioning Errors
| Code | Description |
|------|-------------|
| OSProvisioningTimedOut | OS provisioning did not finish in allotted time. Check if image is properly generalized |
| OSProvisioningClientError | OS provisioning failed - check guest OS state, Linux agent setup, or SSH key generation |
| OSProvisioningInternalError | Internal error during provisioning |

### Disk Errors
| Code | Description |
|------|-------------|
| AttachDiskWhileBeingDetached | Wait for disk detach to complete before attaching |
| ConflictingUserInput | Disk already owned by another VM |
| DiskBlobNotFound | VHD blob not found at specified URI |
| IncorrectDiskBlobType | Disk blobs must be page blobs, not block blobs |

### Storage Errors
| Code | Description |
|------|-------------|
| StorageAccountTypeNotSupported | Premium storage not supported for boot diagnostics |
| StorageAccountNotFound | Storage account deleted or wrong location |
| StorageAccountLocationMismatch | Storage account must be in same location as compute resource |

### Extension Errors
| Code | Description |
|------|-------------|
| VMAgentStatusCommunicationError | VM agent not reporting status - check agent and outbound connectivity |
| VMExtensionProvisioningError | Extension processing failure - check error message |
| VMExtensionProvisioningTimeout | Extension installation timed out |
| ArtifactNotFound | VM extension with specified publisher/type not found in location |

### Operation Errors
| Code | Description |
|------|-------------|
| OperationNotAllowed | Various: VM not running, being deleted, disk conversion in progress, etc. |
| Conflict | Disk resizing only allowed when creating VM or VM deallocated |
| VMStartTimedOut | VM did not start in allotted time - check power state later |

## Error Response Format
```json
{
  "status": "status code",
  "error": {
    "code": "Top level error code",
    "message": "Top level error message",
    "details": [{"code": "Inner level error code", "message": "Inner level error message"}]
  }
}
```

The most inner level error message is typically the root failure.
