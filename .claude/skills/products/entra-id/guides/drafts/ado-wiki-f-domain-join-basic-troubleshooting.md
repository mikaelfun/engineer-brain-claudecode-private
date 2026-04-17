---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AskDS Blog Content/20250422 Domain Join and Basic troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAskDS%20Blog%20Content%2F20250422%20Domain%20Join%20and%20Basic%20troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Domain Join and Basic Troubleshooting

Originally posted on AskDS blog at [Domain Join and Basic troubleshooting | Microsoft Community Hub](https://techcommunity.microsoft.com/blog/askds/domain-join-and-basic-troubleshooting/4405860)

## Section 1: Prerequisites to Perform a Domain Join

(Note: These prerequisites primarily apply when performing a domain join over a network. For offline domain join, refer to [Offline Domain Join (Djoin.exe) Step-by-Step Guide](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/dd392267(v=ws.10)))

### 1-1. Network Connectivity

The device must communicate with a Domain Controller over the network. If remote, a VPN connection is necessary. The device must use the corporate DNS server (typically the DC).

Test DC discovery:
```
nltest /dsgetdc:contoso.com /force
```

**Working example:**
```
DC: \Cont-DC.contoso.com
Address: \192.168.2.100
Dom Name: contoso.com
Flags: PDC GC DS LDAP KDC TIMESERV WRITABLE DNS_DC DNS_DOMAIN DNS_FOREST
The command completed successfully
```

**Required ports:**

| Port | Protocol | Service |
|------|----------|---------|
| 53 | TCP/UDP | DNS |
| 389 | UDP | DC Locator (LDAP Ping) |
| 389 | TCP | LDAP Server |
| 88 | TCP | Kerberos |
| 135 | TCP | RPC |
| 445 | TCP | SMB |
| 1024-65535 | TCP | RPC Ephemeral |

### 1-2. Computer Name Requirements

- Adhere to [AD naming conventions](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/naming-conventions-for-computer-domain-site-ou#computer-names)
- Assign a unique hostname to prevent conflicts
- Be aware of domain join hardening when reusing existing computer accounts: [KB5020276](https://support.microsoft.com/en-us/topic/kb5020276-netjoin-domain-join-hardening-changes-2b65a0f3-1f4c-42ef-ac0f-1caaf421baf8)

### 1-3. User Credentials

By default, AD allows authenticated users to join 10 machine accounts. Users in Administrators or Domain Administrators groups are not restricted. Windows Home editions cannot join a domain.

## Section 2: Domain Join Workflow

### 2-1. DC Discovery

Client queries DNS for SRV record: `_ldap._tcp.dc._msdcs.<domain-name>`

Client sends LDAP Ping (UDP 389) to verify DC availability and discover client site.

### 2-2. LDAP Binding & Machine Name Verification

Client performs LDAP Bind (Kerberos auth) and searches CN=Computers or designated OU for existing computer name.

### 2-3. Computer Account Creation

Client initiates LDAP Add/Modify to create computer account. A unique SID is assigned, machine password is generated and stored both locally and in AD (auto-rotation every 30 days).

## Section 3: Frequent Causes of Domain Join Failures

### 3-1. Networking Issues

More than 50% of domain join failures are due to blocked ports. Most common: UDP 389 is overlooked.

**Error:** "The specified domain either does not exist or could not be contacted"

**Diagnosis:**
- TCP ports: `Test-NetConnection DC_FQDN -port <number>`
- UDP ports: `portqry -n DC_FQDN -p UDP -e 389` (download PortQryUI from Microsoft)

Reference: [Troubleshoot errors joining computers to domain](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/troubleshoot-errors-join-computer-to-domain)

### 3-2. Hostname Not Unique

**3-2-1. Same name in same domain (with exempted user):**
- Domain join succeeds but breaks existing computer's secure channel
- Existing computer gets: "The trust relationship between this workstation and the primary domain failed."
- Root cause: New machine password overwrites existing computer's password in AD

**3-2-2. Same name in forest (different domain):**
- Error: "The operation failed because SPN value provided for addition/modification is not unique forest wide."
- Root cause: HOST/ComputerName SPN must be forest-unique
- Fix: Delete existing object or rename workstation. Search global catalog before joining.

### 3-3. Domain Join Hardening (KB5020276)

- Error: "An account with the same name exists in Active Directory. Re-using the account was blocked by security policy."
- Fix: Delete existing object, get proper permissions, or use different name

### Deep Troubleshooting

Capture network trace and examine `C:\Windows\Debug\netsetup.log`.

Reference: [Active Directory domain join troubleshooting guidance](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/active-directory-domain-join-troubleshooting-guidance)
