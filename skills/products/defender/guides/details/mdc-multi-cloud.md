# DEFENDER 多云连接 (AWS/GCP) — Comprehensive Troubleshooting Guide

**Entries**: 35 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-gcp-audit-logs-tsg.md, ado-wiki-b-tsg-gcp-agentless-platform-issues.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Multi Cloud
> Sources: ado-wiki

**1. Member accounts not created for AWS master account multi-cloud connector after 12+ hours**

- **Root Cause**: AWS stackset not deployed correctly or discovery not finding member accounts. SLA 24h.
- **Solution**: Wait 12h (SLA 24h). Verify stackset deployment. Use Kusto Span table on romemulticloudlogsprd for onboarding/autoprov activity.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. HTTP 400 creating AWS security connector: IAM role(s) do not exist or are invalid**

- **Root Cause**: IAM role missing or lacks sts:RoleSessionName condition in trust relationship.
- **Solution**: Verify IAM role exists. Check trust relationship has sts:RoleSessionName. Redeploy CloudFormation template.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**3. 404 not found error syncing ARM resources for multi-cloud connector**

- **Root Cause**: Possible Cosmos DB access issue in onboarding service.
- **Solution**: Check entity store via Kusto on ascentitystoreprdus.centralus ConnectorDataRecordsMetadata. If exists sync via Geneva Actions ARM. Check CosmosDB in TraceEvent.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**4. AWS/GCP account deleted but MDC security connector still exists**

- **Root Cause**: MDC does not auto-delete connector when cloud account is deleted.
- **Solution**: Customer must manually delete the MDC security connector.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**5. Identity provider is missing error connecting AWS to MDC**

- **Root Cause**: Old Azure AD directory ID in CloudFormation template.
- **Solution**: Download fresh CF template from MDC portal and redeploy in AWS.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**6. Multi-cloud org connectors not working: member and org on different subscriptions**

- **Root Cause**: Org and member connectors must be in same subscription.
- **Solution**: Ensure all connectors in same Azure subscription.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**7. Multi-cloud log ingestion for AWS CloudTrail / GCP Cloud Logging not working; no logs appearing in MDC**

- **Root Cause**: Defender CSPM is not enabled on the AWS/GCP connector; Log Ingestion requires CSPM to be enabled during onboarding
- **Solution**: Enable Defender CSPM and Log Ingestion on the AWS/GCP connector during onboarding; ensure the CloudFormation/CloudShell/Terraform script is properly executed
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**8. Customer remediated an AWS/GCP resource configuration but MDC still shows the multi-cloud recommendation as non-compliant (UNHEALTHY).**

- **Root Cause**: Multi-cloud recommendation freshness interval is up to 12 hours. Connector sync from AWS/GCP may not have completed, or the remediation does not fully satisfy the underlying KQL query condition evaluated against RawEntityMetadata in ARG.
- **Solution**: 1) Check freshness interval (up to 12h, no forced refresh). 2) Run recommendation KQL query in ARG against RawEntityMetadata filtered to specific resource. 3) Inspect Record column to verify if MDC has latest config. 4) If Record stale, wait for next sync. 5) If Record current but UNHEALTHY, review query condition and walk customer through exact fields being evaluated.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**9. AWS connector created but no subresources added (EC2 S3 etc)**

- **Root Cause**: CloudFormation template not deployed correctly.
- **Solution**: Verify CF template deployment. If OK escalate to discovery team with connector ID.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — ADO Wiki]`

**10. Errors during legacy multi-cloud onboarding: internal errors or SPN not valid**

- **Root Cause**: SPN must be created by Owner. Permissions misconfigured. Account onboarded once only.
- **Solution**: Verify SPN by Owner role. Check AWS/GCP permissions. Confirm not already onboarded. Legacy deprecated Sep 2023.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — ADO Wiki]`

**11. No CIEM recommendations appearing after enabling Multi-Cloud Log Ingestion on AWS/GCP connector**

- **Root Cause**: CIEM is not enabled; Log Ingestion is separate from CIEM, but CIEM is currently the only consumer of ingested logs
- **Solution**: Enable CIEM feature on the connector; without CIEM enabled, ingested logs provide no value
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — ADO Wiki]`

### Phase 2: Mepm
> Sources: ado-wiki

**1. MDC + EPM 双授权（EPM-first）客户在 AWS 上启用 MDC Permissions Management 扩展时，CloudFormation 部署失败或与已有 EPM 资源冲突**

- **Root Cause**: EPM-first 客户已在 AWS 部署了 EPM IAM 角色和 identity provider，MDC CloudFormation 模板尝试重复创建同名资源（如 DefenderForCloud-OidcCiem、DefenderForCloud-Ciem）导致冲突
- **Solution**: 修改 MDC CloudFormation 模板：删除 Parameters 中 CiemOidcRoleName/CiemCloudTrailBucketName/CiemRoleName，删除 Resources 中6个 CIEM 相关资源，删除 Outputs 中对应项；在 wizard Step 3 中将 CIEMAccountRole 和 CIEMOidcRole 名称修改为与 EPM portal 中完全一致的名称
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**2. MDC + EPM 双授权（EPM-first）客户在 GCP 上启用 MDC Permissions Management 扩展时，gcloud script 与已有 EPM 资源冲突或产生冗余 service account**

- **Root Cause**: EPM-first 客户已在 GCP 部署了 CIEM service account 和 workload identity provider，MDC gcloud script 尝试重复创建相同资源
- **Solution**: Option 1（简单）：直接运行完整 gcloud script，接受产生冗余 service account。Option 2（精细）：从 gcloud script 删除 microsoft-defender-ciem service account 创建段及对应 policy binding、ciem-discovery identity provider 创建段，并在 wizard Step 3 中将 CIEM OIDC Service Account Name 和 Workload Identity Pool Provider ID 修改为 EPM portal 中的相同值
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**3. GCP security connector creation fails during MEPM onboarding - error creating app registration in AAD**

- **Root Cause**: Logged-in user lacks permissions to create app registration mciem-gcp-oidc-app in Azure AD
- **Solution**: Ask user with AAD app registration permissions to create the security connector. If still fails, open CRI with GCP project/org ID, subscription ID, portal session ID
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**4. GCP gcloud script fails for MEPM-specific resources (DefenderForCloud-OidcCiem service account or ciem-discovery workload identity provider)**

- **Root Cause**: GCP script deployment failure related to MEPM resources - service account or workload identity provider creation failed
- **Solution**: Before CRI, gather: 1) EPM license status, 2) error from GCP console, 3) gcloud script used, 4) GCP project ID + subscription ID, 5) onboarding type. Open CRI with all info
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**5. GCP MEPM connector created successfully but no recommendations after 24h - third-party app mciem-gcp-oidc-app missing or misconfigured in AAD**

- **Root Cause**: Third-party app registration mciem-gcp-oidc-app was not created or its Expose an API configuration is incorrect
- **Solution**: Search AAD for mciem-gcp-oidc-app. If missing, create with az ad app create. If exists, verify Expose an API configuration matches expected setup
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**6. GCP MEPM no recommendations - GCP resources (service account or workload identity provider) deleted or missing from project**

- **Root Cause**: Required GCP resources (service account and workload identity provider) were deleted or never created. Resource names are customizable and found via ARG query for the security connector
- **Solution**: Query ARG for security connector by GCP project ID. Find CIEM service account and WI provider names from connector properties. Verify in GCP IAM. If missing, re-run gcloud script
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 3: Aws
> Sources: ado-wiki

**1. Defender for Cloud cannot connect to an AWS account that is already connected to Microsoft Sentinel. CloudFormation template deployment fails due to OIDC identity provider conflict.**

- **Root Cause**: Defender for Cloud and Microsoft Sentinel use the same authentication mechanism (OIDC identity provider: ASCDefendersOIDCIdentityProvider). When Sentinel connects first, Defender for Cloud CloudFormation template cannot create a duplicate provider.
- **Solution**: Modify CloudFormation template: (1) Copy ClientIdList from ASCDefendersOIDCIdentityProvider section, (2) Delete the ASCDefendersOIDCIdentityProvider section from template, (3) In AWS IAM > Identity Providers, find 33e01921-4d64-4f8c-a055-5bdaffd5e33d, add the copied audience, (4) Deploy the modified template. See: https://learn.microsoft.com/en-us/azure/defender-for-cloud/sentinel-connected-aws
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. EC2 instances in AWS not automatically onboarding to Azure Arc after creating AWS connector with Defender for Servers and Arc auto-provisioning enabled in MDC**

- **Root Cause**: Prerequisites not met on EC2 instances: (1) OS not supported by Azure Arc, (2) AWS SSM (Systems Manager) agent not installed, or (3) IAM role AmazonSSMRoleForInstancesMDCSetup not attached to the instance
- **Solution**: Verify 3 prerequisites: (1) EC2 has supported OS per Azure Arc docs, (2) SSM agent is installed (check via AWS SSM agent status commands), (3) IAM role AmazonSSMRoleForInstancesMDCSetup is attached to EC2 instance. Use Kusto query on romelogs.kusto.windows.net/Rome3Prod FabricTraceEvent (applicationName=MultiCloudAgentsApp) to trace onboarding failures. Collect Arc logs: Windows %ProgramData%\AzureConnectedMachineAgent\Log, Linux /var/opt/azcmagent.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**3. Customer requests onboarding AWS GovCloud to Microsoft Defender for Cloud**

- **Root Cause**: AWS GovCloud is not supported on MDC commercial platform. Support is being developed for onboarding AWS Gov from public Azure only (not from Azure Gov)
- **Solution**: Inform customer that AWS Gov onboarding to MDC is not currently supported. PG is working on support for onboarding from public Azure only (not Gov Azure). Check with PG for latest ETA.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**4. Assigning regulatory compliance standard to AWS connector fails with 401 status code error: Failed unauthorized action request**

- **Root Cause**: AWS connector only has free CSPM bundle (CSPMMonitor) enabled. Additional offerings must be enabled on the connector to assign regulatory compliance standards. This is by-design limitation.
- **Solution**: (1) Check prerequisites per MS docs (update-regulatory-compliance-packages). (2) Verify if connector has only CSPMMonitor free bundle. (3) Enable additional offerings/plans (e.g. Defender CSPM) on the AWS connector, then retry assigning the compliance standard.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**5. AWS/GCP security connector created and sub-resources (EC2, S3, etc.) appear in inventory, but no security recommendations are generated in MDC**

- **Root Cause**: No security standards (regulatory compliance assignments) are configured on the security connector
- **Solution**: Go to MDC Environment Settings > select the connector > Settings menu > Standards. Verify standards/assignments exist. If standards are present but still no recommendations, escalate to PG contacts: Bahjat Musa (standards issues) or Tal Cohen (other issues).
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 4: Ciem
> Sources: ado-wiki

**1. CIEM AWS OIDC authentication failures observed — AssumeRole operations failing in telemetry**

- **Root Cause**: Customer configuration error: AWS environment does not trust the OIDC IDP, environment was deleted, permissions were removed post-onboarding, or other customer-side changes
- **Solution**: Run Kusto span query to assess success/failure ratio: `Span | where TIMESTAMP > ago(30d) | where name == 'AssumeRoleAwsCredentialsProvider.GetCredentialsAsync' | summarize Count=count() by bin(TIMESTAMP,1d), OperationResult | render timechart`. If mostly customer-error failures → guide customer to restore IDP trust or connector configuration. Customer must reinstate permissions matching CloudFormation stack from onboarding.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. CIEM AWS Hydration fails — CloudTrail data not collected from customer AWS S3 bucket/SQS**

- **Root Cause**: Customer mis-configured S3 bucket or SQS resources, or customer changed permissions from onboarding time (no longer matching original CloudFormation stack)
- **Solution**: 1) Run ADX query to get S3 bucket ARN and SQS ARN: `cluster('adx-ciem-prod-cus.centralus').database('CIEMDataProcessing').GetAwsSecurityConnectors1h | where TenantId == '{TenantId}'`. 2) Check Kusto Span for S3FileAnalyzer errors: `cluster('mdcprd.centralus').database('Mdcx').Span | where name == 'S3FileAnalyzer.AnalyzeSingleS3BucketAsync' | extend Data=todynamic(customData) | extend BucketName=tostring(Data.bucketName) | where BucketName == '{bucket}'`. 3) If permissions issue → ask customer to restore CloudFormation stack permissions. 4) If resources deleted → ask customer to re-create and update security connector. 5) Check [dashboard](https://dataexplorer.azure.com/dashboards/bd61b360-b592-4346-ac7d-ea8014d942d3) for customer-error vs failure classification.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. GCP CIEM shows no recommendations after connector creation for large, heavily used GCP projects**

- **Root Cause**: Large GCP project hydration takes up to 5 days to collect last 90 days of logs from gcloud, plus 1 more day for CIEM to process — total up to 6 days
- **Solution**: Wait up to 6 days for hydration to complete. If customer uses IAM recommender and already has recommendations, they should not be affected by hydration. No action required if within the expected timeline. If IAM recommender recommendations exist, a different scenario may be at play.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. CIEM AWS OIDC auth shows zero successes across all tenants — no successful AssumeRole operations in telemetry**

- **Root Cause**: Microsoft-side issue: the Entra App used for CIEM OIDC authentication may have been removed or misconfigured
- **Solution**: Check Kusto Span table for AssumeRoleAwsCredentialsProvider — if ALL results are failures (zero successes), escalate as platform issue. Verify Entra App IDs are present per environment: Dev=899f0cc2-ecb4-4247-a440-1d21babd8e61, Staging=e042d438-82e4-4138-a23c-bcf296c09e99, Production=5e174513-2037-45d3-9eca-29403f20193f. If Entra App removed → file CRI.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 5: Gcp
> Sources: ado-wiki, mslearn

**1. GCP connector successfully created in MDC but no subresources are added - connector shows no child resources**

- **Root Cause**: Issues during GCP onboarding step: GCLOUD script or Configure Access tab did not properly create required GCP resources (WorkloadIdentityPool, WorkloadIdentityProvider, ServiceAccount, or role assignments)
- **Solution**: Verify in GCP project: (1) WorkloadIdentityPoolId exists and correctly configured, (2) WorkloadIdentityProviderId established, (3) ServiceAccountEmail is accurate, (4) Service account has necessary roles assigned. If all confirmed and issue persists, contact discovery team (Sulaiman Rashed, Sivan Manor, Chemi Shumacher) with connector ID.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. GCP Security connector onboarding script fails with error: User is not in permitted organization - constraints/iam.allowedPolicyMemberDomains violation when assigning permissions to MDC agentless scan**

- **Root Cause**: Customer GCP organization enforces Domain restricted sharing policy (iam.allowedPolicyMemberDomains) which blocks MDC service accounts (mdc-agentless-scanning@guardians-prod-diskscanning.iam.gserviceaccount.com and service-220551266886@compute-system.iam.gserviceaccount.com)
- **Solution**: Add MDC organization principal set to the allowed list in Domain restricted sharing policy: principalSet://iam.googleapis.com/organizations/517615557103. Ensure policy is managed at organization level (not project level). After propagation, rerun onboarding script or manually run the two service account permission commands. Verify permissions in GCP IAM page. Reference CRI: ICM-514230667.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**3. GCP onboarding deployment script fails when connecting GCP account to Defender for Cloud**

- **Root Cause**: GCP enforces Domain Restricted Sharing policy by default for organizations created after May 2024; blocks IAM permission assignment to external service accounts including Defender for Cloud
- **Solution**: In GCP: IAM and Admin > Organization Policies > Domain Restricted Sharing > Manage policy; add Defender for Cloud org ID principalSet://iam.googleapis.com/organizations/517615557103 or Customer ID C03um0klj to allowed principals; wait for propagation then rerun deployment script
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 6: Agentless Scanning
> Sources: ado-wiki, mslearn

**1. AWS control plane secret scanning not detecting secrets in CloudFormation templates despite Defender CSPM enabled for the AWS connector**

- **Root Cause**: The MDC CSPM Reader role on the AWS account is missing required CloudFormation permissions: cloudformation:DescribeStacks and cloudformation:GetTemplate. Without these, the CPDA service cannot retrieve template content for scanning.
- **Solution**: Grant the MDC CSPM Reader role the following permissions on the AWS account: cloudformation:DescribeStacks and cloudformation:GetTemplate. Note: For Azure only template parameters/outputs/tags are scanned (not ARM content). For AWS template content plus outputs/tags/parameters are all scanned. Supported secret types: https://learn.microsoft.com/en-us/azure/defender-for-cloud/sensitive-info-types
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. Defender for Cloud agentless scanning blocked by GCP VPC Service Controls - no scan results for GCP VMs within protected VPC perimeters**

- **Root Cause**: GCP VPC Service Controls perimeters block Defender for Cloud service accounts from accessing resources. Ingress and egress policies need to be configured to allow MDC service accounts.
- **Solution**: Add ingress policies for service accounts: mdc-agentless-scanning@guardians-prod-diskscanning.iam.gserviceaccount.com and microsoft-defender-cspm@eu-secure-vm-project.iam.gserviceaccount.com. Add egress policy for mdc-agentless-scanning account. Check GCP Logs Explorer for VPC Service Controls violations. Results appear within 24 hours.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 7: Multicloud
> Sources: ado-wiki

**1. Multicloud (AWS/GCP) connector assessments stuck or stale in MDC after connector was deleted and recreated with same resource ID**

- **Root Cause**: Deleting and recreating a connector with same resource ID generates different internal unique ID, causing existing assessments to become stale. Smart Aligner cannot identify them by internal ID.
- **Solution**: Run ARG query to check for connectors with duplicate unique IDs. Provide connector unique IDs to recommendation platform owner for manual deletion using Rome-Defenders-Utilities Remove-CosmosDbItems.ps1 script. Keep assessments for unique ID with most recent evaluations.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 8: Servicenow
> Sources: ado-wiki

**1. Cannot create ServiceNow governance assignment for AWS/GCP recommendations despite having subscription-level integration**

- **Root Cause**: Subscription-level ServiceNow integration only covers Azure resources. AWS/GCP recommendations require a connector-level integration.
- **Solution**: Create a ServiceNow integration at the connector level (not subscription level) for AWS/GCP environments.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 9: Dcspm
> Sources: ado-wiki

**1. missingPermissions error raised by K8sProxy service when MDC cannot add its IP CIDR block to EKS (AWS) or GKE (GCP) clusters that impose IP restrictions, blocking agentless K8s data collection**

- **Root Cause**: MDCContainersAgentlessDiscoveryK8sRole (AWS) or MDC GKE Cluster Write Role (GCP) lacks permission to update cluster IP access restrictions; customer likely deleted MDC-provisioned permissions
- **Solution**: AWS: add eks:UpdateClusterConfig to MDCContainersAgentlessDiscoveryK8sRole (or custom role). GCP: add container.clusters.update to MDC GKE Cluster Write Role attached to mdc-containers-k8s-operator service account (or custom names used during connector creation).
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 10: Defender For Containers
> Sources: ado-wiki

**1. UberCollectorWindowsProcessedThroughputTooLow ICM alert triggered. UberCollectorInstance in specific region is reported as unhealthy. Scubas monitor indicates increased authentication errors with GCP/**

- **Root Cause**: Customers have offboarded from Defender for Containers services and deleted the resources or certificates provisioned for authentication with GCP/AWS resources. The audit log rules removal from Scubas Cosmos DB takes up to 24 hours, during which the monitor fires.
- **Solution**: 1) Run Kusto queries on romeeus.eastus.kusto.windows.net ProdRawEvents: GetGkeClustersForAgentAndAuditLogProvisioning and GetEksClustersForAgentAndAuditLogProvisioning filtered by TimeStamp < ago(12h) 2) If large number of clusters show timestamps NOT from the last 24 hours, this confirms mass offboarding - the monitor will auto-mitigate within 24 hours 3) For any other issue, contact the Defender for Containers sensor on-call team via ICM
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🟡 4.0/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | CIEM AWS OIDC authentication failures observed — AssumeRole operations failing in telemetry | Customer configuration error: AWS environment does not trust the OIDC IDP, environment was delete... | Run Kusto span query to assess success/failure ratio: `Span / where TIMESTAMP > ago(30d) / where ... | 🟢 8.5 | ADO Wiki |
| 2 | CIEM AWS Hydration fails — CloudTrail data not collected from customer AWS S3 bucket/SQS | Customer mis-configured S3 bucket or SQS resources, or customer changed permissions from onboardi... | 1) Run ADX query to get S3 bucket ARN and SQS ARN: `cluster('adx-ciem-prod-cus.centralus').databa... | 🟢 8.5 | ADO Wiki |
| 3 | GCP CIEM shows no recommendations after connector creation for large, heavily used GCP projects | Large GCP project hydration takes up to 5 days to collect last 90 days of logs from gcloud, plus ... | Wait up to 6 days for hydration to complete. If customer uses IAM recommender and already has rec... | 🟢 8.5 | ADO Wiki |
| 4 | Multicloud (AWS/GCP) connector assessments stuck or stale in MDC after connector was deleted and ... | Deleting and recreating a connector with same resource ID generates different internal unique ID,... | Run ARG query to check for connectors with duplicate unique IDs. Provide connector unique IDs to ... | 🟢 8.5 | ADO Wiki |
| 5 | MDC + EPM 双授权（EPM-first）客户在 AWS 上启用 MDC Permissions Management 扩展时，CloudFormation 部署失败或与已有 EPM 资源冲突 | EPM-first 客户已在 AWS 部署了 EPM IAM 角色和 identity provider，MDC CloudFormation 模板尝试重复创建同名资源（如 DefenderFo... | 修改 MDC CloudFormation 模板：删除 Parameters 中 CiemOidcRoleName/CiemCloudTrailBucketName/CiemRoleName，删... | 🔵 7.5 | ADO Wiki |
| 6 | MDC + EPM 双授权（EPM-first）客户在 GCP 上启用 MDC Permissions Management 扩展时，gcloud script 与已有 EPM 资源冲突或产生冗... | EPM-first 客户已在 GCP 部署了 CIEM service account 和 workload identity provider，MDC gcloud script 尝试重复创建... | Option 1（简单）：直接运行完整 gcloud script，接受产生冗余 service account。Option 2（精细）：从 gcloud script 删除 microsof... | 🔵 7.5 | ADO Wiki |
| 7 | CIEM AWS OIDC auth shows zero successes across all tenants — no successful AssumeRole operations ... | Microsoft-side issue: the Entra App used for CIEM OIDC authentication may have been removed or mi... | Check Kusto Span table for AssumeRoleAwsCredentialsProvider — if ALL results are failures (zero s... | 🔵 7.5 | ADO Wiki |
| 8 ⚠️ | GCP security connector creation fails during MEPM onboarding - error creating app registration in... | Logged-in user lacks permissions to create app registration mciem-gcp-oidc-app in Azure AD | Ask user with AAD app registration permissions to create the security connector. If still fails, ... | 🔵 7.0 | ADO Wiki |
| 9 ⚠️ | GCP gcloud script fails for MEPM-specific resources (DefenderForCloud-OidcCiem service account or... | GCP script deployment failure related to MEPM resources - service account or workload identity pr... | Before CRI, gather: 1) EPM license status, 2) error from GCP console, 3) gcloud script used, 4) G... | 🔵 7.0 | ADO Wiki |
| 10 ⚠️ | GCP MEPM connector created successfully but no recommendations after 24h - third-party app mciem-... | Third-party app registration mciem-gcp-oidc-app was not created or its Expose an API configuratio... | Search AAD for mciem-gcp-oidc-app. If missing, create with az ad app create. If exists, verify Ex... | 🔵 7.0 | ADO Wiki |
| 11 ⚠️ | GCP MEPM no recommendations - GCP resources (service account or workload identity provider) delet... | Required GCP resources (service account and workload identity provider) were deleted or never cre... | Query ARG for security connector by GCP project ID. Find CIEM service account and WI provider nam... | 🔵 7.0 | ADO Wiki |
| 12 ⚠️ | Cannot create ServiceNow governance assignment for AWS/GCP recommendations despite having subscri... | Subscription-level ServiceNow integration only covers Azure resources. AWS/GCP recommendations re... | Create a ServiceNow integration at the connector level (not subscription level) for AWS/GCP envir... | 🔵 7.0 | ADO Wiki |
| 13 ⚠️ | Defender for Cloud cannot connect to an AWS account that is already connected to Microsoft Sentin... | Defender for Cloud and Microsoft Sentinel use the same authentication mechanism (OIDC identity pr... | Modify CloudFormation template: (1) Copy ClientIdList from ASCDefendersOIDCIdentityProvider secti... | 🔵 7.0 | ADO Wiki |
| 14 ⚠️ | EC2 instances in AWS not automatically onboarding to Azure Arc after creating AWS connector with ... | Prerequisites not met on EC2 instances: (1) OS not supported by Azure Arc, (2) AWS SSM (Systems M... | Verify 3 prerequisites: (1) EC2 has supported OS per Azure Arc docs, (2) SSM agent is installed (... | 🔵 7.0 | ADO Wiki |
| 15 ⚠️ | Customer requests onboarding AWS GovCloud to Microsoft Defender for Cloud | AWS GovCloud is not supported on MDC commercial platform. Support is being developed for onboardi... | Inform customer that AWS Gov onboarding to MDC is not currently supported. PG is working on suppo... | 🔵 7.0 | ADO Wiki |
| 16 ⚠️ | Assigning regulatory compliance standard to AWS connector fails with 401 status code error: Faile... | AWS connector only has free CSPM bundle (CSPMMonitor) enabled. Additional offerings must be enabl... | (1) Check prerequisites per MS docs (update-regulatory-compliance-packages). (2) Verify if connec... | 🔵 7.0 | ADO Wiki |
| 17 ⚠️ | GCP connector successfully created in MDC but no subresources are added - connector shows no chil... | Issues during GCP onboarding step: GCLOUD script or Configure Access tab did not properly create ... | Verify in GCP project: (1) WorkloadIdentityPoolId exists and correctly configured, (2) WorkloadId... | 🔵 7.0 | ADO Wiki |
| 18 ⚠️ | GCP Security connector onboarding script fails with error: User is not in permitted organization ... | Customer GCP organization enforces Domain restricted sharing policy (iam.allowedPolicyMemberDomai... | Add MDC organization principal set to the allowed list in Domain restricted sharing policy: princ... | 🔵 7.0 | ADO Wiki |
| 19 ⚠️ | AWS/GCP security connector created and sub-resources (EC2, S3, etc.) appear in inventory, but no ... | No security standards (regulatory compliance assignments) are configured on the security connector | Go to MDC Environment Settings > select the connector > Settings menu > Standards. Verify standar... | 🔵 7.0 | ADO Wiki |
| 20 ⚠️ | Member accounts not created for AWS master account multi-cloud connector after 12+ hours | AWS stackset not deployed correctly or discovery not finding member accounts. SLA 24h. | Wait 12h (SLA 24h). Verify stackset deployment. Use Kusto Span table on romemulticloudlogsprd for... | 🔵 7.0 | ADO Wiki |
| 21 ⚠️ | HTTP 400 creating AWS security connector: IAM role(s) do not exist or are invalid | IAM role missing or lacks sts:RoleSessionName condition in trust relationship. | Verify IAM role exists. Check trust relationship has sts:RoleSessionName. Redeploy CloudFormation... | 🔵 7.0 | ADO Wiki |
| 22 ⚠️ | 404 not found error syncing ARM resources for multi-cloud connector | Possible Cosmos DB access issue in onboarding service. | Check entity store via Kusto on ascentitystoreprdus.centralus ConnectorDataRecordsMetadata. If ex... | 🔵 7.0 | ADO Wiki |
| 23 ⚠️ | AWS/GCP account deleted but MDC security connector still exists | MDC does not auto-delete connector when cloud account is deleted. | Customer must manually delete the MDC security connector. | 🔵 7.0 | ADO Wiki |
| 24 ⚠️ | Identity provider is missing error connecting AWS to MDC | Old Azure AD directory ID in CloudFormation template. | Download fresh CF template from MDC portal and redeploy in AWS. | 🔵 7.0 | ADO Wiki |
| 25 ⚠️ | Multi-cloud org connectors not working: member and org on different subscriptions | Org and member connectors must be in same subscription. | Ensure all connectors in same Azure subscription. | 🔵 7.0 | ADO Wiki |
| 26 ⚠️ | Multi-cloud log ingestion for AWS CloudTrail / GCP Cloud Logging not working; no logs appearing i... | Defender CSPM is not enabled on the AWS/GCP connector; Log Ingestion requires CSPM to be enabled ... | Enable Defender CSPM and Log Ingestion on the AWS/GCP connector during onboarding; ensure the Clo... | 🔵 7.0 | ADO Wiki |
| 27 ⚠️ | Customer remediated an AWS/GCP resource configuration but MDC still shows the multi-cloud recomme... | Multi-cloud recommendation freshness interval is up to 12 hours. Connector sync from AWS/GCP may ... | 1) Check freshness interval (up to 12h, no forced refresh). 2) Run recommendation KQL query in AR... | 🔵 7.0 | ADO Wiki |
| 28 ⚠️ | missingPermissions error raised by K8sProxy service when MDC cannot add its IP CIDR block to EKS ... | MDCContainersAgentlessDiscoveryK8sRole (AWS) or MDC GKE Cluster Write Role (GCP) lacks permission... | AWS: add eks:UpdateClusterConfig to MDCContainersAgentlessDiscoveryK8sRole (or custom role). GCP:... | 🔵 7.0 | ADO Wiki |
| 29 ⚠️ | AWS control plane secret scanning not detecting secrets in CloudFormation templates despite Defen... | The MDC CSPM Reader role on the AWS account is missing required CloudFormation permissions: cloud... | Grant the MDC CSPM Reader role the following permissions on the AWS account: cloudformation:Descr... | 🔵 7.0 | ADO Wiki |
| 30 ⚠️ | AWS connector created but no subresources added (EC2 S3 etc) | CloudFormation template not deployed correctly. | Verify CF template deployment. If OK escalate to discovery team with connector ID. | 🔵 6.0 | ADO Wiki |
| 31 ⚠️ | Errors during legacy multi-cloud onboarding: internal errors or SPN not valid | SPN must be created by Owner. Permissions misconfigured. Account onboarded once only. | Verify SPN by Owner role. Check AWS/GCP permissions. Confirm not already onboarded. Legacy deprec... | 🔵 6.0 | ADO Wiki |
| 32 ⚠️ | No CIEM recommendations appearing after enabling Multi-Cloud Log Ingestion on AWS/GCP connector | CIEM is not enabled; Log Ingestion is separate from CIEM, but CIEM is currently the only consumer... | Enable CIEM feature on the connector; without CIEM enabled, ingested logs provide no value | 🔵 6.0 | ADO Wiki |
| 33 ⚠️ | Defender for Cloud agentless scanning blocked by GCP VPC Service Controls - no scan results for G... | GCP VPC Service Controls perimeters block Defender for Cloud service accounts from accessing reso... | Add ingress policies for service accounts: mdc-agentless-scanning@guardians-prod-diskscanning.iam... | 🔵 6.0 | MS Learn |
| 34 ⚠️ | GCP onboarding deployment script fails when connecting GCP account to Defender for Cloud | GCP enforces Domain Restricted Sharing policy by default for organizations created after May 2024... | In GCP: IAM and Admin > Organization Policies > Domain Restricted Sharing > Manage policy; add De... | 🔵 6.0 | MS Learn |
| 35 ⚠️ | UberCollectorWindowsProcessedThroughputTooLow ICM alert triggered. UberCollectorInstance in speci... | Customers have offboarded from Defender for Containers services and deleted the resources or cert... | 1) Run Kusto queries on romeeus.eastus.kusto.windows.net ProdRawEvents: GetGkeClustersForAgentAnd... | 🟡 4.0 | ADO Wiki |
