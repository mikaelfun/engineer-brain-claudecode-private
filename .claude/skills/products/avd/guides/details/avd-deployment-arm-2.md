# AVD AVD ARM 部署 (Part 2) - Comprehensive Troubleshooting Guide

**Entries**: 13 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki, ContentIdea, MS Learn, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| AVD deployment fails with InvalidContentLink error: 'Unable to downloa... | ARM templates artifacts are missing from the storage blob used for AVD... | Create an ICM incident. PG team will need to upload the missing ARM te... |
| Customer cannot download or install Windows App because company blocks... | Organization policy blocks Microsoft Store access, preventing standard... | Download Windows App directly from Microsoft Learn: https://learn.micr... |
| AVD deployment fails with InvalidContentLink: Unable to download deplo... | ARM template artifacts are missing from the storage blob used during A... | Create an IcM to AVD PG. PG will need to upload the missing ARM templa... |
| AVD VM deployed with Windows Enterprise multi-session image gets downg... | Backend issue potentially caused by old WinPA agent on certain VM clus... | 1) Collect MSRD-Collect data. 2) Check Application event logs for Micr... |
| AVD host pool deployment fails with InvalidContentLink error: Unable t... | ARM template artifacts are missing from the storage blob used by the A... | Create an ICM incident to the AVD PG team. PG will upload the missing ... |
| Windows 10/11 Enterprise multi-session AVD VM gets downgraded to Profe... | Scenario 2: Issue in Azure backend system (e.g., due to old WinPA agen... | Redeploy the VM. The underlying cause is a backend issue that should b... |
| DSC extension fails to download Configuration.zip - catalogartifact.az... | Firewall/NSG/static route blocking download | Remove blocking network rules or download zip manually |
| AVD deployment fails with DeploymentFailed InvalidResourceReference er... |  | See Microsoft documentation: https://docs.microsoft.com/en-us/azure/vi... |
| WVD Deployment failed with DSC extension error. User is not authorized... | SPN was missing role assignment. | Create service principal role assignment per docs. |
| WVD ARM deployment fails: The template deployment vmCreation-linkedTem... | Azure subscription quota limit exceeded for a region or VM family. | Check detailed error by clicking error banner in Portal. Request quota... |
| Ephemeral OS disk deployment fails in certain regions due to SKU rollo... | Incomplete rollout of supported SKUs or backend bugs cause regional de... | Monitor Azure announcements for SKU availability updates; deploy to an... |
| Azure Monitor workbook deployment for AVD fails with 'Deployment valid... | Azure Monitor configuration workbook passes object-type parameter inst... | If workbook deployment fails, go to Log Analytics workspace > Agents c... |
| Deployment fails Unauthorized - scale operation not allowed for subscr... | Subscription type (MSDN/Free/Education) lacks VM features in region | Change subscription type or deploy to different region |

### Phase 2: Detailed Investigation

#### Entry 1: AVD deployment fails with InvalidContentLink error: 'Unable ...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r3-001 | Score: 8.0

**Symptom**: AVD deployment fails with InvalidContentLink error: 'Unable to download deployment content from Storage Blob'. Pasting the blob URL in browser shows 'storage blob does not exist'.

**Root Cause**: ARM templates artifacts are missing from the storage blob used for AVD deployment.

**Solution**: Create an ICM incident. PG team will need to upload the missing ARM templates using the artifact deployment pipeline.

> 21V Mooncake: Applicable

#### Entry 2: Customer cannot download or install Windows App because comp...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r8-001 | Score: 8.0

**Symptom**: Customer cannot download or install Windows App because company blocks Microsoft Store

**Root Cause**: Organization policy blocks Microsoft Store access, preventing standard Windows App installation

**Solution**: Download Windows App directly from Microsoft Learn: https://learn.microsoft.com/en-us/windows-app/whats-new - the page has direct download links for all platforms without requiring Microsoft Store

> 21V Mooncake: Applicable

#### Entry 3: AVD deployment fails with InvalidContentLink: Unable to down...
> Source: ADO Wiki | ID: avd-ado-wiki-b-r4-001 | Score: 8.0

**Symptom**: AVD deployment fails with InvalidContentLink: Unable to download deployment content from Storage Blob. Pasting the blob URL in browser returns storage blob does not exist.

**Root Cause**: ARM template artifacts are missing from the storage blob used during AVD host pool deployment.

**Solution**: Create an IcM to AVD PG. PG will need to upload the missing ARM templates using the artifact deployment pipeline.

> 21V Mooncake: Applicable

#### Entry 4: AVD VM deployed with Windows Enterprise multi-session image ...
> Source: ADO Wiki | ID: avd-ado-wiki-b-r4-004 | Score: 8.0

**Symptom**: AVD VM deployed with Windows Enterprise multi-session image gets downgraded to Professional edition during initial deployment. Session hosts show as Unavailable. Issue occurs with specific VM sizes (e.g., NV12s_v3) but not others (e.g., DS2v2).

**Root Cause**: Backend issue potentially caused by old WinPA agent on certain VM clusters. During automated deployment, the OS edition gets switched from Enterprise for Virtual Desktop to Professional before the AVD agent installation completes.

**Solution**: 1) Collect MSRD-Collect data. 2) Check Application event logs for Microsoft-Windows-Security-SPP events (1016, 1040, 1061, 8198, 8230, 12288, 16394) showing edition change from multi-session to Pro. 3) Open IcM to AVD PG documenting symptoms and findings. 4) Redeploy the VM is the only supported fix. Reference IcM 256401151.

> 21V Mooncake: Applicable

#### Entry 5: AVD host pool deployment fails with InvalidContentLink error...
> Source: ADO Wiki | ID: avd-ado-wiki-b-r5-001 | Score: 8.0

**Symptom**: AVD host pool deployment fails with InvalidContentLink error: Unable to download deployment content from Storage Blob. Pasting the blob URL in browser returns 'storage blob does not exist'.

**Root Cause**: ARM template artifacts are missing from the storage blob used by the AVD deployment pipeline.

**Solution**: Create an ICM incident to the AVD PG team. PG will upload the missing ARM templates using the artifact deployment pipeline.

> 21V Mooncake: Applicable

#### Entry 6: Windows 10/11 Enterprise multi-session AVD VM gets downgrade...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r3-007 | Score: 7.0

**Symptom**: Windows 10/11 Enterprise multi-session AVD VM gets downgraded to Professional edition during initial deployment. OS loses multi-session capability right after provisioning.

**Root Cause**: Scenario 2: Issue in Azure backend system (e.g., due to old WinPA agent) causes OS downgrade during initial deployment phase.

**Solution**: Redeploy the VM. The underlying cause is a backend issue that should be resolved with updated WinPA agent. If persists, escalate to PG.

> 21V Mooncake: Applicable

#### Entry 7: DSC extension fails to download Configuration.zip - cataloga...
> Source: MS Learn | ID: avd-mslearn-044 | Score: 7.0

**Symptom**: DSC extension fails to download Configuration.zip - catalogartifact.azureedge.net not resolved

**Root Cause**: Firewall/NSG/static route blocking download

**Solution**: Remove blocking network rules or download zip manually

> 21V Mooncake: Applicable

#### Entry 8: AVD deployment fails with DeploymentFailed InvalidResourceRe...
> Source: ADO Wiki | ID: avd-ado-wiki-b-r6-006 | Score: 7.0

**Symptom**: AVD deployment fails with DeploymentFailed InvalidResourceReference error during host pool/session host provisioning

**Root Cause**: 

**Solution**: See Microsoft documentation: https://docs.microsoft.com/en-us/azure/virtual-desktop/troubleshoot-set-up-issues#error-deploymentfailed--invalidresourcereference (two scenarios documented)

> 21V Mooncake: Applicable

#### Entry 9: WVD Deployment failed with DSC extension error. User is not ...
> Source: ContentIdea | ID: avd-contentidea-kb-007 | Score: 6.5

**Symptom**: WVD Deployment failed with DSC extension error. User is not authorized to query the management service.

**Root Cause**: SPN was missing role assignment.

**Solution**: Create service principal role assignment per docs.

> 21V Mooncake: Applicable

#### Entry 10: WVD ARM deployment fails: The template deployment vmCreation...
> Source: ContentIdea | ID: avd-contentidea-kb-020 | Score: 6.5

**Symptom**: WVD ARM deployment fails: The template deployment vmCreation-linkedTemplate is not valid according to the validation procedure. Error appears after validation succeeded.

**Root Cause**: Azure subscription quota limit exceeded for a region or VM family.

**Solution**: Check detailed error by clicking error banner in Portal. Request quota increase for affected region/VM family.

> 21V Mooncake: Applicable

#### Entry 11: Ephemeral OS disk deployment fails in certain regions due to...
> Source: MS Learn | ID: avd-mslearn-067 | Score: 6.0

**Symptom**: Ephemeral OS disk deployment fails in certain regions due to SKU rollout gaps

**Root Cause**: Incomplete rollout of supported SKUs or backend bugs cause regional deployment issues

**Solution**: Monitor Azure announcements for SKU availability updates; deploy to another region or select a different SKU as workaround

> 21V Mooncake: Applicable

#### Entry 12: Azure Monitor workbook deployment for AVD fails with 'Deploy...
> Source: OneNote | ID: avd-onenote-065 | Score: 5.5

**Symptom**: Azure Monitor workbook deployment for AVD fails with 'Deployment validation failed: Template parameter JToken type is not valid. Expected String, Uri. Actual Object.'

**Root Cause**: Azure Monitor configuration workbook passes object-type parameter instead of string when setting up session host data (performance counters/event logs).

**Solution**: If workbook deployment fails, go to Log Analytics workspace > Agents configuration to manually configure performance counters and Windows event logs for AVD session hosts.

> 21V Mooncake: Applicable

#### Entry 13: Deployment fails Unauthorized - scale operation not allowed ...
> Source: MS Learn | ID: avd-mslearn-043 | Score: 4.5

**Symptom**: Deployment fails Unauthorized - scale operation not allowed for subscription in region

**Root Cause**: Subscription type (MSDN/Free/Education) lacks VM features in region

**Solution**: Change subscription type or deploy to different region

> 21V Mooncake: Not verified

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
