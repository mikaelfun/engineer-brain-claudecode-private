---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS understanding the issuerid claim issuance"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20understanding%20the%20issuerid%20claim%20issuance"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS Understanding the IssuerID Claim Issuance

## Issue

Federated users get one of these errors when signing into Entra applications:

- `AADSTS50107: The requested federation realm object 'user@contoso.com' does not exist`
- `AADSTS500083: Unable to verify token signature. No trusted realm was found with identifier http://contoso.com/adfs/services/trust/.`

## Variants of the Error

1. **UPN is displayed instead** - The IssuerID contains the user's UPN instead of the federation service identifier
2. **Default IssuerID of the Federation Service is displayed** - Using the default ADFS service identifier instead of the domain-specific one
3. **IssuerID uses child domain suffix instead of federated root** - A child domain's suffix is used instead of the root federated domain
4. **IssuerID contains unexpected characters** - Typos or encoding issues in the IssuerID value
5. **AADSTS900023 showing invalid DNS name** - DNS-related IssuerID issues

## Explanation of AADSTS50107 and AADSTS500083

The AADSTS50107 error is a lookup error indicating that Microsoft Entra ID could not find a **federation realm object** that matches the value in the token.

Without being able to look up the realm object, Entra will be unable to:
- Load the TokenSigning Certificate references to validate the signature of the token
- Map the tenant domain to enforce Federated-Token-Validation-Policy (if configured)

The **IssuerID** in the token must be an exact match of what has been registered on Entra and is usually a **globally unique** value.

## Checking the Registered IssuerURI

```powershell
Get-MgDomainFederationConfiguration -DomainId contoso.com | fl
```

## The Claim Rules

When Entra Connect federates domains, it generates claim rules based on:
- **SourceAnchor attribute** (objectGuid vs Ms-Ds-ConsistencyGuid vs custom attribute)
- **UPN source** (UserPrincipalName vs AlternateLoginID e.g., mail)
- **Configuration for hybrid devices**

### The 4 IssuerID-Related Rules

1. **"Issue UPN"** - Issues a UPN claim. Source is usually the `userPrincipalName` attribute in AD DS (or `mail` if AlternateLoginID is configured). The UPN claim is used later in the pipeline.

2. **"Issue accounttype for domain-joined computers"** - Checks for a group SID claim matching the "domain computers" group. If found, issues `accounttype = "DJ"` (domain joined).

3. **"Issue AccountType with the value USER when it is not a computer account"** - If no "DJ" claim found, adds `accounttype = "User"`.

4. **"Issue IssuerID"** - The final rule that constructs the IssuerID based on the UPN suffix and accounttype. This rule maps the domain suffix to the correct IssuerURI registered in Entra ID.

## Troubleshooting Steps

1. **Check registered IssuerURI**: `Get-MgDomainFederationConfiguration -DomainId <domain>`
2. **Review ADFS claim rules**: Check all 4 IssuerID-related rules in the Azure AD Relying Party Trust
3. **Verify UPN suffixes**: Ensure all UPN suffixes used by federated users have corresponding IssuerURI entries
4. **Re-run AAD Connect federation**: If rules are corrupted, re-running the AAD Connect federation setup regenerates correct claim rules
5. **Check for custom claim rules**: Manual modifications may have introduced errors
