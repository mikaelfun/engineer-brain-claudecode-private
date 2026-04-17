---
source: ado-wiki
sourceRef: "Supportability\AzureAD\AzureAD;C:\Program Files\Git\GeneralPages\AAD\AAD Authentication\Azure AD Conditional Access Policy\Azure AD Conditional Access for Guests and Roles"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=C:/Program Files/Git/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20Conditional%20Access%20Policy/Azure%20AD%20Conditional%20Access%20for%20Guests%20and%20Roles"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.CA
- cw.Guestuser
-  cw.B2C
- SCIM Identity
- Conditional Access
-  Guest user
-  B2C
-  B2B
-  External User
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Conditional-Access](/Tags/Conditional%2DAccess) 


[[_TOC_]]

## Summary

The '**Users and groups**' Conditional Access Policy blade now supports assigning policies directly to '**All Guest users**' and members of Azure AD '**Directory Roles**'. This is in addition to the traditional setting of '**All users**' or '**Select users and groups**',

### Conditional Access Policy for All Guests Users

**IMPORTANT**: This section contains information about the previous version of Conditional Access for guest users, for the updated version please refer to: [Conditional Access for Guests and External Users](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/755946/Azure-AD-Conditional-Access-Fine-Grained-Policies-for-Guests-and-External-Users).

Prior to the new '**All Guest users**' option, [guidance](https://docs.microsoft.com/en-us/azure/active-directory/active-directory-b2b-dynamic-groups#hardening-the-all-users-dynamic-group) for assigning Conditional Access Policy to Guest accounts was to assign Guest users to a Dynamic group and then assign the Conditional Access Policy to that Dynamic group. One drawback with this method is that the initial cloud application login may not get the policy applied because their Guest account might not be added to the dynamic group in time for Conditional Access Policy evaluation. The guidance referenced earlier will change to recommend sing the '**All Guest users**' option instead of Dynamic groups.

With the new '**All guest users**' option we will no longer recommend Dynamic groups for guests. Instead, Azure AD will just check the **UserType** attribute directly for **Guest**?and ensure they get CA policy applied.

[![GuestOption.jpg](/.attachments/0446446e-c522-013e-0452-078b755f826c442px-GuestOption.jpg)](/.attachments/0446446e-c522-013e-0452-078b755f826c442px-GuestOption.jpg)

### Conditional Access Policy for Directory Roles

It is now possible to apply Conditional Access Policy to Azure AD Roles. This does not apply to Azure RBAC roles.

Prior to the new '**Directory roles**' option, guidance to enforce Conditional Access Policy for sensitive Azure AD Role members was to create Security groups and add those members to those groups before Including those Security groups on the '**Users and groups**' Condition blade. The '**Directory roles**' option should help to address escalations where customers apply Conditional Access Policy to "All users" which effectively blocks user accounts that are used by Azure AD Connect to sync from on-premises. Now Administrators can Exclude members of the '**Directory Sync Accounts**' role.

[![DirectoryRoleOption.jpg](/.attachments/34046855-9cf7-df49-2c91-39471c8f4487222px-DirectoryRoleOption.jpg)](/.attachments/34046855-9cf7-df49-2c91-39471c8f4487222px-DirectoryRoleOption.jpg)

The '**All Guest users**' and the '**Directory roles**' options, as well as '**Users and groups**' can be selected on the **Exclusion** tab to prevent the Conditional Access Policy from being applied.

## Objects and Attributes

Conditional Access Policies objects are stored in MSODS. Support engineers with GME access can view these policies in DSExplorer. Policies created in Azure Portal have a **PolicyType** of **MultiConditionalAccessPolicy \[18\]**. The policy definition is contained in a JSON string stored in the **PolicyDetail** attribute.

Selecting '**Select users and groups**' on the '**Users and Groups**' condition in the Conditional Access Policy UX presents the administrator with three options:

  - '**All Guest users**' under **Include** or **Exclude** creates a top-level **Users** section in the JSON string.
      - The **Include** or **Exclude** subsections state **Guests**. This covers all accounts in the customer's tenant of **UserType=Guest**.

<!-- end list -->

```
    {"Version":0,"State":"Enabled","Conditions":{"Applications":{"Include":[{"Applications":["230848d5-2c87-45d4-b05a-60d29a40fced"]}]},"Users":{"Include":[{"Users":["Guests"]}]}},"Controls":[{"Control":["Mfa"]}],"EnforceAllPoliciesForEas":false,"IncludeOtherLegacyClientTypeForEvaluation":false}
```

  - '**Directory roles**' under **Include** or **Exclude** creates a top-level **Users** section in the JSON string.
      - The **Include** or **Exclude** subsections contain a category called **Roles** containing a comma separated list of Directory Role Template ObjectIds.

<!-- end list -->

```
    {"Version":0,"State":"Enabled","Conditions":{"Applications":{"Include":[{"Applications":["230848d5-2c87-45d4-b05a-60d29a40fced"]}]},"Users":{"Include":[{"Roles":["9b895d92-2cd3-44c7-9d02-a6ac2d5ea5c3","b0f54661-2d74-4c50-afa3-1ec803f12efe","17315797-102d-40b4-93e0-432062caca18"]}],"Exclude":[{"Roles":["729827e3-9c14-49f7-bb1b-9608f156bbb8"]}]}},"Controls":[{"Control":["Mfa"]}],"EnforceAllPoliciesForEas":false,"IncludeOtherLegacyClientTypeForEvaluation":false}
```

  - Finally, '**Users and groups**' creates a top-level **Users** and/or **Groups** section in the JSON string.
      - The **Include** or **Exclude** subsections contain a category of **Users** and/or **Groups** containing a comma separated list of user and group ObjectIds.

<!-- end list -->

```
    {"Version":0,"State":"Enabled","Conditions":{"Applications":{"Include":[{"Applications":["230848d5-####-####-####-############"]}]},"Users":{"Include":[{"Groups":["d1b79dbe-####-####-####-############"]},{"Users":["08d45166-####-####-####-############","ee759066-####-####-####-############"]}]}},"Controls":[{"Control":["Mfa"]}],"EnforceAllPoliciesForEas":false,"IncludeOtherLegacyClientTypeForEvaluation":false}
```

## Tools

### Identify Directory Role(s) Specified in the PolicyDetail?JSON string

The Directory Role Template ObjectID that is listed under the **Include** or **Exclude** portion of the JSON string can be resolved to the Role Names using **Get-MgDirectoryRole**.

**Note**: The roles that Microsoft Graph does not return a DisplayName which aligns to the Directory Role UX are in the table below.

| Role Name in Azure Portal | ObjectId of the Directory Role Template | PowerShell [Get-MgDirectoryRole](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.identity.directorymanagement/get-mgdirectoryrole?view=graph-powershell-1.0)|
| ------------------------- | --------------------------------------- | ------------------------------------------------------------- |
| Global Administrator      | 62e90394-69f5-4237-9190-012177145e10    | Company Administrator                                         |
| Password Administrator    | 729827e3-9c14-49f7-bb1b-9608f156bbb8    | Helpdesk Administrator                                        |

### Determine the User Account Type

If '**All Guest users**' is selected then the **UserType** attribute must be **Guest** for Conditional Access Policy evaluation to succeed.

  - The customer can use [**Get-MgBetaUser**](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.beta.users/get-mgbetauser?view=graph-powershell-beta) to view the UserType attribute.

```
    PS C:\> Get-MgBetaUser -UserId 2c313fa4-####-####-###4-############ | fl "DisplayName","Id","UserPrincipalName","ObjectID","AccountEnabled","UserType","UserState","ExternalUserState"

DisplayName       : ##
Id                : 2c313fa4-####-####-###4-############
UserPrincipalName : r#################a_h#####l.com#EXT#@######.onmicrosoft.com
AccountEnabled    : True
UserType          : **Guest**
ExternalUserState : Accepted
```

## Troubleshooting

When troubleshooting Conditional Access Policy failing to apply for users that are members of Directory Roles.

1.  Determine if the customer has an Azure AD Premium P2, or Office E5 Subscription.
    1.  If they use Privileged Identity Management (PIM), verify the user was not listed as an '**Eligible**' role member at the time the login was attempted. Only '**Active**' role members will pass Conditional Access Policy evaluation and apply the policy.
    2.  To view '**Eligible**' role members, the customer can look in the Azure Privileged Identity Management portal under **Azure AD directory roles** \> **Roles**.

## Known Issues

1.  Users get MFA when using EAS.
    1.  EAS has no way of telling if the user is an administrator or not. For this reason, all users will be prompted for MFA.
2.  Currently, Directory Roles displayed in UX are not generated dynamically for various reasons. The main reason, at this time, is the role names needs to be translated. The role drop-down should show all roles that are available in the tenant. This issue is being tracked in [Bug 356367](https://identitydivision.visualstudio.com/ISP/ISPUX/_queries?id=356367%2F&triage=true&_a=edit).

## Service-Side Trace Logging

This section covers performing Service-side tracing of EvoSTS using Kusto queries using Kusto client or Logsminer. The product group created the LogsMinor to simplify trace review for Conditional Access cases.

### Access to ESTS

1.  Verify you have membership to these RamWeb projects:?[Azure Identity - 20630](https://ramweb/RequestAccess.aspx?ProjectID=20630)?and?[WA CTS -14817](https://ramweb/RequestAccess.aspx?ProjectID=14817)

### LogsMiner

**Use Azure Support Center Authentication diagnostic instead**

LogsMinor perform basic queries against ESTS or SAS without having to craft Kusto Queries.

  - Install the latest version from here. This installer guarantees it always the latest version (no need to copy from fileshare anymore).

<!-- end list -->

1.  Double-click LogsMiner
2.  Click the "**Search**" icon in the top left
3.  Enter the CorrelationID or RequestId
4.  Enter the time the event occurred in UTC time.

## Kusto Client

### To perform Kusto trace logging

1.  You must have access to RamWeb projects:?[Azure Identity - 20630](https://ramweb/RequestAccess.aspx?ProjectID=20630)?and?[WA CTS -14817](https://ramweb/RequestAccess.aspx?ProjectID=14817)
2.  Kusto client must be configured to query ESTS. Click t[his link to Install](https://estsam2.kusto.windows.net/)?and open Kusto.
3.  Expand?**Connections**?\\?**Estsby2**?\\?**ESTS**?and select "**DiagnosticTracesIfx**"
    1.  If you do not see Estsby2?under Connections, right-click?**Connections**?and click?**Add Connection**. Change the cluster to point to?[https://estsam2.kusto.windows.net:443](https://estsam2.kusto.windows.net/)
    2.  If you click the green "**Run**" arrow and you get a message stating, "**Title: No query context Please, select any Database or Table**", you must select?**DiagnosticTracesIfx**?as described in the previous step above.

### Initial Kusto Query of PerRequestTableIfx Using the CorrelationId

Query the?**PerRequestTableIfx**?to obtain a high level summary of the activity that took place using the CorrelationID obtained from the Client-Side error.

  - Click?[this link](https://estssn1.kusto.windows.net:443/ESTS?query=H4sIAAAAAAAEAJ2STY%2faMBCG70j8BysnkJJuEhYB21IJAZUilapaOO2lmtiTxa1jp7aTLdL%2b%2bE5gYbuVUKvcRuP3mQ%2fPq9Az58F6NmcCPHpZ4iCNk2kUj6J0xtL4LpncxfHD8H2%2fp0iMWlyXpulZWkjSSc0G%2fR5XtfNoBwE676BMg%2bE7wiEHh4Ngvd1tKfEV7T3%2brEmxg1xhVvwK%2fwJz1RU8JN1Avu8IinzUDdz%2f0N1AJzuCouy4o9P%2fCQ7Z0x4tkm%2bab61j2Mf5i%2bGAHHLJfpgfndXmlsZaVOCl0Rl5bc6CkeDFOMdRVFC36FaMJ1HOZ7MonvJpOiYLwuQ26PeeWWXNd%2bT%2bUjZ8WyxkL8OdQlcrH7JthVyC%2bqTMU8gWVaUkv8gzl2laGbiXDRVbW2vs0ggKN6Ik7UmzwkZyXJqSWNB%2bocUGNDwiPZ6edpZ%2bbneoWq6ArQdfOxpNSdQ%2bq86qttgf%2fVfSVQoOX%2bC0hhayzYJacI7OHZsTLguJNrkmSFa0m6Psvyqk1wTpa4UNfZdcLtYNqPo44WfzeNlCF%2bYcs5ubeyxNg6wwlpWGji%2fQg1TthZyhy%2beH18OD478BUo2LsIQEAAA%3d)?to pre-populate the Initial PerRequestTableIfx query using the CorrelationId:

**Note**: If you don't have a CorrelationID, see the section titled, "**Use PUID to Trace a Successful Login in Kusto**" below.

1.  Modify the?**datetime**?entries to start just prior to, and just after the event cited in the client side error. Make sure it is in UTC format like it appears in the client-side error. Kusto shows the current time in UTC in the extreme bottom right corner of the Kusto application.

2.  Modify the query to use the?**CorellationID**?in the client-side error

3.  Locate the?**ErrorCode**?column with the error condition, like "**ConditionalAccessFailed**"

4.  Copy the?**RequestId**?from the column with the error.
    
    ```
        let start = datetime(2018-03-29 20:17:00Z);
        let end = datetime(2018-03-29 20:22:00Z);
        find in (
        cluster("estsam2").database("ESTS").PerRequestTableIfx,
        cluster("estsbl2").database("ESTS").PerRequestTableIfx,
        cluster("estsby1").database("ESTS").PerRequestTableIfx,
        cluster("estsch1").database("ESTS").PerRequestTableIfx,
        cluster("estsdb3").database("ESTS").PerRequestTableIfx,
        cluster("estshkn").database("ESTS").PerRequestTableIfx,
        cluster("estssin").database("ESTS").PerRequestTableIfx,
        cluster("estsdm1").database("ESTS").PerRequestTableIfx,
        cluster("estssn1").database("ESTS").PerRequestTableIfx) where env_time >= start and env_time <= end and CorrelationId == "3dcf5be3-faba-4d57-bc99-08c825201a74"
        | project env_time, CorrelationId, RequestId, Result, SpecialFlow, ApplicationId, IsInteractive, ErrorCode, MdmAppId, IsDeviceCompliantAndManaged, DeviceTrustType, MfaStatus, ClientIp, DeviceId, ApplicationDisplayName, ConditionalAccessAppIdentifier1, ConditionalAccessAppId1Decision, ConditionalAccessAppIdentifier2, ConditionalAccessAppId2Decision, MultiCAEvaluationLog, ClientInfo, Client //Remove for more detail
        | sort by env_time asc
    ```

### Kusto Query of DiagnosticTracesIfx Using the RequestId

The?**DiagnosticTracesIfx**?results table provides a detailed view of the activity that took place. Using the RequestId, search all policy evaluation activity in the DiagnosticTracesIfx table.

Use the RequestID from the PerRequestTableIfx,?and examine the detailed activity that is in the DiagnosticTracesIfx?table to understand the failure.

  - Click?[this link](https://estsam2.kusto.windows.net:443/ESTS?query=H4sIAAAAAAAEAJ2SwWvCMBjF74L%2fw0dPFdrZpoLWrbtsHjzsop52GWn6qdnSxOWLTmF%2f%2fFLZFAaDkZzC4%2f3ex4On0AE5bh1U0HCHTrYYsyyfpFmRshJYNs3H0yx7Htz2e8qbUTd%2fWxn7sa6l90kNcb8n1J4c2jhCcsRbFg1uPM5rThhHs%2bVq6YVHyTfakJNiZblAmq%2bPyS%2byVsHkKQ8kxTaUbOoikNy%2b6UCSZCjZtKE9Sf%2bXHMDHFi36AR1euunAffW9PO6nclHvqvPEOm2B73t%2fY%2b4HV0GUj7GYYF6k5UTU6SjHPC0ZsrQUWIxYITL%2fIuj3PmFnzSsKd8lM4MFYi4o7afS8Sa7B3Zf2ynkHVyqB2QH1WV6h5trLT0jENz5hdhS463gYDhfYmgPC2lhojW%2fUoONSdZfJ%2bDr16dqGk%2fgC%2fBrIEWIDAAA%3d)?to pre-populate the DiagnosticTracesIfx?query and examine the *Messages* to understand the failure.

<!-- end list -->

1.  Paste the **RequestId** copied from the PerRequestTableIfx?query.

<!-- end list -->

```
    let start = datetime(2018-03-29 20:17:00Z);
    let end = datetime(2018-03-29 20:22:00Z);
    find in (
    cluster("estsam2").database("ESTS").DiagnosticTracesIfx,
    cluster("estsbl2").database("ESTS").DiagnosticTracesIfx,
    cluster("estsby1").database("ESTS").DiagnosticTracesIfx,
    cluster("estsch1").database("ESTS").DiagnosticTracesIfx,
    cluster("estsdb3").database("ESTS").DiagnosticTracesIfx,
    cluster("estshkn").database("ESTS").DiagnosticTracesIfx,
    cluster("estssin").database("ESTS").DiagnosticTracesIfx,
    cluster("estsdm1").database("ESTS").DiagnosticTracesIfx,
    cluster("estssn1").database("ESTS").DiagnosticTracesIfx) where env_time >= start and env_time <= end and RequestId == "17e38e13-98cb-41e1-92e2-9ce3423c0000" 
    | project env_time, CorrelationId, RequestId, Result, Call, EventId, Tenant, Message, Exception //Remove for more detail
    | sort by env_time asc
```

### Interpret Messages from DiagnosticTracesIfx Results

Examine the *Messages* column for to determine the Conditions and Controls that need to be satisfied, identity which the Policy ObjectId is being Applied, or DoesNotApply as the case may be.

In the scenario below a B2B user successfully signed into a Cloud application where the User Condition has **All Guest users** selected on the **Include** tab after Accepting a Terms Of Use access Control.

**NOTE**: Messages in the table below are in reverse order because the Messages are being reviewed from the last result at the bottom, going up.

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>Message</th>
<th>Result</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="vertical-align:top">New Cookie created with ExpId:dae55da2-b7e3-413d-b9f4-d087f9a52800, Time:03/29/2018 20:20:48</td>
<td style="vertical-align:top">A new Access Token has been issued</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Multi CA Policy evaluation log:
<p>{"<strong>Id":"fc61dd5d-bb8b-4284-8937-91fc97d1a131</strong>","<strong>Eval":"Applies</strong>","Val":"Valid","Data":{"App":{"res":"Satisfied","inc":"Satisfied","exc":"NotSatisfied"},"User":{"res":"Satisfied","inc":"Satisfied","exc":"NotSatisfied"}},"ExtChlgs":{"db2b7360-76c4-44ba-8507-a7a985e9246f":"ToU+Name"},"NoChlgNeeded":true,"Type":0}</p></td>
<td style="vertical-align:top">This is a B2B Guest user login to a Cloud application where the <strong>Users</strong> Condition has <strong>All Guest users</strong> selected on the <strong>Include</strong>.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">DataForConditionEvaluation: {"<strong>AudienceAppIds":["230848d5-####-####-####-############</strong>"],"UserObjectId":"f25e6ab7-####-####-####-############","DevicePlatform":3,"ClientIpAddress":"167.###.###.133","ClientType":1,"RequestTime":"2018-03-29T20:20:48.8888241Z","SignInRisk":1,"UserRisk":1,"<strong>IsGuestUser":true</strong>,"IsLegacyAuth":false,"IsInsideCorpnet":false,"IsIpAllowedDueToTenantStrongAuthPolicy":true,"IsManagedApp":false,"DeviceProperties":{"IsManaged":false,"IsCompliant":false,"IsDomainJoined":false,"IsKnownWithManagedApp":false,"IsKnown":false},"IsMfaDone":false,"ListOfAlreadySatisfiedExternalControls":["db2b7360-76c4-44ba-8507-a7a985e9246f"],"RequestedAcrs":[]}</td>
<td style="vertical-align:top">The AppId to the right of <strong>AudienceAppIds</strong> matches the AppId seen in the ConditionalAccessAppIdentifier2 column of the PerRequestTableIfx.
<p><strong>IsGuestUser</strong> is <strong>True</strong> indicating the UserType satisfied the Condition.</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top">CFL: 48; SFL: 48; CurFL: 48; AuthQuery (Batch):
<p><em>&lt;SNIP&gt;</em></p>
<p><strong>USER</strong>:</p>
<p><em>&lt;SNIP&gt;</em></p>
<p><strong>IsGuest</strong>:true</p>
<p><strong>OrganizationName</strong>:"contoso.com"</p>
<p><strong>PUID</strong>:"1003############"</p>
<p><em>&lt;/SNIP&gt;</em></p></td>
<td style="vertical-align:top"><strong>IsGuest:true</strong> indicates this is a B2B login
<p><strong>OrganizationName</strong> is the verified domain name where the user is a Member and not a Guest.</p>
<p><strong>PUID</strong> is the LiveId of the Guest user object in the Resource tenant where the application resides.</p></td>
</tr>
</tbody>
</table>

#### Values seen in the MultiConditionalAccessPolicy log

| Values | Meaning                                                                 |
| ------ | ----------------------------------------------------------------------- |
| res    | Indicates if the overall evaluation data is valid for a given Condition |
| inc    | details of Include evaluation.                                          |
| exc    | details of Exclude evaluation.                                          |

### Use PUID to Trace a Successful Login in Kusto

If the customer's scenario does not produce a client-side error, and you don't have a CorrelationID to perform the initial Kusto Query against the PerRequestTableIfx, all you need to do is know the Date/Time of the login and the PUID of the user.

  - Click?[this link](https://estssn1.kusto.windows.net:443/ESTS?query=H4sIAAAAAAAEAJ2SUWvbMBDH3wP5DsJPCbit7cDWtPXAJB4YllGa7KUv4yydG22y5Emyu8A%2b%2fM5Jk45C6LCejtP%2fd6fT%2fRV65jxYz1ImwKOXNU6SKL6%2biGYXyZwl0U388SaKHqe345EiMWpxXpokR2klSSc1m4xHXLXOo50E6LyDOgmml4RDCQ4nQb7erClxj%2fYBf7Wk2ECpsKh%2bh2%2fAUg0Fd%2fEwkG8HgqKcDQO3P%2fUw0MmBoKgHzuj0f4JT9rxFi%2bSb7nvvGPYpfTEckENO2bt076w%2bd%2f%2btWLI0ZUEcRbOITjbP89n1%2fEMwHv1hjTU%2fkPsTGbKFsRYVeGl0IUL20v8Qulb5kK0b5BLUZ2WeQ5Y1jZL8JC9coWkq4F52VCy31tiFERSuRE3ag2aJneS4MDWxoH2mxQo0PCFdHq42lj5ns2t6roK1B986epqSqH3RHFV9sX%2f6L6VrFOy%2bwmEMLWSfBZVxjs7tmxMuK4k2PieIlzSbo%2bx7FZJzguS1woq%2bSy6yvAPV7l%2f4xTydptCVOcbs6uoBa9Mhq4xltaH9CvQgVb8hZ2i55e51t%2bD4XznDMaBnBAAA)?to pre-populate the query to Locate the CorrelationID using the PUID:

<!-- end list -->

1.  Modify the?**Start**?and?**End**?datetime entries
2.  Modify the?**PUID**?using the customer's LiveID
3.  Copy the?last **RequestID**?where *IsInteractive* is equal to "1" and *ConditionalAccessAppIdentifier2* contains the AppID of the Cloud app being accessed by the user.
4.  Proceed to the "**Kusto Query of DiagnosticTracesIfx Using the RequestId**" section above.

<!-- end list -->

```
    let start = datetime(2018-03-29 20:17:00Z);
    let end = datetime(2018-03-29 20:22:00Z);
    find in (
    cluster("estsam2").database("ESTS").PerRequestTableIfx,
    cluster("estsbl2").database("ESTS").PerRequestTableIfx,
    cluster("estsby1").database("ESTS").PerRequestTableIfx,
    cluster("estsch1").database("ESTS").PerRequestTableIfx,
    cluster("estsdb3").database("ESTS").PerRequestTableIfx,
    cluster("estshkn").database("ESTS").PerRequestTableIfx,
    cluster("estssin").database("ESTS").PerRequestTableIfx,
    cluster("estsdm1").database("ESTS").PerRequestTableIfx,
    cluster("estssn1").database("ESTS").PerRequestTableIfx) where env_time >= start and env_time <= end and PUID == "1003############"
    | project env_time, CorrelationId, RequestId, Result, SpecialFlow, ApplicationId, IsInteractive, ErrorCode, MdmAppId, IsDeviceCompliantAndManaged, DeviceTrustType, MfaStatus, ClientIp, DeviceId, ApplicationDisplayName, ConditionalAccessAppIdentifier1, ConditionalAccessAppId1Decision, ConditionalAccessAppIdentifier2, ConditionalAccessAppId2Decision, MultiCAEvaluationLog, ClientInfo, Client //Remove for more detail
    | sort by env_time asc
```

## IcM Creation

### Conditional Access Policy (ESTS)

EvoSTS (ESTS) - This team handles issues involving the EvoSTS authentication service.? This is the token issuance portion of Azure Active Directory.Please make sure you have reviewed the support workflows on csssupportwiki.com and consult an Cloud Identity TA prior to submitting.

#### Support Engineer Instructions

Create IcM from ASC tool, by using Escalate Case button and searching for IcM template with Code [ID][AUTH][CA] - CA policy investigation and Id: F2N2ox

#### Target ICM Team (TA use)

  - **Owning Service**: ESTS
  - **Owning Team**: Conditional Access

# Training

The new options of '**All Guest users**' and Azure AD '**Directory Roles**' added to the '**Users and groups**' Conditional Access Policy blade is covered in the Conditional Access PowerPoint deck.

**Title:**?Azure AD Conditional Access

**Course ID**: S1210001

**Format:**?Self-paced eLearning

**Duration:**?140 minutes (2.3 hours)

**Audience:**?Cloud Identity Support Engineers (Authentication Vertical) and Intune Support Engineers (Suggested)

**Training Completion:**?ASAP as this feature has been released.

**Region**: All regions

**Course Location:**?[SuccessFactors](https://learn.microsoft.com/activity/S1210001/launch)

  
[Brown Bag CA for Legacy Protocols, Sign-in Logs, BaseLine Protection and Guest and AD Roles](https://learn.microsoft.com/activity/S2241624/launch#/)
