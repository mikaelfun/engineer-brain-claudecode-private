---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/TSG Application Gateway TLS Deprecation"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FTSG%20Application%20Gateway%20TLS%20Deprecation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting Guide for TLS Deprecation in Application Gateway

[[_TOC_]]

## Overview
This is required to align with the Azure-wide retirement of TLS versions (1.0 and 1.1) for enhanced security measures. We need to deprecate these TLS versions in Application Gateway both for the frontend and backend connections that Application Gateway makes.

### What policies are getting deprecated?
`AppGwSslPolicy20150501` and `AppGwSslPolicy20170401` will be deprecated as they are on TLSv1.0 and 1.1. Custom policy will get rid of TLSv1_0 and TLSv1_1 as Min Protocol version.

In Portal, a warning message will be displayed when customer selects deprecated policies/tls versions. All UX methods, including Portal, will see an error message from NRP if a deprecated policy/version is selected.

## Notes
- Auto Scale/Manual Scale in/out operations won't be impacted
- Gateways with Default Predefined policy will be auto upgraded to `AppGwSslPolicy20220101` policy post any PUT call from Customer.

## Rollout Plan

### Phase 1
NRP validations/changes wherein:
- The deprecating policies will render the resource in a **FAILED** state.
- Gateways that have `defaultPredefinedSslPolicy` as `AppGwSslPolicy20150501` will be auto updated to `AppGwSslPolicy20220101` (except if listener-specific SSL Profile is configured).
- Autoscale operations will NOT be affected by this enforcement.
- Note: Customers who have been granted one month's extension will NOT see any control or data plane impact until the committed timeline.

### Phase 2
Cleanup of deprecated configs such that all their existence will be erased from all the systems.

## How to Mitigate Customers in Failed State / Datapath Issues

- Customers have to choose a different SSL policy which is not deprecated. **Recommended: `AppGwSslPolicy20220101`**.
- If customer backends won't support TLSv1.3, issues may occur with `AppGwSslPolicy20220101`. In that case, ask customers to choose `AppGwSslPolicy20170401S` or Custom policy with TLSv1.2.
- Handshake failure error would be visible in `BackendServerDiagnosticHistory` logs with message: `"SSL/TLS protocol version mismatch. Please check the backend server's SSL/TLS configuration."` in case backends only support TLSv1.0 or 1.1.

## Mitigation for Control Plane Issues

- Approve AFEC - `DisableApplicationGatewayTlsDeprecation` using "Approve feature registration" for that subscription. This might require additional ACIS JIT.

## Mitigation for Data Path Issues

- Update Tenant settings to false for that gateway:
```json
{
  "update": {
    "EnableTLSProtocolMinversion1_2": {"value": false}
  },
  "method": {"fastPath": "true"}
}
```

## FAQs

- [TLS 1.0 and 1.1 retirement on Azure Application Gateway | Microsoft Learn](https://learn.microsoft.com/en-us/azure/application-gateway/application-gateway-tls-version-retirement#identification-methods)
