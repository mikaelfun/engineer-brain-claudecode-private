# How to Identify if a Domain is Dual-Federated

## Method: OIDC Metadata Endpoint Check

The OIDC metadata endpoint in each cloud returns domain metadata of its own cloud instance prior to other cloud instances.

### Step 1: Check Mooncake
Access: `https://login.partner.microsoftonline.cn/<domain>/v2.0/.well-known/openid-configuration`

- If `token_endpoint` contains `login.partner.microsoftonline.cn/<domain>/...` -> domain IS registered in Mooncake (may also be in public)
- If `token_endpoint` contains `login.microsoftonline.com/<domain>/...` -> domain is ONLY in public Azure

### Step 2: Check Public Azure
Access: `https://login.microsoftonline.com/<domain>/v2.0/.well-known/openid-configuration`

- If `token_endpoint` contains `login.partner.microsoftonline.cn/<domain>/...` -> domain is ONLY in Mooncake
- If `token_endpoint` contains `login.microsoftonline.com/<domain>/...` -> domain IS in public Azure (may also be in Mooncake)

### Conclusion
If both endpoints return their own cloud's token endpoint -> domain is dual-federated (registered in both clouds).

### Tip
You can also use tenant ID instead of domain name to check if a given tenant exists in a specific cloud.

## PowerShell Quick Check Script
Download: [get-dualfed.ps1](https://dev.azure.com/CSS-Mooncake/SupportTools/_git/MooncakeCodeRepo?path=/VM/get-dualfed.ps1)

```powershell
# Usage: .\get-dualfed.ps1 <domainname>
# Checks both Mooncake and Public Azure endpoints
# Also checks federation status (Managed vs Federated)
```

The script checks:
1. Mooncake OIDC endpoint - reports if domain is in Mooncake
2. Public Azure OIDC endpoint - reports if domain is in public
3. Federation status for each cloud (Federated vs Managed)
4. Handles errors gracefully (invalid_tenant = domain not found)

## Source
- Mooncake POD Support Notebook / Dual-Federation / Technical details / How to identify if a domain is dual-fed
