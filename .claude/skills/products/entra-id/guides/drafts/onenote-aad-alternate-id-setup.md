# AAD Alternate ID Setup (Email as Login) - Azure China

## Overview
Enable users to sign in with their email (ProxyAddresses) as an alternate login ID, in addition to UPN. Uses Home Realm Discovery (HRD) policy.

Reference: https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-use-email-signin#powershell

## Setup Steps

### 1. Check Existing HRD Policies
```
GET https://microsoftgraph.chinacloudapi.cn/v1.0/policies/homeRealmDiscoveryPolicies
```

### 2. Create/Update HRD Policy with AlternateIdLogin
```
POST https://microsoftgraph.chinacloudapi.cn/v1.0/policies/homeRealmDiscoveryPolicies

{
    "definition": [
        "{\"HomeRealmDiscoveryPolicy\":{\"AccelerateToFederatedDomain\":false,\"AllowCloudPasswordValidation\":true,\"AlternateIdLogin\":{\"Enabled\":true}}}"
    ],
    "displayName": "AlternateIdLogin-Policy",
    "isOrganizationDefault": true
}
```

### 3. Verify
After enabling, users can sign in using their ProxyAddresses email instead of UPN.

## Notes
- Feature enables sign-in with ProxyAddresses for cloud-authenticated users
- For federated domains, AllowCloudPasswordValidation must be true
- Test thoroughly before enabling organization-wide

## Source
- OneNote: MCVKB/VM+SCIM/11.52
