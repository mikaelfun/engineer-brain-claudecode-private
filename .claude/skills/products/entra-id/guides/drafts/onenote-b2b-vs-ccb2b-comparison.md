---
title: "B2B SAML/WS-Fed Federation vs Cross Cloud B2B Feature Comparison"
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Azure AD _ Ms Entra ID/Account management/B2B/Feature comparison with CC B2B.md"
product: entra-id
tags: [B2B, CCB2B, cross-cloud, direct-federation, SAML, WS-Fed, comparison]
21vApplicable: true
createdAt: "2026-04-18"
---

# B2B SAML/WS-Fed Federation vs Cross Cloud B2B

| Aspect | B2B SAML/WS-Fed IdP Federation (Direct Federation) | Cross Cloud B2B (CC B2B) |
|--------|-----------------------------------------------------|--------------------------|
| Description | Non-Microsoft Entra ID partner org federated directly to your tenant via SAML/WS-Fed IdP | Azure AD orgs in separate Microsoft Clouds collaborate (national <-> commercial) |
| Requirement | Complete direct federation setting on target tenant; DNS TXT record if domain != passive endpoint | Complete CC B2B setup on BOTH national and commercial tenant; invite remote users as guests |
| Sign-in Endpoint | portal.azure.cn/<tenantID> or myapps.windowsazure.cn/?tenantid=<tenantID> | Same endpoints |
| Auth Flow | User -> sign-in endpoint -> redirected to SAML/WS-Fed IdP for authentication | User -> sign-in endpoint -> redirected to public cloud tenant for authentication |
| Cross-cloud user sync compatibility | **Not compatible** - user sources of direct federation and cross-cloud user sync are different, objects cannot be merged | **Compatible** - user source of CC B2B and cross-cloud user sync are identical |

## Key Decision Point
- Use **Direct Federation** when partner uses a non-Microsoft IdP (e.g. ADFS, Okta)
- Use **CC B2B** when collaborating between Microsoft national and commercial clouds
- If you need cross-cloud user sync, **only CC B2B** is compatible
