---
title: VM Inspector Error Messages Reference
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/vm-inspector-error-messages
product: vm
21vApplicable: true
---

# VM Inspector Error Messages Reference

VM Inspector is a self-help diagnostic tool for remote users with privileged access, used on Azure VMs running Windows or Linux.

## Common Error Codes

### 400 - Bad Request
- **IncorrectPatternUploadSASUri**: uploadSasUri must have .zip extension
- **IncorrectPermissionUploadSasUri**: SAS URI needs read+write permissions (sp=rw)
- **IncorrectSasUriFormat**: Invalid SAS URI format
- **InvalidParameter**: Invalid input parameter

### 403 - Forbidden
- **DiskInspectForbiddenError**: Disk lacks correct access for inspection

### 404 - Not Found
- **StorageAccountNotFoundInARM**: Storage account not found
- **VirtualMachineNotFoundInARM**: VM not found

### 405 - Not Supported
- **EncryptedDiskNotSupported**: Encrypted OS disk not supported
- **UnmanagedDiskNotSupported**: Unmanaged OS disk not supported
- **ResourceNotSupported**: Ephemeral OS disk not supported
- **ForbiddenError**: Insufficient permissions on storage account

### 429 - Throttling
- **TooManyRequestsError**: Downstream API throttled, retry later

### 500 - Internal Server Error
- **DiskInspectInternalServerError**: Unexpected error during inspection

## Common Solutions

### Missing Role Assignment
- First-time use requires Owner-level permissions for Disk Backup reader role assignment to Compute Recommendation Service app

### Error 403 Authorization
- Need Contributor role at subscription level (built-in)

### Error 405 Caller Access
- Cannot use Service Administrator or Classic Administrator roles
- Need proper RBAC permissions per VM Inspector documentation
