---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Agentless Scanning/[Diagnostics] - Agentless Scanning"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Workload%20Protections/Agentless%20Scanning/%5BDiagnostics%5D%20-%20Agentless%20Scanning"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Diagnostics - ASC DiskScan Failures Tool for Agentless Scanning

## Overview

When troubleshooting Agentless Scanning related issues in Microsoft Defender for Cloud (MDFC), the **DiskScan Failures** diagnostic tool available in the Azure Support Center (ASC) Tenant Explorer provides valuable insights into scan failures for a given resource.

## Prerequisites

- Access to the **Azure Support Center (ASC)** portal
- The **Subscription ID** of the customer's affected subscription
- The **Resource ID** of the resource experiencing Agentless Scanning issues

## Step-by-Step Instructions

### Step 1: Open ASC Tenant Explorer

Navigate to the **Azure Support Center** and open the case you are working on. From the left-hand navigation panel, locate the **Tenants** section.

### Step 2: Navigate to Defender for Cloud

In the left-side navigation tree, scroll down until you find the **Defender products** section. Expand it and click on **Defender for Cloud**.

### Step 3: Open the DiskScan Failures Tab

Once in the Defender for Cloud diagnostics view, select the **DiskScan failures** tab at the top of the page.

### Step 4: Run the Diagnostic

1. Enter the customer's **Subscription ID** in the "Subscription ID" field.
2. Enter the **Resource ID** of the resource you are troubleshooting in the "Resource ID" field.
3. Click the **Run** button.

## Interpreting Results - Failure Category Reference

| Failure Category | FailedReason Value | Description |
|--|--|--|
| Unsupported Disk SKU | `UnsupportedDiskSku*` | The disk SKU type is not supported for agentless scanning. |
| Unsupported Disk SKU | `InvalidDiskReference` | The disk reference is invalid or points to an unsupported disk type. |
| Total Disk Size Exceeded | `UnsupportedDiskSize-TotalDiskSizeExceeded` | The combined size of all disks on the VM exceeds the maximum supported total disk size for scanning. |
| Single Disk Size Exceeded | `UnsupportedDiskSize-SingleDiskSizeExceeded` | A single disk on the VM exceeds the maximum supported individual disk size for scanning. |
| Unsupported Encryption | `UnsupportedResourceLevelEncryption*` | The resource uses a resource-level encryption configuration that is not supported by agentless scanning. |
| Unsupported Operational State | `UnsupportedOperationalState-ResourceNotRunning` | The resource is not in a running state (e.g., deallocated, stopped). |
| Unsupported Unmanaged Disk | `UnsupportedUnmanagedDisk` | The VM uses unmanaged disks, which are not supported for agentless scanning. |
| Databricks Exclusion | `DatabricksExclusion` | The resource is a Databricks-managed VM and is excluded from scanning by design. |
| Exclusion Tags | `ExclusionTags` | The resource has been explicitly excluded from scanning via exclusion tags. |
| Max Disk Count Exceeded | `MaxDiskCount` | The VM has more attached disks than the maximum supported count for scanning. |
| Unsupported Extended Location | `UnsupportedExtendedLocation` | The resource is in an extended location (e.g., Azure Edge Zone) that is not supported. |
| Unsupported Region | `UnsupportedRegion*` | The resource is deployed in a region where agentless scanning is not available. |
| CMK Encryption - No Permission | `NoPermissionForCustomerKeyVaultRBAC` | The resource uses CMK encryption and the scanner lacks RBAC permissions to access the customer's Key Vault. |
| Other | *(any other value)* | A failure reason that does not match any known category. Escalate for further investigation. |

## Feedback

For any feedback, issues, or questions regarding this diagnostic tool, reach out to the **MDC EEE team**.
