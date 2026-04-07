---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Troubleshooting tools/Kusto EvoSTS TableDef"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Troubleshooting%20tools%2FKusto%20EvoSTS%20TableDef"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[[_TOC_]]

## Introduction

### Intended Audience:

This document is intended for Cloud Identity Engineers working in the CSS Organization, and is designed to aid in assessing and understanding various logs returned from querying the EvoSTS tables in Kusto

## Table Overviews

### DiagnosticTracesIfx

Think of this as a Verbose table, as although it doesn't contain nearly as many columns as **PerRequestTableIfx** it has a couple of freeform fields which can prove invaluable in troubleshooting

Namely these are **Message** and **Exception**

Also be aware that both tables described in this article will complement each other, and the likelihood is you will end up querying both to create the complete picture for a given scenario

### PerRequestTableIfx

This table has a lot more columns than **DiagnosticTracesIfx** but is generally a much easier table to create queries for, as specific filters can be created based on columns

It then becomes easier to filter by things such as Application ID, MFA Status, HTTP Status codes etc.

### Shared Fields

The following fields are used by both **DiagnosticTracesIfx** and **PerRequestTableIfx** allow us to join these 2 datasets together where needed

  - env\_time
  - env\_cloud\_roleinstance
  - env\_cloud\_location
  - CorrelationId
  - RequestId
  - Result
  - Call
  - Tenant
  - GatewayForkTrackingId  

## Definition: DiagnosticTracesIfx

  

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<tbody>
<tr class="odd">
<td style="vertical-align:top"><strong>Field</strong></td>
<td style="vertical-align:top"><p><strong>Description</strong></p></td>
<td style="vertical-align:top"><p><strong>Example Data</strong></p></td>
<td style="vertical-align:top"><p><strong>Notes</strong></p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>Env_time</strong></p></td>
<td style="vertical-align:top"><p>UTC Timestamp</p></td>
<td style="vertical-align:top"><p>16/03/2017 15:33:25</p></td>
<td style="vertical-align:top"><p>Exact time correlation, validating data against timestamps and other traces (i.e. Fiddler)</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>Env_cloud_roleinstance</strong></p></td>
<td style="vertical-align:top"><p>Specific server which served the request</p></td>
<td style="vertical-align:top"><p>ESTSFE_IN_47</p></td>
<td style="vertical-align:top"><p>Validating data against headers in Fiddler trace</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>Env_cloud_location</strong></p></td>
<td style="vertical-align:top"><p>Datacenter which handled the request</p></td>
<td style="vertical-align:top"><p>DUB2</p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>CorrelationId</strong></p></td>
<td style="vertical-align:top"><p>ID used to correlate similar events together, across tables</p></td>
<td style="vertical-align:top"><p>177d1e45-bdbd-480d-a3cf-2d6bba034864</p></td>
<td style="vertical-align:top"><p>Searching across multiple tables, or grabbing all relevant events for one specific operation. For example, one Correlation ID representing a single login events would return multiple entries from both the PerRequestEventIfx and DiagnosticTracesIfx tables</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>RequestId</strong></p></td>
<td style="vertical-align:top"><p>ID which represents a client's interaction with EvoSTS</p></td>
<td style="vertical-align:top"><p>b38f93c4-f0f1-43f6-9804-daf446e0c1b1</p></td>
<td style="vertical-align:top"><p>Searching through logs using the x-ms-client-request-id HTTP Header in a Fiddler trace</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>Result</strong></p></td>
<td style="vertical-align:top"><p>Indicates operation success or failure</p></td>
<td style="vertical-align:top"><p>Success</p></td>
<td style="vertical-align:top"><p>Useful to quickly identify failures in a log trace</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>Call</strong></p></td>
<td style="vertical-align:top"><p>Represents the type of operation requested/performed</p></td>
<td style="vertical-align:top"><p>Oauth2:Token</p></td>
<td style="vertical-align:top"><p>Helps to validate and understand the flow we are analyzing</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>EventId</strong></p></td>
<td style="vertical-align:top"><p>Represents the exact operation requested/performed</p></td>
<td style="vertical-align:top"><p>15008</p></td>
<td style="vertical-align:top"><p>Useful to perform pattern analysis, where you can search for a particular Event ID and correlate those events, slicing into different view points and/or plotting occurrences over time</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>Tenant</strong></p></td>
<td style="vertical-align:top"><p>Object ID of the Tenant object</p></td>
<td style="vertical-align:top"><p>eddd7390-b33c-48ce-8f2e-01e4a7ea6fbe</p></td>
<td style="vertical-align:top"><p>Used commonly to scope queries, or useful when performing multi-tenant queries</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>Message</strong></p></td>
<td style="vertical-align:top"><p>Verbose output containing trace events</p></td>
<td style="vertical-align:top"><p>SessionContext cookie was not present</p></td>
<td style="vertical-align:top"><p>Possibly the most useful column in these traces, and will provide a 'Plain English' description of the event itself including calls into MSODS via DPX</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>Exception</strong></p></td>
<td style="vertical-align:top"><p>Contains any exceptions thrown</p></td>
<td style="vertical-align:top"><p>Microsoft.AzureAD.Telemetry.Diagnostics.ServiceException: AADSTS50034: To sign into this application the account must be added to the 8e81adc1-50ac-4f9f-a655-48d4485cb1ca directory.</p>
<p>at Microsoft.AzureAD.Sts.PrincipalValidator.EnsurePrincipalExistsAndIsValid(IDirectoryPrincipal p, String principalIdentifier, String principalType, String tenantName, StsErrorCode principalNotProvidedErrorCode, StsErrorCode principalNotInTenantErrorCode, StsErrorCode disabledPrincipalErrorCode, Boolean isPrincipalIdentifierPII) in e:\bt\783723\repo\private\Product\Microsoft.AzureAD.Sts\PrincipalValidator.cs:line 109</p></td>
<td style="vertical-align:top"><p>Another extremely useful column, especially when analyzing AADSTS Error Codes. The first line will contain the error code and it's error string, while the lines underneath will provide a pointer to where the exception itself has been thrown via the stack trace</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>GatewayForkTrackingId</strong></p></td>
<td style="vertical-align:top"><p>Unique ID tying these events to corresponding events in the AAD Gateway Logs. Currently I don't know the Kusto namespace for querying Gateway, but via Jarvis the table name to use is AADDiagGateway</p></td>
<td style="vertical-align:top"><p>2e18c352-e0f8-444d-8460-17961b9b5ed9</p></td>
<td style="vertical-align:top"><p>Analyzing AAD Gateway logs, particularly handy when you want to inspect the HTTP later more than eSTS handling of it (i.e. to Validate User Agents, query strings used etc.)</p></td>
</tr>
</tbody>
</table>

  
  
  

## Definition: PerRequestTableIfx

  

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<tbody>
<tr class="odd">
<td style="vertical-align:top"><strong>Field</strong></td>
<td style="vertical-align:top"><p><strong>Description</strong></p></td>
<td style="vertical-align:top"><p><strong>Example Data</strong></p></td>
<td style="vertical-align:top"><p><strong>Notes</strong></p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>Env_time</strong></p></td>
<td style="vertical-align:top"><p>UTC Timestamp</p></td>
<td style="vertical-align:top"><p>16/03/2017 15:33:25</p></td>
<td style="vertical-align:top"><p>Exact time correlation, validating data against timestamps and other traces (i.e. Fiddler)</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>Env_cloud_roleinstance</strong></p></td>
<td style="vertical-align:top"><p>Specific server which served the request</p></td>
<td style="vertical-align:top"><p>ESTSFE_IN_47</p></td>
<td style="vertical-align:top"><p>Validating data against headers in Fiddler trace</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>Env_cloud_location</strong></p></td>
<td style="vertical-align:top"><p>Datacenter which handled the request</p></td>
<td style="vertical-align:top"><p>DUB2</p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>CorrelationId</strong></p></td>
<td style="vertical-align:top"><p>ID used to correlate similar events together, across tables</p></td>
<td style="vertical-align:top"><p>177d1e45-bdbd-480d-a3cf-2d6bba034864</p></td>
<td style="vertical-align:top"><p>Searching across multiple tables, or grabbing all relevant events for one specific operation. For example, one Correlation ID representing a single login events would return multiple entries from both the PerRequestEventIfx and DiagnosticTracesIfx tables</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>RequestId</strong></p></td>
<td style="vertical-align:top"><p>ID which represents a client's interaction with EvoSTS</p></td>
<td style="vertical-align:top"><p>b38f93c4-f0f1-43f6-9804-daf446e0c1b1</p></td>
<td style="vertical-align:top"><p>Searching through logs using the x-ms-client-request-id HTTP Header in a Fiddler trace</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>Result</strong></p></td>
<td style="vertical-align:top"><p>Indicates operation success or failure</p></td>
<td style="vertical-align:top"><p>Success</p></td>
<td style="vertical-align:top"><p>Useful to quickly identify failures in a log trace</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>ApplicationId</strong></p></td>
<td style="vertical-align:top"><p>ID of the application referenced in the call (Unclear if client or resource)</p></td>
<td style="vertical-align:top"><p>3e74c654-####-####-####-############</p></td>
<td style="vertical-align:top"><p>Useful to identify the application being referenced in the trace (i.e. Salesforce). Also very useful to run scoped queries per application in order to view those specific errors, possibly cross tenant</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>Call</strong></p></td>
<td style="vertical-align:top"><p>Represents the type of operation requested/performed</p></td>
<td style="vertical-align:top"><p>Oauth2:Token</p></td>
<td style="vertical-align:top"><p>Helps to validate and understand the flow we are analyzing</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OriginalHost</strong></p></td>
<td style="vertical-align:top"><p>The hostname referenced by the client</p></td>
<td style="vertical-align:top"><p>Login.windows.net</p></td>
<td style="vertical-align:top"><p>Can be useful to determine whether a client is using login.windows.net or login.microsoftonline.com directly (More useful for custom developed apps)</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>InMicrosoftPolicyGroup</strong></p></td>
<td style="vertical-align:top"><p>Represents whether this is a 'First Party' Service Principal (i.e. Exchange, SharePoint etc.)</p></td>
<td style="vertical-align:top"><p>1</p></td>
<td style="vertical-align:top"><p>0 = False, 1 = True</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>Tenant</strong></p></td>
<td style="vertical-align:top"><p>Object ID of the Tenant object</p></td>
<td style="vertical-align:top"><p>eddd7390-####-####-####-############</p></td>
<td style="vertical-align:top"><p>Used commonly to scope queries, or useful when performing multi-tenant queries</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>GatewayForkTrackingId</strong></p></td>
<td style="vertical-align:top"><p>Unique ID tying these events to corresponding events in the AAD Gateway Logs. Currently I don't know the Kusto namespace for querying Gateway, but via Jarvis the table name to use is AADDiagGateway</p></td>
<td style="vertical-align:top"><p>2e18c352-e0f8-444d-8460-17961b9b5ed9</p></td>
<td style="vertical-align:top"><p>Analyzing AAD Gateway logs, particularly handy when you want to inspect the HTTP layer more than eSTS handling of it (i.e. to Validate User Agents, query strings used etc.)</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>ErrorCode</strong></p></td>
<td style="vertical-align:top"><p>String identifying the error received</p></td>
<td style="vertical-align:top"><p>UserInformationNotProvided</p></td>
<td style="vertical-align:top"><p>Self-explanatory, helps to identify errors quickly</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>ErrorNo</strong></p></td>
<td style="vertical-align:top"><p>Number representing the error received</p></td>
<td style="vertical-align:top"><p>50058</p></td>
<td style="vertical-align:top"><p>Mapping errors to customer error. For example AADSTS50058 received from a customer will map to 50058 in this field</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>HttpStatusCode</strong></p></td>
<td style="vertical-align:top"><p>HTTP response code</p></td>
<td style="vertical-align:top"><p>200</p></td>
<td style="vertical-align:top"><p>200 - Request was OK and some content was served</p>
<p>400 - Bad Request, likely also received a AADSTS error code</p>
<p>302 - Redirect, quite common</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>IsApplicationDisabled, IsResourceDisabled, IsUserAccountDisabled</strong></p></td>
<td style="vertical-align:top"><p>Indicates whether object is disabled in MSODS</p></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OTEncr</strong></p></td>
<td style="vertical-align:top"><p>Is Output Token encrypted</p></td>
<td style="vertical-align:top"><p>FALSE</p></td>
<td style="vertical-align:top"><p>Output token information</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>OTSigAlg</strong></p></td>
<td style="vertical-align:top"><p>Signature algorithm used to sign the output token</p></td>
<td style="vertical-align:top"><p><a href="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256" class="external free">http://www.w3.org/2001/04/xmldsig-more#rsa-sha256</a></p></td>
<td style="vertical-align:top"><p>Output token information,</p>
<p><strong>JWT Access Token Field: alg</strong></p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OTIss</strong></p></td>
<td style="vertical-align:top"><p>Issuer of the output token</p></td>
<td style="vertical-align:top"><p><a href="https://sts.windows.net/8e81adc1-####-####-####-############/" class="external free">https://sts.windows.net/8e81adc1-50ac-4f9f-a655-48d4485cb1ca/</a></p></td>
<td style="vertical-align:top"><p>Output token information, will usually resemble the example on the left including the tenant ID</p>
<p><strong>JWT Access Token Field: iss</strong></p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>OTAud</strong></p></td>
<td style="vertical-align:top"><p>Audience of the output token</p></td>
<td style="vertical-align:top"><p><a href="https://graph.windows.net" class="external free">https://graph.windows.net</a></p></td>
<td style="vertical-align:top"><p>Output token information, useful to validate the token has been issued to the intended audience. Should match a ServicePrincipalName on the resource's ServicePrincipal object, or the AppIdentifierUri on the Application object</p>
<p><strong>JWT Access Token Field: aud</strong></p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OTTID</strong></p></td>
<td style="vertical-align:top"><p>Tenant ID the output token is scoped to</p></td>
<td style="vertical-align:top"><p>8e81adc1-####-####-####-############</p></td>
<td style="vertical-align:top"><p>Output token information</p>
<p><strong>JWT Access Token Field: tid</strong></p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>OTOID</strong></p></td>
<td style="vertical-align:top"><p>Object ID the output token is scoped to</p></td>
<td style="vertical-align:top"><p>72776df6-####-####-####-############</p></td>
<td style="vertical-align:top"><p>Output token information</p>
<p><strong>JWT Access Token Field: oid</strong></p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OTIDP</strong></p></td>
<td style="vertical-align:top"><p>IDP which issues the output token</p></td>
<td style="vertical-align:top"><p><a href="https://sts.windows.net/8e81adc1-####-####-####-############/" class="external free">https://sts.windows.net/8e81adc1-50ac-4f9f-a655-48d4485cb1ca/</a></p></td>
<td style="vertical-align:top"><p>Output token information, will normally match the Issuer</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>OTAppID</strong></p></td>
<td style="vertical-align:top"><p>Client ID the output token is scoped to</p></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"><p>Output token information</p>
<p><strong>JWT Access Token Field: appid</strong></p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OTAppAuthn</strong></p></td>
<td style="vertical-align:top"><p>Application Authentication Strength (Relevant when service principal is authing)</p></td>
<td style="vertical-align:top"><p>2</p></td>
<td style="vertical-align:top"><p>0 = Unauthenticated, 1 = Password or Client Assertion, 2 = Client Assertion (Asymmetric) or X.509 certificate</p>
<p><strong>JWT Access Token Field: appidacr</strong></p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>OTAuthn</strong></p></td>
<td style="vertical-align:top"><p>Authentication method reference in the output token</p></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"><p>Output token information</p>
<p><strong>JWT Access Token Field: amr</strong></p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OTSub</strong></p></td>
<td style="vertical-align:top"><p>Encrypted subject of the output token</p></td>
<td style="vertical-align:top"><p>smtovdpB72LTUxmLE4KRdc4HP4/rTsALQk0ejd//MOE=</p></td>
<td style="vertical-align:top"><p>Output token information</p>
<p><strong>JWT Access Token Field: sub</strong></p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>OTName</strong></p></td>
<td style="vertical-align:top"><p>Name within the token</p></td>
<td style="vertical-align:top"><p>Test User 01</p></td>
<td style="vertical-align:top"><p>Output token information</p>
<p><strong>JWT Access Token Field: Name</strong></p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OTPuid</strong></p></td>
<td style="vertical-align:top"><p>PUID within the token</p></td>
<td style="vertical-align:top"><p>1003xxxxxxxx</p></td>
<td style="vertical-align:top"><p>Output token information</p>
<p><strong>JWT Access Token Field: puid</strong></p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>OTSName</strong></p></td>
<td style="vertical-align:top"><p>Surname within the token</p></td>
<td style="vertical-align:top"><p>Reason</p></td>
<td style="vertical-align:top"><p>Output token information</p>
<p><strong>JWT Access Token Field: family_name</strong></p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OTGName</strong></p></td>
<td style="vertical-align:top"><p>Given Name within the token</p></td>
<td style="vertical-align:top"><p>Ashley</p></td>
<td style="vertical-align:top"><p>Output token information</p>
<p><strong>JWT Access Token Field: given_name</strong></p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>OTGroups</strong></p></td>
<td style="vertical-align:top"><p>Subject's group membership</p></td>
<td style="vertical-align:top"><p>Group GUIDs</p></td>
<td style="vertical-align:top"><p>Output token information</p>
<p><strong>JWT Access Token Field: groups</strong></p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OTTforD</strong></p></td>
<td style="vertical-align:top"><p>Is token trusted for delegation</p></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"><p>Output token information</p>
<p><strong>JWT Access Token Field: trustedfordelegation</strong></p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>OTAuthCode</strong></p></td>
<td style="vertical-align:top"><p>Authorization Code</p></td>
<td style="vertical-align:top"><p>Opaque Value</p></td>
<td style="vertical-align:top"><p>Unique authorization code acquired via call to /authorize endpoint, usually then exchanged for a token via another call to /token</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OTRfrsh</strong></p></td>
<td style="vertical-align:top"><p>Output token refresh token</p></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>OTRespScope</strong></p></td>
<td style="vertical-align:top"><p>Scope of the token</p></td>
<td style="vertical-align:top"><p>Calendars.ReadWrite Contacts.ReadWrite</p></td>
<td style="vertical-align:top"><p>Scopes to restrict what this token can be used for</p>
<p><em><code>Believe this is restricted to apps acquiring tokens via the v2 endpoint (Need to confirm)</code></em></p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OTRespAud</strong></p></td>
<td style="vertical-align:top"><p>Audience of the token</p></td>
<td style="vertical-align:top"><p><a href="https://outlook.office365.com/" class="external free">https://outlook.office365.com/</a></p></td>
<td style="vertical-align:top"><p>Exists when OTRespScope is also populated with a value</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>SID</strong></p></td>
<td style="vertical-align:top"><p>Session ID</p></td>
<td style="vertical-align:top"><p>b0c0f849-1d3f-4d15-99b8-4027b466fba9</p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>PUID</strong></p></td>
<td style="vertical-align:top"><p>PUID of the user account</p></td>
<td style="vertical-align:top"><p>1003xxxxxxxx</p></td>
<td style="vertical-align:top"><p>Identify the user account</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>UserAuth</strong></p></td>
<td style="vertical-align:top"><p>Indicates whether it is a user login or SP login</p></td>
<td style="vertical-align:top"><p>FALSE</p></td>
<td style="vertical-align:top"><p>True = User Principal is the requestor</p>
<p>False = Service Principal is the requestor</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>UserAgent</strong></p></td>
<td style="vertical-align:top"><p>View the User Agent connecting</p></td>
<td style="vertical-align:top"><p>Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:51.0) Gecko/20100101 Firefox/51.0</p></td>
<td style="vertical-align:top"><p>Gives a good indication which client was used to connect &lt;TO DO&gt; Add Ref to user agents</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>ClientIp</strong></p></td>
<td style="vertical-align:top"><p>IP Address of the connecting client</p></td>
<td style="vertical-align:top"><p>10.10.10.10</p></td>
<td style="vertical-align:top"><p>Very useful when validating Ips against Trusted Ips and Well-Known IP Settings</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>DeviceId</strong></p></td>
<td style="vertical-align:top"><p>Device Object ID?</p></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>ResourceId</strong></p></td>
<td style="vertical-align:top"><p>Resource ID a token has been requested for</p></td>
<td style="vertical-align:top"><p>00000002-0000-0000-c000-000000000000</p></td>
<td style="vertical-align:top"><p>Corresponds to AppID on either ServicePrincipal or Application objects</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>RealmType</strong></p></td>
<td style="vertical-align:top"><p>Domain Authentication Method</p></td>
<td style="vertical-align:top"><p>Federated</p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>TenantId</strong></p></td>
<td style="vertical-align:top"><p>Tenant ID token request was made for</p></td>
<td style="vertical-align:top"><p>8e81adc1-####-####-####-############</p></td>
<td style="vertical-align:top"><p>Usually as a result of the tenant specific endpoint client accessed for code/token (i.e. <a href="https://login.microsoftonline.com/overtrax.onmicrosoft.com/oauth2/token" class="external free">https://login.microsoftonline.com/overtrax.onmicrosoft.com/oauth2/token</a></p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>UserTenantId</strong></p></td>
<td style="vertical-align:top"><p>Tenant ID the user belongs to</p></td>
<td style="vertical-align:top"><p>8e81adc1-####-####-####-############</p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>ConfigVariants</strong></p></td>
<td style="vertical-align:top"><p>Additional data not fitting into a column</p></td>
<td style="vertical-align:top"><p>x-client-sku=.NET,x-client-ver=2.28.1.741,x-client-cpu=x64,x-client-os=Microsoft Windows NT 6.2.9200.0,federatedidp=ompm.co.uk,tenantname=8e81adc1-####-####-####-############,tenantid=8e81adc1-####-####-####-############,applicationidentifier=d88a361a-####-####-####-############,resourceidentifier=00000002-0000-0000-c000-000000000000,userregionscope=eu</p></td>
<td style="vertical-align:top"><p>Can be useful for edge cases</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>MfaAuthMethod</strong></p></td>
<td style="vertical-align:top"><p>Method by which user is honoring MFA requirement</p></td>
<td style="vertical-align:top"><p>OneWaySMS</p></td>
<td style="vertical-align:top"><p>Useful when troubleshooting MFA Issues</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>ConditionalAccessAppIdentifier1</strong></p></td>
<td style="vertical-align:top"><p>Identifies app being evaluated against conditional access policies</p></td>
<td style="vertical-align:top"><p>00000002-0000-0ff1-ce00-000000000000</p></td>
<td style="vertical-align:top"><p>Useful to troubleshoot CA issues</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>ConditionalAccessAppId1Decision</strong></p></td>
<td style="vertical-align:top"><p>Status of decisions regarding evaluation of CA Policy</p></td>
<td style="vertical-align:top"><p>MfaDone,DeviceStatePolicySkipped</p></td>
<td style="vertical-align:top"><p>Useful to troubleshoot CA issues</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>ConditionalAccessAppIdentifier2</strong></p></td>
<td style="vertical-align:top"><p>Identifies app being evaluated against conditional access policies, specifically CA policies that evaluate more than 1 application</p></td>
<td style="vertical-align:top"><p>00000003-0000-0ff1-ce00-000000000000</p></td>
<td style="vertical-align:top"><p>Useful to troubleshoot CA issues</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>ConditionalAccessAppId2Decision</strong></p></td>
<td style="vertical-align:top"><p>Status of decisions regarding evaluation of CA Policy for 2nd application</p></td>
<td style="vertical-align:top"><p>DeviceStatePolicySkipped</p></td>
<td style="vertical-align:top"><p>Useful to troubleshoot CA issues</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>SasStatus</strong></p></td>
<td style="vertical-align:top"><p>Status of MFA Flow</p></td>
<td style="vertical-align:top"><p>SMSAuthFailedWrongCodeEntered</p></td>
<td style="vertical-align:top"><p>Good to troubleshoot MFA Failures</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>UserPrincipalObjectID</strong></p></td>
<td style="vertical-align:top"><p>Object ID of the user</p></td>
<td style="vertical-align:top"><p>&lt;GUID&gt;</p></td>
<td style="vertical-align:top"><p>Only valid for user authentication flows</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>ServicePrincipalObjectID</strong></p></td>
<td style="vertical-align:top"><p>Object ID of the service principal</p></td>
<td style="vertical-align:top"><p>&lt;GUID&gt;</p></td>
<td style="vertical-align:top"><p>Only valid for service principal authentication flows</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OAuth2RequestScopes</strong></p></td>
<td style="vertical-align:top"><p>Scope parameter sent in HTTP Body</p></td>
<td style="vertical-align:top"><p>Open_id</p></td>
<td style="vertical-align:top"><p>Identify the type of token we have asked for</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>IsProofUpDone</strong></p></td>
<td style="vertical-align:top"><p>Has user completed proof up to provide Contact methods</p></td>
<td style="vertical-align:top"><p>TRUE</p></td>
<td style="vertical-align:top"><p>Useful for troubleshooting MFA Issues</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>MfaStatus</strong></p></td>
<td style="vertical-align:top"><p>Current MFA Status</p></td>
<td style="vertical-align:top"><p>MfaFromFlowToken</p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>XForwardedForOriginal</strong></p></td>
<td style="vertical-align:top"><p>Forwarded IP</p></td>
<td style="vertical-align:top"><p>10.10.10.10</p></td>
<td style="vertical-align:top"><p>Maps to HTTP header x-forwarded-for-original</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>MsaRedirUsed</strong></p></td>
<td style="vertical-align:top"><p>Flags when account is both MSA and Work/School Account (Need to validate)</p></td>
<td style="vertical-align:top"><p>FALSE</p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>UserPrincipalSecurityFlags</strong></p></td>
<td style="vertical-align:top"><p>Has the account been flagged for security reasons</p></td>
<td style="vertical-align:top"><p>0</p></td>
<td style="vertical-align:top"><p>0 = Fine</p>
<p>1 = User must change password</p>
<p>2 = User must change password</p>
<p>4 = Account flagged as security risk (Compromised)</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OTData</strong></p></td>
<td style="vertical-align:top"><p>Output Token Data</p></td>
<td style="vertical-align:top"><p>1|ClientOnlyJsonWebToken,2017-03-07T08:16:35.1500553Z,2017-03-07T09:21:35.1500553Z,,,,,,,,</p></td>
<td style="vertical-align:top"><p>Very Useful for analyzing output token data &lt;TO DO&gt; Break down individual parts</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>FederationProtocol</strong></p></td>
<td style="vertical-align:top"><p>Federation Protocol Used</p></td>
<td style="vertical-align:top"><p>WSTrust</p></td>
<td style="vertical-align:top"><p>Identify the federation protocol used</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>DevicePlatform/DevicePlatformForUI</strong></p></td>
<td style="vertical-align:top"><p>OS/Platform device is running on</p></td>
<td style="vertical-align:top"><p>Windows</p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>ITData</strong></p></td>
<td style="vertical-align:top"><p>Input Token Data (PII Scrubbed)</p></td>
<td style="vertical-align:top"><p>1|Refresh Token,2016-11-13T04:41:25.4987384Z,2017-02-11T04:41:25.4987384Z,2016-08-29T03:32:50.0000000Z,Password,&lt;IP&gt;,&lt;GUID&gt;,,,,,,</p></td>
<td style="vertical-align:top"><p>No defined schema for this data so cannot blow open fully. Contains token type, various timestamps (maybe issued at and expiry time) and the authentication method reference used to acquire the token</p>
<p>Useful where a refresh token with only amr=Password has been used to try and acquire a token for a resource where the CA policy enforces MFA must be performed</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>LastPasswordChangeTimestamp</strong></p></td>
<td style="vertical-align:top"><p>Last Password Change</p></td>
<td style="vertical-align:top"><p>2017-03-17T10:00:00Z</p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>Prompt</strong></p></td>
<td style="vertical-align:top"><p>Parsing the prompt parameter from the request</p></td>
<td style="vertical-align:top"><p>None</p></td>
<td style="vertical-align:top"><p>Some apps will pass a prompt= parameter within their query string to login.microsoftonline.com to change the prompt behaviour. For instance, None will cause there to be no UI displayed at all, so if there are no ESTSAUTH tokens sent in the request we typically fail with a User cannot be identified error AADSTS50058</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>IsInteractive</strong></p></td>
<td style="vertical-align:top"><p>Was UI thrown up</p></td>
<td style="vertical-align:top"><p>0</p></td>
<td style="vertical-align:top"><p>0 = No</p>
<p>1 =� Yes</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>LastStsRefreshTokenInvalidatedByPasswordChange</strong></p></td>
<td style="vertical-align:top"><p>Last timestamp the user's refresh tokens were invalidated because of a password change</p></td>
<td style="vertical-align:top"><p>06/03/2017 04:14</p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>LastStsRefreshTokenRevoked</strong></p></td>
<td style="vertical-align:top"><p>User's refresh token timestamp, whereby it has been revoked via other means</p></td>
<td style="vertical-align:top"><p>06/03/2017 04:14</p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>ITAuthenticationTime</strong></p></td>
<td style="vertical-align:top"><p>Input Token authentication time</p></td>
<td style="vertical-align:top"><p>2017-03-06T02:13:57.961Z</p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>OTAuthenticationTime</strong></p></td>
<td style="vertical-align:top"><p>Output Token authentication time</p></td>
<td style="vertical-align:top"><p>2017-03-06T02:13:57.961Z</p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>AdalClientLastError</strong></p></td>
<td style="vertical-align:top"><p>Last error thrown by ADAL Client, will be the error code</p></td>
<td style="vertical-align:top"><p>50034</p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>IdentityProvider</strong></p></td>
<td style="vertical-align:top"><p>Identity Provider for incoming tokens</p></td>
<td style="vertical-align:top"><p><a href="https://adfs.contoso.com/services/.trust" class="external free">https://adfs.contoso.com/services/.trust</a></p></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>EstsClientTokenSigningCertificateInfo</strong></p></td>
<td style="vertical-align:top"><p>Thumbprint of cert used to sign client token</p></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>EstsResourceTokenSigningCertificateInfo</strong></p></td>
<td style="vertical-align:top"><p>Thumbprint of cert used to sign resource token</p></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>ITSigAlg</strong></p></td>
<td style="vertical-align:top"><p>Signature algorithm used to sign input token</p></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>EventData</strong></p></td>
<td style="vertical-align:top"><p>Additional Verbose Information</p></td>
<td style="vertical-align:top"><p>Token, IP:OAuth2, OP:OAuth2, IT:RefreshToken, OT:Jwt, RefreshToken, Success</p></td>
<td style="vertical-align:top"><p>Summary of various data.</p>
<p>IP/OP = Input/Output protocol</p>
<p>IT/OT = Input/Output token types</p>
<p>RefreshToken = Unsure</p>
<p>Success = Status Code</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>IsKeepMeSignedIn</strong></p></td>
<td style="vertical-align:top"><p>Did user tick KMSI on login?</p></td>
<td style="vertical-align:top"><p>0</p></td>
<td style="vertical-align:top"><p>0 = False</p>
<p>1 = True</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>IsKeepMeSignedInClaim</strong></p></td>
<td style="vertical-align:top"><p>Claim sent by AD FS for persistent authN (i.e. "<a href="http://schemas.microsoft.com/2014/03/psso" class="external free">http://schemas.microsoft.com/2014/03/psso</a>" claim is present)</p></td>
<td style="vertical-align:top"><p>1</p></td>
<td style="vertical-align:top"><p>0 = False</p>
<p>1 = True</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>ForceFreshLogin</strong></p></td>
<td style="vertical-align:top"><p>Was request made to force fresh login to login.microsoftonline.com with query parameter wfresh=0</p></td>
<td style="vertical-align:top"><p>0</p></td>
<td style="vertical-align:top"><p>0 = False</p>
<p>1 = True</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>HttpMethod</strong></p></td>
<td style="vertical-align:top"><p>HTTP Verb used in request</p></td>
<td style="vertical-align:top"><p>GET</p></td>
<td style="vertical-align:top"><p>Typically HTTP GET or POST</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><p><strong>AuthMethods</strong></p></td>
<td style="vertical-align:top"><p>Bitwise value representing auth method(s) used</p></td>
<td style="vertical-align:top"><p>10 (X.509 + MFA)</p></td>
<td style="vertical-align:top"><p>0x1 = Password</p>
<p>0x2 = X.509 Cert</p>
<p>0x4 = Windows Integrated Authentication</p>
<p>0x8 = Multi Factor Auth</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><p><strong>MiscFields</strong></p></td>
<td style="vertical-align:top"><p>OT Fields added into one</p></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"><p>Consolidated view of all OT* properties</p></td>
</tr>
</tbody>
</table>
