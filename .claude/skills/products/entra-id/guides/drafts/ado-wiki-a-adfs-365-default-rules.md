---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Troubleshooting/ADFS - 365 Default Rules"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20Troubleshooting%2FADFS%20-%20365%20Default%20Rules"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS - 365 Default Rules

With ADFSHelp not available it may be necessary to review or setup rules manually.
This article gives a reference to common rule configurations and deployments customers could use.

## Pre-requisites

To select the best matching scenario first understand how Connect Sync had been configured and in particular which attributes are synced as **SourceAnchor** (aka ImmutableID) and **UserPrincipalName**.

You can get this information from:
- ASC (assuming the Customer has Connect Sync Health Agents installed)
- **Entra Connect** in the "View or Export Current Configuration" section

Secondly you need to verify if the customer intends to federate one TenantDomain or Multiple domains.

## Scenario 1: ImmutableID=ObjectGuid, UPN synced, MultipleDomainSupport=enabled

```
@RuleName = "Issue UPN"
c:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname"]
 => issue(store = "Active Directory", types = ("http://schemas.xmlsoap.org/claims/UPN"), query = "samAccountName={0};userPrincipalName;{1}", param = regexreplace(c.Value, "(?<domain>[^\\]+)\\(?<user>.+)", "${user}"), param = c.Value);

@RuleName = "Issue Immutable ID"
c:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname"]
 => issue(store = "Active Directory", types = ("http://schemas.microsoft.com/LiveID/Federation/2008/05/ImmutableID"), query = "samAccountName={0};objectGUID;{1}", param = regexreplace(c.Value, "(?<domain>[^\\]+)\\(?<user>.+)", "${user}"), param = c.Value);

@RuleName = "Issue nameidentifier"
c:[Type == "http://schemas.microsoft.com/LiveID/Federation/2008/05/ImmutableID"]
 => issue(Type = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", Value = c.Value, Properties["http://schemas.xmlsoap.org/ws/2005/05/identity/claimproperties/format"] = "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified");

@RuleName = "Issue accounttype for domain-joined computers"
c:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid", Value =~ "-515$", Issuer =~ "^(AD AUTHORITY|SELF AUTHORITY|LOCAL AUTHORITY)$"]
 => issue(Type = "http://schemas.microsoft.com/ws/2012/01/accounttype", Value = "DJ");

@RuleName = "Issue AccountType with the value USER when it is not a computer account"
NOT EXISTS([Type == "http://schemas.microsoft.com/ws/2012/01/accounttype", Value == "DJ"])
 => add(Type = "http://schemas.microsoft.com/ws/2012/01/accounttype", Value = "User");

@RuleName = "Issue issuerid when it is not a computer account"
c1:[Type == "http://schemas.xmlsoap.org/claims/UPN"] && c2:[Type == "http://schemas.microsoft.com/ws/2012/01/accounttype", Value == "User"]
 => issue(Type = "http://schemas.microsoft.com/ws/2008/06/identity/claims/issuerid", Value = regexreplace(c1.Value, "(?i)(^([^@]+)@)(sales\.)*(?<domain>((?<=sales\.)contoso\.com|contoso\.com|fabrikam\.com))$", "http://${domain}/adfs/services/trust/"));

@RuleName = "Issue issuerid for DJ computer auth"
c1:[Type == "http://schemas.microsoft.com/ws/2012/01/accounttype", Value == "DJ"]
 => issue(Type = "http://schemas.microsoft.com/ws/2008/06/identity/claims/issuerid", Value ="http://contoso.com/adfs/services/trust/");

@RuleName = "Issue onpremobjectguid for domain-joined computers"
c1:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid", Value =~ "-515$", Issuer =~ "^(AD AUTHORITY|SELF AUTHORITY|LOCAL AUTHORITY)$"]
 && c2:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname", Issuer =~ "^(AD AUTHORITY|SELF AUTHORITY|LOCAL AUTHORITY)$"]
 => issue(store = "Active Directory", types = ("http://schemas.microsoft.com/identity/claims/onpremobjectguid"), query = ";objectguid;{0}", param = c2.Value);

@RuleName = "Pass through primary SID"
@RuleName = "Pass through claim - insideCorporateNetwork"
@RuleName = "Pass Through Claim - Psso"
@RuleName = "Issue Password Expiry Claims"
@RuleName = "Pass through claim - authnmethodsreferences"
@RuleName = "Pass through claim - multifactorauthenticationinstant"
@RuleName = "Pass through claim - certificate authentication - serial number"
@RuleName = "Pass through claim - certificate authentication - issuer"
```

## Scenario 2: ImmutableID=ObjectGuid, UPN synced, MultipleDomainSupport=No

Similar to Scenario 1 but without the issuerid regex for multiple domains.

## Key Differences

| Feature | Scenario 1 | Scenario 2 |
|---------|-----------|-----------|
| Multiple Domain Support | Yes - issuerid uses regex per domain | No - simpler issuerid |
| ImmutableID source | ObjectGuid | ObjectGuid |
| UPN source | userPrincipalName (synced) | userPrincipalName (synced) |
