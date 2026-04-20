# AVD ARM 部署 (Part 2) — Troubleshooting Workflow

**Scenario Count**: 13
**Generated**: 2026-04-18

---

## Scenario 1: AVD deployment fails with InvalidContentLink error: 'Unable ...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Create an ICM incident. PG team will need to upload the missing ARM templates using the artifact deployment pipeline.

**Root Cause**: ARM templates artifacts are missing from the storage blob used for AVD deployment.

## Scenario 2: Customer cannot download or install Windows App because comp...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Download Windows App directly from Microsoft Learn: https://learn.microsoft.com/en-us/windows-app/whats-new - the page has direct download links for all platforms without requiring Microsoft Store

**Root Cause**: Organization policy blocks Microsoft Store access, preventing standard Windows App installation

## Scenario 3: AVD deployment fails with InvalidContentLink: Unable to down...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Create an IcM to AVD PG. PG will need to upload the missing ARM templates using the artifact deployment pipeline.

**Root Cause**: ARM template artifacts are missing from the storage blob used during AVD host pool deployment.

## Scenario 4: AVD VM deployed with Windows Enterprise multi-session image ...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1) Collect MSRD-Collect data
- 2) Check Application event logs for Microsoft-Windows-Security-SPP events (1016, 1040, 1061, 8198, 8230, 12288, 16394) showing edition change from multi-session to Pro
- 3) Open IcM to AVD PG documenting symptoms and findings
- 4) Redeploy the VM is the only supported fix
- Reference IcM 256401151.

**Root Cause**: Backend issue potentially caused by old WinPA agent on certain VM clusters. During automated deployment, the OS edition gets switched from Enterprise for Virtual Desktop to Professional before the AVD agent installation completes.

## Scenario 5: AVD host pool deployment fails with InvalidContentLink error...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Create an ICM incident to the AVD PG team. PG will upload the missing ARM templates using the artifact deployment pipeline.

**Root Cause**: ARM template artifacts are missing from the storage blob used by the AVD deployment pipeline.

## Scenario 6: Windows 10/11 Enterprise multi-session AVD VM gets downgrade...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Redeploy the VM. The underlying cause is a backend issue that should be resolved with updated WinPA agent. If persists, escalate to PG.

**Root Cause**: Scenario 2: Issue in Azure backend system (e.g., due to old WinPA agent) causes OS downgrade during initial deployment phase.

## Scenario 7: DSC extension fails to download Configuration.zip - cataloga...
> Source: MS Learn | Applicable: ✅

### Troubleshooting Steps
- Remove blocking network rules or download zip manually

**Root Cause**: Firewall/NSG/static route blocking download

## Scenario 8: AVD deployment fails with DeploymentFailed InvalidResourceRe...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- See Microsoft documentation: https://docs.microsoft.com/en-us/azure/virtual-desktop/troubleshoot-set-up-issues#error-deploymentfailed--invalidresourcereference (two scenarios documented)

**Root Cause**: None

## Scenario 9: WVD Deployment failed with DSC extension error. User is not ...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Create service principal role assignment per docs.

**Root Cause**: SPN was missing role assignment.

## Scenario 10: WVD ARM deployment fails: The template deployment vmCreation...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Check detailed error by clicking error banner in Portal. Request quota increase for affected region/VM family.

**Root Cause**: Azure subscription quota limit exceeded for a region or VM family.

## Scenario 11: Ephemeral OS disk deployment fails in certain regions due to...
> Source: MS Learn | Applicable: ✅

### Troubleshooting Steps
- Monitor Azure announcements for SKU availability updates; deploy to another region or select a different SKU as workaround

**Root Cause**: Incomplete rollout of supported SKUs or backend bugs cause regional deployment issues

## Scenario 12: Azure Monitor workbook deployment for AVD fails with 'Deploy...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- If workbook deployment fails, go to Log Analytics workspace > Agents configuration to manually configure performance counters and Windows event logs for AVD session hosts.

**Root Cause**: Azure Monitor configuration workbook passes object-type parameter instead of string when setting up session host data (performance counters/event logs).

## Scenario 13: Deployment fails Unauthorized - scale operation not allowed ...
> Source: MS Learn | Applicable: ❓

### Troubleshooting Steps
- Change subscription type or deploy to different region

**Root Cause**: Subscription type (MSDN/Free/Education) lacks VM features in region
