# AVD 数据收集与升级流程 — 排查工作流

**来源草稿**: ado-wiki-assist-365-request-access.md, ado-wiki-assist365-usage.md, ado-wiki-css-saaf-cat-collaboration-escalation-flows.md, ado-wiki-escalation-workflow-w365.md, ado-wiki-extra-goodies-scripts-powershell-python.md, ado-wiki-msrd-collect.md, ado-wiki-sfi-compliance.md, ado-wiki-share-customer-data-with-pg.md, ado-wiki-vm-os-dump-from-azure-host.md, ado-wiki-w365-css-mcaps-subscription-lab.md, ado-wiki-w365-lab-visual-studio-subscription.md, ado-wiki-w365-saaf-cri-review-process.md, ado-wiki-windows-error-dump.md, ado-wiki-wpr-logs-collection.md, mslearn-setup-overview-escalation.md
**Kusto 引用**: (无)
**场景数**: 54
**生成日期**: 2026-04-07

---

## Scenario 1: Step 1: MID Account
> 来源: ado-wiki-assist-365-request-access.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Login to physical or virtual SAW
2. Navigate to https://aka.ms/visops
3. Fill in: Supplier=Microsoft FTE, Site=Microsoft FTE, Region=closest, LOB=Microsoft FTE, Users=1
4. Action: MID - Create Account
5. Tool: Modern Identity Account (MID)
6. Description: Need MID account for Assist 365 and support tools
7. Click Order Now → await approval email

## Scenario 2: Step 2: Assist 365 Provisioning
> 来源: ado-wiki-assist-365-request-access.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Request manager/SDM to provision MID account via Agent Management Tool (AMT)

## Scenario 3: Support Contacts
> 来源: ado-wiki-assist-365-request-access.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - MID queries: https://aka.ms/visops
   - Assist 365 provisioning: Manager/SDM
   - Assist 365 tool issues: https://aka.ms/assistdesk

## Scenario 4: Access via Centurion AVD (Windows App)
> 来源: ado-wiki-assist365-usage.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Download Windows App from Microsoft Store
2. Sign-in with Managed ID (@microsoftsupport.com) account with YubiKey
3. Click on "Centurion" device
4. Navigate to Assist 365:
   - (Global) https://assist.microsoft.com
   - (EU) https://eu.assist.microsoft.com
5. Sign-in with MID account
6. Enter case number in search box to set context
7. On left pane: Applications > Actions > Troubleshooting for Windows 365
8. Choose "Audit Event" or "Configuration" to view customer data

## Scenario 5: CSS Overview
> 来源: ado-wiki-css-saaf-cat-collaboration-escalation-flows.md | 适用: \u901a\u7528 \u2705

### 排查步骤
The CSS (Customer Service & Support) team focuses on providing exceptional support and service to customers.

## Scenario 6: CSS Escalation Process for WCX
> 来源: ado-wiki-css-saaf-cat-collaboration-escalation-flows.md | 适用: \u901a\u7528 \u2705

### 排查步骤
The CxE SaaF team works as a bridge between CSS and WCX Engineering. They are involved in high level escalations and technical roadblock cases. SaaF helps in triaging DCRs, approves ICM creations and works directly with feature teams to resolve issues.

## Scenario 7: How SaaF Engages with CSS
> 来源: ado-wiki-css-saaf-cat-collaboration-escalation-flows.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - If CSS engineers need assistance, they can use the Teams Case Collaboration channel (W365-specific) or participate in case triage sessions where SaaF is engaged.
   - If an escalation to engineering is needed, CSS teams will open a support escalation via ICM which is triaged and handled by the SaaF team.

## Scenario 8: Public Preview Support
> 来源: ado-wiki-css-saaf-cat-collaboration-escalation-flows.md | 适用: \u901a\u7528 \u2705

### 排查步骤
An important part of public preview is to up-skill CSS teams and test support capability at scale. Customers reporting public preview issues should raise a ticket with CSS and normal processes apply.

## Scenario 9: CAT/PAT Support Case Collaboration/Escalation
> 来源: ado-wiki-css-saaf-cat-collaboration-escalation-flows.md | 适用: \u901a\u7528 \u2705

### 排查步骤
If customers experience a technical issue with Windows 365, Windows 365 Link, or AVD outside normal CAT/PM engagement scope, first ensure the customer opens a support case with CSS.
A CSS support engineer will own the case throughout its lifecycle, and can engage resources from different support teams (Intune, Teams, Entra ID) for collaboration.

## Scenario 10: Scenario 1: Issue resolved but customer frustrated
> 来源: ado-wiki-css-saaf-cat-collaboration-escalation-flows.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Encourage customer to provide feedback to their CSAM and the CSS TA/Manager
2. Document feedback and submit via [https://aka.ms/WCXSaaFHelp](https://aka.ms/WCXSaaFHelp)

## Scenario 11: Scenario 2: Ongoing issue with no resolution
> 来源: ado-wiki-css-saaf-cat-collaboration-escalation-flows.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. CSS follows standard escalation path (troubleshooting, collaboration channels, case triage, ICM to SaaF)
2. Check if ICM already open for the case
3. Encourage customer to reach out to CSAM for escalation
4. CAT/PAT can email CSAM + case owner's TA and M1 manager
5. After 2 working days with no progress → submit via [https://aka.ms/WCXSaaFHelp](https://aka.ms/WCXSaaFHelp)

## Scenario 12: Scenario 3: Enormous customer impact or broad service issue
> 来源: ado-wiki-css-saaf-cat-collaboration-escalation-flows.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Open an incident with the WCX SaaF team following the ICM Process for 24x7x365 engagement.

## Scenario 13: Main Flow
> 来源: ado-wiki-escalation-workflow-w365.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Customer creates W365 case
2. Engineer assigned, contacts customer to scope issue
3. Engineer investigates → finds solution? YES → Action Plan Path / NO → Escalation Team Path

## Scenario 14: Action Plan Path (Solution Found)
> 来源: ado-wiki-escalation-workflow-w365.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Action plan shared with customer
2. Customer tries action plan → works? → Issue resolved
3. If not → Ranger shares solution with case owner → case owner tries with customer

## Scenario 15: Escalation Team Path (No Solution)
> 来源: ado-wiki-escalation-workflow-w365.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Engineer works with local escalation team (TA/SEE)
2. For DPs: work with TL & SME, follow standard escalation
3. Still no solution → post help request in collaboration channel
4. Ranger reviews and investigates
5. Ranger finds solution → shares with case owner
6. No solution → Rangers contact SaaF in Private channel

## Scenario 16: SaaF Support Path
> 来源: ado-wiki-escalation-workflow-w365.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. SaaF investigates, provides assistance and coaching
2. If ICM needed → SaaF/Ranger inform case owner to open ICM
3. Case owner opens ICM and follows PG instructions

## Scenario 17: Example: Remote Action call via Graph API (Python)
> 来源: ado-wiki-extra-goodies-scripts-powershell-python.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Requirements: Enterprise Application with required API permissions, client secret
```python
import msal
import requests
from azure.identity import ClientSecretCredential
from msgraph import GraphServiceClient
import asyncio
from msgraph.generated.device_management.virtual_endpoint.cloud_p_cs.cloud_p_cs_request_builder import CloudPCsRequestBuilder
from kiota_abstractions.base_request_configuration import RequestConfiguration
import re

UPN=input("What is the UPN?:\n")
scopes = ['https://graph.microsoft.com/.default']

tenant_id = 'TENANT ID'
client_id = 'Enterprise APP ID'
client_secret = 'App Secret VALUE'

credential = ClientSecretCredential(
    tenant_id=tenant_id,
    client_id=client_id,
    client_secret=client_secret)

graph_client = GraphServiceClient(credential, scopes)
query_params = CloudPCsRequestBuilder.CloudPCsRequestBuilderGetQueryParameters(
    select = ["id"],
    filter= "startswith(userPrincipalName,"+"'"+UPN+"'"+")",
)

request_configuration = RequestConfiguration(
    query_parameters = query_params,
)

async def call_graph():
    CPID = await graph_client.device_management.virtual_endpoint.cloud_p_cs.get(request_configuration=request_configuration)
    CPIDText = str(CPID)
    match = re.search(r"id='(.*?)'", CPIDText)
    if match:
        extracted_value = match.group(1)
        response = await graph_client.device_management.virtual_endpoint.cloud_p_cs.by_cloud_p_c_id(extracted_value).troubleshoot.post()
        print(response)
        return response
    else:
        print("No match found.")
        return extracted_value

asyncio.run(call_graph())
```
Python modules required:
   - `pip install azure-identity`
   - `pip install msgraph-sdk` (may throw error if OS long-path not enabled)
   - `pip install asyncio` (requires Python 3.3+)

## Scenario 18: MSRD-Collect (Microsoft Remote Desktop Collect)
> 来源: ado-wiki-msrd-collect.md | 适用: \u901a\u7528 \u2705

### 排查步骤
PowerShell script for collecting diagnostic data for AVD, RDS, and Windows 365 Cloud PC troubleshooting.

## Scenario 19: Requirements
> 来源: ado-wiki-msrd-collect.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - PowerShell 5.1 or newer
   - Elevated (admin) rights — preferably Domain Admin or Domain User with local admin
   - Secure DTM workspace for data submission
   - If ExecutionPolicy blocks: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Force -Scope Process`
   - PowerShell ISE is NOT supported

## Scenario 20: Download
> 来源: ado-wiki-msrd-collect.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Latest version: https://aka.ms/MSRD-Collect (public link). Always use latest version.

## Scenario 21: Usage for Windows 365 Connectivity Issues
> 来源: ado-wiki-msrd-collect.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Machine context: **W365**
   - Machine role: **Source** (user's local computer) or **Target** (Cloud PC)
   - Scenario: **Core** (add additional scenarios as needed)

## Scenario 22: Key Features
> 来源: ado-wiki-msrd-collect.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Collects data for: deployment, configuration, session connectivity, profiles (FSLogix), Teams media optimization, MSIX App Attach, Remote Assistance
   - **MSRD-Diag.html** diagnostics report provides extensive system overview to pinpoint known issues

## Scenario 23: Links
> 来源: ado-wiki-msrd-collect.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - How to use: See ADO Wiki WindowsVirtualDesktop/1048609
   - Sample action plans: See ADO Wiki WindowsVirtualDesktop/665072
   - What data is collected: See ADO Wiki WindowsVirtualDesktop/665070
   - Feedback: MSRDCollectTalk@microsoft.com (internal)

## Scenario 24: Public IP Addresses
> 来源: ado-wiki-sfi-compliance.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Background**
As part of SFI all services will be required to specify a tag when they deploy an IP address. There are two types of Service Tagging:
   - Standard Service Tags which allow for pre-allocated ranges to be assigned to a specific service.
   - Virtual Tags — a new level of tagging that will identify IP allocations as either first party or third party.
**Application**
The first requirement is to register the subscription for the `AllowBringYourOwnPublicIpAddress` feature. Without it you will get an error when trying to create the IP:
```
Subscription /subscriptions/.../resourceGroups//providers/Microsoft.Network/subscriptions/ is not
registered for feature Microsoft.Network/AllowBringYourOwnPublicIpAddress required to carry out the requested operation.
StatusCode: 400
ReasonPhrase: Bad Request
ErrorCode: SubscriptionNotRegisteredForFeature
```
Once enabled, confirm by checking the feature status:
```powershell
Get-AzProviderFeature -FeatureName AllowBringYourOwnPublicIpAddress -ProviderNamespace Microsoft.Network
```
Then create a tagged IP Address:
```powershell
$iptag = New-AzPublicIpTag -IpTagType "FirstPartyUsage" -Tag "/Unprivileged"
New-AzPublicIpAddress -ResourceGroupName CloudPC -Name UKFWIPAddress -AllocationMethod Static -Location uksouth -Sku Standard -IpTag $iptag
```
Confirm the tag:
```powershell
(Get-AzPublicIpAddress -Name UKFWIPAddress).IpTagsText
```

## Scenario 25: Rules - DO NOT:
> 来源: ado-wiki-share-customer-data-with-pg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Add PII into ICM (email, UPN, etc.)
   - Attach support data files to ICM incidents
   - Attach support data files to ADO work items
   - Send email with attached support data
   - Share via OneDrive, Teams, SharePoint, or UNC paths
   - **ONLY share through DTM (Data Transfer and Management)**

## Scenario 26: CSS Engineer Process
> 来源: ado-wiki-share-customer-data-with-pg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Wait for ICM transfer email, get ICM owner alias
2. Add ICM owner as contact in DFM case (domain: microsoft.com, role: Contact)
3. Open DTM Portal from DFM case
4. Copy "Customer access" link from DTM workspace
5. @mention ICM owner in incident with DTM workspace link

## Scenario 27: Product Group Process
> 来源: ado-wiki-share-customer-data-with-pg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Request access from CSS engineer
2. Receive workspace link
3. Sign in to DTM page to access files

## Scenario 28: Scenario
> 来源: ado-wiki-vm-os-dump-from-azure-host.md | 适用: \u901a\u7528 \u2705

### 排查步骤
CPC VM encounters bootup issue and customer requests RCA.

## Scenario 29: Pre-requirements
> 来源: ado-wiki-vm-os-dump-from-azure-host.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Second DfM case for main RAVE case taken ownership
2. Customer consent to dump the Cloud PC for RCA

## Scenario 30: Steps
> 来源: ado-wiki-vm-os-dump-from-azure-host.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Raise Sev 3 IcM to **Azure Incident Management/WASU** team with Node ID/Container ID/DfM case number
2. If VM not crashing, coordinate with customer to restart VM while WASU triggers dumping (remote session recommended)
3. Grant dump permission with DfM case owner and engage **WSD CFE/HCCompute-Guest OS Health** (SaaF/Dev) or **CSS Windows Support EE** (Intune Support) to analyze

## Scenario 31: MCAPS Support Subscriptions
> 来源: ado-wiki-w365-css-mcaps-subscription-lab.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Create new Azure subscription ($400) in the MCAPS managed environment: https://aka.ms/SupportSubscriptions
For Windows 365, choose **External Subscription** (aka User Tenant):
   - Azure subscription provisioned in an External AAD tenant with M365 E5 license
   - RBAC Owner on subscription, Global Admin in tenant
   - Used when additional AAD permissions or licenses are needed
**Note:** This creates a brand new tenant with M365 E5 licenses. You also need to request Windows 365 licenses separately.
**Do not select Enterprise Premium P2 option.**

## Scenario 32: Request Windows 365 test licenses
> 来源: ado-wiki-w365-css-mcaps-subscription-lab.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Follow the [DARSy Request Process](https://dev.azure.com/OneCommercial/NoCode/_wiki/wikis/NoCode.wiki/62/DARSy-Request-Process)
New location for Promo Codes (as of Nov 2025): [DARSy - Commerce Enablement Services](https://darsydigitalsupplychaincommercial.azurewebsites.net/PromoCodes/Create)

## Scenario 33: Suggested licenses to request
> 来源: ado-wiki-w365-css-mcaps-subscription-lab.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| License | Offer GUID | Count |
|---------|-----------|-------|
| Microsoft 365 E5 (no Teams) Trial | e8a7950f-96c3-4af2-ac38-d0e315a9baf9 | 25 |
| W365 Enterprise 2/8/128 | 42968ea6-f48c-4865-a97e-be1c53f15eef | 3 |
| W365 Enterprise 4/16/256 | f25b2793-4168-40eb-b22a-79218a168511 | 3 |
| W365 Business 2/8/128 | b370ec89-3ea1-4ecb-9333-fa986fcbe436 | 1 |
| W365 Frontline 2/8/128 | ed202e7a-f98c-4182-95f5-78cc59b295bb | 1 |

## Scenario 34: Apply test licenses to tenant
> 来源: ado-wiki-w365-css-mcaps-subscription-lab.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Receive email from microsoft-noreply@microsoft.com with Token Depot link
2. Go to DARSy "My Requests" tab, check status = "Campaign Created"
3. Download CSV, use FinalPromoURL column
4. Open URL in new test tenant browser tab and follow prompts
More information: https://aka.ms/promocodeuserguide

## Scenario 35: High Level Steps
> 来源: ado-wiki-w365-lab-visual-studio-subscription.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Setup EMS Trial Tenant
2. Get Cloud PC License
3. Bring your own Azure Subscription (Visual Studio Benefit)
4. Networking Setup
5. Domain Controller / DNS / Azure AD Connect
6. Configure On-Premises network connection in MEM
7. Provision a Cloud PC
8. Create Provisioning Policy
9. Access your Cloud PC

## Scenario 36: Microsoft E5 Test Tenant
> 来源: ado-wiki-w365-lab-visual-studio-subscription.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Navigate to: https://cdx.transform.microsoft.com/my-tenants
   - Sign in with MSFT Account (Segment: Enterprise, Role: Specialist Modern Workplace)
   - Create Tenant → Microsoft 365 Enterprise Demo Content (1 year)

## Scenario 37: Windows 365 Trial License
> 来源: ado-wiki-w365-lab-visual-studio-subscription.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Follow steps in W365 wiki trial subscription guide

## Scenario 38: Visual Studio (FTE) Benefit Subscription Setup
> 来源: ado-wiki-w365-lab-visual-studio-subscription.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Activate at https://my.visualstudio.com/Benefits
2. Invite your MSA (with VS subscription) as guest user to test tenant
3. Accept invitation from email
4. In Azure Portal (as guest user): Subscriptions → Visual Studio Enterprise → Change directory to test tenant
5. Assign test tenant admin as Owner of the subscription
6. Switch to admin account → verify subscription visible

## Scenario 39: Notes
> 来源: ado-wiki-w365-lab-visual-studio-subscription.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Visual Studio subscription provides $150 monthly Azure Credit
   - Costs: Domain Controller VM + network egress
   - May need to wait a few minutes after directory change for subscription to appear

## Scenario 40: Overview
> 来源: ado-wiki-w365-saaf-cri-review-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
The WCX SaaF team performs a monthly review of ICM escalations (CRIs) to determine insights:
   - What types of issues are being escalated? Any trends?
   - Are there low-quality ICMs to improve?
   - What tools, training, and data could CSS use to avoid escalation?
Goal: Reduce overall Time to Resolution (TTR) by eliminating need for CSS to engage SaaF/Engineering or reducing Time in Engineering (TIE).

## Scenario 41: CRI Escalation Quality Criteria
> 来源: ado-wiki-w365-saaf-cri-review-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Scoring system for escalation quality:
| Criterion | Score |
|-----------|-------|
| Basic information provided (TenantID, UserID, DeviceID, etc.) | +1 if YES |
| Issue Description clear | +1 if YES |
| Troubleshooting details included | +1 if YES |
| Issue NOT already in support wiki or TSG | +1 if NO |
| Issue NOT documented as known issue to CSS | +1 if NO |
   - 5/5 = High quality
   - 3-4 = Medium quality
   - <3 = Low quality

## Scenario 42: Regional SaaF CE Review Contacts
> 来源: ado-wiki-w365-saaf-cri-review-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - APAC: Xinyu, Andy
   - EMEA: Joe, Wei
   - US: Venkatesh, Valerie

## Scenario 43: Support Ticket Volume
> 来源: ado-wiki-w365-saaf-cri-review-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
cluster('cpcsre.eastus.kusto.windows.net').database('SaaF').fn_GetW365SupportCase()
| where CreatedDateTime >= datetime(2023-07-01 00:00) and CreatedDateTime < datetime(2023-08-01 00:00)
| where InitialResponseQueueKey != 3447
| distinct CaseNumber
| count
```
`[来源: ado-wiki-w365-saaf-cri-review-process.md]`

## Scenario 44: Total SaaF CRI Volume
> 来源: ado-wiki-w365-saaf-cri-review-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
cluster('icmcluster.kusto.windows.net').database('IcMDataWarehouse').Incidents
| where OwningTenantId == 27011 and OwningTeamId == 78675
| where CreateDate >= datetime(2023-08-01 00:00) and CreateDate < datetime(2023-09-01 00:00)
```
`[来源: ado-wiki-w365-saaf-cri-review-process.md]`

## Scenario 45: SaaF CRI Status Distribution
> 来源: ado-wiki-w365-saaf-cri-review-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
let icmlist = cluster('icmcluster.kusto.windows.net').database('IcMDataWarehouse').Incidents
    | where OwningTenantId == 27011 and OwningTeamId == 78675
    | where CreateDate >= datetime(2023-08-01 00:00) and CreateDate < datetime(2023-09-01 00:00)
    | distinct IncidentId;
cluster('icmcluster.kusto.windows.net').database('IcmDataWarehouse').IncidentsSnapshotV2()
| where IncidentId in (icmlist)
| extend Status = iff(OwningTeamName !contains "jarnold", "Transferred", Status)
| summarize count() by Status
| order by count_ desc
```
`[来源: ado-wiki-w365-saaf-cri-review-process.md]`

## Scenario 46: ICMs Transferred to Service Teams
> 来源: ado-wiki-w365-saaf-cri-review-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
let icmlist = cluster('icmcluster.kusto.windows.net').database('IcMDataWarehouse').Incidents
    | where OwningTenantId == 27011 and OwningTeamId == 78675
    | where CreateDate >= datetime(2023-08-01 00:00) and CreateDate < datetime(2023-09-01 00:00)
    | distinct IncidentId;
cluster('icmcluster.kusto.windows.net').database('IcmDataWarehouse').IncidentsSnapshotV2()
| where IncidentId in (icmlist)
| where OwningTeamName !contains "jarnold"
| extend OwningTeamName = case(
    OwningTeamName startswith "CLOUDPCSERVICE", split(OwningTeamName,"\\")[1],
    OwningTeamName startswith "WINDOWSVIRTUALDESKTOP" or OwningTeamName startswith "AZUREVIRTUALDESKTOP", strcat("AVD-",split(OwningTeamName,"\\")[1]),
    OwningTeamName)
| summarize count() by OwningTeamName
| order by count_ desc
```
`[来源: ado-wiki-w365-saaf-cri-review-process.md]`

## Scenario 47: ICM Review Process
> 来源: ado-wiki-w365-saaf-cri-review-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
ICM query for pulling list: https://portal.microsofticm.com/imp/v3/incidents/search/advanced?sl=r2fh1jonhpa

## Scenario 48: Custom Field Filtering Rules
> 来源: ado-wiki-w365-saaf-cri-review-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - FollowUps = Yes → Include in report
   - FollowUps = N/A → Exclude
   - TSGCovered = False → Include
   - Quality = Low/Medium → Include
   - DCR = Yes → Exclude (tracked by product team)

## Scenario 49: Supportability Dashboard
> 来源: ado-wiki-w365-saaf-cri-review-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
https://supportability.visualstudio.com/Windows365/_queries/query/57cc35fd-8304-46cc-b6c3-795516c3b012/

## Scenario 50: AVD Troubleshooting Overview & Escalation Tracks
> 来源: mslearn-setup-overview-escalation.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> Source: [Troubleshooting overview, feedback, and support for Azure Virtual Desktop](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-set-up-overview)

## Scenario 51: Pre-check
> 来源: mslearn-setup-overview-escalation.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Before troubleshooting, always check:
   - [Azure Status Page](https://azure.status.microsoft/status)
   - [Azure Service Health](https://azure.microsoft.com/features/service-health/)

## Scenario 52: Diagnostic Tools
> 来源: mslearn-setup-overview-escalation.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Azure Virtual Desktop Insights** — Azure Monitor workbook dashboard for quick issue identification
   - **Log Analytics** — Kusto query-based diagnostic feature for deeper analysis

## Scenario 53: Escalation Matrix
> 来源: mslearn-setup-overview-escalation.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Issue | Action |
|-------|--------|
| VNet / ExpressRoute settings | Azure support → Networking category |
| VM creation (not using ARM templates) | Azure support → Azure Virtual Desktop service |
| ARM template errors | See host pool creation troubleshooting |
| Portal management issues | Azure support → Azure Virtual Desktop |
| PowerShell config management | See AVD PowerShell troubleshooting |
| Host pool / App group config | See AVD PowerShell troubleshooting or Azure support |
| FSLogix Profile Containers | FSLogix troubleshooting guide → Azure support → FSLogix problem type |
| Remote Desktop client malfunction | Client troubleshooting → Azure support → Remote Desktop clients |
| Connected but no feed | See service connection troubleshooting (no feed section) |
| Feed discovery (network) | User contacts network administrator |
| Connecting clients | Service connection → VM configuration troubleshooting |
| Desktop/app responsiveness | Contact product-specific team |
| Licensing errors | Contact product-specific team |
| Third-party auth tools | Verify provider supports AVD scenarios |
| Log Analytics issues | Azure support → diagnostics schema or Log Analytics problem type |
| Microsoft 365 app issues | Microsoft 365 admin center |

## Scenario 54: External Resources
> 来源: mslearn-setup-overview-escalation.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [App Assure](https://learn.microsoft.com/en-us/microsoft-365/fasttrack/windows-and-other-services#app-assure) — free Microsoft service for application compatibility issues
   - [Azure Virtual Desktop Tech Community](https://techcommunity.microsoft.com/t5/azure-virtual-desktop/bd-p/AzureVirtualDesktopForum) — feature requests and best practices
