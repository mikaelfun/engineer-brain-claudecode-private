# AVD AVD 监控与诊断 - Comprehensive Troubleshooting Guide

**Entries**: 8 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki, ContentIdea, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Error retrieving data when loading Diagnostics tab in DfM EU ASC for C... | DfM EU region data retrieval limitation in Azure Support Center | Use a Global (WW) DFM case to load the VM in ASC instead of the EU DFM... |
| AVD Insights workbook (new, not Insights Legacy) not selecting the exp... | The default Insights workbook selects DCR based on naming convention '... | Ensure the desired DCR name follows the 'microsoft-avdi-*' naming conv... |
| AVD Insights workbook not selecting the expected Log Analytics workspa... | Default Insights workbook selects LA workspace based on alphanumerical... | Rename/recreate the desired Diagnostic Setting to appear first in alph... |
| Need to verify if Relative Mouse is being triggered successfully in an... |  | Use ASC Tracing tab with connection Activity ID (filter Task Name = Re... |
| AVD Insights workbook (new, not Insights Legacy) displays unexpected o... | Default Insights workbook selects DCR based on 'microsoft-avdi-*' nami... | 1. Ensure DCR name follows 'microsoft-avdi-*' naming convention (the c... |
| User session UPNs not displayed in AVD portal user sessions list; UPN ... | User subscribes to the AVD workspace with one set of credentials (e.g.... | 1) Get ActivityID for an affected connected user session. 2) Run Kusto... |
| Logging in to VM joined to Azure AD DS with an Azure AD user sourced f... | By design: strict enforcement on UPN to enable reliable re-connections... | Organizations using Azure AD DS for their AVD environment need users c... |
| AVD auto scaling script fails with 'The remote name could not be resol... | Log Analytics workspace ODS ingestion endpoint DNS not resolvable. Wor... | Re-run the script after Log Analytics workspace is fully provisioned. ... |

### Phase 2: Detailed Investigation

#### Entry 1: Error retrieving data when loading Diagnostics tab in DfM EU...
> Source: ADO Wiki | ID: avd-ado-wiki-429 | Score: 8.0

**Symptom**: Error retrieving data when loading Diagnostics tab in DfM EU ASC for Cloud PC

**Root Cause**: DfM EU region data retrieval limitation in Azure Support Center

**Solution**: Use a Global (WW) DFM case to load the VM in ASC instead of the EU DFM case

> 21V Mooncake: Applicable

#### Entry 2: AVD Insights workbook (new, not Insights Legacy) not selecti...
> Source: ADO Wiki | ID: avd-ado-wiki-0819 | Score: 8.0

**Symptom**: AVD Insights workbook (new, not Insights Legacy) not selecting the expected Data Collection Rule (DCR) – wrong DCR selected, incorrect data displayed

**Root Cause**: The default Insights workbook selects DCR based on naming convention 'microsoft-avdi-*'; a DCR that does not follow this naming convention will not be selected. The workbook looks for DCRs starting with 'microsoft-avdi-' prefix.

**Solution**: Ensure the desired DCR name follows the 'microsoft-avdi-*' naming convention. The configuration workbook creates DCR as 'microsoft-avdi-<location>' by default. Rename or recreate the DCR with a name starting with 'microsoft-avdi-'.

> 21V Mooncake: Applicable

#### Entry 3: AVD Insights workbook not selecting the expected Log Analyti...
> Source: ADO Wiki | ID: avd-ado-wiki-0820 | Score: 8.0

**Symptom**: AVD Insights workbook not selecting the expected Log Analytics workspace – showing data from wrong workspace

**Root Cause**: Default Insights workbook selects LA workspace based on alphanumerical sort of Diagnostic Settings; the first Diagnostic Setting that starts with numbers or letters AND has a LA workspace as destination wins. Diagnostic Settings starting with special characters (e.g., '_') are deprioritized. Priority order: allowed symbols → numbers → letters.

**Solution**: Rename/recreate the desired Diagnostic Setting to appear first in alphanumerical sort (must start with numbers or letters). Note: Diagnostic Setting names cannot be edited – must delete and recreate with the correct name.

> 21V Mooncake: Applicable

#### Entry 4: Need to verify if Relative Mouse is being triggered successf...
> Source: ADO Wiki | ID: avd-ado-wiki-0852 | Score: 8.0

**Symptom**: Need to verify if Relative Mouse is being triggered successfully in an AVD session

**Root Cause**: 

**Solution**: Use ASC Tracing tab with connection Activity ID (filter Task Name = RelativeMouse), or Kusto query on RDClientTrace `| where TaskName == 'RelativeMouse'` across all regional clusters. Alternatively run RelativeMouseSupportTool.exe on AVD VM (Ctrl+O to toggle); if Relative Mouse Movement field shows N/A, it is not enabled.

> 21V Mooncake: Applicable

#### Entry 5: AVD Insights workbook (new, not Insights Legacy) displays un...
> Source: ADO Wiki | ID: avd-ado-wiki-0818 | Score: 8.0

**Symptom**: AVD Insights workbook (new, not Insights Legacy) displays unexpected or incorrect data at the Host Pool level in Azure Portal

**Root Cause**: Default Insights workbook selects DCR based on 'microsoft-avdi-*' naming convention and Log Analytics workspace based on alphanumerical sort of Diagnostic Settings; when naming conventions are not followed or incorrect Diagnostic Setting is first alphabetically, the wrong data source is selected

**Solution**: 1. Ensure DCR name follows 'microsoft-avdi-*' naming convention (the configuration workbook creates DCR as 'microsoft-avdi-<location>' by default). 2. Ensure the desired Diagnostic Setting (with LA workspace destination) appears first in alphanumerical sort – delete and recreate with appropriate name if needed (names cannot be edited).

> 21V Mooncake: Applicable

#### Entry 6: User session UPNs not displayed in AVD portal user sessions ...
> Source: ADO Wiki | ID: avd-ado-wiki-0824 | Score: 8.0

**Symptom**: User session UPNs not displayed in AVD portal user sessions list; UPN column is empty or missing for active sessions despite users being connected.

**Root Cause**: User subscribes to the AVD workspace with one set of credentials (e.g. User1@domain.com) but connects to a resource using a different set of credentials (e.g. direct1@domain.com or account from a different domain). This 'switched user credentials scenario' causes the orchestration layer to lose the UPN mapping.

**Solution**: 1) Get ActivityID for an affected connected user session. 2) Run Kusto query on RDInfraTrace (all regions union) with ActivityId filter and Msg contains 'switched user credentials scenario' to confirm. 3) On session host, run 'quser <sessionID>' to get username. 4) Run 'Get-WmiObject win32_useraccount | Where-Object{$_.Name -like "<Username>"} | Select name,sid' to get SID. 5) Run '([ADSI]"LDAP://<SID=<User SID>>").UserPrincipalName' to get the actual UPN. 6) Compare with orchestration trace using connection ActivityID (filter on OrchestrationService and RDmiAuthorizationService categories) to confirm credential mismatch. 7) Inform customer to use consistent credentials for workspace subscription and resource connection.

> 21V Mooncake: Applicable

#### Entry 7: Logging in to VM joined to Azure AD DS with an Azure AD user...
> Source: ContentIdea | ID: avd-contentidea-kb-002 | Score: 6.5

**Symptom**: Logging in to VM joined to Azure AD DS with an Azure AD user sourced from Windows Server (on prem) Active Directory fails. Users synchronized to Azure AD through Azure AD Connect. Error in Diagnostics: ErrorSource: RDBroker, ErrorOperation: Orchestration.

**Root Cause**: By design: strict enforcement on UPN to enable reliable re-connections and no duplication of sessions. When synchronized from AD to Azure AD, the user comes with a SID. However, the identity on Azure AD DS has a different SID, so login is blocked.

**Solution**: Organizations using Azure AD DS for their AVD environment need users created directly in Azure AD.

> 21V Mooncake: Applicable

#### Entry 8: AVD auto scaling script fails with 'The remote name could no...
> Source: OneNote | ID: avd-onenote-067 | Score: 5.5

**Symptom**: AVD auto scaling script fails with 'The remote name could not be resolved' for *.ods.opinsights.azure.com endpoint when creating Log Analytics custom log table.

**Root Cause**: Log Analytics workspace ODS ingestion endpoint DNS not resolvable. Workspace may not be fully provisioned yet, or network/DNS configuration blocking the endpoint.

**Solution**: Re-run the script after Log Analytics workspace is fully provisioned. Verify DNS resolution for the ODS endpoint. For Mooncake, ensure endpoint uses .azure.cn domain.

> 21V Mooncake: Applicable

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
