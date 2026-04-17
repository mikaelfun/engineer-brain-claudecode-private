---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Authentication Strengths Conditional Access CBA Advanced Options"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FAuthentication%20Strengths%20Conditional%20Access%20CBA%20Advanced%20Options"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.CA
- cw.Authstrengths
- cw.CBA
- SCIM Identity
- Conditional Access
-  Authentication Strengths
-  CBA
-  Certificate Based Auth
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Conditional-Access](/Tags/Conditional%2DAccess) 

[[_TOC_]]

### Compliance note  

This wiki contains test/lab data only.

# Feature overview  

This feature is an extension to native [Microsoft Entra certificate-based authentication](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-certificate-based-authentication) and [Microsoft Entra Authentication Strength](https://learn.microsoft.com/en-us/graph/api/resources/authenticationstrengths-overview?view=graph-rest-1.0) policies.  With this feature an administrator can require a specific certificate issuer when users perform certificate-based authentication to access certain sensitive resources.  

Until this preview, Admins could already configure whether certificates are bound in the system to single/multifactor authentication protection levels, based on the certificate issuer or policy ID. They could also require single or multifactor authentication certificates for specific resources, based on Conditional Access authentication strength policies.

However, admins may have resources that are so sensitive that they only trust users with certificates issued by specific issuers to access them. For example, Contoso may issue three different types of multifactor certificates via Smart Cards to employees (distinguished by properties of the certificate, such as **Policy OID** or **issuer**): one for Confidential clearance, one for Secret clearance, and one for Top Secret clearance. Contoso wants to ensure that only users with the appropriate multifactor certificate can access data of the appropriate classification.  

# Case handling  

This feature is supported by the Identity Security and Protection community.

# Licensing  

Microsoft Entra ID Premium 1 or higher.

# Limitations and known issues  

- Only one certificate can be used in each browser session. If you have signed-in with a certificate, it is cached in the browser for the duration of the session and you will not be prompted to choose another certificate if it doesn’t meet the authentication strength requirements.
- Certificate Authorities and User certificates should conform to X.509 v3 standard. Specifically, for enforcing issuer SKI CBA restrictions, we require certificates to have valid AKIs as shown below.
![Certificate must have a valid SKI](.attachments/AAD-Authentication/1256163/CBA-Valid-SKI.png)

>Note: If the certificate used does not conform to the above, user authentication might succeed but it will not satisfy the issuerSki restrictions in Authentication Strength.

- Certificates with more than 5 Policy OIDs – We track up to 5 policy OIDs in the token. We choose them based on the auth strength policies in the tenant. This means that, currently, if a certificate has more than 5 Policy OIDs in some cross cloud or cross tenant scenario, it will be best effort to track the correct certificate. If your certificate has more than 5 policy OIDs, let us know about the use case.
- External users cannot use CBA restrictions:
  - Currently CBA can only be used in cross tenant access scenarios (when a user authenticates on the home tenant with a certificate in order to meet the authentication requirements of the home tenant.) 
  - External users cannot use CBA on the resource tenant.
  - PG is working on enabling both scenarios (cross tenant CBA restrictions AND external users using CBA on the resource tenant).
- A certificate that is not 'qualified' for MFA can be used in an MFA policy.

## Clouds currently supported

- Public/General
- Fairfax

# How to configure and manage  

## Configure Azure AD CBA

Details available here: [How to configure Azure AD certificate-based authentication](https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-certificate-based-authentication).

## Create a custom authentication strength policy from the Microsoft Entra ID portal

1. Navigate to Entra ID > Protect and Secure > Conditional Access > Authentication Strength.  
2. Click on New Authentication Strength > provide it a name and description > look for Certificate-based authentication (either single factor or multifactor) and click on the advanced setting underneath.
![Alt text](.attachments/AAD-Authentication/1256163/New-CBA-Auth-Str.png)
3. Select certificate issuers from the drop down or type the allowed policy OIDs.  
    1. If both “Allowed certificate issuer” AND “Allowed Policy OID” are configured, there is an **AND** relationship. The user has to use a certificate which satisfies **both** conditions.  
    2. Between the individual lists (“Allowed certificate issuer”, “Allowed Policy OID”) there is an **OR** relationship, the user has to use a certificate which satisfies **one of** the issuers or policy OIDs.
    ![Alt text](.attachments/AAD-Authentication/1256163/New-CBA-Auth-Str-Advanced.png)
4. When finish click on “next”, review the configuration and click “Create”.
5. Create a new Conditional Access policy: Under the Conditional Access blade go to Policies > New policy > Choose the relevant  conditions for your policy (such as users and applications) > Under the grant controls choose authentication strength and select the custom authentication strength you created.
6. Save the policy.

## Create a custom authentication strength policy using the APIs:

Adding new Authentication Strength policies with Certificate combinationConfiguration

POST  /beta/identity/conditionalAccess/authenticationStrengths/policies

```json
{
    "displayName": "CBA Restriction",
    "description": "CBA Restriction with both IssuerSki and OIDs ",
    "allowedCombinations": [
        " x509CertificateMultiFactor "
    ],
    "combinationConfigurations": [
        {
            "@odata.type": "#microsoft.graph.x509CertificateCombinationConfiguration",
            "appliesToCombinations": [
                "x509CertificateMultiFactor"
            ],
            "allowedIssuerSkis": ["9A4248C6AC8C2931AB2A86537818E92E7B6C97B6"],
            "allowedPolicyOIDs": [
                "1.2.3.4.6",
                "1.2.3.4.5.6"
            ]
        }
    ]
}
```

## Adding new combinationConfiguration to Existing authentication Strength Policy
POST beta/identity/conditionalAccess/authenticationStrength/policies/{authenticationStrengthPolicyId}/combinationConfigurations

```json
{
    "@odata.type": "#microsoft.graph.x509CertificateCombinationConfiguration",
    "allowedIssuerSkis": [
        "9A4248C6AC8C2931AB2A86537818E92E7B6C97B6"
    ],
    "allowedPolicyOIDs": [],
    "appliesToCombinations": [
        "x509CertificateSingleFactor "
    ]
}
```

> **Note:** allowedIssuerSkis is from the Certificate Authority configured in the tenant(issuerSki).  For more information please see: [List certificateBasedAuthConfigurations](https://learn.microsoft.com/en-us/graph/api/certificatebasedauthconfiguration-list?view=graph-rest-1.0&tabs=http)  

## API

### Authentication Strengths API schema

```json
{
  "@odata.type": "authenticationStrengthPolicy",
  "id": "4504965a-2be8-4c68-b087-4444a0333bbe",
  "displayName": "Custom certificate auth strength",
  "policyType": "custom",
  "allowedCombinations": [
	"x509CertificateMultiFactor",
	"x509CertificateSingleFactor",
	"fido2"
  ]
  "combinationConfigurations": [
    {
      " appliesToCombinations": "x509CertificateMultiFactor",
      "allowedIssuerSkis": [" issuerSki-value-1"," issuerSki-value-2"," issuerSki-value-3"],
      "allowedPolicyOIDs": ["policyOID1","policyOID2","policyOID3"]
    },
    {
      " appliesToCombinations": "x509CertificateSingleFactor",
      "allowedIssuerSkis": [" issuerSki-value-1"," issuerSki-value-2"," issuerSki-value-3"],
      "allowedPolicyOIDs": ["policyOID1","policyOID2","policyOID3"]
    },
    {
      " appliesToCombinations": "fido2",
      "allowedAAGUIDs": ["AAGUID1","AAGUID2","AAGUID3"]
    }
  ]
}
```

### API error handling

1. **Exceeding limit of allowed issuers, policy OIDs, or AAGUIDs**: Throw an HTTP 405 error if the number of allowed certificate issuers, allowed policy OIDs, or AAGUIDs exceeds 5.
2. **Invalid allowedIssuerSkis**: Throw an HTTP 405 error if allowedIssuers does not belong to the list of allowed certificate issuers configured in the tenant.
3. **Invalid AAGUID**: Throw an HTTP 405 error if allowedAAGUIDs is not a valid GUID: The input must be in a valid GUID format. Example: 12345678-0000-0000-0000-123456780000


# Troubleshooting  

## Reviewing the policies in ASC Graph Explorer

In ASC under **Sign-Ins** > **Authentication Methods** > **Authentication Strengths** you can see the list of authentication strength policies.  From there you can expand a policy and view the **Allowed Policy OIDs** and **Allowed Issuers** requirements for that policy.  **No Data** means that this setting is not configured for this particular policy.

![alt text](../../../../.attachments/AAD-Authentication/1256163/ASC-Auth-Strength-Details.png)

## Reviewing the policies in ASC Graph Explorer

To see a list of all Authentication Strength policies run:
> identity/conditionalAccess/authenticationStrengths/policies

To see a list of all Authentication Strength policies that contain a x509 cert setting run:
> identity/conditionalAccess/authenticationStrengths/policies?$filter=allowedCombinations/any(x:x eq 'x509CertificateMultiFactor')

![Alt text](.attachments/AAD-Authentication/1256163/ASC-Graph-X509-Policy-List.png)

To view the details of a specific policy run:

> policies/authenticationStrengthPolicies/{authenticationStrengthPolicyId}

![Alt text](.attachments/AAD-Authentication/1256163/ASC-Graph-X509-Policy-Details.png)

```json
{
  "Title": "Graph response output",
  "Details": {
    "@odata.context": "https://graph.microsoft.com/beta/$metadata#policies/authenticationStrengthPolicies/$entity",
    "id": "e5db7655-fcc9-4ef8-bfd6-ba986fc3d6d0",
    "createdDateTime": "2023-10-04T00:58:50.2428389Z",
    "modifiedDateTime": "2023-10-04T00:58:50.2428389Z",
    "displayName": "CBA General Clearence",
    "description": "",
    "policyType": "custom",
    "requirementsSatisfied": "mfa",
    "allowedCombinations": [
      "x509CertificateMultiFactor"
    ],
    "combinationConfigurations@odata.context": "https://graph.microsoft.com/beta/$metadata#policies/authenticationStrengthPolicies('e5db7655-fcc9-4ef8-bfd6-ba986fc3d6d0')/combinationConfigurations",
    "combinationConfigurations": [
      {
        "@odata.type": "#microsoft.graph.x509CertificateCombinationConfiguration",
        "id": "bf28edad-5349-4608-af96-54ead0087347",
        "appliesToCombinations": [
          "x509CertificateMultiFactor"
        ],
        "allowedIssuerSkis": [
          "E92F6E130795CFA7A27FA05267555CD657C836DE",
          "633170D0D42FE840A751E5AC5DA2C0A4042FF4B3"
        ],
        "allowedPolicyOIDs": [
          "2.3.4.6007.4135"
        ]
      }
    ]
  }
}
```

From this output you can see if they are targeting certain issuer's **allowedIssuerSkis** and/or certain OIDs **allowedPolicyOIDs**.

- If **both** allowedIssuerSkis and allowedPolicyOIDs are specified the client certificate must match **both**.  
- If multiple allowedIssuerSkis are specified, the client certificate must match **one of** them.  
- If multiple allowedPolicyOIDs are specified, the client certificate must match **one of** them.  

::: mermaid
graph TD;
    A[CBA Auth Strength Policy]-->B{Is allowedIssuerSkis
     spcified?};
    B-- Yes -->C{Does the client cert match 
    one of the entries?};
    B-- No -->D{Is allowedPolicyOIDs 
    specified?};
    C--No Match-->E([Auth Strength Not Met]);
    C-- Yes -->D;
    D-- Yes -->G{Does the client cert match 
    one of the entries?};
    D-- No -->F{Is allowedIssuerSkis
     spcified?};
    G-- No Match -->E;
    G-- Yes -->H([Auth Strength Met]);
    F-- Yes -->H;
    F-- No-->I([Policy Not Set]);
:::

## Troubleshooting sign-in failure due to wrong user certificate

**Error Code 500187**
> **AADSTS500187**: Selected certificate does not meet the criteria.

![Alt text](.attachments/AAD-Authentication/1256163/Cert-Not-Match-Error2.png)

This error occurs if the certificate provided does not meet the conditions of the authentication strength policy.

```json
  "appliedConditionalAccessPolicies": [
    {
      "id": "0245c0e9-cf51-4c90-8a7b-e18b00257e3d",
      "displayName": "Require STS Cert for Office",
      "enforcedGrantControls": [],
      "enforcedSessionControls": [],
      "sessionControlsNotSatisfied": [],
      "result": "failure",   <=================== Failure
      "conditionsSatisfied": "application,users",
      "conditionsNotSatisfied": "none",
      "includeRulesSatisfied": [
        {
          "conditionalAccessCondition": "application",
          "ruleSatisfied": "office365"
        },
        {
          "conditionalAccessCondition": "users",
          "ruleSatisfied": "userId"
        }
      ],
      "excludeRulesSatisfied": [],
      "authenticationStrength": {
        "displayName": "Super Top Secret",
        "authenticationStrengthId": "59f27727-7054-4b43-ab4a-2bb4f4f6a3ff",
        "authenticationStrengthResult": "singleChallengeRequired"
      }
    }]
```

1. In ASC locate the failed login attempt the customer is concerned about.  This will usually be an **AADSTS500187: Selected certificate does not meet the criteria** error.
2. Click the **Troubleshoot this sign-in** link.
![ASC Troubleshoot this sign-in](.attachments/AAD-Authentication/1256163/TS-this-signin.png)
3. Select the **500187** error from the Authentication Summary
![ASC Auth Summary 500187](.attachments/AAD-Authentication/1256163/ASC-Auth-Summary.png)
4. Under Basic Details expand CA Diagnostics.
5. Locate the failure, it should look something like this:

![ASC Basic Details](.attachments/AAD-Authentication/1256163/ASC-BasicSummary.png)

``` text
Require Top Secret Cert For Office (0245c0e9-Cf51-4c90-8a7b-E18b00257e3d)
All Of The Policy's Conditions Were Satisfied:
- The User Requested A Token For OfficeHome (4765445b-32c6-49b0-83e6-1d93765276ca)
  As A Result, We Evaluated Conditional Access For 1 Resource (4765445b-32c6-49b0-83e6-1d93765276ca)
  This Office 365 Resource Was Included And Not Excluded By The Policy's Application Condition.
- The User (E469b337-xxxx-xxxx-xxxx-89f2b412d092) Was Included And Not Excluded By The Policy's User Condition.
All Of The Following Grant Controls Were Unsatisfied:
- This Policy Contained A Custom Authentication Strength (59f27727-7054-4b43-Ab4a-2bb4f4f6a3ff)
  The User Had Already Completed These Modes: X509CertificateMultiFactor
  The User Was Registered For These Modes: Password, X509CertificateSingleFactor, X509CertificateMultiFactor
  This Particular Strength Required The User To Complete One Of The Following Methods: X509CertificateSingleFactor
  ```

6. Record the value for the Authentication Strength policy.
7. Expand the **Expert view** and select the **Diagnostic Logs** tab.  Filter on "Validating certificate".
![ASC Expert View](.attachments/AAD-Authentication/1256163/ASC-Expert-View.png)

``` text
  Validating certificate with thumbprint='{ %%pii_removed%%}', issuer='CN=BugBash_IA2', serialNumber='{ %%pii_removed%%}', authorityKeyIdentifier='KeyID=60b63e6515aae4a0fc6abd799ed383f507717036', subject='{ %%pii_removed%%}', alternativeName='{ %%pii_removed%%}', notBefore='09/06/2023 23:34:22', notAfter='09/05/2024 23:34:32', policyOIDs:'1.3.6.1.9402.4379;1.3.6.1.7836;1.3.6.1.6023.4393;1.3.6.1.4233.4111;1.3.6.1.1473'
```

8. Record the **authorityKeyIdentifier** and/or the **policyOIDs**.  
  
  >**Note**: policies can apply to one of both of these values.  Also verify certificate dates are valid.

9. Go to **Graph Explorer** and use the following query "**policies/authenticationStrengthPolicies/{policy guid from step 6}**"

```json
{
  "Title": "Graph response output",
  "Details": {
    "@odata.context": "https://graph.microsoft.com/beta/$metadata#policies/authenticationStrengthPolicies/$entity",
    "id": "59f27727-7054-4b43-ab4a-2bb4f4f6a3ff",
    "createdDateTime": "2023-11-16T20:58:24.7038349Z",
    "modifiedDateTime": "2023-11-29T19:25:38.3285132Z",
    "displayName": "Top Secret",
    "description": "",
    "policyType": "custom",
    "requirementsSatisfied": "none",
    "allowedCombinations": [
      "x509CertificateSingleFactor"
    ],
    "combinationConfigurations@odata.context": "https://graph.microsoft.com/beta/$metadata#policies/authenticationStrengthPolicies('59f27727-7054-4b43-ab4a-2bb4f4f6a3ff')/combinationConfigurations",
    "combinationConfigurations": [
      {
        "@odata.type": "#microsoft.graph.x509CertificateCombinationConfiguration",
        "id": "a2f1a8f6-bac8-4c02-a576-08ff59b1f078",
        "appliesToCombinations": [
          "x509CertificateSingleFactor"
        ],
        "allowedIssuerSkis": [  <==============
          "F6817E0068639C2193651F08E4EC637DD7A91BB8"
        ],
        "allowedPolicyOIDs": [  <==============
          "2.3.4.6007.4135"
        ]
      }
    ]
  }
}
```

10. Compare the AKI and OIDs required in the policy (step 9) with the ones sent by the user (step 7/8).

If there is a mismatch, the user sent the wrong certificate or the administrator configured the policy with the wrong OID/AKI.

To compare the client cert against the policy for Issuer you will want to compare the **Authority Key Identifier** against the values in **allowedIssuerSkis**.  There must be a match.

![Alt text](.attachments/AAD-Authentication/1256163/User-Cert-SKI-AKI.png)

To compare the client cert against the policy of OID you will want to compare the **Certificate Policies** against the values in **allowedPolicyOIDs**.  There must be a match.

![Alt text](.attachments/AAD-Authentication/1256163/User-Cert-OID.png)

## Common Errors

### MFA Capability Mismatch

Microsoft Entra Portal > Protection > Authentication methods > Policies > Certificate-based authentication > Configure Tab.

If the Native CBA [authentication binding policy's](https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-certificate-based-authentication#step-3-configure-authentication-binding-policy) authentication strength (protection level) does not match the level chosen in the Conditional Access authentication strength policy login will fail.  If your authentication binding only supports single-factor you must be sure to choose the single-factor CBA option in the Conditional Access authentication strength policy.

![Auth MFA Capability must match](.attachments/AAD-Authentication/1256163/MFA-Cap-Mismatch.png)

If the customer creates an CBA Multifactor Auth strength and the certificate binding only supports single-factor the user will receive the following error:

![Alt text](.attachments/AAD-Authentication/1256163/Cert-Not-Match-Error.png)

# ICM escalations  

Management and enforcement of CA policy with Auth strengths in the Portal route to the Conditional Access UX team:

**Owning Service**: Conditional Access UX
**Owning Team**: Triage

Management and enforcement of CA policy with Auth strengths using Microsoft Graph API route to the Conditional Access team

**Owning Service**: Conditional Access
**Owning Team**: Triage

Management of Authentication strengths, authentication methods policy and authentication methods route to the Credential Configuration Endpoint (CCE) team:

**Owning Service**: Azure MFA
**Owning Team**: MFA On-call Engineers (MFA Support requests)

# Supportability documentation  

## Public documentation

- https://learn.microsoft.com/en-us/entra/identity/authentication/concept-certificate-based-authentication-technical-deep-dive

## Internal documentation

- https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageid=712194
