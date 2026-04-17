---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Conditional Access What If API"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FConditional%20Access%20What%20If%20API"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.whatif
- cw.CA
- SCIM Identity
- Conditional Access
- WhatIf Tool 
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   


[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Dev](/Tags/AAD%2DDev) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Conditional-Access](/Tags/Conditional%2DAccess)                           




[[_TOC_]]

# Compliance note

This wiki contains test and/or lab data only.

___

# Summary

The new Conditional Access What If API provides a programmatic way to interact with the Conditional Access (CA) [What If](https://entra.microsoft.com/#view/Microsoft_AAD_ConditionalAccess/WhatIfBlade) tool to determine which CA policies will apply to a specific identity, based on specified conditions

What If API introduces a new service action called evaluate under the Conditional Access category. This allows Security Readers, Global Readers, Conditional Access Administrators, Security Administrators and Global Administrators to issue `POST` calls against the `https://graph.microsoft.com/beta/identity/conditionalAccess/evaluate` endpoint.

The request body of the POST call is comprised of three sections:

- **Subject**  Who is signing in, whether it is a user, an external user, or a service principal. This supports values for each type of subject. For instance, a 'User' can be a member or guest, and is defined using the `signInIdentity` complex type with attributes like userId and `externalUserType`. Similarly, a 'Service Principal' is defined with attributes like `servicePrincipalId`.

| Subject | Description | Example values |
|-----|-----|-----|
| userSignIn | This defines a 'User' as the subject of the What-If operation. This can be a member or guest. |     "signInIdentity": { <br>        "@odata.type": "#microsoft.graph.userSignIn", <br>        "userId": "3af8c0b2-d428-4a8f-9355-407ef75d0811" <br>    } |
|  |  |   "signInIdentity": {<br>    "@odata.type": "#microsoft.graph.userSignIn",<br>    "externalTenantId": "f3abbf3a-####-####-####-############",<br>    "externalUserType": "b2bCollaborationGuest"<br>  } |
| servicePrincipalSignIn | This defines a ' Service Principal' as the subject of the What-If operation. | " signInIdentity ": {<br>        "@odata.type": "#microsoft.graph. servicePrincipalSignIn ",<br>        "servicePrincipalId": "bb141406-9604-4300-84e3-64cdd8ad10a3"<br>    } |

- **Context**  What is the user or service principal trying to do? This provides detailed descriptions and example values for each type of context scenario. For instance, the `applicationContext` complex type refers to the application being accessed. The application is indicated by specifying an application `Id` for `includeApplications`. The `userActionContext` refers to user actions such as `registerOrJoinDevices` and `RegisterSecurityInfo`. Additionally, the `authenticationContext` complex type refers to the authentication context specified using an `Id` of `c1 - c99`.

| Subject | Description | Example values |
|-----|-----|-----|
| applicationContext | This complex type protects the application scope by specifying an application Id for `"includeApplications"`. |       "signInContext": {<br>        "@odata.type": "#microsoft.graph.whatifapplicationContext", <br>        "includeApplications": [ <br>            "797f4846-ba00-4fd7-ba43-dac1f8f63013" <br>        ] |
| userActionContext | This complex type protects user actions by specifying one of these action types: `"registerOrJoinDevices",` and `"RegisterSecurityInfo"` | "signInContext": {<br>        "@odata.type": "#microsoft.graph. userActionContext ",<br>        "userAction": "registerSecurityInformation"<br>    } |
| authContext | This complex type protects the authentication context specified using an Id of "c1" - "c99" | "signInContext": {<br>        "@odata.type": "#microsoft.graph. authContext ",<br>        "authenticationContext": "c1"<br>    },  |

- **Conditions**  What are the sign-in parameters of the user or service principal. This provides detailed descriptions and example values for each type of condition. For instance, the `signInRiskLevel` complex type specifies the sign-in risk level for the test, with example values like `Low`, `Medium`, and `High`. Similarly, the `userRiskLevel` and `servicePrincipalRiskLevel` complex types specify the risk levels for users and service principals, respectively. Other conditions include `country`, `ipAddress`, `clientAppType`, `devicePlatform`, `deviceInfo`, `insiderRiskLevel`, `authenticationFlow`, and `signInDateTime`.

| Subject | Description | Example values |
|-----|-----|-----|
| signInRiskLevel | Sign-in risk level for the test. Optionally populated | Low, Medium, High |
| userRiskLevel | User risk level for the test. Optionally populated | Low, Medium, High |
| servicePrincipalRiskLevel | Service Principal risk level for the test. Optionally populated | Low, Medium, High |
| country | Country to be used for the test. Optionally populated | US, AF |
| ipAddress | IP address to be used for the test. Optionally populated | 192.168.12.46 |
| clientAppType | Client application type to be used for the test. Optionally populated | browser, mobileAppsAndDesktopClients, exchangeActiveSync, easSupported, other |
| devicePlatform | Device platform to be used for the test. Optionally populated | Android, iOS, windows, windowsPhone, macOS, linux |
| deviceInfo | Information about the device used for the Sign-In | "deviceInfo": {<br>    "deviceId": "bd304a31-8123-4087-bdb3-91f0ea52391d",<br>    "deviceOwnership": "Company",<br>"displayName": "Neils MacBook Pro",<br>"enrollmentProfileName": "Woodgrove Mac",<br>"isCompliant": false,<br>"manufacturer": "Apple",<br>"mdmAppId": "0000000a-0000-0000-c000-000000000000",<br>"model": "MacBook Pro",<br>"operatingSystem": "MacMDM",<br>"operatingSystemVersion": "11.3 (20E232)",<br>"physicalIds": [<br>    "[HWID]:h:6966522099501206",<br>    "[USER-HWID]:a38d3b3e-afcd-4e1e-a4dd-fa679495a459:6966522099501206",<br>    "[GID]:g:6755425214673291",<br>    "[USER-GID]:a38d3b3e-afcd-4e1e-a4dd-fa679495a459:6755425214673291"<br>],<br>"profileType": "RegisteredDevice",<br>"systemLabels": [<br>    "MDEManaged",<br>    "MDEJoined"<br>],<br>"trustType": "AzureAd" |
| insiderRiskLevel | Insider risk level for a user included in the policy scope | Low, Medium, High |
| authenticationFlow | Information about whether the sign-in uses device code flow or authentication transfer | "authenticationFlow": {<br>    "transferMethod": "deviceCodeFlow"<br>} |
| signInDateTime | Date and time of the sign-in event | "2024-02-05T22:16:18Z" |


The `POST` call returns a list of all policies. When all conditions are satisfied, those policies that would be enforced show a result of `"policyApplies": true`. Adding `"appliedPoliciesOnly": "true"` returns only those policies which are applied.

![GEtest](/.attachments/AAD-Authentication/1224560/GEtest.png)

___

# Portal Experience

The new WhatIf portal experience that uses the new APIs that can be enabled by customers under preview features. Today, customers can opt in to, or out of, the preview experience by clicking the **Preview features** button at the top of the WhatIf page where they can toggle the **Enhanced 'What if' evaluation** experience *On* or *Off*.

As part of public preview, the new WhatIf portal experience will become the default, and the old experience will remain available for customers until the API reaches general availability, which is expected in May 2025.

![PreviewOptIn](/.attachments/AAD-Authentication/1224560/PreviewOptIn.jpg)

Once the public preview is enabled, the new UX based on the new API is exposed. The new UX behaves differently from the beta API. In the old UX, only the user field is mandatory, while in the new UX, you must select the **Identity** type and **Target** type before proceeding. The UX responds with policies matching your parameters.

![NewUX](/.attachments/AAD-Authentication/1224560/NewUX.jpg)

For the API, all input parameters must match the policy parameters. If a parameter is not specified, the API cannot evaluate policies containing that parameter, leading to differences between API and UX responses.

___

# Limitations

- All conditions will support only a single value.  For example:  The supported values for `clientAppType` are: `browser`, `mobileAppsAndDesktopClients`, `exchangeActiveSync`, `easSupported`, and `other`. The UX has the same limitation of only supporting a single value.

- The `"ConditionalAccessWhatIfConditions"` section should not be empty. Unless the sign-in conditions are specified, the what if controller won't be able to return the response accurately. For example, if the policy is configured to have the user risk condition, the what-if request must contain that information.

___

# Query parameters

Support for `$filter` and `$select` will be added as possible across the various data sets. Pagination is not supported. A maximum of 195 Conditional Access policies can be created in a tenant and that is the maximum possible number of policies returned by the API.

___

# Errors

An error of 'not enough information' occurs when the request body does not have all the details required for the what if engine to do the policy evaluation. For example, if the policy has a specific country as the condition and no information about the country is included in the request body, that particular policy would return 'not enough information'.

| Scenario | Method | Code | Message |
|-----|-----|-----|-----|
| User doesn't have appropriate permission scope | POST | 403 | Your account does not have access to perform this evaluation. Please contact your global administrator to request access. |
| Tenant not licensed for this functionality | POST | 403 | Your tenant doesn't is not licensed for this functionality. Please refer to your license agreement to determine which credentials functionality is available at your license level. |
| Invalid user identifier | POST | 400 | The supplied userId does not exist in your tenant. Please correct it and try again. |
| Invalid evaluation parameters | POST | 400 | The supplied JSON for your what-if evaluation contains invalid evaluation parameters. Please correct it and try your query again. |

___

# Permissions

This API re-uses existing Graph permissions.

| Permissions | Type | Entities/APIs Covered |
|-----|-----|-----|
| Policy.Read.ConditionalAccess | Delegated | All |
| Policy.Read.ConditionalAccess | Application-only | All |

___

# Public Documents

- The existing *What If* portal functionality covered in the [Use the What If tool to troubleshoot Conditional Access policies](https://learn.microsoft.com/en-us/entra/identity/conditional-access/what-if-tool) public document will be updated at public preview.

- The [conditionalaccessWhatIf resource type](https://learn.microsoft.com/en-us/graph/api/resources/conditionalaccess-what-if?view=graph-rest-beta) API documentation will be live once public preview is announced.

___

# Complex Types

A complex type in an API is a way of defining a custom data structure that consists of one or more properties which can be used to represent rich information that cannot be easily expressed by a single primitive value, such as a string or a number.

## signInIdentity

A complex type that defines the subject/actor of the What-If operation. This type has been newly introduced for this API.

```json
<ComplexType Name="signInIdentity" Abstract="true">
</ComplexType>
```

___

## conditionalAccessContext

A complex type that defines the context in which the Conditional Access Policy is triggered. This type has been newly introduced for this API.

```json
<ComplexType Name="conditionalAccessContext" Abstract="true">
</ComplexType>
```

___

## userSubject

A complex type that defines the 'User' subject of the What-If operation. This type has been newly introduced for this API.

```json
<ComplexType Name="userSubject" BaseType="graph.signInIdentity">
   <Property Name="userId" Type="Edm.String" Nullable="false" />
   <Property Name="externalUserType" Type="microsoft.graph.conditionalAccessGuestOrExternalUserTypes" Nullable="false" />
</ComplexType>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `userId` | `String` | The userId of the user | false |
| `externalUserType` | The type of external user | false |


| EnumMember values | Description |
|-----|-----|
| `mB2bCollaborationGuest` | User authenticated externally with UserType guest and a representation in the local tenant. | false |
| `B2bCollaborationMember` | User authenticated externally with UserType member and a representation in the local tenant. | 
| `B2bDirectConnectUser` | User authenticated externally with Native Federation without any representation in the local tenant. |
| `InternalGuest` | User authenticated locally with UserType guest. |
| `ServiceProviderUser` | Cloud Solution Provider, third party consultant, or any future externally authenticated user without any representation in the local tenant. |
| `OtherExternalUser` | Other unknown types of external users, that are not tagged with any of the other types. |
| `None` | Type is None, not internal guest or external user. |

___

## servicePrincipalSubject

A complex type that defines the 'Service Principal' subject of the What-If operation. This type has been newly introduced for this API.

```json
<ComplexType Name="servicePrincipalSubject" BaseType="graph.signInIdentity">
   <Property Name="servicePrincipalId" Type="Edm.String" Nullable="false" />
</ComplexType>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `servicePrincipalId` | `String` | The unique GUID of the Service Principal | false |

___

## whatIfApplicationContext

A complex type that defines the application scope. This type has been derived from the context type that determines the CA policies that gets applied to the subject. This type has been newly introduced for this API.

```json
<ComplexType Name="whatIfApplicationContext" BaseType="graph.conditionalAccessContext">
   <Property Name="includeApplications" Type="Collection(Edm.String)" Nullable="false" />
</ComplexType>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `includeApplications` | Comma separated collection of `String` | Application IDs in scope of policy unless explicitly excluded |  |

___

## whatIfUserActionContext

A complex type that defines the user action scope. This type has been derived from the context type that determines the CA policies that gets applied to the subject. This type has been newly introduced for this API.

```json
<ComplexType Name="whatIfUserActionContext" BaseType="graph.conditionalAccessContext">
   <Property Name="userAction" Type="graph.userAction" Nullable="false" DefaultValue="registerSecurityInformation" />
</ComplexType>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `userAction` | `microsoft.graph.userAction` | User action to be tested | false |

___

## whatIfAuthenticationContext

A complex type that defines the authentication context scope. This type has been derived from the context type that determines the CA policies that gets applied to the subject. This type has been newly introduced for this API.

```json
<ComplexType Name="whatIfAuthenticationContext" BaseType="graph.conditionalAccessContext">
   <Property Name="authenticationContext" Type="Edm.String" Nullable="false" />
</ComplexType>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `authenticationContext` | `String` | Authentication Context in scope of the CA policy | false |

___

## whatIfAuthenticationContext

A complex type that defines the permission scope. This type has been derived from the context type that determines the CA policies that gets applied to the subject. This type has been newly introduced for this API.

```json
<ComplexType Name="whatIfPermissionScopeContext" BaseType="graph.conditionalAccessContext">
   <Property Name="permissionScopes" Type="Collection(Edm.String)" Nullable="false" />
</ComplexType>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `permissionScopes` | `Collection of String` | Permission scopes in scope of the CA policy | false |

___

## conditionalAccessWhatIfConditions

A complex type that defines the optional conditions that determines the CA policies that gets applied. This type has been newly introduced for this API.

```json
<ComplexType Name="conditionalAccessWhatIfConditions">
    <Property Name="signInRiskLevel" Type="microsoft.graph.riskLevel" Nullable="true" DefaultValue="none" />
    <Property Name="userRiskLevel" Type="microsoft.graph.riskLevel" Nullable="true" DefaultValue="none" />
    <Property Name="servicePrincipalRiskLevel" Type="microsoft.graph.riskLevel" Nullable="true" DefaultValue="none" />
    <Property Name="country" Type="Edm.String" Nullable="true" />
    <Property Name="ipAddress" Type="Edm.String" Nullable="true" />
    <Property Name="clientAppType" Type="graph.conditionalAccessClientApp" Nullable="false" DefaultValue="browser" />
    <Property Name="devicePlatform" Type="graph.conditionalAccessDevicePlatform" Nullable="false" />
    <Property Name="deviceInfo" Type="graph.deviceInfo" Nullable="true" />
    <Property Name="insiderRiskLevel" Type="Microsoft.graph.insiderRiskLevel" Nullable="true" DefaultValue="none" />
</ComplexType>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `signInRiskLevel` | `microsoft.graph.riskLevel` | Sign-in risk level for the test. Optionally populated | false |
| `userRiskLevel` | `microsoft.graph.riskLevel` | User risk level for the test. Optionally populated | false |
| `servicePrincipalRiskLevel` | `microsoft.graph.riskLevel` | Service Principal risk level for the test. Optionally populated | false |
| `country` | `String` | Country to be used for the test. Optionally populated | false |
| `ipAddress` | `String` | IP address to be used for the test. Optionally populated | false |
| `clientAppType` | `microsoft.graph.conditionalAccessClientApp` | Client application type to be used for the test. Optionally populated | false |
| `devicePlatform` | `microsoft.graph.conditionalAccessDevicePlatform` | Device platform to be used for the test. Optionally populated | false |
| `deviceInfo` | `microsoft.graph.deviceInfo` | Information about the device used for the sign-in | false |
| `insiderRiskLevel` | `microsoft.graph.insiderRiskLevel` | Insider risk level for a user included in the policy scope | false |

___

## deviceInfo

A complex type that describes the device details that the user can optionally include in the request so that what if evaluation can happen based on the device details.

```json
<ComplexType Name="deviceInfo" BaseType="graph.conditionalAccessWhatIfConditions">
	<Property Name="deviceId" Type="Edm.String" Nullable="true" />
	<Property Name="ownership" Type="Edm.String" Nullable="true" />
	<Property Name="displayName" Type="Edm.String" Nullable="true" />
	<Property Name="enrollmentProfileName" Type="Edm.String" Nullable="true" />
	<Property Name="isCompliant" Type="Edm.Boolean" Nullable="true" />
	<Property Name="mdmAppId" Type="Edm.String" Nullable="true" />
	<Property Name="operatingSystem" Type="Edm.String" Nullable="true" />
	<Property Name="operatingSystemVersion" Type="Edm.String" Nullable="true" />
	<Property Name="physicalIds" Type="Collection(Edm.String)" Nullable="true" />
	<Property Name="profileType" Type="Edm.String" Nullable="true" />
	<Property Name="systemLabels" Type="Collection(Edm.String)" Nullable="true" />
	<Property Name="trustType" Type="Edm.String" Nullable="true" />
	<Property Name="manufacturer" Type="Edm.String" Nullable="true" />
	<Property Name="model" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute1" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute2" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute3" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute4" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute5" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute6" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute7" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute8" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute9" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute10" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute11" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute12" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute13" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute14" Type="Edm.String" Nullable="true" />
  <Property Name="extenstionAttribute15" Type="Edm.String" Nullable="true" />
</ComplexType>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `deviceId` | `String` | Unique identifier set by Azure Device Registration Service at the time of registration | |
| `Ownership` | `String` | Ownership of the device. This property is set by Intune | |
| `displayName` | `String` | The display name for the device | |
| `enrollmentProfileName` | `String` | Enrollment profile applied to the device | |
| `isCompliant` | `String` | Indicates the device compliance status with Mobile Management Device (MDM) policies | |
| `mdmAppId` | `String` | Application identifier used to register device into MDM | |
| `operatingSystem` | `String` | The type of operating system on the device | |
| `operatingSystemVersion` | `String` | The version of the operating system on the device | |
| `physicalIds` | `String` | For internal use only | |
| `profileType` | `String` | The profile type of the device | |
| `systemLabels` | `String` | List of labels applied to the device by the system. | |
| `trustType` | `String` | Type of trust for the joined device | |
| `manufacturer` | `String` | Manufacturer of the device | |
| `model` | `String` | Model of the device | |
| `extenstionAttribute1` | `String` | Extension attribute | |
| `extenstionAttribute2` | `String` | Extension attribute | |
| `extenstionAttribute3` | `String` | Extension attribute | |
| `extenstionAttribute4` | `String` | Extension attribute | |
| `extenstionAttribute5` | `String` | Extension attribute | |
| `extenstionAttribute6` | `String` | Extension attribute | |
| `extenstionAttribute7` | `String` | Extension attribute | |
| `extenstionAttribute8` | `String` | Extension attribute | |
| `extenstionAttribute9` | `String` | Extension attribute | |
| `extenstionAttribute10` | `String` | Extension attribute | |
| `extenstionAttribute11` | `String` | Extension attribute | |
| `extenstionAttribute12` | `String` | Extension attribute | |
| `extenstionAttribute13` | `String` | Extension attribute | |
| `extenstionAttribute14` | `String` | Extension attribute | |
| `extenstionAttribute15` | `String` | Extension attribute | |

___

## conditionalAccessGrantControls

Complex type of grant controls that must be fulfilled to pass the policy. This is an existing type.

```json
<ComplexType Name="conditionalAccessGrantControls">
	<Property Name="builtInControls" Type="Collection(graph.conditionalAccessGrantControl)" Nullable="false" />
	<Property Name="customAuthenticationFactors" Type="Collection(Edm.String)" Nullable="false" />
	<Property Name="operator" Type="Edm.String" />
	<Property Name="termsOfUse" Type="Collection(Edm.String)" Nullable="false" />
</ComplexType>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `operator` | `String` | Acceptable values: `AND` and `OR`, defines relationship of controls | true |
| `builtInControls` | Collection of `microsoft.graph.conditionalAccessGrantControl` | List of enum values of built-in controls specified by the policy | true |
| `customAuthenticationFactors` | Collection of `String` | List of string IDs of custom authentication factors specified by the policy | true |
| `termsOfUse` | Collection of `String` | List of string IDs of terms of use controls specified by the policy | true |
| `authenticationStrength` | `microsoft.graph.authenticationStrengthsPolicy` | Navigation property for Authentication Strength policy | true |

___

# Entity Types

An entity type is a way of describing the structure and behavior of a data type that can be accessed or manipulated by the API.

## conditionalAccessPolicy

Entity that represents a conditional access policy. This is an existing type.

```json
<EntityType Name="conditionalAccessPolicy" BaseType="microsoft.graph.entity">
    <Property Name="id" Type="Edm.String" Nullable="false" />
    <Property Name="createdDateTime" Type="Edm.DateTimeOffset" Nullable="false" />
    <Property Name="modifiedDateTime" Type="Edm.DateTimeOffset" Nullable="false" />
    <Property Name="displayName" Type="Edm.String" Nullable="false" />
    <Property Name="description" Type="Edm.String" Nullable="true" />
    <Property Name="templateId" Type="Edm.String" Nullable="true" ags:isHidden="true" />
    <Property Name="state" Type="microsoft.graph.conditionalAccessPolicyState" Nullable="false" />
    <Property Name="conditions" Type="microsoft.graph.conditionalAccessConditionSet" Nullable="false" />
    <Property Name="grantControls" Type="microsoft.graph.conditionalAccessGrantControls" Nullable="true" />
    <Property Name="sessionControls" Type="microsoft.graph.conditionalAccessSessionControls" Nullable="true" />
 </EntityType>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `id` | `String` | id of a policy	
| `createdDateTime` | `DateTimeOffset` | creation datetime of the policy | true |
| `modifiedDateTime` | `DateTimeOffset` | last modification datetime of the policy | true |
| `displayName` | `String` | human-readable name of the policy. | |
| `description` | `String` | A description for this policy. | |
| `templateId` | `String` | immutable id of a template, this value will be represented as GUID. This property will be hidden. | |
| `state` | `microsoft.graph.conditionalAccessPolicyState` | state of the policy, including Enabled, Disabled, and LogOnly. | |
| `conditions` | `microsoft.graph.conditionalAccessConditionSet` | complex type of conditions that govern when the policy applies. | |
| `grantControls` | `microsoft.graph.conditionalAccessGrantControls` | complex type of grant controls that must be fulfilled to pass the policy. | |
| `sessionControls` | `microsoft.graph.conditionalAccessSessionControls` | complex type of session controls that will be enforced after sign-in. | |

___

## conditionalAccessSessionControls

Complex type of session controls that will be enforced after sign-in. This is an existing type.

```json
<ComplexType Name="conditionalAccessSessionControls">
    <Property Name="applicationEnforcedRestrictions" Type="microsoft.graph.applicationEnforcedRestrictionsSessionControl" Nullable="true" />
    <Property Name="cloudAppSecurity" Type="microsoft.graph.cloudAppSecuritySessionControl" Nullable="true" />
    <Property Name="signInFrequency" Type="microsoft.graph.signInFrequencySessionControl" Nullable="true" />
    <Property Name="persistentBrowser" Type="microsoft.graph.persistentBrowserSessionControl" Nullable="true" />
    <Property Name="continuousAccessEvaluation" Type="self.continuousAccessEvaluationSessionControl" Nullable="true" />
    <Property Name="secureSignInSession" Type="microsoft.graph.secureSignInSessionControl" Nullable="true" />
    <Property Name="disableResilienceDefaults" Type="Edm.Boolean" />
    <Property Name="networkAccessSecurity" Type="microsoft.graph.networkAccessSecuritySessionControl" Nullable="true" ags:isHidden="true" />
</Property>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `applicationEnforcedRestrictions` | `microsoft.graph.applicationEnforcedRestrictionsSessionControl` | Session control to enforce application restrictions. | true |
| `cloudAppSecurity` | `microsoft.graph.cloudAppSecuritySessionControl` | Session control to apply cloud app security. | true |
| `signInFrequency` | `microsoft.graph.signInFrequencySessionControl` | Session control to enforce signin frequency. | true |
| `persistentBrowser` | `microsoft.graph.persistentBrowserSessionControl` | Session control to define whether to persist cookies or not. | true |
| `continuousAccessEvaluation` | `microsoft.graph.continuousAccessEvaluationSessionControl` | Session control to define the Continuous Access Evaluation behavior. | true | `secureSignInSession` | `microsoft.graph.secureSignInSessionControl` | Session control to enforce secure signin sessions. | true |
| `disableResilienceDefaults` | `Edm.Boolean` | Session control to disable the behavior of the resilience mechanisms we provide in AAD. | true |
| `networkAccessSecurity` | `microsoft.graph.networkAccessSecuritySessionControl` | Session control to enforce network access security. | true |

___

## continuousAccessEvaluationSessionControl

Session control to define the Continuous Access Evaluation behavior. This is an existing type.

```json
<ComplexType Name="continuousAccessEvaluationSessionControl">
	<Property Name="mode" Type="graph.continuousAccessEvaluationMode" />
</ComplexType>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `mode` | `microsoft.graph.continuousAccessEvaluationMode` | Type of Continuous Access Evaluation mode (e.g. strictEnforcement, disabled). | |

___

## persistentBrowserSessionControl

Session control to define whether to persist cookies or not. This is an existing type which uses the [Abstract class of conditionalAccessSessionControl](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=1224560&anchor=abstract-class).

```json
<ComplexType Name="persistentBrowserSessionControl" BaseType="graph.conditionalAccessSessionControl">
	<Property Name="mode" Type="graph.persistentBrowserSessionMode" />
</ComplexType>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `mode` | `microsoft.graph.persistentBrowserSessionMode` | Type of persistent browser session mode (e.g. always, never). | |

___

## signInFrequencySessionControl

Session control used to enforce signin frequency. This is an existing type which uses the [Abstract class of conditionalAccessSessionControl](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=1224560&anchor=abstract-class).

```json
<ComplexType Name="signInFrequencySessionControl" BaseType="graph.conditionalAccessSessionControl">
	<Property Name="authenticationType" Type="graph.signInFrequencyAuthenticationType" />
	<Property Name="frequencyInterval" Type="graph.signInFrequencyInterval" />
	<Property Name="type" Type="graph.signinFrequencyType" />
	<Property Name="value" Type="Edm.Int32" />
</ComplexType>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `Value` | `Edm.Int32` | Numeric value corresponding to the given type (e.g. 8 hours, 1 day), or null if frequencyInterval is everyTime. |  |
| `type` | `microsoft.graph.signinFrequencyType` | Type of the numeric value for this control, or null if frequencyInterval is everyTime. |  |
| `authenticationType` | `microsoft.graph.signInFrequencyAuthenticationType` | The type of authentication to use. |  |
| `frequencyInterval` | `microsoft.graph.signInFrequencyInterval` | The frequency interval to use (e.g. every time user signs in or a time based interval). |  |

___

## conditionalAccessRoot

```json
<EntityType Name="conditionalAccessRoot" BaseType="graph.entity">
	<NavigationProperty Name="authenticationContextClassReferences" Type="Collection(graph.authenticationContextClassReference)" ContainsTarget="true" />
	<NavigationProperty Name="namedLocations" Type="Collection(graph.namedLocation)" ContainsTarget="true" />
	<NavigationProperty Name="policies" Type="Collection(graph.conditionalAccessPolicy)" ContainsTarget="true" />
</EntityType>
```

___

## conditionalAccessFilter

```json
<ComplexType Name="conditionalAccessFilter">
    <Property Name="mode" Type="self.filterMode" Nullable="false" />
    <Property Name="rule" Type="Edm.String" Nullable="false" />
</ComplexType>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `mode` | `microsoft.graph.filterMode` | Whether this filter is in include or exclude mode. Must be populated. |  |
| `rule` | `Edm.String` | Dynamic-group-syntax rule to perform the filtering. Must be populated. |  |

___

# Abstract class

A class that can not be initiated by itself, it needs to be subclassed by another class to use its properties.

## conditionalAccessSessionControl

Complex type of session controls that will be enforced after sign-in. This is an existing class.

```json
<ComplexType Name="conditionalAccessSessionControl" Abstract="true">
	<Property Name="isEnabled" Type="Edm.Boolean" />
</ComplexType>

```

___

# API Actions

The `https://graph.microsoft.com/beta/identity/conditionalAccess/evaluate` endpoint only supports the `POST` action.

___

# API Endpoint

## evaluate

The ConditionalAccess API has been extended to include the `execution` endpoint as seen in the URL of `https://graph.microsoft.com/beta/identity/conditionalAccess/evaluate`. The endpoint name describes the purpose of the WhatIf API.

```json
<Action Name="evaluate" IsBound="true">
  <Parameter Name="bindingParameter" Type="graph.conditionalAccessRoot" />
  <Parameter Name="signInIdentity" Type="graph.signInIdentity" />
  <Parameter Name="conditionalAccessContext" Type="graph.conditionalAccessContext" />
  <Parameter Name="conditionalAccessWhatIfConditions" Type="graph.conditionalAccessWhatIfConditions" />
  <Paramerer Name="appliedPoliciesOnly" Type='Edm.Boolean' />
  <ReturnType Type="Collection(graph.conditionalAccessWhatIfPolicy)" />
</Action>
```

| Property | Type | Description | Read-Only |
|-----|-----|-----|-----|
| `bindingParameter` | `graph.conditionalAccessRoot` | binding parameter | false |
| `signInIdentity` | `graph.signInIdentity` | complex type that defines the subject of the What-If operation | false |
| `conditionalAccessContext` | `graph.conditionalAccessContext` | complex type that defines the context in which the Conditional Access Policy is triggered | false |
| `conditionalAccessWhatIfConditions` | `graph.conditionalAccessWhatIfConditions` | complex type that defines the conditions of the What-If operation | false |
| `appliedPoliciesOnly` | `Boolean`| indicates whether the response should contain all CA policies or only the CA policies that applies to the sign-in scenario | false |

___

# Enums

## userAction

List of enum values of user actions supported by the what if tool. This is a new enum.

```json
<EnumType Name="userAction">
	<Member Name="registerSecurityInformation" Value="0" />
	<Member Name="registerOrJoinDevices" Value="1" />
  <Member Name="unknownFutureValue" Value="2" />
</EnumType>
```

| Property | Description |
|-----|-----|
| `registerSecurityInformation` | Register security information |
| `registerOrJoinDevices` | Register or Join Devices |
| `unknownFutureValue` | Evolvable enum |

___

## conditionalAccessWhatIfReasons

List of enum values of reasons for policy applicability or inapplicability. This is a new enum.

```json
<EnumType Name="conditionalAccessWhatIfReasons">
  <Member Name="notSet" Value="0" />
  <Member Name="notEnoughInformation" Value="1" />
  <Member Name="invalidCondition" Value="2" />
  <Member Name="users" Value="3" />
  <Member Name="workloadIdentities" Value="4" />
  <Member Name="application" Value="5" />
  <Member Name="userActions" Value="6" />
  <Member Name="authenticationContext" Value="7" />
  <Member Name="devicePlatform" Value="8" />
  <Member Name="devices" Value="9" />
  <Member Name="clientApps" Value="10" />
  <Member Name="location" Value="11" />
  <Member Name="signInRisk" Value="12" />
  <Member Name="emptyPolicy" Value="13" />
  <Member Name="invalidPolicy" Value="14" />
  <Member Name="policyNotEnabled" Value="15" />
  <Member Name="userRisk" Value="16" />
  <Member Name="time" Value="17" />
  <Member Name="insiderRisk" Value="18" />
  <Member Name="unknownFutureValue" Value="19" />
</EnumType>
```

| Property | Description |
|-----|-----|
| `notSet` | Not Set |
| `notEnoughInformation` | Not Enough Information |
| `invalidCondition` | Invalid Condition |
| `users` | Users and Groups |
| `workloadIdenties` | Workload Identities |
| `application` | Cloud Apps |
| `userActions` | User Actions |
| `authenticationContext` | Authentication Context |
| `devicePlatform` | Device Platform |
| `devices` | Devices |
| `clientApps` | Client Apps |
| `location` | Location |
| `signInRisk` | SignIn Risk |
| `emptyPolicy` | Empty Policy |
| `invalidPolicy` | Invalid Policy |
| `policyNotEnabled` | Policy Not Enabled |
| `userRisk` | User Risk |
| `time` | Time |
| `insiderRisk` | User's insider risk |
| `unknownFutureValue` | Evolvable enum |

___

## conditionalAccessGrantControl

List of enum values of built-in controls specified by the policy. This is an existing enum.

```json
<EnumType Name="conditionalAccessGrantControl">
	<Member Name="block" Value="0" />
	<Member Name="mfa" Value="1" />
	<Member Name="compliantDevice" Value="2" />
	<Member Name="domainJoinedDevice" Value="3" />
	<Member Name="approvedApplication" Value="4" />
	<Member Name="compliantApplication" Value="5" />
	<Member Name="passwordChange" Value="6" />
	<Member Name="unknownFutureValue" Value="7" />
</EnumType>
```

| Property | Description |
|-----|-----|
| `block` | Block sign-in |
| `mfa` | Require Azure MFA |
| `compliantDevice` | Require Intune-compliant device |
| `domainJoinedDevice` | Require AADJ domain-joined device |
| `approvedApplication` | Require approved application |
| `compliantApplication` | Require Intune-compliant application |
| `federatedMfa` | Require MFA via federation |
| `federatedCertAuth` | Required certificate authentication via federation |
| `passwordChange` | Require password change |
| `unknownFutureValue` | Evolvable enum sentinal value |

___

## cloudAppSecuritySessionControlType

Type of check to be performed by the cloud app security service. This is an existing enum

```json
<EnumType Name="cloudAppSecuritySessionControlType">
	<Member Name="mcasConfigured" Value="0" />
	<Member Name="monitorOnly" Value="1" />
	<Member Name="blockDownloads" Value="2" />
	<Member Name="unknownFutureValue" Value="3" />
</EnumType>
```

___

## continuousAccessEvaluationMode

Type of Continuous Access Evaluation mode (e.g. strictEnforcement, disabled). This is an existing enum

```json
<EnumType Name="continuousAccessEvaluationMode">
	<Member Name="strictEnforcement" Value="0" />
	<Member Name="disabled" Value="1" />
	<Member Name="unknownFutureValue" Value="2" />
</EnumType>
```

| Property | Description |
|-----|-----|
| `strictEnforcement` | Continuous Access Evaluation strict enforcement is enabled. Authentication from clients that are not CAE enlightened will be blocked. IP location policy will be enforced on IP seen by Resource provider as well. |
| `disabled` | Continuous Access Evaluation is disabled. Disablement can only be applied to all applications, with no other conditions. |
| `unknownFutureValue` | Evolvable enum sentinal value |
| `strictLocation` | Continuous Access Evaluation strict location is enabled. IP location policy will be strictly enforced on IP seen by Resource provider as well. |

___

## persistentBrowserSessionMode

Type of persistent browser session mode (e.g. always, never). This is an existing enum

```json
<EnumType Name="persistentBrowserSessionMode">
	<Member Name="always" Value="0" />
	<Member Name="never" Value="1" />
</EnumType>
```

| Property | Description |
|-----|-----|
| `always` | Users remain signed in after closing and reopening browser window. Requires policy assignment to All Cloud Apps |
| `never` | Users are signed out after closing and reopening browser window. Requires policy assignment to All Cloud Apps |
| `unknownFutureValue` | Evolvable enum sentinal value |

___

## signInFrequencyAuthenticationType

The type of authentication to use. This is an existing enum

```json
<EnumType Name="signInFrequencyAuthenticationType">
	<Member Name="primaryAndSecondaryAuthentication" Value="0" />
	<Member Name="secondaryAuthentication" Value="1" />
	<Member Name="unknownFutureValue" Value="2" />
</EnumType>
```

| Value | Description |
|-----|-----|
| `primaryAndSecondaryAuthentication` | Requires user to re-authenticate with both primary and secondary authentication methods. |
| `secondaryAuthentication` | Allows user to re-authenticate with secondary authentication method. |

___

## signInFrequencyInterval

The frequency interval to use (e.g. every time user signs in or a time based interval). This is an existing enum

```json
<EnumType Name="signInFrequencyInterval">
	<Member Name="timeBased" Value="0" />
	<Member Name="everyTime" Value="1" />
	<Member Name="unknownFutureValue" Value="2" />
</EnumType>
```

| Value | Description |
|-----|-----|
| `timeBased` | Requires user to sign in again after specified number of days or hours. |
| `everyTime` | Requires user to sign in again every time they access the resource. |

___

## signinFrequencyType

The type of sign in frequency interval to enforce. This is an existing enum

```json
<EnumType Name="signinFrequencyType">
	<Member Name="days" Value="0" />
	<Member Name="hours" Value="1" />
</EnumType>
```

| Value | Description |
|-----|-----|
| `days` | Requires user to sign in again after the specified number of days. |
| `hours` | Requires user to sign in again after the specified number of hours. |

___

## conditionalAccessPolicyState

```json
<EnumType Name="conditionalAccessPolicyState">
	<Member Name="enabled" Value="0" />
	<Member Name="disabled" Value="1" />
	<Member Name="enabledForReportingButNotEnforced" Value="2" />
</EnumType>
```

| Value | Description |
|-----|-----|
| `enabled` | Policy is enabled and enforced |
| `disabled` | Policy is not enabled or enforced |
| `enabledForReportingButNotEnforced` | Policy is evaluated and logged but controls are not enforced |
| `unknownFutureValue` | Evolvable enum sentinal value |

___

## riskLevel

Reusable property that reflects 'how risky' is a risky user or sign-in. For e.g. high, medium or low.

```json
<EnumType Name="riskLevel">
    <Member Name="none" Value="0" />
    <Member Name="low" Value="1" />
    <Member Name="medium" Value="2" />
    <Member Name="high" Value="3" />
    <Member Name="hidden" Value="4" />
    <Member Name="unknownFutureValue" Value="5" />
  </EnumType>
```

| Property |Value | Description |
|-----|-----|-----|
| `none` | `0` | Risky user: The given user is no longer at risk. Sign-in: The sign-in is not at risk. Risk event: The risk event is no longer at risk. |
| `low` | `1` | Risky user: There is a low probability that the identity of the given user is compromised. Sign-in: There is a low probability that this sign-in was compromised. Risk event: The event has a low risk level. |
| `medium` | `2` | Risky user: There is a medium probability that the identity of the given user is compromised. Sign-in: There is a medium probability that this sign-in was compromised.Risk event: The event has a medium risk level. |
| `high` | `3` | Risky user: There is a high probability that the identity of the given user is compromised. Sign-in: There is a high probability that this sign-in was compromised. Risk event: The event has a high risk level. |
| `hidden` | `4` | Risky user: The at risk user is not enabled for Identity Protection. Sign-in: The at risk sign-in was not enabled for Identity Protection.
| `unknownFutureValue` | `5` | Unknown future value. |

___

## conditionalAccessClientApp

```json
<EnumType Name="conditionalAccessClientApp">
    <Member Name="all" Value="0" />
    <Member Name="browser" Value="1" />
    <Member Name="mobileAppsAndDesktopClients" Value="2" />
    <Member Name="exchangeActiveSync" Value="3" />
    <Member Name="easSupported" Value="4" />
    <Member Name="other" Value="5" />
    <Member Name="unknownFutureValue" Value="6" />
</EnumType>
```

| Value | Description |
|-----|-----|
| `all` | All client app types including modern and legacy auth client types |
| `browser` | Browser applications |
| `mobileAppsAndDesktopClients` | Modern authentication applications |
| `exchangeActiveSync` | All EAS applications including supported and unsupported platforms |
| `easSupported` | EAS applications on supported platforms |
| `other` | Other legacy protocol applications |
| `unknownFutureValue` | Evolvable enum sentinal value |

___

## conditionalAccessPlatform

```json
<EnumType Name="conditionalAccessDevicePlatform">
    <Member Name="android" Value="0" />
    <Member Name="iOS" Value="1" />
    <Member Name="windows" Value="2" />
    <Member Name="windowsPhone" Value="3" />
    <Member Name="macOS" Value="4" />
    <Member Name="all" Value="5" />
    <Member Name="unknownFutureValue" Value="6" />
    <Member Name="linux" Value="7" />
</EnumType>
```

| Property | Description |
|-----|-----|
| `android` | Android |
| `ios` | iOS |
| `windows` | Windows |
| `windowsPhone` | Windows Phone |
| `macOs` | MacOS |
| `all` | All platforms |
| `linux` | Linux |
| `unknownFutureValue` | Evolvable enum sentinal value |

___

## filterMode

```json
<EnumType Name="filterMode">
    <Member Name="include" Value="0" />
    <Member Name="exclude" Value="1" />
</EnumType>
```

___

## insiderRiskLevel

Enum signifying the Insider Risk Level of the given user to be used for Conditional access policy evaluation.

```json
<EnumType Name="insiderRiskLevel">
    <Member Name="none" Value="0" />
    <Member Name="minor" Value="1" />
    <Member Name="moderate" Value="2" />
    <Member Name="elevated" Value="3" />
    <Member Name="unknownFutureValue" Value="4" />
</EnumType>
```

| Property | Description |
|-----|-----|
| `none` | Signifies no for the given user. |
| `minor` | The lowest risk level, signifying minor insider risk for the given user. |
| `moderate` | The medium risk level, signifying moderate insider risk for the given user. |
| `elevated` | The highest risk level, signifying elevated risk for the given user. |
| `unknownFutureValue` | Unknown future value for insider risk. |

___

## conditionalAccessGuestOrExternalUserTypes

```json
<EnumType Name="conditionalAccessGuestOrExternalUserTypes" IsFlags="true">
  <Member Name="none" Value="0" />
  <Member Name="internalGuest" Value="1" />
  <Member Name="b2bCollaborationGuest" Value="2" />
  <Member Name="b2bCollaborationMember" Value="4" />
  <Member Name="b2bDirectConnectUser" Value="8" />
  <Member Name="otherExternalUser" value="16" />
  <Member Name="serviceProvider" Value="32" />
  <Member Name="unknownFutureValue" Value="64" />
</EnumType>
```

| Property | Description |
|-----|-----|
| `none` | Guests or external users are not specified. |
| `internalGuest` | Users authenticated internally and with UserType guest. |
| `b2bCollaborationGuest` | Users authenticated externally and with UserType guest. |
| `b2bCollaborationMember` | Users authenticated externally and with UserType member. |
| `b2bDirectConnectUser` | Users authenticated externally without any representation in the local tenant |
| `serviceProvider` | Cloud Solution Providers, third party consultants, and other service provider users authenticated externally without any representation in the local tenant. |
| `otherExternalUser` | Other types of external users apart from b2bCollaborationGuest, b2bCollaborationMember, b2bDirectConnectUser, or serviceProvider. |
| `unknownFutureValue` | Unknown future value. |

___

# Usage Examples

The `"ConditionalAccessWhatIfConditions"` section should not be empty. Unless the sign-in conditions are specified, the what if controller won't be able to return the response accurately. For example, if the policy is configured to have the user risk condition, the what-if request must contain that information.

## 1. Identify CA policies that apply to a User

Admin wants to identify all the CA policies that applies to chenlin@contoso.com on any cloud app.

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/evaluate`

**Request Body**:

```json
{
    "signInIdentity": {
        "@odata.type": "#microsoft.graph.userSubject",
        "userId": "3af8c0b2-####-####-####-############"
    },
    "conditionalAccessContext": {
        "@odata.type": "#microsoft.graph.whatifapplicationContext",
        "includeApplications": [
            "All"
        ]
    },
    "conditionalAccessWhatIfConditions": {
        "signInRiskLevel": "High",
        "userRiskLevel": "Low",
        "servicePrincipalRiskLevel": "Medium",
        "clientAppType": "browser",
        "devicePlatform": "iOS",
        "ipAddress": "249.###.##.###"
    }
}
```

___

## 2. Identify CA policies that apply to a Service Principal

Admin wants to identify all the CA policies that applies to the Service Principal 'contosoDevOps' on any cloud app.

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/evaluate`

**Request Body**:

```json
{
    "signInIdentity": {
        "@odata.type": "#microsoft.graph.servicePrincipalSubject",
        "servicePrincipalId": "22010fc4-####-####-####-############"
    },
    "conditionalAccessContext": {
        "@odata.type": "#microsoft.graph.whatifapplicationContext",
        "includeApplications": [
            "All"
        ]
    },
    "conditionalAccessWhatIfConditions": {
        "signInRiskLevel": "High",
        "userRiskLevel": "Low",
        "servicePrincipalRiskLevel": "Medium",
        "clientAppType": "browser",
        "devicePlatform": "iOS",
        "ipAddress": "249.###.##.###"
    }
}
```

___

## 3. Identify CA policies that apply to a user with a specific risk level logging in for a specific device platform

Admin wants to identify all the CA policies that applies to the user 'chenlin@contoso.com' on any cloud app. Admin knows that Chenlin will be logging in from an Android device and has a risk level of 'Medium'

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/evaluate`

**Request Body**:

```json
{
    "signInIdentity": {
        "@odata.type": "#microsoft.graph.userSubject",
        "userId": "c635856c-####-####-####-############"
    },
    "conditionalAccessContext": {
        "@odata.type": "#microsoft.graph.whatifapplicationContext",
        "includeApplications": [
            "All"
        ]
    },
    "conditionalAccessWhatIfConditions": {
        "userRiskLevel": "medium",
        "devicePlatform": "android"
    }
}
```

___

## 4. Identify CA policies that apply to a user performing a restricted action

Admin wants to identify all CA policies that applies to the user 'chenlin@contoso.com' when Chenlin attempts to register security info from an android device.

Supported userAction options:

- `registerSecurityInformation`
-  `registerOrJoinDevices`

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/evaluate`

**Request Body**:

```json
{
    "signInIdentity": {
        "@odata.type": "#microsoft.graph.userSubject",
        "userId": "c635856c-####-####-####-############"
    },
    "conditionalAccessContext": {
        "@odata.type": "#microsoft.graph.whatIfUserActionContext",
        "userAction": "registerOrJoinDevices"
    },
    "conditionalAccessWhatIfConditions": {
        "devicePlatform": "android"
    }
}
```

___

## 5. Identify CA policies that apply to a user while accessing a resource protected by an authentication context

Admins wants to identify all CA policies that applies to the user 'chenlin@contoso.com' while Chenlin attempts to perform an operation that is behind an authentication context called 'Secured' (with ID `"c1"`).

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/evaluate`

**Request Body**:

```json
{
    "signInIdentity": {
        "@odata.type": "#microsoft.graph.userSubject",
        "userId": "c635856c-####-####-####-############"
    },
    "conditionalAccessContext": {
        "@odata.type": "#microsoft.graph.whatIfAuthenticationContext",
        "authenticationContext": "c1"
    },
    "conditionalAccessWhatIfConditions": {
        "devicePlatform": "android"
    }
}
```

___

## 6. Identify CA policies that apply to a user while accessing a specific application

Admins wants to identify all CA policies that applies to the user 'chenlin@contoso.com' while Chenlin attempts to access the Microsoft Defender app. Admin knows Chenlin's risk profile and also has details about his specific device and access location.

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/evaluate`

**Request Body**:

```json
{
    "signInIdentity": {
        "@odata.type": "#microsoft.graph.userSubject",
        "userId": "3af8c0b2-####-####-####-############"
    },
    "conditionalAccessContext": {
        "@odata.type": "#microsoft.graph.whatifapplicationContext",
        "includeApplications": [
            "22010fc4-####-####-####-############"
        ]
    },
    "conditionalAccessWhatIfConditions": {
        "signInRiskLevel": "high",
        "userRiskLevel": "medium",
        "country": "Azerbaijan",
        "clientAppType": "mobileAppsAndDesktopClients",
        "devicePlatform": "iOS"
    }
}
```

___

## 7. Identify CA policies that apply to a specific external user category while accessing a specific application

Admins wants to identify all CA policies that applies to the 'B2B Collaboration Guest users' while any user belonging to that category attempts to access the Microsoft Defender app.

- Just enter the objectId of the external user account from the tenant where the policy exists.

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/evaluate`

**Request Body**:

```json
{
    "signInIdentity": {
        "@odata.type": "#microsoft.graph.userSubject",
        "userId": "4aee4e36-####-####-####-############"
    },
    "conditionalAccessContext": {
        "@odata.type": "#microsoft.graph.whatifapplicationContext",
        "includeApplications": [
            "All"
        ]
    },
    "conditionalAccessWhatIfConditions": {
        "signInRiskLevel": "High",
        "userRiskLevel": "Low",
        "servicePrincipalRiskLevel": "Medium",
        "clientAppType": "browser",
        "devicePlatform": "iOS",
        "ipAddress": "249.###.##.###"
    }
}
```

___

## 8. Ensure CA policies with exclusions based on permission scopes are not enforced for select users

**NOTE**: `"permissionScopes"` are not functional yet.

Contoso has always required their employees to be connected to their corporate network before accessing cloud applications. They now want to allow access to some apps, such as AADClaimsXray, from anywhere when an employee has a compliant device. Sandy, who is an admin at Contoso, configures the policy as follows:

- All users

- All cloud apps, Except cloud app: AADClaimsXray

- All locations, Except Corp net
- Block

However, AADClaimsXray has a delegated scope `"user.readwrite.all"` for AzureAD. When a user signs in from outside of the corpnet, they will be blocked. With permission scopes based CA policy, Sandy can modify the policy to exclude `"user.readwrite.all"` permission scope so that users can use `"user.readwrite.all"` without satisfying corpnet location restriction. Sandy configures the policy as follows:

- All users
- All cloud apps, Except cloud app: AADClaimsXray
- permissionScope: MSGraph / user.readwrite.all
- All locations, Except Corp net
- Block

When the admin simulates the sign-in of Sandy accessing AADClaimsXray from outside of corpnet, the CA policy shows up as 'does not apply' as she expected.

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/evaluate`

**Request Body**:

```json
{
    "signInIdentity": {
        "@odata.type": "#microsoft.graph.userSubject",
        "userId": "4aee4e36-####-####-####-############"
    },
    "conditionalAccessContext": {
        "@odata.type": "#microsoft.graph.whatifapplicationContext",
        "permissionScopes": [
            "22010fc4-371f-405f-92ad-d0c80cfaed22"
        ]
    },
    "conditionalAccessWhatIfConditions": {
        "signInRiskLevel": "high",
        "userRiskLevel": "medium",
        "country": "Azerbaijan",
        "clientAppType": "mobileAppsAndDesktopClients",
        "devicePlatform": "iOS"
    }
}
```

___

## 9. Only see applicable CA policies by default

Customers using the What If evaluation tool are primarily interested in knowing what CA policies apply to the given sign-in scenario. Feedback indicates that customers would like to see only the applicable CA policies by default. However, they do wish to retain the option to view all CA policies if they choose to.

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/evaluate`

**Request Body**:

___

# Troubleshooting

## Azure Support Center (ASC)

There is a work item to get WhatIf incorporated into ASC. However, this API only supports `POST` actions which might not be possible. 

___

# ICM Path

Support engineers can submit ICMs by setting the Support Topic to anything below `Azure/Microsoft Entra Sign-in and Multifactor Authentication/Conditional Access`, then click **Escalate case** in ASC.

Technical Admins can change the ICM Path to escalate to the Conditional Access engineering group. 

**Owning service**: ESTS/Conditional Access

**Owning team**: Conditional Access

___

# Training

**Title**: Deep Dive 04602 - Conditional Access What-If API

**Course ID**: TBD

**Format**: Self-paced eLearning

**Duration**: 32 minutes

**Audience**: Cloud Identity Support Team **Identity Security and Protection**

**Tool Availability**: 

**Training Completion**: 

**Region**: All regions

**Course Location**: [QA](https://aka.ms/AApy55x)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.
