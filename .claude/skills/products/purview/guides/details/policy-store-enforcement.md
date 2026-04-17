# Purview 策略存储与执行 -- Comprehensive Troubleshooting Guide

**Entries**: 11 | **Drafts fused**: 2 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-a-policy-change-removing-corp-access.md](..\guides/drafts/ado-wiki-a-policy-change-removing-corp-access.md), [ado-wiki-get-tenant-xml-scc-labeling-policy.md](..\guides/drafts/ado-wiki-get-tenant-xml-scc-labeling-policy.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-policy-change-removing-corp-access.md

1. dSTS Enforcement to Block Corp Access `[source: ado-wiki-a-policy-change-removing-corp-access.md]`
2. What this Change means? `[source: ado-wiki-a-policy-change-removing-corp-access.md]`
3. What does this mean? What are the impacted scenarios? `[source: ado-wiki-a-policy-change-removing-corp-access.md]`
4. Geneva Actions environments in scope for this enforcement `[source: ado-wiki-a-policy-change-removing-corp-access.md]`
5. What action is needed from me as Geneva Actions Extension owner? `[source: ado-wiki-a-policy-change-removing-corp-access.md]`
6. What action is needed from me as Geneva Actions user executing an operation? `[source: ado-wiki-a-policy-change-removing-corp-access.md]`
7. Support Contacts `[source: ado-wiki-a-policy-change-removing-corp-access.md]`
8. Get Tenant XML SCC labeling Policy `[source: ado-wiki-get-tenant-xml-scc-labeling-policy.md]`
9. Running the Script `[source: ado-wiki-get-tenant-xml-scc-labeling-policy.md]`
10. Login with admin privileges `[source: ado-wiki-get-tenant-xml-scc-labeling-policy.md]`

### Phase 2: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Policy publish allows binding policies to data sources that are not part of the ... | Known product bug in policy publish flow — source validation... | PG is aware and working on a fix (ETA unknown). Advise customer that this is a k... |
| Created a Purview access policy but it is not getting enforced / policy not exec... | Policy is either not published, or was published to the wron... | 1) Verify the policy status is 'Published'. 2) Verify the policy is published to... |
| Policy deletion fails with error: 'Deletion of policy with bindings is not allow... | One or more data sources are still associated (bound) with t... | Delete all data source bindings (associations) from the policy first, then retry... |
| ADLS Gen2 data policy created via Purview Data Governance is not working as expe... | Multiple possible causes: 1) Policy created at file level in... | 1) For Storage Explorer: create policy at container level. 2) For Synapse worksp... |
| Policy Store calls to Artifact Store fail with 'ArtifactStoreError_PurviewAuthzP... | The data factory associated with the Purview account does no... | Contact RP team to investigate why the data factory for the Purview account does... |
| Policy Store CRUD operations fail with ErrorResponseException/ArtifactStoreExcep... | Collection reference has not yet propagated to Artifact Stor... | Retries should succeed once propagation completes. Check with RP team if the col... |
| 500 Internal Server Error from Gateway during policy CRUD operations, or 401 Una... | Client certificate domain used is not whitelisted in the env... | 1) Get correlation ID from logs and query ProjectBabylonLogEvent. 2) Check the c... |
| Old Purview accounts throw error: cnfCondition in AttributeRule not supported. P... | Validation rules were updated but old accounts have not been... | Account needs migration. Query PolicyStoreLogEvent on babylon.eastus2 cluster fo... |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Policy publish allows binding policies to data sources that are not part of the asset being governed... | Known product bug in policy publish flow — source validation does not properly r... | PG is aware and working on a fix (ETA unknown). Advise customer that this is a known limitation and ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Policy/Policy%20publish/FAQs%20and%20limitations) |
| 2 | Created a Purview access policy but it is not getting enforced / policy not executing on the target ... | Policy is either not published, or was published to the wrong/incorrect data sou... | 1) Verify the policy status is 'Published'. 2) Verify the policy is published to the correct data so... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Policy/Policy%20publish/Policy%20not%20executing) |
| 3 | Policy deletion fails with error: 'Deletion of policy with bindings is not allowed'. | One or more data sources are still associated (bound) with the policy. Policies ... | Delete all data source bindings (associations) from the policy first, then retry the delete operatio... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Policy/Self-Service%20access%20policy%20deletion/Policy%20deletion%20failed) |
| 4 | ADLS Gen2 data policy created via Purview Data Governance is not working as expected | Multiple possible causes: 1) Policy created at file level instead of container l... | 1) For Storage Explorer: create policy at container level. 2) For Synapse workspace: file-level poli... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FPolicy%2FPolicy%20-%20Customer%20Issues%2FADLS%20Gen2%20policy%20not%20working) |
| 5 | Policy Store calls to Artifact Store fail with 'ArtifactStoreError_PurviewAuthzPolicy' and 'Artifact... | The data factory associated with the Purview account does not exist in Artifact ... | Contact RP team to investigate why the data factory for the Purview account does not exist. Query Po... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/Troubleshooting%20Guides%20(TSGs)/Policy/Policy%20-%20Customer%20Issues/Collection%20reference%20not%20available%20in%20Artifact%20Store) |
| 6 | Policy Store CRUD operations fail with ErrorResponseException/ArtifactStoreException 'The reference ... | Collection reference has not yet propagated to Artifact Store (timing/propagatio... | Retries should succeed once propagation completes. Check with RP team if the collection is in a fail... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/Troubleshooting%20Guides%20(TSGs)/Policy/Policy%20-%20Customer%20Issues/Failing%20Artifact%20Store%20requests) |
| 7 | 500 Internal Server Error from Gateway during policy CRUD operations, or 401 Unauthorized when Polic... | Client certificate domain used is not whitelisted in the environment-specific co... | 1) Get correlation ID from logs and query ProjectBabylonLogEvent. 2) Check the certificate domain fr... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/Troubleshooting%20Guides%20(TSGs)/Policy/Policy%20-%20Customer%20Issues/Invalid%20Client%20Certificate%20Issues%20TSG) |
| 8 | Old Purview accounts throw error: cnfCondition in AttributeRule not supported. PolicyStoreException ... | Validation rules were updated but old accounts have not been migrated, causing u... | Account needs migration. Query PolicyStoreLogEvent on babylon.eastus2 cluster for ExceptionType Poli... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/Troubleshooting%20Guides%20(TSGs)/Policy/Policy%20-%20Customer%20Issues/Old%20accounts%20throwing%20errors) |
| 9 | ADLS Gen2 container not visible in Asset section when creating a new policy in Purview | Data source or container has not been scanned successfully, or Purview account l... | 1) Verify the data source/container has been scanned successfully - if not, rescan it. 2) Check if P... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Policy/Policy%20Creation/ADLS%20Gen2%20container%20is%20not%20visible) |
| 10 | Purview access policy not taking effect even after waiting 2 hours | Storage account created outside supported regions - initially only France Centra... | Verify the storage account is in a supported region. If not, create a new storage account in a suppo... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Policy/Policy%20Creation/Supported%20sources%20and%20FAQs) |
| 11 | Purview Policies enforcement on Azure SQL not supported in UK West region | Purview policy enforcement has limited regional availability; UK West not in sup... | Use a supported region. See docs: https://learn.microsoft.com/en-us/purview/register-scan-azure-sql-... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Jan%20FR%20Known%20Issues) |