# Entra ID Azure AD B2C — 排查工作流

**来源草稿**: ado-wiki-a-b2c-conditional-access-ip-p2-retirement.md, ado-wiki-a-b2c-end-of-sale-reference.md, ado-wiki-b-b2c-linkedin-oidc-idp.md, ado-wiki-b-debug-idp-federation-azure-ad-b2c.md, ado-wiki-c-b2c-email-delivery-troubleshooting.md, ado-wiki-c-b2c-kusto-queries.md, ado-wiki-c-b2c-latency-kusto-queries.md, ado-wiki-c-configure-fiddler-b2c.md, ado-wiki-c-tsg-troubleshooting-afd-b2c-504-errors.md, ado-wiki-d-b2c-locate-correlation-id-and-logs.md... (+17 more)
**场景数**: 18
**生成日期**: 2026-04-07

---

## Scenario 1: Set up sign-up and sign-in with a LinkedIn account using Azure Active Directory B2C and LinkedIn Ope
> 来源: ado-wiki-b-b2c-linkedin-oidc-idp.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Sign in to the [LinkedIn Developers website](https://developer.linkedin.com/) with your LinkedIn account credentials.
- 2. Select **My Apps**, and then click **Create app**.
- 3. Enter **App name**, **LinkedIn Page**, **Privacy policy URL**, and **App logo**.
- 4. Agree to the LinkedIn **API Terms of Use** and click **Create app**.
- 5. Select the **Auth** tab. Under **Authentication Keys**, copy the values for **Client ID** and **Client Secret**.
- 6. Select the edit pencil next to **Authorized redirect URLs for your app**, and then select **Add redirect URL**. Enter `https://your-tenant-name.b2clogin.com/your-tenant-name.onmicrosoft.com/oauth2/
- 7. By default, your LinkedIn app isn't approved for scopes related to sign in. To request a review, select the **Products** tab, and then select **Sign In with LinkedIn using OpenID Connect**. When th
- 1. Sign in to the [Azure portal](https://portal.azure.com/) as the global administrator of your Azure AD B2C tenant.
- 2. Navigate to your Azure AD B2C tenant.
- 3. Select **Identity providers**, then select **New OpenID Connect provider**.

---

## Scenario 2: TSG - Debug Identity Provider Federation with Azure AD B2C
> 来源: ado-wiki-b-debug-idp-federation-azure-ad-b2c.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshoot OIDC or OAuth2 Protocol**
   - Share the Proxy tool link [https://custom-idp.azurewebsites.net/](https://custom-idp.azurewebsites.net/) with the customer so they can debug their identity provider federation when integrating to Azur
2. **Steps to Enable the Debugger (Custom Policies)**
   - 1. Setup a tenant ID by adding a name after the domain name. For example `https://custom-idp.azurewebsites.net/bobenvironment`
   - 2. From the menu, select **Tenant Settings**, and provide your **Application Insights instrumentation key**. Then click **Save**.
   - Find the instrumentation key from the Overview page of your Application Insights resource. See [Set up Application Insights](https://learn.microsoft.com/azure/active-directory-b2c/troubleshoot-with-ap
3. **Steps for User Flows (not Custom Policies)**
   - 1. Create the proxy and obtain the proxy URL (same steps 1-4 above).
   - 2. Follow [Set up sign-in with OpenID Connect - Azure AD B2C](https://learn.microsoft.com/azure/active-directory-b2c/identity-provider-generic-openid-connect?pivots=b2c-user-flow#add-the-identity-prov
   - 3. When saving the metadata URL in the portal, you will receive an error `Url should end with /.well-known/openid-configuration`. Save a dummy value like `https://custom-idp.azurewebsites.net/bobenvir
4. **Troubleshoot SAML Protocol**
   - To debug SAML integration, use a browser extension:
   - **Chrome**: [SAML DevTools extension](https://chrome.google.com/webstore/detail/saml-devtools-extension/jndllhgbinhiiddokbeoeepbppdnhhio)
   - **Firefox**: [SAML-tracer](https://addons.mozilla.org/es/firefox/addon/saml-tracer/)

---

## Scenario 3: Azure AD B2C Email Delivery Troubleshooting
> 来源: ado-wiki-c-b2c-email-delivery-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 0 - Prerequisites**
   - Confirm customer uses default email verification provider (not 3rd party like SendGrid/Mailjet)
   - Collect: original email file, B2C internalCorrelationID, timestamps (within 7-30 days, ideally 72hrs)
2. **Step 1 - Query B2C/CPIM Logs**
   - Cluster: idsharedneueudb.northeurope
   - Table: AllIfxCPIMEmailValidationRequestEvent
   - Filter by internalCorrelationId or timeframe + beginemailverification/endemailverification resourceId
3. **Step 2 - Query SSPR Logs**
   - Cluster: idsharedwus (EU: idsharedneu.northeurope), DB: aadssprprod
   - Table: TraceEvent, filter by TrackingID = B2C internalCorrelationID
   - Look for TraceEnumCode: IrisInstanceId, EmailServiceProvider, IrisEmailSendAttemptCompleted
4. **Step 3 - Query IRIS Logs**
   - Requires SCIM Identity - Internal entitlement + idslogread security group
   - Jarvis query: https://portal.microsoftgeneva.com/s/EA6FDD90
   - Events: IDSWorkerSubstrateBusSender, IDSTelemWorkerEventHubProcessingService

---

## Scenario 4: Azure AD B2C Latency Kusto Queries
> 来源: ado-wiki-c-b2c-latency-kusto-queries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. Query AllIfxRequestEvent by tenant/domain/timeframe, summarize percentiles(durationMs, 95/99/99.9) by policy + region
   - 2. Identify high-duration policy, set _policyId filter
   - 3. Compare 2 regions of similar count, set _env_cloud_location

---

## Scenario 5: Configure Fiddler Custom Columns for B2C Troubleshooting
> 来源: ado-wiki-c-configure-fiddler-b2c.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Open Fiddler > Rules > Customize Rules
- 2. Paste FiddlerScript code after opening bracket of Handlers class
- 3. Close and reopen Fiddler to see new columns
- 4. B2C_Trans column: right-click value > Copy > This Column to get correlation ID and Kusto queries

---

## Scenario 6: ado-wiki-c-tsg-troubleshooting-afd-b2c-504-errors
> 来源: ado-wiki-c-tsg-troubleshooting-afd-b2c-504-errors.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 7: How to locate B2C correlation ID and logs
> 来源: ado-wiki-d-b2c-locate-correlation-id-and-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps to identify the B2C correlation ID from a HAR or Fiddler trace**
   - 1. Request customer reproduce issue and collect/provide a HAR trace (https://aka.ms/hartrace) or Fiddler trace (w/https decryption enabled)
   - **Note**: If the issue can only be reproduced on mobile device, review Mobile Phone Data Gathering wiki page.
   - 2. Open the trace with Fiddler classic

### 关键 KQL 查询
```kql
let id = "12345678-1234-1234-1234-123456789abc";  //replace with correlation ID
let timestamp = datetime(2022-03-01 20:00); // replace with UTC timestamp
let delta = 1d;
AllIfxEvents
| where env_time > timestamp - delta and env_time <= timestamp + delta
| where TableName !in ("IfxRedisRequestEvent", "IfxThrottlingRequestEvent", "IfxClientTelemetryRequestEvent", "IfxDocDBRequestEvent")
| where internalCorrelationId == id or correlationId == id
| where resultSignature !in ("", "Success", "200", "OK", "200 OK", "Noop", "302")
| summarize by TableName, policyId, userJourneyId, userJourneyStepNumber, resultSignature, resultDescription, message
```
`[来源: ado-wiki-d-b2c-locate-correlation-id-and-logs.md]`

```kql
let id = "12345678-1234-1234-1234-123456789abc";  //replace with correlation ID
let timestamp = datetime(2023-07-10 22:16); // replace with UTC timestamp
let delta = 30m;
AllIfxEvents
| where env_time > timestamp - delta and env_time <= timestamp + delta
| where TableName !contains "IfxRedisRequestEvent" and TableName !contains "IfxThrottlingRequestEvent" and TableName !contains "IfxClientTelemetryRequestEvent" and TableName !contains "IfxDocDBRequestEvent"
| where internalCorrelationId == id or correlationId == id
| project-reorder env_time, policyId, userJourneyId, userJourneyStepNumber, userJourneyStepType, targetEndpointAddress, operationType, resultType, resultSignature, resourceId, resultDescription, errorCode, responseCode, message, technicalProfileId, correlationId, internalCorrelationId, userObjectId, callerIdentity, clientId, indexableData, sentClaims, receivedClaims, outputClaims, inputClaims, sendClaimsIn, domainName, tenantName, policyClassification
```
`[来源: ado-wiki-d-b2c-locate-correlation-id-and-logs.md]`

---

## Scenario 8: How to reproduce a customer's B2C advanced policy using ASC
> 来源: ado-wiki-d-b2c-reproduce-advanced-policy-using-asc.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**

---

## Scenario 9: Feature overview
> 来源: ado-wiki-e-azure-monitor-for-b2c.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.	Install Azure Powershell version 6.13.1 (or higher)
- 2.	Gather the following information:
- 3.	Download the ARM template and parameter file that correspond (you can just project a RG if you want to scope down access, but I've just projected the subscription)(doc)
- 4.	Modify the parameter file with the info above.
- 5.	Authorize the subscription for ManagedServices, this can take a few minutes. (Azure Portal -> Go to your subscription -> Resource Providers -> Microsoft.ManagedServices -> Register)
- 6.	Open Powershell and login to your Entra ID tenant which has an Azure Subscription available
- 7.	Set the context to the subscription you want to project (Select-AzSubscription <subscriptionId>)
- 8.	Deploy your template (New-AzDeployment -Name <deploymentName> ` -Location <AzureRegion> ` -TemplateFile <pathToTemplateFile> ` -TemplateParameterFile <pathToParameterFile> ` -Verbose)
- 9.	Go to your B2C tenant in the Azure Portal. Under the directory picker, make sure to select the new projected subscriptions:
- 10.	Now you will be able to see your subscription in your B2C directory in the Subscriptions blade

---

## Scenario 10: ado-wiki-e-b2c-as-idp-in-salesforce
> 来源: ado-wiki-e-b2c-as-idp-in-salesforce.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Log into the Azure AD B2C instance you wish to connect to.
- 1. Go to Applications. Click + Add.
- 1. Add https://www.salesforce.com as a Reply URL. Click Create.
- 1. Select the new app you just created. Save the Application ID.
- 1. Click Published Scope. Add read as a scope. Click Save.
- 1. Save the Full Scope Value.
- 1. Click API access. Click + Add. Under Select API, select the name of the application. Under Select Scopes, ensure read and user_impersonation are selected.
- 1. Click OK. Select Keys from the left nav. Click + Generate key. Click Save.
- 1. Check the value of the generated App key. If it contains �/�, �?�, �&�, or �%� (there may be more invalid characters), delete the generated key and repeat steps 8 and 9 until a valid key is generat
- 1. Log into Salesforce. Go to Setup. In the Quick Find box, type Auth. Select Auth. Providers.

---

## Scenario 11: Azure AD B2C - Custom Policy Starter Pack Lab
> 来源: ado-wiki-e-b2c-custom-policy-starter-pack-lab.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1. Azure AD B2C Tenant Creation**
   - > **Note**: As of 2025-05, Azure AD B2C has reached [end of sale](https://learn.microsoft.com/en-us/azure/active-directory-b2c/faq?tabs=app-reg-ga#azure-ad-b2c-end-of-sale) for customers and internal 
   - 1. Follow [Create an Azure Active Directory B2C tenant](https://learn.microsoft.com/azure/active-directory-b2c/tutorial-create-tenant)
   - 2. Switch directories in the Azure Portal into your B2C tenant to verify access
2. **Step 2. Deploy the Azure AD B2C Custom Policy Starter Pack**
   - Uses the [Custom Policy Starter Pack](https://github.com/Azure-Samples/active-directory-b2c-custom-policy-starterpack) and the https://b2ciefsetupapp.azurewebsites.net/ quick setup tool.
   - 1. Login to B2C tenant from Azure Portal
   - 2. Visit https://b2ciefsetupapp.azurewebsites.net/
3. **Step 3. Setup Visual Studio Code for Custom Policy Management**
   - 1. Download and install [Visual Studio Code](https://code.visualstudio.com/) with "Open with Code" context menu options
   - 2. Install "Azure AD B2C" extension from VS Code Extensions Marketplace
   - 3. Configure the extension for [direct policy upload](https://github.com/azure-ad-b2c/vscode-extension/blob/master/src/help/policy-upload.md)

### 相关错误码: AADSTS900144

---

## Scenario 12: JSON Claim Transformations Including Arrays
> 来源: ado-wiki-e-b2c-json-claim-transformations.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 13: Azure AD B2C - B2C as a SAML Identity Provider Lab
> 来源: ado-wiki-e-b2c-saml-identity-provider-lab.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1. Create and Customize Your B2C_1A_SIGNUP_SIGNIN_SAML Policy**
   - 1. Using Visual Studio Code, create a new file named `C:\B2CPolicies\B2C_1A_SIGNUP_SIGNIN_SAML.xml`
   - 2. The policy XML includes:
   - SAML Token Issuer technical profile (`Saml2AssertionIssuer`) with `SamlAssertionSigning` and `SamlMessageSigning` keys referencing `B2C_1A_SamlIdpCert`
2. **Step 2. Verify your SAML Policy Metadata URL**
   - Metadata URL format: `https://myb2ctenant.b2clogin.com/myb2ctenant.onmicrosoft.com/b2c_1a_signup_signin_saml/Samlp/metadata`
3. **Step 3. Create your policy key certificates**
   - 1. Use PowerShell to create a self-signed certificate and export to .PFX
   - 2. Upload to B2C tenant > Identity Experience Framework > Policy Keys with name `B2C_1A_SamlIdpCert`
4. **Step 4. Register a SAML Application In Azure AD B2C for Testing**
   - 1. Register new app (e.g., SAMLApp1) in Azure AD B2C
   - 2. Update manifest:
   - `accessTokenAcceptedVersion`: 2
5. **Step 5. Test using https://aka.ms/samltestapp**
   - 1. Visit https://aka.ms/samltestapp > Service Provider tab
   - 2. Configure SP Initiated SSO:
   - Tenant Name = `myb2ctenant`
6. **Step 6. Debug the SAML Protocol**
   - 1. Start a Fiddler capture and repeat the test flow
   - 2. Follow [Debug the SAML Protocol](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1052453/Debug-SAML-Protocol) to find SAML Request/Response in the trace

---

## Scenario 14: AADB2C90047: The resource contains script errors preventing it from being loaded
> 来源: ado-wiki-f-aadb2c90047-custom-html-errors.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Verify CORS configuration matches [required docs](https://learn.microsoft.com/azure/active-directory-b2c/customize-ui-with-html?pivots=b2c-custom-policy#3-configure-cors)
- 2. If CORS is correct, issue is with hosting provider reliability
- 3. Customer should run load tests on custom HTML page, mimicking B2C's OPTIONS/GET requests
- 4. Collect HAR trace if reproducible

### 关键 KQL 查询
```kql
cluster('idsharedneueudb.northeurope.kusto.windows.net').database('CPIM').AllIfxRequestEvent
| where env_time >= ago(14d)
| where domainName == "b2ctenant.onmicrosoft.com"
| where policyId =~ "B2C_1A_SIGNUP_SIGNIN"
| where resultSignature == "Microsoft.Cpim.UserExperience.Client.CrossOriginException"
| summarize count() by bin(env_time, 1d)
```
`[来源: ado-wiki-f-aadb2c90047-custom-html-errors.md]`

```kql
cluster('idsharedneueudb.northeurope.kusto.windows.net').database('CPIM').AllIfxRequestEvent
| where env_time >= ago(14d)
| where domainName == "b2ctenant.onmicrosoft.com"
| where policyId =~ "B2C_1A_SIGNUP_SIGNIN"
| where resultSignature == "Microsoft.Cpim.UserExperience.Client.CrossOriginException"
| summarize count() by bin(env_time, 1h)
| render timechart
```
`[来源: ado-wiki-f-aadb2c90047-custom-html-errors.md]`

```kql
let tenantid = "<tenant-id>";
let tenantname = "myb2ctenant.onmicrosoft.com";
let policyName = "B2C_1A_POLICYNAME";
cluster('idsharedneueudb.northeurope.kusto.windows.net').database('CPIM').AllIfxRequestEvent
| where env_time >= ago(31d)
| where domainName =~ tenantname or tenantName == tenantid
| where policyId =~ policyName
| where resultSignature == "Microsoft.Cpim.UserExperience.Client.CrossOriginException"
| extend resourceFailed = extract("The resource '([^']+)'", 1, Message)
| summarize count() by resourceFailed
```
`[来源: ado-wiki-f-aadb2c90047-custom-html-errors.md]`

---

## Scenario 15: Identifying the Cause of B2C Throttling
> 来源: ado-wiki-f-b2c-throttling-diagnosis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. Find the B2C throttling category using Kusto query: [B2C throttling query](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/587764/Azure-AD-B2C-Kusto-Queries?anchor=query-b2c-thr
   - 2. **Dev Mode throttling**: If category is `Cpim.TPEngine.RequestPerPolicyTenantWithDevMode`, the policy is in Dev mode. Ask customer to remove Dev mode from the policy ([DeploymentMode docs](https://
   - 3. **MFA throttling** (voice/SMS): If category matches SMS or voice patterns (e.g., `Cpim.TPEngine.SmsPerSession.1000000.8h`), get additional information about the customer's scenario.

---

## Scenario 16: AAD B2C Rate Limit Increase Process
> 来源: ado-wiki-f-b2c-throttling-service-limit-handbook.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Steps**
   - 1. Request at minimum:
   - Azure AD B2C tenant name and tenant ID
   - Azure AD B2C policy name and run now URL

---

## Scenario 17: B2C CPIM Troubleshooting - Jarvis & Kusto (Mooncake)
> 来源: onenote-b2c-cpim-jarvis-kusto.md | 适用: Mooncake ✅

### 排查步骤
- 1. Get correlationID from B2C error response (x-ms-cpim-trans header or error page)
- 2. Search Jarvis logs using tenant name or correlationID
- 3. Check resultdescription for root cause
- 4. For deeper analysis, query CPIM Kusto cluster with correlation ID

---

## Scenario 18: Skip MFA for Specific B2C Accounts Using Custom Attributes
> 来源: onenote-b2c-skip-mfa-custom-attribute.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**

---
