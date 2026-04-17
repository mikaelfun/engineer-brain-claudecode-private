# DEFENDER MDC 接入与自动预配 — Comprehensive Troubleshooting Guide

**Entries**: 23 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-product-knowledge-mdc-auto-provisioning-ama.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Onboarding
> Sources: mslearn

**1. MDE service doesn't start after onboarding; error 577 or error 1058 when trying to start the SENSE service**

- **Root Cause**: Early Launch Antimalware (ELAM) driver is disabled by system policy; DisableAntiSpyware or DisableAntiVirus GPO values are set under SOFTWARE\Policies\Microsoft\Windows Defender
- **Solution**: Clear DisableAntiSpyware and DisableAntiVirus Group Policy values; ensure ELAM driver is enabled; re-run onboarding script after clearing policies
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. MDE onboarding: SENSE service does not auto-start on newly built devices if no first user logon completed**

- **Root Cause**: On Windows before 1809, SENSE requires first user logon to complete OOBE before auto-starting
- **Solution**: Ensure first user logon completes before reboot; on Windows 10 1809+/Server 2019+/Azure Stack HCI 23H2+ no longer required
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. MDE onboarding Event ID 5/6/7: service failed to connect, not onboarded, or failed to read parameters**

- **Root Cause**: Event 5: no internet; Event 6: onboarding script not run; Event 7: connectivity issue preventing parameter retrieval
- **Solution**: Event 5: ensure internet; Event 6: re-run onboarding script; Event 7: verify connectivity then re-run onboarding; check SENSE operational log
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**4. MDE Intune onboarding error 0x87D1FDE8: Remediation failed for onboarding/offboarding blob**

- **Root Cause**: Wrong blob signature or missing PreviousOrgIds fields in onboarding/offboarding package
- **Solution**: Check Event Viewer; verify registry key HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Advanced Threat Protection; re-apply onboarding package
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 2: Containers
> Sources: ado-wiki

**1. EKS audit log alerts are not being produced for customer Amazon EKS clusters connected to Defender for Containers via AWS connector**

- **Root Cause**: Multiple possible causes: 1) Containers plan not enabled or audit logs auto-provisioning flag not enabled on AWS connector. 2) Changes take ~1 hour for existing connectors or ~6 hours for brand new connectors to take effect. 3) Provisioning pipeline failure (permission denied, quota issues) in customer AWS environment. 4) Cluster not discovered by MDC entity store.
- **Solution**: 1) Verify plan is enabled and audit logs auto-provisioning flag is on. 2) Check data ingestion using Kusto query on K8S_KubeAudit table (clusters: romeeus.eastus / romeuksouth.uksouth, database: ProdRawEvents) filtering by AzureResourceId containing securityConnectors and customer cluster name. 3) If no data received, check provisioning status via Ext_Eks_Cluster_ProvisioningStatus table (clusters: mdcentitystoreprodus.centralus / mdcentitystoreprodeu.westeurope, database: DiscoveryAws). 4) If cluster not in provisioning status, check EKS_Cluster entity table in DiscoveryAws. 5) Cluster found in entity but not provisioning -> escalate to Rome/RomeDetection IcM. Cluster not found at all -> escalate to Rome/RomeDefenders IcM.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Defender for Containers auto-provisioning of Arc-enabled Kubernetes agents fails for GKE (Google Kubernetes Engine) clusters connected via GCP connector**

- **Root Cause**: Auto-provisioning requires two sets of permissions: GCP IAM permissions (using SSO identity providers for GCP token) and Azure permissions (via Azure Lighthouse deployed on customer subscription for creating Arc resources). Failures can occur in either GCP authentication phase or Azure authentication phase (Arc providers not registered, Azure Lighthouse registration invalid).
- **Solution**: 1) Run Kusto query to identify which phase the failure occurred in. 2) If GCP authentication failure: verify SSO identity provider configuration and GCP IAM permissions. 3) If Azure authentication failure: ensure Arc providers are registered in the subscription and verify Azure Lighthouse registration is valid.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**3. Customer pushes a new image to ECR but VA scan results do not appear immediately or within expected timeframe.**

- **Root Cause**: ECR VA does not have scan-on-push capability. Scans are triggered every 1 hour for all images. Provisioning for new accounts can take up to 30 minutes. Large numbers of images per account may cause throttling (Fargate task limits).
- **Solution**: Set customer expectations: 1) Provisioning can take up to 30 minutes for new setups. 2) Image scans trigger every 1 hour, so results should appear within ~2 hours. 3) Scan-on-push is planned for a future stage. 4) Large image volumes may experience additional delays due to throttling.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 3: Resource Provider
> Sources: ado-wiki

**1. MDC not showing security data or recommendations for a subscription; Microsoft.Security resource provider shows NotRegistered**

- **Root Cause**: Microsoft.Security RP is not registered on the subscription; it normally auto-registers on first Security Center portal access
- **Solution**: Access Security Center portal to auto-register, or manually register via Subscription > Settings > Resource Providers > select Microsoft.Security > Register
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. MDC default processes not running (e.g., default policy assignment, MDE onboarding status stale) after configuration changes**

- **Root Cause**: Microsoft.Security RP registration state is stale and needs refresh
- **Solution**: Re-register the RP: go to Subscription > Resource Providers > select Microsoft.Security > Unregister > wait for Unregistered status > Register again
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 4: Byol
> Sources: ado-wiki

**1. BYOL VA auto-provisioning is turned on but certain VMs are not getting the VA extension deployed automatically.**

- **Root Cause**: Auto-provisioning has strict prerequisites: (1) VM provisioning state must be Succeeded, (2) Azure VM agent must be installed and responsive, (3) VM must be Running, (4) VM must not be a security appliance/AKS/Databricks, (5) VM must not have a VA extension installed outside of ASC, (6) OS must be Windows or Linux. Auto-provisioning processes up to 10 VMs per cycle (every 20min-2hrs for active subs, 12hrs for inactive).
- **Solution**: Verify all 6 prerequisites for the affected VMs. Check VM provisioning state, VM agent status, power state, and ensure no external VA extension exists. For inactive subscriptions, wait up to 12 hours for the next provisioning cycle.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer cannot configure auto-provisioning of a vulnerability assessment solution because a BYOL solution is already configured on the subscription. The option to enable built-in VA under the Server **

- **Root Cause**: A BYOL VA solution (Qualys/Rapid7) is still active on the subscription, which prevents enabling the built-in vulnerability assessment under the Defender for Servers plan.
- **Solution**: Navigate to Defender for Cloud > Security solutions > Connected solutions > find the Qualys VA solution > View > unlink all VMs > delete the Qualys solution (requires Owner permissions). After removal, enable Vulnerability assessment for machines under the Server plan.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 5: Ama
> Sources: ado-wiki

**1. AMA (Azure Monitor Agent) or ASA (Azure Security Agent) not deployed on VMs built from custom images or unsupported OS**

- **Root Cause**: MDC auto-provisioning policies only evaluate supported OS lists. Machines built from custom images or images missing SKU/OS data are not evaluated and not targeted for extension deployment.
- **Solution**: (1) Push AMA via Monitoring blade: Monitor → Data Collection Rules → Click rule → Resources → Add (works regardless of custom image or missing SKU). (2) Add Custom Image to policy parameter for policy ID ae8a10e6-19d6-44a3-a02d-a2bdfc707742 (Linux) or 637125fd-7c39-4b94-bb0a-d331faf333a9 (Windows) — Note: MDC initiative does not expose this parameter at initiative level; re-assign policy outside initiative scope. (3) Install ASA manually via API (no custom image parameter in ASA policy): PUT https://management.azure.com/.../extensions/AzureSecurityLinuxAgent?api-version=2019-03-01 or AzureSecurityWindowsAgent. (4) Use PowerShell script to iterate all VMs and push extensions via `az vm extension set`.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. AMA and/or ASA not deployed at scale on VMs with unsupported OS or missing OS/SKU data**

- **Root Cause**: Both AMA and ASA auto-provisioning policies evaluate a hardcoded list of supported OSs. Custom images or VMs missing OS/SKU metadata are excluded from policy evaluation and will not receive the extensions.
- **Solution**: (1) Push AMA via Monitoring blade: Monitor → Data Collection Rules → rule → Resources → Add (bypasses OS check). (2) Add custom image to AMA policy parameter (policy IDs: ae8a10e6 for Linux, 637125fd for Windows) — requires re-assigning policy outside MDC initiative scope. (3) ASA has no custom image parameter — install manually via API: PUT .../extensions/AzureSecurityLinuxAgent or AzureSecurityWindowsAgent with publisher Microsoft.Azure.Security.Monitoring. For unsupported OS requests, contact the relevant team via the MDC Auto-Provisioning TSG.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 6: Mma Deprecation
> Sources: ado-wiki

**1. Need to disable LAW auto-provisioning at scale across many subscriptions but no built-in script available**

- **Root Cause**: MDC does not provide a bulk disable mechanism for LAW auto-provisioning. Each subscription must be configured individually via UI or API.
- **Solution**: Use REST API calls: For Arc machines, DELETE both MMA auto-provisioning policies (Linux + Windows) per subscription. For Azure VMs, PUT autoProvisioningSettings with autoProvision=Off. API endpoints: DELETE .../policyAssignments/ASC%20provisioning%20LA%20agent%20Windows%20Arc and Linux%20Arc (api-version=2019-09-01), PUT .../autoProvisioningSettings/default (api-version=2017-08-01-preview). Tip: build subscription list and iterate.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 7: Cloud Security Explorer
> Sources: ado-wiki

**1. Cloud Security Explorer shows only partial data shortly after onboarding a new scope**

- **Root Cause**: Expected behavior: only partial data is available for ~12 hours after scope onboarding; full ingestion takes up to 24 hours
- **Solution**: Wait 24 hours for full data ingestion. Onboarding banner is expected during this period. If data is still incomplete beyond 24 hours → investigate as an actual issue. Verify bundle is enabled: `securityresources | where type == 'microsoft.security/pricing' | where subscriptionId == '{subscriptionId}' | where name == 'CloudPosture' | where properties['pricingTier'] == 'Standard'`
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 8: Defender For Storage
> Sources: onenote

**1. Defender for Storage (classic) cannot be enabled via Azure Portal in Mooncake - no portal UI available for Storage plan onboarding**

- **Root Cause**: Defender for Storage classic in Mooncake has no portal UI. Only programmatic onboarding via REST API, PowerShell, or ARM template.
- **Solution**: Per-storage: Enable-AzSecurityAdvancedThreatProtection -ResourceId /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Storage/storageAccounts/{sa}/. Per-sub: Set-AzSecurityPricing -Name StorageAccounts -PricingTier Standard -SubPlan PerTransaction. Disable: Set-AzSecurityPricing -Name StorageAccounts -PricingTier Free.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.0/10 — OneNote]`

### Phase 9: Extension
> Sources: ado-wiki

**1. MDE.Windows or MDE.Linux VM extension is automatically reinstalled within minutes to hours after customer manually removes it via Azure Portal/CLI/PowerShell. Device re-appears in MDE portal after eac**

- **Root Cause**: Defender for Servers (P1/P2) auto-provisioning mechanism continuously evaluates VMs and installs MDE extension on any eligible VM that does not have it. Manual removal triggers reinstallation in next evaluation cycle.
- **Solution**: Apply ExcludeMdeAutoProvisioning tag (value: true) on the VM BEFORE removing the extension. Wait 15-30 min for tag propagation. Alternative: disable MDE integration at subscription level (Settings & monitoring > Endpoint protection = Off) or use Azure Policy exemptions for granular control.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 10: Intune
> Sources: mslearn

**1. Auto from connector option is not available when creating EDR onboarding policy in Intune**

- **Root Cause**: The Intune-to-Defender for Endpoint service connection is not configured or not yet active. The connection can take up to 15 minutes to become available after initial setup
- **Solution**: 1) Verify Defender connection shows Connected under Tenant administration > Connectors and tokens > Microsoft Defender for Endpoint; 2) Wait up to 15 minutes after enabling connection; 3) Ensure account has Security Administrator permissions in both Intune and Defender; 4) If still unavailable, use manual onboarding package method as fallback
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 11: Generalized Image
> Sources: mslearn

**1. MDE not auto-provisioned on VMs from generalized OS images**

- **Root Cause**: Generalized images skip automatic MDE provisioning
- **Solution**: Manually enable MDE via Azure CLI, REST API, or Azure Policy
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 12: Security Config Management
> Sources: mslearn

**1. MDE Security Config Management enrollment fails with error code 40 - clock sync issue**

- **Root Cause**: Device clock not synced correctly causing Entra registration/certificate validation to fail
- **Solution**: Verify clock is set correctly and synced on the device (w32tm /query /status or chronyc tracking)
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 13: Devops Security
> Sources: mslearn

**1. Cannot find Azure DevOps repository in Defender for Cloud DevOps security onboarding**

- **Root Cause**: TFSVC repository type is not supported; only TfsGit repository type is supported by DevOps security onboarding
- **Solution**: Ensure repository uses TfsGit type; verify correct Azure DevOps organization user account is signed in; Azure subscription and ADO org must be in same tenant; if connector has wrong user, delete and recreate
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 14: Mde Integration
> Sources: ado-wiki

**1. MDE onboarding script fails with error code 4: No internet connectivity on Linux VM behind proxy. Manual connectivity works but extension cannot reach internet.**

- **Root Cause**: /etc/environment global env vars not forwarded to systemd walinuxagent service on all Linux distributions.
- **Solution**: Create drop-in file /lib/systemd/system/walinuxagent.service.d/13-Proxy.conf with Environment=http_proxy and https_proxy. Then systemctl daemon-reload and restart walinuxagent.service.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — ADO Wiki]`

### Phase 15: Defender For Business
> Sources: mslearn

**1. Devices show as unprotected in Defender for Business portal despite being onboarded - real-time protection turned off**

- **Root Cause**: Non-Microsoft antivirus/antimalware solution is running on the device, causing MDAV real-time protection to be disabled during onboarding.
- **Solution**: Verify and enable real-time protection in Defender for Business next-generation protection policies. Consider using MDAV as primary AV.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Need to disable LAW auto-provisioning at scale across many subscriptions but no built-in script a... | MDC does not provide a bulk disable mechanism for LAW auto-provisioning. Each subscription must b... | Use REST API calls: For Arc machines, DELETE both MMA auto-provisioning policies (Linux + Windows... | 🟢 8.5 | ADO Wiki |
| 2 | Cloud Security Explorer shows only partial data shortly after onboarding a new scope | Expected behavior: only partial data is available for ~12 hours after scope onboarding; full inge... | Wait 24 hours for full data ingestion. Onboarding banner is expected during this period. If data ... | 🟢 8.5 | ADO Wiki |
| 3 | MDC not showing security data or recommendations for a subscription; Microsoft.Security resource ... | Microsoft.Security RP is not registered on the subscription; it normally auto-registers on first ... | Access Security Center portal to auto-register, or manually register via Subscription > Settings ... | 🟢 8.5 | ADO Wiki |
| 4 | EKS audit log alerts are not being produced for customer Amazon EKS clusters connected to Defende... | Multiple possible causes: 1) Containers plan not enabled or audit logs auto-provisioning flag not... | 1) Verify plan is enabled and audit logs auto-provisioning flag is on. 2) Check data ingestion us... | 🟢 8.5 | ADO Wiki |
| 5 | BYOL VA auto-provisioning is turned on but certain VMs are not getting the VA extension deployed ... | Auto-provisioning has strict prerequisites: (1) VM provisioning state must be Succeeded, (2) Azur... | Verify all 6 prerequisites for the affected VMs. Check VM provisioning state, VM agent status, po... | 🟢 8.5 | ADO Wiki |
| 6 | Customer cannot configure auto-provisioning of a vulnerability assessment solution because a BYOL... | A BYOL VA solution (Qualys/Rapid7) is still active on the subscription, which prevents enabling t... | Navigate to Defender for Cloud > Security solutions > Connected solutions > find the Qualys VA so... | 🟢 8.5 | ADO Wiki |
| 7 | Defender for Storage (classic) cannot be enabled via Azure Portal in Mooncake - no portal UI avai... | Defender for Storage classic in Mooncake has no portal UI. Only programmatic onboarding via REST ... | Per-storage: Enable-AzSecurityAdvancedThreatProtection -ResourceId /subscriptions/{sub}/resourceG... | 🟢 8.0 | OneNote |
| 8 | MDC default processes not running (e.g., default policy assignment, MDE onboarding status stale) ... | Microsoft.Security RP registration state is stale and needs refresh | Re-register the RP: go to Subscription > Resource Providers > select Microsoft.Security > Unregis... | 🔵 7.5 | ADO Wiki |
| 9 | Defender for Containers auto-provisioning of Arc-enabled Kubernetes agents fails for GKE (Google ... | Auto-provisioning requires two sets of permissions: GCP IAM permissions (using SSO identity provi... | 1) Run Kusto query to identify which phase the failure occurred in. 2) If GCP authentication fail... | 🔵 7.5 | ADO Wiki |
| 10 ⚠️ | AMA (Azure Monitor Agent) or ASA (Azure Security Agent) not deployed on VMs built from custom ima... | MDC auto-provisioning policies only evaluate supported OS lists. Machines built from custom image... | (1) Push AMA via Monitoring blade: Monitor → Data Collection Rules → Click rule → Resources → Add... | 🔵 7.0 | ADO Wiki |
| 11 ⚠️ | AMA and/or ASA not deployed at scale on VMs with unsupported OS or missing OS/SKU data | Both AMA and ASA auto-provisioning policies evaluate a hardcoded list of supported OSs. Custom im... | (1) Push AMA via Monitoring blade: Monitor → Data Collection Rules → rule → Resources → Add (bypa... | 🔵 7.0 | ADO Wiki |
| 12 ⚠️ | MDE.Windows or MDE.Linux VM extension is automatically reinstalled within minutes to hours after ... | Defender for Servers (P1/P2) auto-provisioning mechanism continuously evaluates VMs and installs ... | Apply ExcludeMdeAutoProvisioning tag (value: true) on the VM BEFORE removing the extension. Wait ... | 🔵 7.0 | ADO Wiki |
| 13 ⚠️ | Customer pushes a new image to ECR but VA scan results do not appear immediately or within expect... | ECR VA does not have scan-on-push capability. Scans are triggered every 1 hour for all images. Pr... | Set customer expectations: 1) Provisioning can take up to 30 minutes for new setups. 2) Image sca... | 🔵 7.0 | ADO Wiki |
| 14 ⚠️ | MDE service doesn't start after onboarding; error 577 or error 1058 when trying to start the SENS... | Early Launch Antimalware (ELAM) driver is disabled by system policy; DisableAntiSpyware or Disabl... | Clear DisableAntiSpyware and DisableAntiVirus Group Policy values; ensure ELAM driver is enabled;... | 🔵 6.0 | MS Learn |
| 15 ⚠️ | Auto from connector option is not available when creating EDR onboarding policy in Intune | The Intune-to-Defender for Endpoint service connection is not configured or not yet active. The c... | 1) Verify Defender connection shows Connected under Tenant administration > Connectors and tokens... | 🔵 6.0 | MS Learn |
| 16 ⚠️ | MDE not auto-provisioned on VMs from generalized OS images | Generalized images skip automatic MDE provisioning | Manually enable MDE via Azure CLI, REST API, or Azure Policy | 🔵 6.0 | MS Learn |
| 17 ⚠️ | MDE Security Config Management enrollment fails with error code 40 - clock sync issue | Device clock not synced correctly causing Entra registration/certificate validation to fail | Verify clock is set correctly and synced on the device (w32tm /query /status or chronyc tracking) | 🔵 6.0 | MS Learn |
| 18 ⚠️ | MDE onboarding: SENSE service does not auto-start on newly built devices if no first user logon c... | On Windows before 1809, SENSE requires first user logon to complete OOBE before auto-starting | Ensure first user logon completes before reboot; on Windows 10 1809+/Server 2019+/Azure Stack HCI... | 🔵 6.0 | MS Learn |
| 19 ⚠️ | MDE onboarding Event ID 5/6/7: service failed to connect, not onboarded, or failed to read parame... | Event 5: no internet; Event 6: onboarding script not run; Event 7: connectivity issue preventing ... | Event 5: ensure internet; Event 6: re-run onboarding script; Event 7: verify connectivity then re... | 🔵 6.0 | MS Learn |
| 20 ⚠️ | MDE Intune onboarding error 0x87D1FDE8: Remediation failed for onboarding/offboarding blob | Wrong blob signature or missing PreviousOrgIds fields in onboarding/offboarding package | Check Event Viewer; verify registry key HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Advanced Thr... | 🔵 6.0 | MS Learn |
| 21 ⚠️ | Cannot find Azure DevOps repository in Defender for Cloud DevOps security onboarding | TFSVC repository type is not supported; only TfsGit repository type is supported by DevOps securi... | Ensure repository uses TfsGit type; verify correct Azure DevOps organization user account is sign... | 🔵 6.0 | MS Learn |
| 22 ⚠️ | MDE onboarding script fails with error code 4: No internet connectivity on Linux VM behind proxy.... | /etc/environment global env vars not forwarded to systemd walinuxagent service on all Linux distr... | Create drop-in file /lib/systemd/system/walinuxagent.service.d/13-Proxy.conf with Environment=htt... | 🔵 5.0 | ADO Wiki |
| 23 ⚠️ | Devices show as unprotected in Defender for Business portal despite being onboarded - real-time p... | Non-Microsoft antivirus/antimalware solution is running on the device, causing MDAV real-time pro... | Verify and enable real-time protection in Defender for Business next-generation protection polici... | 🔵 5.0 | MS Learn |
