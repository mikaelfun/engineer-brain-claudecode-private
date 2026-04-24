# VM Elastic SAN — 排查速查

**来源数**: 1 (AW) | **条目**: 15 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Elastic SAN scale out fails in Azure Portal with Service Error when updating SAN size (e.g. Canada C | Bug in Elastic SAN RP related to Volume Groups with missing subnets in VNET conf | Workaround 1: Fix missing subnets in Volume Group VNET rules, then retry update  | 🔵 7.5 | AW |
| 2 | Elastic SAN I/O timeouts after successful iSCSI login; disk disappears from Windows VM | Windows iSCSI initiator unmounts disk when I/O times out. Windows Event 157 is l | Check Windows Event Viewer for Event 157. Initiator typically retries login auto | 🔵 7.5 | AW |
| 3 | Elastic SAN iSCSI login fails with Authentication Error or Access Denied | Customer did not correctly configure VNET ACL on the Elastic SAN Volume Group. N | Verify VNET ACL configuration on the Volume Group. Ensure the client VM subnet h | 🔵 7.5 | AW |
| 4 | Customer reports being billed for Elastic SAN after creation failed or SAN was deleted. Billing cont | During Elastic SAN creation failure, certain resources (master storage account)  | 1) Find operationId from ElasticSanRP dgrep logs. 2) Find master storage account | 🔵 7.5 | AW |
| 5 | "Storage Resource Unavailable" error when creating Elastic SAN in certain regions or availability zo | Elastic SAN is not available in all regions/zones. Some regions only support LRS | 1) Check available SKUs with Get-AzElasticSanSkuList. 2) Ensure SkuName matches  | 🔵 7.5 | AW |
| 6 | Unable to create Azure Elastic SAN resources; resource creation blocked or access denied | Elastic SAN creation is protected by AFEC feature flag (ElasticSanPreview Access | Register the subscription for AFEC (ElasticSanPreview Access) to enable Elastic  | 🔵 6.5 | AW |
| 7 | Elastic SAN networking validation fails when creating or updating volume group with VNET rules | Service endpoint not registered on the VNET, or AFEC not set for VNETs across di | Register the Microsoft.Storage or Microsoft.ElasticSan service endpoint on the t | 🔵 6.5 | AW |
| 8 | Unable to create Elastic SAN Volume Group or Volume; operation fails with permission/authorization e | User does not have the required RBAC role assignment (Elastic SAN Owner, Volume  | Assign the appropriate Elastic SAN RBAC role: Elastic SAN Owner (full access), V | 🔵 6.5 | AW |
| 9 | Elastic SAN resource creation takes a long time; provisioning slow or appears stuck | Intermittent delays during underlying storage account creation by the Elastic SA | Wait for the operation to complete. If consistently slow, check Jarvis ServiceAp | 🔵 6.5 | AW |
| 10 | Incorrect Elastic SAN billing continues after Elastic SAN resource is deleted | In rare cases, Elastic SAN billing meters are not stopped upon resource deletion | Verify billing usage via Kusto (xstore.kusto.windows.net / xdataanalytics). If b | 🔵 6.5 | AW |
| 11 | Elastic SAN iSCSI login fails with Connection Failed error; target not processing login | Network error between client and Elastic SAN target, or target did not process t | Gather client-side diagnostics: Windows Event Viewer / Linux syslogs, nslookup f | 🔵 6.5 | AW |
| 12 | Elastic SAN disk unexpectedly unmounts during Windows Failover Cluster restart. iSCSI initiator fail | iSCSI initiator session timeout (LinkDownTime) defaults to 15 seconds, which is  | Increase iSCSI initiator session timeout (LinkDownTime) to 30 seconds. See: http | 🔵 6.5 | AW |
| 13 | Customer encounters "Active sessions present on Volume. Close active sessions before modifying" erro | Active iSCSI sessions exist to the volume from one or more VMs, preventing delet | Customer must terminate iSCSI sessions from all VMs that have active connections | 🔵 6.5 | AW |
| 14 | After attempting to update Elastic SAN volume size, portal shows incorrect/stale volume details inst | Volume size update fails due to active iSCSI sessions, but portal may not immedi | Refresh the volume details in the portal to obtain the correct (original) volume | 🔵 6.5 | AW |
| 15 | Customer requests quota increase for Elastic SAN (e.g., maximum number of Elastic SANs per subscript |  | File ICM to ElasticSANRP team with title "Quota Increase for Customer Subscripti | 🔵 5.5 | AW |

## 快速排查路径

1. **Elastic SAN scale out fails in Azure Portal with Service Error when updating SAN**
   - 根因: Bug in Elastic SAN RP related to Volume Groups with missing subnets in VNET configuration. Hotfix rolled out August 2024
   - 方案: Workaround 1: Fix missing subnets in Volume Group VNET rules, then retry update from portal. Workaround 2: Use PowerShell: Update-AzElasticSan -Name <
   - `[🔵 7.5 | AW]`

2. **Elastic SAN I/O timeouts after successful iSCSI login; disk disappears from Wind**
   - 根因: Windows iSCSI initiator unmounts disk when I/O times out. Windows Event 157 is logged. If initiator retry also fails, di
   - 方案: Check Windows Event Viewer for Event 157. Initiator typically retries login automatically. If retry fails and disk disappears, reconnect the iSCSI tar
   - `[🔵 7.5 | AW]`

3. **Elastic SAN iSCSI login fails with Authentication Error or Access Denied**
   - 根因: Customer did not correctly configure VNET ACL on the Elastic SAN Volume Group. Network security rules must allow the cli
   - 方案: Verify VNET ACL configuration on the Volume Group. Ensure the client VM subnet has a service endpoint registered and is added to the Volume Group netw
   - `[🔵 7.5 | AW]`

4. **Customer reports being billed for Elastic SAN after creation failed or SAN was d**
   - 根因: During Elastic SAN creation failure, certain resources (master storage account) may still get created, causing ongoing b
   - 方案: 1) Find operationId from ElasticSanRP dgrep logs. 2) Find master storage account via operationId or Kusto. 3) File IcM to delete master storage accoun
   - `[🔵 7.5 | AW]`

5. **"Storage Resource Unavailable" error when creating Elastic SAN in certain region**
   - 根因: Elastic SAN is not available in all regions/zones. Some regions only support LRS (not ZRS), and some regions may not hav
   - 方案: 1) Check available SKUs with Get-AzElasticSanSkuList. 2) Ensure SkuName matches region capabilities. 3) Try other availability zones. 4) Use GetSanRpS
   - `[🔵 7.5 | AW]`

