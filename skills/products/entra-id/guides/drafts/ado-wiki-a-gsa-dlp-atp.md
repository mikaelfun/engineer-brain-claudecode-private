---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/GSA Data Loss Prevention"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGSA%20Data%20Loss%20Prevention"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GSA Data Loss Prevention (DLP) / Advanced Threat Protection (ATP)

## Summary

Microsoft Security Service Edge (SSE) with Netskope provides organizations a multi-layered security approach. Microsoft SSE, in collaboration with Netskope, offers a comprehensive threat protection framework using signature-based antivirus, web IPS, and ML-based detection. This article covers DLP policy creation, troubleshooting, and Netskope support engagement.

## Case Handling

| Scenario | Queue | SAP |
|---|---|---|
| Internet traffic | Azure Networking | Azure/Global Secure Access/Internet or M365 access/* |
| Web content filtering policy | Azure Networking | Azure/Global Secure Access/Internet or M365 access/Web content filtering policies |
| Configure TLS Inspection | Azure Networking | Azure/Global Secure Access/Internet or M365 access/Configure TLS Inspection |
| Manage TLS Certificate in Key Vault | Identity - Object and Principal Management | Azure/Global Secure Access/Internet or M365 access/Manage TLS Certificate in Key Vault |
| TLS Inspection policies | Azure Networking | Azure/Global Secure Access/Internet or M365 access/TLS Inspection policies |
| ATP policies | Azure Networking | Azure/Global Secure Access/Internet or M365 access/Advanced Threat Protection policies |
| DLP policies | Azure Networking | Azure/Global Secure Access/Internet or M365 access/Data Loss Prevention policies |
| GSA Policy API CRUD issues | Identity - Hybrid Auth Experiences | Azure/Global Secure Access/GSA Logs/Unable to view Alerts or Traffic logs in portal |

## Requirements

### Licenses
- Microsoft Entra Suite or Microsoft Entra Internet Access required
- Netskope functionality requires Internet Access add-on license

### Roles
- Global Secure Access Administrator for policy management
- Conditional Access Administrator for CA policies

## Known Issues

### Issue 1: Events missing from Alerts blade
Alert appears in Traffic logs but not in Alerts blade. Collect createdDateTime and transactionId from Traffic log event details. The transactionId maps to partnerTransactionId in Alerts blade.

**Solution:** Query TalonOperationEvent to check if VendorName contains "Netskope". If present, check securityProfileMetadata for Netskope response. If alert still missing, file ICM to GSA Control Plane.

### Issue 2: "Your connection isn't private" for All TLS Connections (NET::ERR_CERT_AUTHORITY_INVALID)
Every TLS connection fails. Stopping Global Secure Access Engine Service resolves it. Intune sync may also fail with 0x80072f8f.

**Solution:** Download .CER file from TLS Inspection tab (Settings > Session management > TLS Inspection) and import to Trusted Root Certificate store of client computer.

### Issue 3: Intune sync fails with 0x80190194 (404) during TLS inspection
Intune traffic intercepted as Internet traffic when it should be M365.

**Solution:** Create Custom Bypass rule: Connect > Traffic forwarding > Internet access profile > Custom Bypass > Add rule. FQDN: `checkin.dm.microsoft.com,r.manage.microsoft.com`. Save and restart GSA client.

### Issue 4: Windows Update fails with 0x801901f6 during TLS inspection
Windows Update traffic incorrectly intercepted by TLS inspection.

**Solution:** Create Custom Bypass rule. FQDN: `fe2cr.update.microsoft.com,slscr.update.microsoft.com,fe3cr.delivery.mp.microsoft.com`. Save and restart GSA client.

## Setup Steps

### Step 1: Enable Internet access traffic profile
### Step 2: Enable TLS Termination
- Create a Key Vault, obtain CA Certificate, upload to Key Vault, enable TLS Inspection
### Step 3: Enable DLP Policy
- Activate the Netskope Offer, create a DLP Policy
### Step 4: Link DLP Policy to a Security Profile
### Step 5: Assign Security Profile to Users with CA Policy
### Step 6: Verify the Configuration
### Step 7: Test DLP

## Troubleshooting

### TLS Troubleshooting Steps

1. Verify tenant has onboarded to TLS (check TLS Inspection tab in ASC under Global Secure Access)
2. Verify TLS interception in Kusto:
   ```kql
   TalonOperationEvent
   | where FilterChain contains "tls-intercept"
   | where Vendors contains "Netskope"
   | project TIMESTAMP, TlsAction, TenantId
   ```
3. If TlsAction is not "Intercepted", check TLS policy assignment (Baseline profile or CA-linked security profile)
4. Certificate upload/policy change errors → Control Plane issue → Identity support
5. Certificate not trusted → Add public .cer from Session Management > TLS Inspection to trusted root store

### ATP and DLP Troubleshooting Steps

#### Scenario 1: Security checks are not applied

1. **Collect Flow Correlation Id**: Ask user to reproduce with traffic recording enabled (GSA client > Advanced Diagnostics > Traffic Tab > Start Recording). Get Correlation vector IDs.

2. **Verify TLS interception**:
   ```kql
   TalonOperationEvent
   | where FlowCorrelationId == "<correlation-id>"
   | project FilterChain, TenantId, DestinationFqdn, FlowCorrelationId
   ```
   Check TlsAction field: "intercepted" = OK, "bypassed" = TLS not applied.

3. **Check if traffic routed to Netskope**:
   ```kql
   TalonOperationEvent
   | where FlowCorrelationId == "<correlation-id>"
   | where Vendors contains "Netskope"
   | project TIMESTAMP, TenantId, Vendors
   ```
   Empty result = no ATP/DLP policies for user or GSA service failed to route.

4. **Debug routing failure**: Check for expired GICA certificate in Kusto logs.

#### Scenario 2: App responds with error message
App receives error from security check. Collect error details and Flow Correlation Id. Check if block action matches policy intent.

#### Scenario 3: Customer complains about latency
App takes longer than usual. Collect timing info and Flow Correlation Id. Check if traffic is being double-processed.

### ASC Tools

- **Global Secure Access tab**: Global Settings, Policies, TLS Inspection, 3P Policies, Third Party Offerings
- **Graph Explorer tab**: Query activated offerings, TLS config, security profiles, policies, alerts, traffic logs
- **Kusto Web UX** (cluster: idsharedwus, DB: NaasProd): Alerts log, policy management, certificate management, DLP policy management, Internet traffic debugging (TalonOperationEvent)

### Key Kusto Queries

**Alerts log:**
```kql
AlertEvent
| where TenantId == "<tenant-id>"
| project TIMESTAMP, AlertType, Severity, Description
```

**Internet Traffic debugging:**
```kql
TalonOperationEvent
| where TenantId == "<tenant-id>"
| project TIMESTAMP, DestinationFqdn, TlsAction, Vendors, FilterChain
```

## Netskope Support Engagement

For issues confirmed to be on the Netskope side (traffic routed but policy not enforced), engage Netskope support via ICM.

## ICM Paths

| Area | IcM Path |
|---|---|
| Threat Protection Policy | GSA Control Plane |
| TLS Inspection | GSA Control Plane |
| Data Loss Prevention | GSA Control Plane |
| Alerts | GSA Control Plane |
| GSA Datapath | GSA Datapath |

## Training

### TLS Inspection
- Deep Dive 239905 - Global Secure Access Transport Layer Security inspection

### ATP & DLP
- Deep Dive AMERS and EMEA Global Secure Access - Advanced Threat Protection ATP & Data Loss Prevention DLP with Netskope
- Deep Dive APAC Global Secure Access - ATP & DLP with Netskope
