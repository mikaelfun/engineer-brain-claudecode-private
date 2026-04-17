# Ultra Disk Storage Feature Readiness

> Source: OneNote — Feature Readiness/202210 Ultra Disk Storage
> Quality: guide-draft (pending SYNTHESIZE review)

## Key References

| Scope | Link |
|-------|------|
| Global Docs | [Ultra disks for VMs](https://docs.microsoft.com/en-us/azure/virtual-machines/disks-enable-ultra-ssd?tabs=azure-portal#ga-scope-and-limitations) |
| Mooncake Docs | [Ultra disks for VMs (China)](https://docs.azure.cn/en-us/virtual-machines/disks-enable-ultra-ssd?tabs=azure-portal#ga-scope-and-limitations) |
| CSS Wiki | [UltraSSD_Disk-Mgmt](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495778/UltraSSD_Disk-Mgmt) |

## Readiness QA Checklist

1. Which regions support Ultra Disk? Any limitations (avset, zone, size, sub)?
2. How to find which zone/VM size supports Ultra Disk? (az CLI, PowerShell, Portal)
3. Does VMs with no redundancy support Ultra Disk in Mooncake?
4. How much is the quota limit of Ultra Disk per subscription?
5. How to enable Ultra disk support for existing VMs vs new VMs?
6. Which driver is used for Ultra Disk?
7. Can Ultra Disk support features that normal SSD/HDD disks support?
8. What tools can be used for troubleshooting Ultra Disk issues?
9. How to check the number of Ultra Disks in a subscription?
10. Can we distinguish Ultra/Normal SSD from blob URL? What's the difference?
11. Can Ultra Disk be recovered after delete?

## Key Limitations

- Ultra Disk does NOT support soft-delete recovery (unlike standard managed disks)
- Zone-specific: must match VM availability zone
- Limited VM size compatibility
- Separate driver from standard disks
