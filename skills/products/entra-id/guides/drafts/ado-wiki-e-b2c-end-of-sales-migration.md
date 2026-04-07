---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/AAD B2C End of sales migration guidance for CSS V1"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAAD%20B2C%20End%20of%20sales%20migration%20guidance%20for%20CSS%20V1"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD B2C End of Sales - Migration Guidance (CSS Internal)

## Key Messages (Do NOT deliver written details directly to customer)

### Nothing changes for existing B2C customers on May 1, 2025
- B2C tenant creation closed only to new customers
- Existing customers can continue running B2C and creating new B2C tenants

### Recommendation: Stay on B2C near-term (till later FY26)
- Future investment in External ID, but no need to move immediately

### Migration tooling coming
- JIT password migration (seamless UX)
- Hybrid upgrade (in-place, B2C + ExtID coexistence)
- For managed customers: private preview access available

### Current migration path (if customer insists)
1. Create External ID tenant
2. Recreate applications, reimplement UX flows, set up policies
3. Transfer user data via Graph APIs (new user objects, temporary passwords)
4. Update application URLs from B2C to ExtID endpoints
5. Users with existing B2C accounts need to recover via SSPR
6. Requires considerable expertise (recommend SI partner)

### Password migration options
1. EOTP as primary sign-in (defer password resets)
2. Custom B2C policy to collect passwords during sign-in, populate ExtID (JIT approach)
3. Federate from External ID to B2C (stepping stone, doesn't reduce B2C dependency)

## Customer Concern Handling
- NDA customers: offer private preview access to JIT/hybrid capabilities
- All customers will eventually migrate to External ID (before B2C EOL 2030)
- Partners can focus on helping customers implement on External ID

## Timeline
- B2C End of Sales: May 1, 2025
- Private preview of migration tools: ~May 2025
- Public preview: FY26Q1
- GA: TBD (later FY26)
- B2C End of Life: 2030
- Full automated migration: no funding/timeline yet
