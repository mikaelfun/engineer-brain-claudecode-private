# Dual Federation - Overview & Process

## What is Dual Federation

Dual Federation is an internal solution that allows a customer to federate one on-premises environment with both public Azure and Mooncake (21Vianet). It is the prerequisite for the Tango solution (O365 application level).

**Status**: Still available for new customers as long as requirements are fulfilled. Will be replaced by Cross-Cloud B2B when GA.

**PM Contact**: Guang Yang (as of 6/24/2025)

## CSS Handling Rules

1. Tell customer their request will be followed up by their CSAM
2. Contact CSAM to follow the process link
3. Bridge customer with CSAM or whoever in MS that can represent customer to submit the D-F request
4. Help representative understand requirements, but **DO NOT discuss requirements with customer directly**

## Request & Approval Process

| Scenario | Request Submit | Approval | Implementation |
| --- | --- | --- | --- |
| D-F for O365 | https://aka.ms/dual-federation-China | O365 PM -> D-F PM | Unknown |
| D-F for non-O365 (Azure/D365/PBI) | https://aka.ms/dual-federation-China | O365 PM -> D-F PM | Field team to look for CE |

**Process KB**: https://internal.evergreen.microsoft.com/en-us/topic/18726364-3236-7f9c-f3e5-ada57306c7b1

**Implementation Steps KB**: https://internal.evergreen.microsoft.com/en-us/topic/054ab2b8-ade3-87e0-e283-46cea3e02a67

## Implementation

- For D-F solution: CSAM should engage Microsoft Customer Engineer (CE)
- For Tango solution: O365 fast track team delivers (no longer available for new tenants)
- CSS assists when CE encounters issues during implementation

## Key Notes

- Mooncake is a totally isolated AAD instance from global Azure (unlike US Gov cloud)
- For customers NOT in the approved list, handle as normal customer - find root cause and identify if related to dual-federation config
- **Tango is deprecated** for new customers. Cross-cloud B2B is the recommended replacement.

## Related

- Cross-Cloud B2B (replacement solution)
- Tango (deprecated, FYI only)
