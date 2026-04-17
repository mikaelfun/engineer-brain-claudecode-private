---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Compute/Virtual Machine TSGs/VM Storage and Fileshare Performance Troubleshooting Guideline"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Virtual%20Machine%20TSGs/VM%20Storage%20and%20Fileshare%20Performance%20Troubleshooting%20Guideline"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# VM Storage and Fileshare Performance Troubleshooting

## Summary

Guide for investigating PV/storage/fileshare performance complaints.

## Key Concepts

- Azure disk performance is determined by disk type AND disk size (IOPS/throughput limits apply per tier)
- Azure Fileshare performance is limited by type and size; higher E2E latency since it is not co-located with physical hosts
- Reference: https://docs.microsoft.com/en-us/azure/virtual-machines/disks-types
- Reference: https://docs.microsoft.com/en-us/azure/storage/files/storage-files-scale-targets#azure-file-share-scale-targets

## Troubleshooting Steps

1. Identify the node where the PV is located
2. Go to ASC → select the VM (Node) → Disk blade → check if VM is being throttled
3. If fileshare PV: skip to step 4 directly
4. Enter the pod in bash mode and run fio benchmarks:

   **Measure MAX IOPS:**
   

   **Measure MAX Throughput:**
   

   Note: MAX IOPS and MAX Throughput are mutually exclusive — you cannot achieve both simultaneously.

5. If output deviates significantly from expected disk specs → open collaboration with VM team
6. If disk latency is observed (without visible throttling limits): may be burst throttling
   - Azure Premium disk IO checked every 50ms — expected latency: single digit ms
   - Azure Standard disk IO checked every 20ms
