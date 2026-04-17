---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Security Alerts/[Troubleshooting Guide] - Testing Alerts/[Troubleshooting Guide] - EICAR Alerts Test"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Security%20Alerts/%5BTroubleshooting%20Guide%5D%20-%20Testing%20Alerts/%5BTroubleshooting%20Guide%5D%20-%20EICAR%20Alerts%20Test"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# EICAR Alerts Test - Multi-Platform Validation

## Windows Virtual Machine

1. Copy an executable (e.g., calc.exe) to the desktop and rename it as **Alert Test 662jfi039N.exe**
2. Open command prompt and execute: `Alert Test 662jfi039N.exe -foo`
3. Wait 5-10 minutes and check Security Center Alerts

### Troubleshooting Windows

- Ensure **Arguments Auditing Enabled** field is `true` in the test alert
- If false, enable command-line arguments auditing:

```cmd
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\policies\system\Audit" /f /v "ProcessCreationIncludeCmdLine_Enabled"
```

- Enable process creation auditing:

```cmd
auditpol.exe /set /subcategory:"process creation" /success:enable
```

- Verify audit policy:

```cmd
auditpol.exe /get /subcategory:"process creation"
```

> If process creation shows **'No Auditing'**, process creation events (ID 4688) will not appear in the Security Event Log, which are the required trigger for EICAR and all other process creation alerts.

## Linux Virtual Machine

1. Copy an executable and rename: `cp /bin/echo ./alerttest_662jfi039n`
2. Execute: `./alerttest_662jfi039n testing eicar pipe`
3. Wait 5-10 minutes and check Security Center Alerts

## Kubernetes (AKS)

1. Connect to cluster: `az aks get-credentials --resource-group myResourceGroup --name myAKSCluster`
2. Run: `kubectl get pods --namespace=alerttest-662jfi039n`
3. Validate test alert appears in Defender for Cloud alert blade

## Advanced Threat Protection for Azure Storage

1. Create a new Storage Account, go to Blob Service > Containers
2. Create new container named **storageatpvalidation** (private access)
3. Download [Storage Explorer](https://azure.microsoft.com/en-us/features/storage-explorer/)
4. Create a text file with the EICAR test string:

```
X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*
```

5. Save as `EICAR.com`
6. Open Storage Explorer, add Azure account
7. Navigate to the container and upload the EICAR file
8. Wait for alert to appear

## References

- [Security Center Alert Validation](https://docs.microsoft.com/en-us/azure/security-center/security-center-alert-validation)
- [Validate Alerts on Windows VMs](https://docs.microsoft.com/en-us/azure/security-center/security-center-alert-validation#validate-alerts-on-windows-vms-)
- [Validate Alerts on Linux VMs](https://docs.microsoft.com/en-us/azure/security-center/security-center-alert-validation#validate-alerts-on-linux-vms-)
- [Validate Alerts on Kubernetes](https://docs.microsoft.com/en-us/azure/security-center/security-center-alert-validation#validate-alerts-on-kubernetes-)
- [Validating ATP for Azure Storage Detections](https://techcommunity.microsoft.com/t5/azure-security-center/validating-atp-for-azure-storage-detections-in-azure-security/ba-p/1068131)
