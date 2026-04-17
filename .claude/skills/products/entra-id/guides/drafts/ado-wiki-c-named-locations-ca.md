---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Named Locations for Conditional Access"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FAzure%20AD%20Named%20Locations%20for%20Conditional%20Access"
importDate: "2026-04-05"
type: troubleshooting-guide
contentNote: "Original wiki page is 50K chars. Key sections preserved below."
---

# Azure AD Named Locations for Conditional Access

## Summary
Named Locations provide greater flexibility for location-based CA than Azure MFA Trusted IPs. Administrators can select individual Named Locations instead of a single flat list, and mark them as Trusted.

### Key Benefits
- Country code support for geo-fencing
- Mark as Trusted to lower sign-in risk
- Greater IP range capacity than MFA Trusted IPs (max 50)

## What's New (IPv6 Preview)
- Each new Named Location stored in its own NamedNetworkPolicy object (not shared)
- Max: 195 Named Locations, each up to 2000 IP ranges
- IPv6 address range support added
- Invalid CIDR values now blocked: IPv4 /8-/32, IPv6 /8-/128

## Limitations
- Max 90 Named Locations with one IP range each (old model)
- Single location can contain up to 1200 IPv4 ranges (old model)
- Name length impacts max count: ~25 with long names, ~40 with short names
- "All trusted locations" only applies to IP-range Named Locations, not Countries/Regions
- IPv6 geolocation mappings not available during IPv6 preview
- Country determination uses IPv4 only via 3rd party providers

## Configuration

### IPv4 Ranges
- CIDR notation, up to 500 ranges per location
- Upload/Download buttons for bulk management
- "Mark as trusted location" — not checked by default

### IPv6 Ranges
1. Get public IPv6: whatismyip.com
2. Determine CIDR value from IPv6 Range table
3. Calculate start address: findipv6.com/ipv6-cidr-to-range/
4. Combine start + CIDR (e.g., `2001:4898:a800:1000::/59`)

### Countries/Regions (Geo-Fencing)
- "Include unknown areas" — IMPORTANT: highly recommended when blocking countries
- Country determined by IPv4 address via 3rd party

### Trusted vs Neutral
- Not selecting "Mark as trusted" = neutral (not untrusted)
- "All trusted locations" exclusion only satisfies for locations marked as trusted
- Sign-ins from trusted locations lower user's sign-in risk

## Scenarios

### Block Sign-ins from Untrusted Networks
- Include: Any location
- Exclude: All trusted locations
- Grant: Block access

### Block Sign-ins from Countries
- Create Named Location with business countries
- Include: All locations
- Exclude: Business countries location
- Grant: Block access

## Service-Side Tracing

### Key Kusto Query
```kql
let start = datetime(YYYY-MM-DD HH:MM:SSZ);
let end = datetime(YYYY-MM-DD HH:MM:SSZ);
find in (
  cluster("estsam2").database("ESTS").PerRequestTableIfx,
  cluster("estsbl2").database("ESTS").PerRequestTableIfx, ...
) where env_time >= start and env_time <= end 
  and CorrelationId == "<guid>"
| project env_time, CorrelationId, RequestId, Result, ErrorCode, ClientIp, ClientIpSubnet, MultiCAEvaluationLog, ConditionalAccessVerboseData
| sort by env_time asc
```

### Interpreting Multi CA Policy Evaluation Log
- `"Loc":"Satisfied"` → location condition met → policy applies
- `"Loc":"NotSatisfied"` → location excluded → policy does not apply
- Check `KnownNetworkPolicies` in AuthQuery for Trusted vs neutral (`"Categories":["trusted"]` vs `"Categories":[]`)

## ASC Navigation
- Old Named Locations: Conditional Access > Configurations
- New IPv6 Named Locations: Conditional Access > Configurations (Non-Default Policies)
