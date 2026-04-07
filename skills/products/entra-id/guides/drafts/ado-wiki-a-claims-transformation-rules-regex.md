---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Claims_and_Token_Customization/How to/Azure AD Claims transformation rules using regex"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Claims_and_Token_Customization/How%20to/Azure%20AD%20Claims%20transformation%20rules%20using%20regex"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-appex
- SCIM Identity
- Claims
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[**Tags**](/Tags): [AzureAD](/Tags/AzureAD) 

**BREAKING CHANGE NOTICE**: A breaking change will release on February 27, 2020 to the Policy API in Microsoft Graph beta which will impact management of these policies: activityBasedTimeoutPolicies, claimsMappingPolicies, homeRealmDiscoveryPolicies, tokenIssuancePolicies, and tokenLifetimePolicies.

To avoid an issue, customers should install the latest [Microsoft Graph PowerShell module](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation?view=graph-powershell-1.0)



[[_TOC_]]

# Feature Overview

Customers need more flexibility to transform claims before sending this information to applications upon successful authentication. AD FS allows claims transformation using regex in AD FS claim rules. However, until now this was not possible with Azure AD claims. Our customers have indicated that this is one of their main blockers for moving applications to Azure AD. With this feature we intend to provide richer capabilities to transform claims and allow Admins to configure those applications requiring specials values as claims.

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

![Overview](/.attachments/AAD-Authentication/184023/Overview.png)
<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

# Case Handling

**Azure AD Claims transformation rules using regex**cases are handled by the[AAD - Authentication Professional](https://expert.partners.extranet.microsoft.com/expert/Radius?QueueName=AAD%20-%20Authentication%20Professional&QueueNameFilter=azure%20active%20directory&SearchFlag=True)and the[AAD - Authentication Premier](https://expert.partners.extranet.microsoft.com/expert/Radius?QueueName=AAD%20-%20Authentication%20Premier&QueueNameFilter=azure%20active%20directory&SearchFlag=True)teams.

# How it works

For the purposes of the templates were defining, a generalized claims mapping transforms consists of five inputs:

|                            |                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------- |
| **Attribute1**             | **The attribute were attempting to match against**                              |
| String to match 1          | String to use to match against attribute 1                                       |
| String to match 2          | Second string to match when two are required to extract whats between them      |
| Value of claim if match    | Can be either Attribute 2 (including repeat of Attribute 1), or a static value. |
| Value of claim if no match | Either attribute 3, or a static value, or null                                   |

Attributes used for Attributes 1 through 3 must all be valid source attributes for claims mapping

Strings should be checked for regex syntax and escaped if necessary following the rules here

There are two main patterns of match and replace:

  - Simple match and replace pattern  if a match is true then emit a specific output in the claim.
  - Extract patterns  if a match is true, take a portion of the input value as defined as a capture group in the regex and output it in the claim.

Here are the templates that cover commonly useful use cases:

<table style="width:100%;">
<colgroup>
<col style="width: 16%" />
<col style="width: 16%" />
<col style="width: 16%" />
<col style="width: 16%" />
<col style="width: 16%" />
<col style="width: 16%" />
</colgroup>
<tbody>
<tr class="odd">
<td style="vertical-align:top"><strong>Description</strong></td>
<td style="vertical-align:top"><strong>String to Match 1</strong>
<p><strong>[B]</strong></p></td>
<td style="vertical-align:top"><strong>String to Match 2 [C]</strong></td>
<td style="vertical-align:top"><strong>Regex</strong></td>
<td style="vertical-align:top"><strong>Value of claim to replace on match [D] (required)</strong></td>
<td style="vertical-align:top"><strong>Default Value of claim if no match [E]</strong></td>
</tr>
<tr class="even">
<td style="vertical-align:top">Test if attribute1 contains a value</td>
<td style="vertical-align:top">&lt;value&gt;</td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top">^.*&lt;value&gt;.*$</td>
<td style="vertical-align:top">Attribute2 or static value</td>
<td style="vertical-align:top">Attribute3 or static value or Null</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Test if Attribute1 Null, or empty</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top">^$</td>
<td style="vertical-align:top">Attribute2 or static value</td>
<td style="vertical-align:top">Attribute3 or static value or Null</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Test if Attribute1 not Null or not </td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top">^.+$</td>
<td style="vertical-align:top">Attribute2 or static value</td>
<td style="vertical-align:top">Attribute3 or static value or Null</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Test match on Attribute1 prefix startWith()</td>
<td style="vertical-align:top">&lt;value&gt;</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top">^&lt;value&gt;.*$</td>
<td style="vertical-align:top">Attribute2 or static value</td>
<td style="vertical-align:top">Attribute3 or static value or Null</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Test match on Attribute1 suffix endWith()</td>
<td style="vertical-align:top">&lt;value&gt;</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top">^.*&lt;value&gt;$</td>
<td style="vertical-align:top">Attribute2 or static value</td>
<td style="vertical-align:top">Attribute3 or static value or Null</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Extract Prefix from Attribute1</td>
<td style="vertical-align:top">&lt;value&gt;</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top">^(?captureGroup.*)&lt;value&gt;.*$</td>
<td style="vertical-align:top">captureGroup</td>
<td style="vertical-align:top">Attribute3 , static value or Null</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Extract Suffix from Attribute1</td>
<td style="vertical-align:top">&lt;value&gt;</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top">^.*&lt;value&gt;(?captureGroup)$</td>
<td style="vertical-align:top">captureGroup</td>
<td style="vertical-align:top">Attribute3 , static value or Null</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Extract from between matching strings</td>
<td style="vertical-align:top">&lt;value1&gt;</td>
<td style="vertical-align:top">&lt;value2&gt;</td>
<td style="vertical-align:top">^.*&lt;value&gt;(?captureGroup)&lt;value2&gt;.*$</td>
<td style="vertical-align:top">captureGoup</td>
<td style="vertical-align:top">Attribute3 , static value or Null</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Extract numeric prefix</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Extract numeric suffix</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="even">
<td style="vertical-align:top">Extract alpha prefix</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
</tr>
<tr class="odd">
<td style="vertical-align:top">Extract alpha suffix</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top">NA</td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
<td style="vertical-align:top"></td>
</tr>
</tbody>
</table>

## Serializing transform templates to claims mapping policy

Heres where the values identified in the table above land in the policy

\[A\] Attribute1

\[B\] String to Match 1 Example @

\[C\] String to Match 2 Example . Escaped to \\\\. (regex escape of . is \\. Json escape of \\ is \\\\)

\[D\] Value for claim if match (Attribute 2, static value, or generated capture group for extract pattern)

\[E\] Default value of claim. Value or an attribute. (optional  leave this claim out of the schema if not present)

### Example: Simple match and replace

This Example emits userprincipalname in testregex claim if samaccountname is null.

```
    { 
    "ClaimsMappingPolicy": { 
    "Version": 1, 
    "IncludeBasicClaimSet": "false", 
    "ClaimsSchema": [{ 
    "value": "DefaultValueIfNoMatch", 
    "SamlClaimType": "testregex" 
    }, { 
    "ID": "AttributeIsNull", 
    "Source": "Transformation", 
    "SamlClaimType": "testregex", 
                    "TransformationId": "TestForNull" 
    }, { 
    "ID": "onpremisessamaccountname", 
    "Source": "user" 
    }, { 
    "ID": "userprincipalname", 
    "Source": "user" 
    },  
    ], 
    "ClaimsTransformations": [{ 
    "ID": "TestForNull", 
    "TransformationMethod": "RegexReplace", 
    "InputClaims": [{ 
    "ClaimTypeReferenceId": "onpremisessamaccountname", 
    "TransformationClaimType": "sourceClaim" 
    },{ 
    "ClaimTypeReferenceId": "userprincipalname", 
    "TransformationClaimType": "userprincipalname" 
    } 
    ], 
    "InputParameters": [{ 
    "ID": "regex", 
    "Value": "^$" 
    }, { 
    "ID": "replacement", 
    "Value": "{userprincipalname}" 
    } 
    ], 
    "OutputClaims": [{ 
    "ClaimTypeReferenceId": "AttributeIsNull", 
    "TransformationClaimType": "outputClaim" 
    } 
    ] 
    } 
    ] 
    } 
    }
```

### Example: Extract pattern

This example emits the string between @ and . i.e. the bottom level of email domain in the email address, and emits nothing if there is no match.

```
    { 
    "ClaimsMappingPolicy": { 
    "Version": 1, 
    "IncludeBasicClaimSet": "false", 
    "ClaimsSchema": [{ 
    "ID": "AttributeMiddle", 
    "Source": "Transformation", 
    "SamlClaimType": "testregex", 
                    "TransformationId": "ExtractMiddle" 
    }, { 
    "ID": "mail", 
    "Source": "user" 
    } 
    ], 
    "ClaimsTransformations": [{ 
    "ID": "ExtractMiddle", 
    "TransformationMethod": "RegexReplace", 
    "InputClaims": [{ 
    "ClaimTypeReferenceId": "mail", 
    "TransformationClaimType": "sourceClaim" 
    } 
    ], 
    "InputParameters": [{ 
    "ID": "regex", 
    "Value": "^.*@(?'captureGroup'.*)\\..*$" 
    }, { 
    "ID": "replacement", 
    "Value": "{captureGroup}" 
    } 
    ], 
    "OutputClaims": [{ 
    "ClaimTypeReferenceId": "AttributeMiddle", 
    "TransformationClaimType": "outputClaim" 
    } 
    ] 
    } 
    ] 
    } 
    }
```

## User Interface experience

 <table class="wikitable">
<tbody><tr>
<td colspan="2"><b>Definition of labels</b>
</td></tr>
<tr>
<td style="vertical-align:top">Parameter 1 (Input)
</td>
<td style="vertical-align:top">The directory attribute or  constant you want to apply the transformation
</td></tr>
<tr>
<td style="vertical-align:top">Value
</td>
<td style="vertical-align:top">The constant value you want to evaluate  in the transformation
</td></tr>
<tr>
<td style="vertical-align:top">Parameter 2 (Output)
</td>
<td style="vertical-align:top">What is the directory attribute or  constant value you want to output if the parameter 1 matches the  transformation
</td></tr>
<tr>
<td style="vertical-align:top">Parameter 3 (Output if no match)
</td>
<td style="vertical-align:top">What is the directory attribute or  constant value you want to output if the parameter 1 doesnt match the  transformation
</td></tr>
<tr>
<td style="vertical-align:top">Value 2
</td>
<td style="vertical-align:top">When extracting a value between two  strings, value 2 is the second string to match.
</td></tr></tbody></table> 

Refer to this document for the user experience: [Transform user claims using regex.pptx](https://microsoft-my.sharepoint-df.com/:p:/p/luleon/EeqLYoR_w9pBlwLvhlpBlC8BzlxD6-OqJO_v_Vk-UQQK6Q?e=OE7ZB3)

# Limitations

This functionality is only available for regular claims. This is not yet supported for NameID.

Custom regex is not available.

# How to configure & manage

To view or edit the claims issued in the SAML token to the application, open the application in Azure portal. Then, open the **User Attributes & Claims** section.

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

![ClaimsRegex01](/.attachments/AAD-Authentication/184023/ClaimsRegex01.jpg)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

There are two possible reasons why you might need to edit the claims issued in the SAML token:

  - The application requires the NameIdentifier or NameID claim to be something other than the username (AKA user principal name) stored in Azure AD.
  - The application has been written to require a different set of claims URIs or claim values.

### Editing the NameIdentifier claim

Open the **Name identifier value** page, then select the attribute or transformation you want to apply to the attribute.As an option, you can specify the format you want the NameID claim to have.

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

![ClaimsRegex02](/.attachments/AAD-Authentication/184023/ClaimsRegex02.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

#### NameID format

You can specify what format you want Azure AD to use for the NameID claim in case the application doesnt send a NameID policy in the SAML request. Be aware that Azure AD always grants the NameID format specified in the NameID policy. From the dropdown, you can select one of the options below:

  - Default: Azure Active Directory select the claim format.
  - Persistent: Azure Active Directory issues the NameID claim as a pairwise identifier.
  - EmailAdress: Azure Active Directory issues the NameID claim in e-mail address format.
  - Unspecified: This value permits Azure Active Directory to select the claim format. Azure Active Directory issues the NameID as a pairwise identifier.
  - Transient: Azure Active Directory issues the NameID claim as a randomly generated value that is unique to the current SSO operation. This means that the value is temporary and cannot be used to identify the authenticating user.

Learn more about NameIDPolicy attribute in [Single Sign-On SAML protocol](https://docs.microsoft.com/en-us/azure/active-directory/develop/single-sign-on-saml-protocol).

#### Attributes

Select the desired source for theNameIdentifier(or NameID) claim. You can select from the following options.

|                           |                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| **Name**                  | **Description**                                                                           |
| Email                     | The email address of the user                                                             |
| userprincipalName         | The user principal name (UPN) of the user                                                 |
| onpremisessamaccount      | SAM account name that has been synced from on-premises Azure AD                           |
| objectID                  | The objectID of the user in Azure AD                                                      |
| EmployeeID                | The EmployeeID of the user                                                                |
| Directory extensions      | Directory extensionssynced from on-premises Active Directory using Azure AD Connect Sync |
| Extension Attributes 1-15 | On-premises extension attributes used to extend the Azure AD schema                       |

#### Transformations

You can also use the special claims transformations functions.

|                         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Function**            | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **ExtractMailPrefix()** | Removes the domain suffix from either the email address, SAM account name, or the user principal name. This extracts only the first part of the user name being passed through (for example, "joe\_smith" instead of\[[smith@contoso.com|joe\_smith@contoso.com](Mailto:joe)\]).                                                                                                                                                                                     |
| **Join()**              | Joins an attribute with a verified domain. If the selected user identifier value has a domain, it will extract the username to append the selected verified domain. For example, if you select the email (\[[smith@contoso.com|joe\_smith@contoso.com](Mailto:joe)\]) as the user identifier value and select contoso.onmicrosoft.com as the verified domain, this will result in\[[smith@contoso.onmicrosoft.com|joe\_smith@contoso.onmicrosoft.com](Mailto:joe)\]. |
| **ToLower()**           | Converts the characters of the selected attribute into lowercase characters.                                                                                                                                                                                                                                                                                                                                                                                          |
| **ToUpper()**           | Converts the characters of the selected attribute into uppercase characters.                                                                                                                                                                                                                                                                                                                                                                                          |

### Adding regular claims

1.  In User Attributes & Claims, click on Add new claim to open the Manage user claims page.
2.  Enter the Name of the claims. It doesnt strictly need to follow a URI pattern as per the SAML spec. If you need a URI pattern, then you can put that in the Namespace field.
3.  Select the Source where the claim is going to retrieve its value. You can select a user attribute from the source attribute dropdown or apply a transformation to the user attribute before emitting it as a claim.

#### Transformations

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<tbody>
<tr class="odd">
<td style="vertical-align:top"><strong>Function</strong></td>
<td style="vertical-align:top"><strong>Description</strong></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><strong>ExtractMailPrefix()</strong></td>
<td style="vertical-align:top">Removes the domain suffix from either the email address, SAM account name, or the user principal name. This extracts only the first part of the user name being passed through (for example, "joe_smith" instead of[<a href="Mailto:joe" class="external text">smith@contoso.com|joe_smith@contoso.com</a>]).</td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><strong>Join()</strong></td>
<td style="vertical-align:top">Create a new value by joining two attributes. Optional, you can use a separator between the two attributes.</td>
</tr>
<tr class="even">
<td style="vertical-align:top"><strong>ToLower()</strong></td>
<td style="vertical-align:top">Converts the characters of the selected attribute into lowercase characters.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><strong>ToUpper()</strong></td>
<td style="vertical-align:top">Converts the characters of the selected attribute into uppercase characters.</td>
</tr>
<tr class="even">
<td style="vertical-align:top"><strong>Contains()</strong></td>
<td style="vertical-align:top">Output an attribute or constant if the input matches the specified value. Otherwise, you can specify another output if theres no match.
<p>For example, if you want to emit a claim where the value is the users email address if it contains the domain @contoso.com, otherwise you want to output the user principal name. You would configure the below values:</p>
<p><em>Parameter 1 (input):</em> user.email</p>
<p><em>Value:</em> @contoso.com</p>
<p>Parameter 2 (Output): user.email</p>
<p>Parameter 3 (output if no match): user.userprincipalname</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><strong>EndWith()</strong></td>
<td style="vertical-align:top">Output an attribute or constant if the input ends with the specified value. Otherwise, you can specify another output if theres no match.
<p>For example, if you want to emit a claim where the value is the users EmployeeID if the employeeId ends with 000, otherwise you want to output an extension attribute. You would configure the below values</p>
<p><em>Parameter 1 (input):</em> user.employeeid</p>
<p><em>Value: </em>000</p>
<p>Parameter 2 (Output): user.employeeid</p>
<p>Parameter 3 (output if no match): user.extensionattribute1</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><strong>Extract()  After matching</strong></td>
<td style="vertical-align:top">Return the substring after it matches the specified value.
<p>For example, if the inputs value is Finance_BSimon, the matching value is Finance_, then the claims output is BSimon.</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><strong>Extract()  Before matching</strong></td>
<td style="vertical-align:top">Return the substring until it matches the specified value.
<p>For example, if the inputs value is BSimon_US, the matching value is _US, then the claims output is BSimon.</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><strong>Extract()  Between matching</strong></td>
<td style="vertical-align:top">Return the substring in-between two strings
<p>For example, if the inputs value is Finance_BSimon_US, the first matching value is Finance_, the second matching value is _US, then the claims output is BSimon.</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><strong>ExtractAlpha() - Prefix</strong></td>
<td style="vertical-align:top">Returns the prefix alphabetical part of the string.
<p>For example, if the inputs value is BSimon_123, then it returns BSimon</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><strong>ExtractAlpha() - Suffix</strong></td>
<td style="vertical-align:top">Returns the suffix alphabetical part of the string.
<p>For example, if the inputs value is 123_BSimon, then it returns BSimon</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><strong>ExtractNumeric() - Prefix</strong></td>
<td style="vertical-align:top">Returns the numerical alphabetical part of the string.
<p>For example, if the inputs value is 123_BSimon, then it returns 123</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><strong>ExtractNumeric() - Suffix</strong></td>
<td style="vertical-align:top">Returns the suffix numerical part of the string.
<p>For example, if the inputs value is BSimon_123, then it returns 123</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><strong>IfEmpty()</strong></td>
<td style="vertical-align:top">Output an attribute or constant if the input is null or empty.
<p>For example, if you want to output an attribute stored in an extensionattribute if the employeeid for a given user is empty. You would configure the below values:</p>
<p>Parameter 1(input): user.empoyeeid</p>
<p>Parameter 2 (output): user.extensionattribute1</p>
<p>Parameter 3 (output if no match): user.employeeid</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top"><strong>IfNotEmpty()</strong></td>
<td style="vertical-align:top">Output an attribute or constant if the input is not null or empty.
<p>For example, if you want to output an attribute stored in an extensionattribute if the employeeid for a given user is not empty. You would configure the below values:</p>
<p>Parameter 1(input): user.empoyeeid</p>
<p>Parameter 2 (output): user.extensionattribute1</p></td>
</tr>
<tr class="odd">
<td style="vertical-align:top"><strong>StartWith()</strong></td>
<td style="vertical-align:top">Output an attribute or constant if the input starts with the specified value. Otherwise, you can specify another output if theres no match.
<p>For example, if you want to emit a claim where the value is the users employeeID if the country starts with US, otherwise you want to output an extension attribute. You would configure the below values:</p>
<p><em>Parameter 1 (input):</em> user.country</p>
<p><em>Value: US</em></p>
<p>Parameter 2 (Output): user.employeeid</p>
<p>Parameter 3 (output if no match): user.extensionattribute1</p></td>
</tr>
</tbody>
</table>

# Azure Support Center (ASC)

Use ASC under the Application node to search. Here is an example:

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

![ASC-Apps](/.attachments/AAD-Authentication/184023/ASC-Apps.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

![ASC-SAMLToken](/.attachments/AAD-Authentication/184023/ASC-SAMLToken.png)
<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

![ASC-SAMLTokenAtt](/.attachments/AAD-Authentication/184023/ASC-SAMLTokenAtt.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

# Escalations and assistance

## ICM

For portal config issues under enterprise apps

  - Owning service: IAM Services
  - Owning team: Enterprise App Management



If everything seems fine from the UI, and we have a token issuance issue

  - Owning service: ESTS
  - Owning team: Incident Triage

## Teams

Enterprise Apps (SAML SSO and Password SSO):<https://teams.microsoft.com/l/channel/19%3a617e7114cbfc4c8e80edd0d3e20e8834%40thread.skype/Enterprise%2520Apps%2520(SAML%2520SSO%2520and%2520Password%2520SSO)?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47>

# Training

(UI) How to: Customize claims issued in the SAML token for enterprise applications [https://review.docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-saml-claims-customization?branch=pr-en-us-71011](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-saml-claims-customization?branch=pr-en-us-71011) 

UserVoice request: <https://feedback.azure.com/forums/169401-azure-active-directory?category_id=160599> 

(PowerShell) How to: Customize claims emitted in tokens for a specific app in a tenant <https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-claims-mapping>

## Brownbag recording

Click on either of these links to view the recorded brownbag and download the PowerPoint presentation.

[Learn](https://learn.microsoft.com/activity/S3193530/launch/)

[Success Factors](https://hcm41.sapsf.com/sf/learning?destUrl=https%3a%2f%2fmicrosoftlmsap2%2elms%2esapsf%2ecom%2flearning%2fuser%2fdeeplink%5fredirect%2ejsp%3flinkId%3dITEM%5fDETAILS%26componentID%3dS3193530%26componentTypeID%3dONLINE-COURSE%26revisionDate%3d1554206280000%26fromSF%3dY&company=microsofAP2)


