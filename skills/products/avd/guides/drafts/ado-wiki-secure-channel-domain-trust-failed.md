---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Azure Network Connection/ErrorDomainTrustFailed"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Azure%20Network%20Connection/ErrorDomainTrustFailed"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Secure Channel Issues - Windows 365

**Author:** Joe Noyce

## Introduction
Windows secure channels enable encrypted communication between Cloud PCs and domain controllers. These channels are established by the NetLogon service when a device joins a domain, creating a machine account with a password that authenticates the device each time it restarts.

For Hybrid Azure AD joined Cloud PCs, network connectivity to on-premises domain controllers is required to maintain the secure channel. When this channel breaks, health checks will report `ErrorDomainTrustFailed` or `AVD Domain trust check failed`, preventing user connections.

**Important:** Secure channel issues are handled by the **Windows Directory Services team**. Windows 365 support provides initial troubleshooting only.
If issues persist after basic checks, escalate to the Directory Services team: **SAP Path - Routing Windows V3 > Windows Security Technologies > Secure channel issues**

---

## Possible Secure Channel Failure Causes
- **Network issues:** SSL inspection, blocked ports, or Network Virtual Appliances (NVAs like Zscaler) interfering with domain controller traffic
- **DNS misconfiguration:** vNET DNS settings not correctly configured
- **Snapshot restore:** Password reverted to old state after snapshot restore or refresh
- **Hybrid Azure AD Join:** Missing or misconfigured Azure AD Kerberos objects in Active Directory
- **Time synchronization:** Clock skew exceeding 5 minutes between Cloud PC and domain controller

---

## Health Check Indicators

```json
{
  "HealthCheckName": "DomainTrustCheck",
  "HealthCheckResult": "HealthCheckFailed",
  "AdditionalFailureDetails": {
    "ErrorCode": -2146233088,
    "Message": "SessionHost unhealthy: VerifyDomainTrust failed..."
  }
}
```

**System Event Log (Event ID 5719):**

```text
Log Name:      System
Source:        NETLOGON
Event ID:      5719
Level:         Error
Description:
This computer was not able to set up a secure session...
```

## Basic Customer Checks (Before Transfer/Collab)

### Network Configuration

- Verify vNET DNS server entries for the ANC point to the correct DNS servers (not public DNS)
- Ensure SSL inspection is not in use
- If using NVAs (Zscaler, Palo Alto, Fortinet): Configure exceptions for W365/AVD traffic
- Ensure required ports are open on the vNET used for the ANC:
  - Port 88 (Kerberos)
  - Port 389 (LDAP)
  - Port 445 (SMB)
  - Port 135 (RPC)
  - Port 53 (DNS)

### Basic Testing

**Important:** When secure channel is broken, customers typically **cannot connect** to their Cloud PC.

**If customer can still access the Cloud PC** (rare):
```powershell
Test-ComputerSecureChannel
# If returns False, attempt repair:
Test-ComputerSecureChannel -Repair
```

**If customer cannot access the Cloud PC:**
Confirm network/DNS configuration checks with customer's IT team and prepare for case collab/transfer.

## Known Third-Party Issues

**Zscaler:**
Zscaler SSL inspection or firewall policies can block domain controller traffic. Check Zscaler tunnel logs for denied connections to domain controllers. Ensure Zscaler has proper bypass rules configured for:
- Domain controller IP addresses/FQDNs
- Ports: 88, 389, 445, 135, 53
- No SSL inspection on domain authentication traffic

**Other NVAs:**
Similar issues can occur with Palo Alto, Fortinet, or other network security appliances performing deep packet inspection or SSL decryption.

---

## When to Escalate

Escalate to **Windows Directory Services team** when:

- Basic network and DNS configuration checks are confirmed correctly configured
- Customer continues to experience secure channel issues after configuration verification
- Event ID 5719 errors persist in Cloud PC event logs
- Health checks continue to show `ErrorDomainTrustFailed`

**Escalation Path:**
**SAP Path - Routing Windows V3 > Windows Security Technologies > Secure channel issues**

**Ensure warm handover includes:**

- Details of connection error or health check failure
- Confirmation of virtual network DNS configuration (LOS to DCs)
- Confirmation of required ports (88, 389, 445, 135, 53) are open
- NVA/Zscaler configuration status (bypasses configured)
- SSL inspection not enabled
- Results of `Test-ComputerSecureChannel` tests (if accessible)
- ASC IaaS disk logs, including details of Event ID 5719 from System event log
