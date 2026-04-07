# ENTRA-ID On-Premises AD/LDAP — Detailed Troubleshooting Guide

**Entries**: 183 | **Drafts fused**: 71 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-ad-forest-restore.md, ado-wiki-a-ad-replication-general-approach-troubleshooting.md, ado-wiki-a-ad-replication-unknown-solution-investigation.md, ado-wiki-a-dc-lsass-high-memory-data-analysis.md, ado-wiki-a-dc-lsass-high-memory-data-collection-adperf.md, ado-wiki-a-dc-lsass-high-memory-data-collection-tss.md, ado-wiki-a-dfsr-cloning.md, ado-wiki-a-dfsr-event-log-verbosity.md, ado-wiki-a-dfsr-unknown-solution-investigation.md, ado-wiki-a-dfsrdiag-syntax.md
**Generated**: 2026-04-07

---

## Phase 1: Dfsr
> 22 related entries

### DFSR server offline for more than 60 days causes stale data to replicate and overwrite live files, or previously deleted files reappear after the s...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: DFSR tombstone garbage collection is hard-coded to 60 days. If a member is offline beyond this period, tombstones are purged and the member cannot reliably reconcile deletions, similar to Active Directory lingering objects.

**Solution**: Enable content freshness protection on all DFSR servers (Windows Server 2008 R2+). When triggered, Event ID 4012 blocks replication and requires admin intervention to restore. See blog: Implementing Content Freshness protection in DFSR. Plan re-seeding for members offline >60 days.

---

### DFSR replication fails with large backlog on downstream servers. FSRM (File Server Resource Manager) quotas or file screens prevent DFSR from writi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: FSRM quotas enforced on replicated folders block DFSR internal write operations. FSRM file screens can also interfere with DFSR staging and file installation.

**Solution**: Review and adjust FSRM quotas and file screens on volumes hosting DFSR replicated folders. Ensure DFSR staging and database paths are excluded from FSRM enforcement. Reference KB959210 for DFSR/FSRM interaction issues.

---

### DFSR health check topology errors, staging issues, and database problems after configuring one-way replication connections. Disabled connections fo...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: One-way replication connections are unsupported in DFSR. Replication connections must exist in both directions between partners. Disabling connections beyond the 60-day tombstone lifetime is also unsupported.

**Solution**: Use read-only replicated folders instead of one-way connections to achieve effective one-way replication. Follow recovery steps in AskDS blog: Recovering from unsupported one-way replication in DFSR.

---

### DFSR replication halts for entire server when staging quota is exceeded with more than 15 concurrent inbound files or 16 outbound RPC requests. All...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Staging area quota is too small for the volume of replicated data. When exceeded with >=15 inbound tasks, staging cleanup uses 1 task and all 15 remaining wait, blocking further replication. With >=16 outbound, all RPC slots are consumed waiting for cleanup.

**Solution**: Increase staging quota size to match or exceed the size of commonly modified/created data. Monitor staging usage. Larger staging reduces CPU/disk overhead from constant purge/reload cycles. Use DFS Management snap-in or PowerShell to adjust staging quota per replicated folder.

---

### DFSR performance degradation or replication failures caused by antivirus software scanning DFSR database and working folders under System Volume In...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Antivirus real-time scanning of DFSR JET database files, staging files, and working folders interferes with DFSR service I/O operations, causing locks, timeouts, or corruption.

**Solution**: Configure antivirus exclusions for DFSR database path (\System Volume Information\DFSR per volume). Exclude specific files: $db_normal$, FileIDTable_*, SimilarityTable_*, *.xml, $db_dirty$, $db_clean$, $db_lost$, Dfsr.db, Fsr.chk, *.frx, *.log, Fsr*.jrs, Tmp.edb. Also exclude staging and ConflictAndDeleted folders. Reference KB822158.

---

### DFSR replication fails between partners with Event ID 5008 (error 1722: RPC server unavailable) and Event ID 5014 (error 1726: remote procedure cal...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TCP/IP connectivity failure between DFSR replication partners. The downstream server cannot establish RPC connection to the upstream server through the endpoint mapper (port 135) or the dynamic RPC port. Causes include firewall blocking, network misconfiguration, or partner server being unreachable.

**Solution**: Restore TCP/IP connectivity between systems. Use RPCDump to verify endpoint mapper registration and dynamic port availability. Capture network traces filtering on partner IP and port 135 (filter: ipv4.address==<partnerIP> && tcp.port==135), then filter on the dynamic port returned. Check for TCP SYN retransmits (Property.TCPSynRetransmit==1). Provide captures to networking team as proof of the connectivity issue.

---

### DFSR replication fails or exhibits anomalous behavior with no obvious errors in event/debug logs, network connectivity and configuration appear cor...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Third-party filter drivers (CrowdStrike, Symantec, McAfee, Carbon Black, FireEye, Kaspersky, Trend Micro) interfere with DFSR file operations on replicated volumes

**Solution**: Run fltmc or fltmc instances to identify loaded filter drivers on replicated volumes. Set AV exclusions, temporarily uninstall suspect applications to test. If uninstalling resolves the issue and reinstalling reproduces it, direct customer to the third-party vendor.

---

### DFSR replication issues potentially caused by antivirus scanning the DFSR working directory under System Volume Information
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Antivirus software scanning the hidden %drive%\System Volume Information\DFSR folder and subfolders, interfering with DFSR service local configuration data

**Solution**: Exclude %drive%\System Volume Information\DFSR and all subfolders from antivirus scanning. Also exclude DFS files in SYSVOL replica sets. Educate customer that this folder contains local configuration data accessed only by Local System account and DFSR service.

---

### Access Denied errors in DFSR debug logs; DFSR replication failures when hard file quotas are configured on replicated folders
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Aggressive or hard file quotas cause replication to exceed quota when files from multiple members converge (e.g., two members each adding files that together exceed quota limit)

**Solution**: Ensure DfsrPrivate hidden folder is not subject to quotas or file screens. Use hard quotas with caution on replicated folders. Ensure FSRM file screening settings match on both ends of the replication.

---

### DFSR performance degradation or self-inflicted denial of service when backlog is checked too frequently via PowerShell or DFSRDIAG
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Aggressive backlog monitoring (Get-DfsrBacklog or DFSRDIAG Backlog run too frequently) consumes DFSR service resources and degrades replication performance

**Solution**: Educate customers not to check backlogs more often than every 4 hours. Once or twice daily is sufficient for normal monitoring. Use caution when running backlogs during active troubleshooting.

---

## Phase 2: Ldap
> 16 related entries

### LDAP paged search fails with error '00000057: LdapErr: DSID-xxxxxxxx, comment: Error processing control, data 0'. Applications cannot continue page...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: LDAP server cookie pool exceeded administrator limits (MaxResultSetSize default 262144 bytes or MaxResultSetsPerConn default 10), causing stored cookies to be evicted from server cache. Client continuation cookie becomes invalid when server discards it.

**Solution**: Enable NTDS diagnostics category 16 (LDAP Interface) at level 2 to get events 2898/2899. If event 2898 (per-connection limit): increase MaxResultSetsPerConn to 25+ in LDAP Policy. If event 2899 (total pool size): increase MaxResultSetSize to >=250MB on DCs with sufficient RAM. Review application design for excessive/repetitive paged queries. Consider adding more replicated DC instances to distribute load.

---

### LDAP over SSL (LDAPS) connection fails with Schannel event 36884 on the domain controller
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: An entry in the hosts file causes the SSL/TLS certificate validation to fail during the LDAPS handshake

**Solution**: Check the hosts file on the DC for incorrect entries that may interfere with certificate validation. Remove or correct the problematic hosts file entry. Ref: KB 4299022

---

### LDAP simple bind fails with error 80090308 immediately after raising Domain Functional Level (DFL) to Windows Server 2012 R2
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: DFL upgrade to 2012R2 changes authentication requirements; simple bind over non-SSL connections may be blocked by new security policies

**Solution**: Enable LDAPS or use SASL bind instead of simple bind. Alternatively, review and adjust LDAP authentication policies after DFL upgrade. Ref: KB 5022801

---

### Third-party LDAP client (e.g., Linux/Java app) fails LDAPS connection when using domain FQDN instead of DC hostname; certificate SAN only contains ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The domain controller certificate Subject Alternative Name (SAN) contains only the DC FQDN, not the domain FQDN. Third-party clients validate hostname against SAN and reject the cert

**Solution**: Either configure the client to connect using the DC hostname instead of domain FQDN, or issue a new certificate that includes the domain FQDN in the SAN field

---

### LDAP client receives error code 0x65 (timeout) when connecting to Active Directory domain controller
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TCP-level connectivity issue prevents the LDAP client from reaching the server within the timeout period; common causes include firewall rules, network latency, or port blocking (389/636/3268/3269)

**Solution**: Check network connectivity between client and DC: verify firewall rules allow LDAP ports (TCP/UDP 389, TCP 636, TCP 3268/3269), test with telnet/portqry, capture network trace to identify where connection drops

---

### LDAPS connection fails when the domain controller certificate is issued from a Certificate Authority (CA) in a different forest
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Cross-forest CA trust is not automatically established; the LDAP client trust store does not contain the root CA certificate from the other forest

**Solution**: Import the root CA certificate from the other forest into the client trusted root certificate store. Ensure the full certificate chain is available. Ref: KB 4316681

---

### Java-based application fails LDAP operations due to LDAP referrals being returned by Active Directory
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AD returns LDAP referrals for cross-domain or cross-partition queries; Java LDAP client (JNDI) follows referrals by default and may fail if it cannot resolve or authenticate to the referred server

**Solution**: Configure the Java application to ignore LDAP referrals (set Context.REFERRAL to 'ignore') or ensure the application can authenticate to all referred DCs. Use specific DC targeting instead of domain-level queries. Ref: KB 4078361

---

### LDAP DirSync synchronization client never completes when using a linked value attribute (e.g., member) in the LDAP search filter
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: DirSync control has a known limitation where linked value attributes in the search filter cause the sync operation to hang or never return results

**Solution**: Remove linked value attributes from the DirSync search filter. Use a post-filter approach: retrieve all objects via DirSync without the linked attribute filter, then filter client-side. Ref: KB 4294771

---

### LDAP search for memberOf attribute incorrectly terminates with DIR_ERROR on Windows Server 2016 or later domain controllers
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug in Windows Server 2016+ LDAP implementation causes incorrect DIR_ERROR when querying memberOf attribute under certain conditions

**Solution**: Apply the latest cumulative update for Windows Server. Check for KB 4494478 hotfix. As workaround, use alternative query approach (e.g., query group membership from the group object instead)

---

### LDAP Undelete operation or adding/removing objectclass inetOrgPerson fails with error 0x207d ERROR_DS_ATT_NOT_DEF_FOR_CLASS
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The inetOrgPerson objectclass has attribute constraints that conflict with the undelete or class change operation in Active Directory

**Solution**: Verify the target object schema compatibility. For undelete, ensure all required attributes are present for the restored object class. Ref: KB 4494710

---

## Phase 3: Ad Replication
> 12 related entries

### AD replication error 8451: the domain controller encounters a problem with the Active Directory database during replication. Event logs may show ES...
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: Active Directory database (ntds.dit) corruption or inconsistency on the affected domain controller. May be caused by hardware/storage failures, unexpected shutdowns, or file system errors.

**Solution**: 1) Try semantic database analysis (ntdsutil) to check database integrity. 2) Run offline defragmentation (ntdsutil) which creates a new clean database file. 3) If analysis/defrag fails or issue recurs, demote the affected DC and re-promote it. This is often the quickest resolution for one-time occurrences.

---

### AD replication fails with error 8464 (Synchronization attempt failed). Global Catalog DCs have stale Partial Attribute Set (PAS) that does not matc...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The partialAttributeSet on read-only partitions became out of sync with the schema due to prolonged replication failures, neglected replication health monitoring, or operational practices like lag sites, offline sites, and firewalls blocking replication.

**Solution**: Use Get-PAS.ps1 script or repadmin /showattr to compare each GC partition cAttrs count against schema PAS count. For mismatched partitions: 1) repadmin /options DC +DISABLE_NTDSCONN_XLATE, 2) repadmin /unhost DC partition, 3) repadmin /add partition DC knownGoodSource, 4) verify PAS matches schema, 5) repadmin /options DC -DISABLE_NTDSCONN_XLATE. Note: fixing gateway DCs may expose additional DCs behind them with bad data.

---

### AD replication error 1256 (Remote Server is Unavailable) logged in repadmin /showrepl output alongside other errors like 1722 or 1726
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Error 1256 is a secondary/cascading error. It occurs when a prior partition replication already failed, so the system skips attempting replication for this partition knowing it will fail. The real issue is the underlying error (e.g., 1722, 1726).

**Solution**: Ignore error 1256 and focus on resolving the other replication errors (commonly 1722 or 1726). Once the primary error is resolved, 1256 will stop appearing. Reference: https://learn.microsoft.com/troubleshoot/windows-server/active-directory/active-directory-replication-error-1256

---

### AD replication fails with error 1726 (RPC call cancelled) or error 1727 (RPC call failed). The two DCs can communicate over RPC initially but some ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Network-related failure where an intermediate network device (firewall, IDS/IPS, WAN optimizer) is performing packet inspection or dropping large-size packets during RPC communication between domain controllers.

**Solution**: Capture two-sided simultaneous network traces on both domain controllers, then force replication while tracing. Examine traces for dropped, inspected, or modified packets. Engage the network team to identify the intermediate device causing the issue. Reference: https://learn.microsoft.com/troubleshoot/windows-server/active-directory/remote-procedure-call-failed-and-did-not-execute-error

---

### AD replication error 8606: Insufficient attributes were given to create an object. Source DC sends update for an object that does not exist on dest...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Lingering objects exist on the source domain controller. An object was deleted and garbage collected on the destination DC, but the source DC still has a live copy (did not replicate the deletion within tombstone lifetime). Destination DC configured for strict replication consistency blocks the update.

**Solution**: 1) Use Lingering Object Liquidator (LOL) tool to identify and remove lingering objects across the forest. 2) Alternatively use repadmin /removelingeringobjects <LingeringDC> <ReferenceDC_DSA_GUID> <Partition> to remove them manually. 3) Use repldiag /removelingeringobjects for automated removal. 4) Verify strict replication consistency is enabled (repadmin /regkey * +strict).

---

### AD replication error 1908: Could not find the domain controller for this domain. Netlogon cannot locate a DC advertising the KDC flag. nltest /dsge...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Broken DNS delegation for the child domain. DNS queries for _kerberos._tcp.dc._msdcs.child.domain SRV records fail because the parent zone has a broken or stale delegation to a non-functional DNS server for the child zone.

**Solution**: 1) Enable verbose Netlogon logging: nltest /dbflag:2080ffff. 2) Review Netlogon.log for DsGetDcName failures. 3) Run dcdiag /test:dns /dnsdelegation to identify broken delegations. 4) Fix DNS delegation in the parent zone to point to a valid, functional DNS server hosting the child zone. 5) Verify with nltest /dsgetdc:<child> /kdc.

---

### AD replication error 8453: Replication access was denied. RODC fails to advertise as Global Catalog. Event 1926 logged in Directory Service event l...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Enterprise Read-Only Domain Controllers security group is missing the Replicating Directory Changes permission on the cross-domain partition. This ACE is normally added during RODCPREP but may be missing if the infrastructure master was unavailable during that process.

**Solution**: 1) Open ADSIEDIT.msc on a writable DC hosting the affected partition. 2) Right-click the partition DN > Properties > Security. 3) Add Enterprise Read-Only Domain Controllers group. 4) Clear default Read permissions, grant only Replicating Directory Changes. 5) Run repadmin kcc <RODC> to trigger topology recalculation. 6) Verify RODC can now replicate the partition and advertise as GC.

---

### USN rollback detected on domain controller. Event ID 2095 logged in Directory Service event log. Netlogon service is paused. Partner DCs refuse to ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Domain controller was restored using an unsupported method (e.g., VM snapshot restore on pre-2012 Server or unsupported hypervisor). The restored DC has USN values that conflict with what replication partners have already acknowledged, causing replication inconsistency.

**Solution**: The supported recovery method is to forcefully demote the affected DC (dcpromo /forceremoval) and re-promote it, or restore from a supported backup (Windows Server Backup with AD-aware VSS writer). Starting with Server 2012 on supported hypervisors, snapshot restores are supported via VM-GenerationID mechanism. Check registry NTDS Parameters Dsa Not Writable = 0x4 to confirm USN rollback.

---

### AD replication failures and lingering objects after implementing firewall rules or RPC port restrictions between Domain Controllers. Replication mo...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Overzealous firewall/ACL configuration restricting RPC dynamic port ranges (49152-65535) between DCs. DC isolation via separate sites, lag sites, or Bridge All Site Links misconfiguration gives KCC incorrect topology information for replication path calculation.

**Solution**: Ensure all DCs in the forest can communicate on all required AD ports including full RPC dynamic range. Do not restrict RPC port ranges on DCs. Do not permanently isolate DCs or create lag sites. Let KCC manage replication topology. Verify replication monitoring alerts are active and not fatigued.

---

### AD replication error 8614: The Active Directory cannot replicate with this server because the time since the last replication with this server has ...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Replication between domain controllers has not occurred for a period exceeding the tombstone lifetime (default 60 or 180 days). This can happen due to prolonged network isolation, suspended virtual DC, or unresolved replication errors left unattended.

**Solution**: Follow KB2020053 for remediation. Key considerations: verify if enough recent backups exist for forest recovery, check if multiple DCs/domains are affected, determine if virtual DCs had snapshot restores. If DC was isolated beyond tombstone lifetime, it must be forcefully demoted and re-promoted rather than allowed to replicate stale data.

---

## Phase 4: Dc Promotion
> 12 related entries

### DC promotion fails with error 'An Active Directory domain controller for domain contoso.com could not be contacted' when promoting a server to DC i...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: UDP port 389 (LDAP/NETLOGON) is blocked to existing Domain Controllers, DNS SRV record queries fail for the domain, or RPC port range is blocked between the member server and target DC

**Solution**: Collect network packet capture (netsh trace start capture=yes) while reproducing the failure. Review DCPROMO.LOG and dcpromoui.log in %windir%\debug for HRESULT and exit codes. Use 'nltest /dsgetdc:<domain>' to verify DC reachability. Check DNS SRV records resolution and UDP 389 NETLOGON PING responses. Look for TCP retransmits (Property.TCPRetransmit==1) in network trace. Resolve the network-level blocking (firewall/port rules) identified in the capture.

---

### DC promotion Prerequisites Check fails with error 'The RPC server is unavailable' (HRESULT 0x800706BA) when promoting a server to Domain Controller...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: RPC and Dynamic RPC port range is blocked between the server and existing Domain Controllers. The prerequisite check uses WMI calls that require RPC connectivity, which fails when blocked by firewall rules.

**Solution**: Collect simultaneous network packet captures from both source and target to identify where TCP retransmits to the Endpoint Mapper (port 135) or dynamic RPC ports occur. Review DCPromoUI.log for 0x800706BA errors. Check if RPC port range has been modified (see MS KB on configuring RPC dynamic port allocation with firewalls). Verify all AD-required ports are open per Microsoft service overview and network port requirements. Consider restricting AD RPC traffic to specific port if needed.

---

### Domain controller promotion fails with error 'Could not logon to the domain with the specified credential. Supply a valid credential and try again'...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Multiple possible causes: wrong username/password, user is not an Enterprise Admin, stale metadata for a computer with the same name or IP, unhealthy secure channel, or communication issue due to blocked ports or security software.

**Solution**: Verify credentials are correct and user has Enterprise Admin membership. Check for stale computer objects with the same name. Verify secure channel health with 'nltest /sc_verify'. Ensure required ports (LDAP 389, RPC 135, etc.) are not blocked by firewall or security software.

---

### Domain controller promotion using Server Manager fails with error 'The server is not operational'.
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: NTLM authentication is disabled either in the domain or on the domain controllers. Server Manager relies on NTLM authentication to browse the AD DS forest when promoting a non-domain-joined server.

**Solution**: Join the server to the domain first, then configure it to be a domain controller. Server Manager will use Kerberos instead of NTLM authentication to browse the AD DS forest.

---

### Domain controller promotion fails with error 'The filename, directory name, or volume label syntax is incorrect'. dcpromoui.log shows 8007007B = ER...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The source DC name does not have a Fully Qualified Domain Name (FQDN). The promotion process requires FQDN format for the source domain controller name.

**Solution**: Change the source DC name so that it has a Fully Qualified Domain Name (FQDN). Ensure DNS resolution is working correctly for the source DC.

---

### Domain controller promotion fails with error 'An attempt was made to add an object with a name that is already in use'. dcpromo.log shows error 830...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The NetBIOS name of the promoted DC is identical to the CN (Common Name) of another object already existing in the Active Directory database.

**Solution**: Rename the server to use a unique NetBIOS name that does not conflict with any existing CN in Active Directory, or remove/rename the conflicting object.

---

### Domain controller promotion fails with 'Verification of prerequisites for Domain Controller promotion failed. The TCP/IP networking protocol must b...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The interface metric of the physical NIC is larger than the value for the Loopback Pseudo-Interface. DC promotion requires the physical adapter to have a lower metric than the loopback interface.

**Solution**: Set the metric of the physical NIC lower than the Loopback Interface using: netsh int ipv4 set interface <InterfaceIndex> metric=<LowerValue>

---

### Domain controller promotion fails with 'Failed to find a DC for domain contoso: 5' (Access is denied). dcpromo.log shows 'Failed to get domain cont...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: 'NT AUTHORITY\Authenticated Users' is missing from the 'Access this computer from the network' user right within the Default Domain Controller Policy.

**Solution**: Add 'NT AUTHORITY\Authenticated Users' back to the 'Access this computer from the network' user right in the Default Domain Controller Policy GPO.

---

### Domain controller promotion hangs when using short (flat/NetBIOS) credential names in a NetBIOS-less/WINS-less environment. dcpromoui.log shows RPC...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Flat credential names were specified in an environment without NetBIOS or WINS name resolution. The promotion process cannot resolve the domain controller using short names.

**Solution**: Use fully qualified (long) credentials (e.g., domain.com\admin instead of DOMAIN\admin). Alternatively, join the computer as a domain member prior to promotion, or enable NetBIOS over TCP/IP (note: this will not help in Azure as it does not support multicast).

---

### Domain controller promotion gets stuck at 'Creating the NTDS Settings object for this Active Directory Domain Controller on the remote AD DC Server...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Timeout due to communication issues on port 135 (RPC endpoint mapper). The 6to4 adapter may be interfering with network communication between the server being promoted and the remote DC.

**Solution**: Disable the 6to4 adapter by running: netsh int 6to4 set state disabled. Also verify that RPC port 135 and dynamic RPC ports are not blocked by firewall.

---

## Phase 5: Lsass High Cpu
> 11 related entries

### Domain Controllers experience random high CPU (90%+) in LSASS process; end-users and application owners report LDAP queries taking long time to com...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Multiple clients simultaneously running costly LDAP queries using LDAP_MATCHING_RULE_IN_CHAIN operator, starting at domain root with deep recursive searches across group memberships, repeated frequently from various clients

**Solution**: 1) Collect AD Data Collector Set (TSS) during high CPU state. 2) Analyze HTML report: check CPU breakdown under Directory Services tab -> Unique Searches section for LDAP_MATCHING_RULE_IN_CHAIN filter patterns. 3) Identify top callers by IP/client using AD ETL 1644 events or Event1644Reader.PS1 parser. 4) Contact service account owner to determine application usage. 5) Remediation: optimize LDAP queries on client/application side (local caching, stagger query schedules, use more efficient filter

---

### Domain Controller experiences high CPU (75%+) in LSASS during peak logon times (e.g. 9-10AM); LDAP queries for contact attributes (telephoneNumber,...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Applications (e.g. Cisco Jabber VoIP) performing LDAP queries against non-indexed AD attributes (telephoneNumber, otherTelephone etc.) with deep searches starting at domain root, causing full directory scans during peak usage

**Solution**: 1) Collect AD Data Collector Set during high CPU window. 2) Analyze HTML report: check Directory Services > LDAP success code CPU %, then 'Clients with Most CPU when Searching' to identify query filters with unindexed attributes. 3) Enable 1644 event logging (Field Engineering=5 + Inefficient Search Results Threshold=50ms) to capture expensive queries. 4) Identify the application making these queries (e.g. Cisco Jabber). 5) Index the required AD attributes per application needs: https://techcomm

---

### Domain Controllers experience random high CPU (80%+) in LSASS process; LSA LookupSids consuming 69%+ of LSASS CPU with SAM workload from SID lookup...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Application(s) on one or more clients sending excessive LsarLookupSids2 (opnum-57) requests with arrays of 500 SIDs per request in rapid succession, generating massive SAM lookup workload on the DC

**Solution**: 1) Collect AD Data Collector Set during high CPU. 2) Analyze HTML report: check LSA Lookup Sids section for CPU % and request rates. 3) Process LSP.log with ADPERF LSP WPA Profile to identify source IPs and SID array sizes per request. 4) Use network trace with filter (lsarpc.opnum == 57 || dcerpc.opnum == 57) on client side to identify the process ID making requests. 5) Cross-reference PID with tasklist.txt to identify the application. 6) Engage app owner to optimize: implement SID caching, red

---

### LSASS.exe high CPU on domain controller caused by excessive SAM EnumUsersInDomain calls originating from the DC itself. WMI queries for Win32_UserA...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Third-party product CheckPoint firewall with Identity Awareness feature enabled issues massive WMI queries targeting Win32_UserAccount class on the domain controller. Each query triggers SamEnumerateUsersInDomain API call which is expensive in large domains. Queries come from CheckPoint appliance IP via RPC/DCOM to WmiPrvSE on the DC.

**Solution**: Identify source IP from Xperf call stacks (OSF_SCALL frame shows Client Endpoint IP) or network traces (MSRPC Auth3 frame reveals authenticating user, ExecQuery frame shows WMI query). Disable or disconnect CheckPoint Identity Awareness feature. Contact CheckPoint support for proper configuration.

---

### Cisco Jabber LDAP queries execute slowly and cause high CPU on domain controllers. LDAP queries issued by Jabber use non-indexed attributes, result...
**Score**: 🔵 7.0 | **Source**: ADO Wiki

**Root Cause**: Cisco Jabber issues LDAP queries against Active Directory using non-indexed attributes. Without proper indexing, each query requires scanning the entire directory, causing high CPU utilization on the targeted domain controller.

**Solution**: Identify unindexed attributes used by Cisco Jabber LDAP queries and create appropriate indexes in AD schema. Work with Cisco support to optimize Jabber LDAP query patterns. Reference KB 3155721.

---

### LSASS high CPU on domain controller caused by LookupNames calls from nessusd.exe (Nessus vulnerability scanner) via WMIPRVSE.exe. Issue appears aft...
**Score**: 🔵 7.0 | **Source**: ADO Wiki

**Root Cause**: Nessus vulnerability scanner plugin 71246 issues excessive LsaLookupNames calls through WMI provider host (WMIPRVSE.exe), causing high CPU utilization in LSASS on the targeted domain controller.

**Solution**: Identify nessusd.exe as source process through WMIPRVSE.exe call stacks. Contact Tenable (Nessus vendor) to address excessive LookupNames behavior in plugin 71246. Temporarily disable or reconfigure offending plugin. Reference KB 4337685.

---

### LSASS high CPU on domain controller caused by high LDAP load from Outlook or Exchange AutoDiscover process. Domain controllers experience sustained...
**Score**: 🔵 7.0 | **Source**: ADO Wiki

**Root Cause**: Outlook or Exchange AutoDiscover process generates excessive LDAP queries against the domain controller, causing high CPU utilization in LSASS. The LDAP load from AutoDiscover overwhelms the DC capacity.

**Solution**: Identify source of AutoDiscover LDAP queries via AD Performance diagnostics. Optimize Exchange AutoDiscover configuration or distribute LDAP load across multiple domain controllers. Reference KB 4295099.

---

### LSASS high CPU and AD version store exhaustion on domain controller. StealthIntercept AD monitoring tool causes sustained high CPU in LSASS and dep...
**Score**: 🔵 7.0 | **Source**: ADO Wiki

**Root Cause**: StealthIntercept (Stealthbits/Netwrix) AD monitoring tool hooks into LSASS and generates excessive internal operations that consume CPU and exhaust the Active Directory database version store (JET Blue ESE version store buckets).

**Solution**: Identify StealthIntercept as offending process via AD Performance diagnostics. Disable or reconfigure StealthIntercept monitoring. Contact Stealthbits/Netwrix support. Reference KB 4024857.

---

### Excessive SAM traffic causes SampLock contention on domain controller, resulting in slow AD replication and degraded authentication performance. SA...
**Score**: 🔵 7.0 | **Source**: ADO Wiki

**Root Cause**: High volume of SAM API calls from applications or scripts create contention on SampLock (SAM global lock), blocking AD replication and other SAM operations. Common sources include WMI queries for Win32_UserAccount, bulk user enumeration, or third-party identity tools.

**Solution**: Identify source of excessive SAM traffic using AD Performance diagnostics (Xperf/WPR, network traces). Reduce or throttle SAM queries from offending application. Consider distributing load across multiple DCs. Reference KB 4136738.

---

### LogRhythm application makes excessive IDL_DRSCrackNames calls to domain controller, exhausting LSASS Database Sessions In Use resource. DC may beco...
**Score**: 🔵 7.0 | **Source**: ADO Wiki

**Root Cause**: LogRhythm SIEM application issues high volume of DRSCrackNames RPC calls to translate security principals, consuming all available LSASS database sessions (ESE sessions). When sessions exhausted, DC cannot service new LDAP or authentication requests.

**Solution**: Identify LogRhythm as source via AD Performance diagnostics and network traces showing DRSCrackNames traffic. Reconfigure LogRhythm to reduce volume of name resolution queries or distribute across multiple DCs. Contact LogRhythm support. Reference KB 4039445.

---

## Phase 6: Laps
> 9 related entries

### Legacy LAPS ms-MCS-AdmPwd attribute not available on Read-Only Domain Controller (RODC); administrators in DMZ site cannot query LAPS password via ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ms-MCS-AdmPwd is part of the RODC Filtered Attribute Set (FAS) by default, so it is not replicated to RODCs. This is by design to prevent passwords from being stored on RODCs in less-secure locations.

**Solution**: Query LAPS password from a LAN machine with access to a Read-Write Domain Controller (RWDC) instead. If RODC replication is required (not recommended): change the 10th bit of searchFlags attribute for ms-MCS-AdmPwd schema object to 0 (subtract 512 from current searchFlags value). Use ADSIEdit or ldifde to modify the schema attribute.

---

### LAPS attributes (ms-MCS-AdmPwd, ms-MCS-AdmPwdExpirationTime) missing from computer object properties after running Update-AdmPwdADSchema to extend ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Active Directory replication latency after schema extension; the schema changes have not yet replicated to all domain controllers

**Solution**: Confirm Update-AdmPwdADSchema cmdlet completed without errors. Force AD replication using repadmin /syncall or check replication status with repadmin /replsummary. Wait for replication to complete, then verify attributes appear.

---

### Windows LAPS Event ID 10011: LAPS failed querying Active Directory for the current computer state.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Windows LAPS periodically queries AD every hour for computer state. Network issues, AD replication problems, or DC unavailability cause failure.

**Solution**: Check LAPS operational log (Event Viewer > Application and Services > Microsoft > Windows > LAPS > Operational). Run Get-LapsDiagnostics -CollectNetworkTrace -ResetPassword.

---

### Windows LAPS Event ID 10012: AD schema has not been updated with necessary LAPS attributes.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AD schema lacks Windows LAPS attributes. Schema was never extended or AD replication has not converged to the target DC.

**Solution**: Run Update-LapsADSchema. Check Event ID 10055 in LAPS log to find target DC. Verify AD replication convergence.

---

### Windows LAPS Event ID 10017: LAPS failed to update Active Directory with the new password. Current password not modified.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Computer account lacks self-permission to write password attributes on its OU, or LDAP connectivity issues to DC.

**Solution**: Verify self-permission with Set-LapsADComputerSelfPermissions -identity OU. Collect Get-LapsDiagnostics and Wldap32 ETL on client + AD ETL on DC.

---

### Windows LAPS Event ID 10056: Failed to locate a writable domain controller for password update.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Network issues, AD site misconfiguration, or all DCs unavailable/read-only prevent discovery of a writable DC.

**Solution**: Run nltest /dsgetdc:yourdomain.com /force /writable. Troubleshoot DNS, network, or AD site configuration.

---

### Windows LAPS Event ID 10057: Unable to bind over LDAP to the domain controller for password operations.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Machine account authentication to DC fails during LDAP bind. Computer account password, Kerberos, or network issues.

**Solution**: Troubleshoot as machine auth issue using auth scripts. Verify Group Policy updates work. Check computer account password sync.

---

### Windows LAPS Event ID 10065: LDAP_INSUFFICIENT_RIGHTS when updating legacy LAPS password attribute in emulation mode.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: In legacy emulation mode, machine account lacks self-permissions on OU to write ms-Mcs-AdmPwd attribute.

**Solution**: Run Update-AdmPwdComputerSelfPermission on the OU. Verify machine account self-permission.

---

### After VM image rollback (Hyper-V snapshot reversion or image re-deployment), Windows LAPS password stored in Active Directory no longer matches the...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Image rollback reverts the local registry GUID (LastPasswordVersion at HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\LAPS\State) to an old value while AD retains the newer msLAPS-CurrentPasswordVersion GUID. The mismatch means the AD-stored password was updated after the snapshot but the local device still has the pre-snapshot password

**Solution**: Deploy Windows 11 24H2 or Windows Server 2025 and run the latest Update-LapsADSchema cmdlet to add the msLAPS-CurrentPasswordVersion attribute. Once enabled, LAPS automatically detects GUID mismatch during each processing cycle (Event ID 10015 with reason 0x4000) and immediately rotates the password (Events 10018, 10020). No additional policy settings required. If password history is enabled, old passwords in msLAPS-EncryptedPasswordHistory may still work as a workaround before upgrading

---

## Phase 7: Domain Join
> 8 related entries

### Domain join fails with error 0xaac (NERR_AccountReuseBlockedByPolicy) when trying to re-use an existing computer account. Netsetup.log shows Accoun...
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: Windows updates from October 2022+ (CVE-2022-38042) block computer account reuse unless: joiner is original creator (ms-DS-creatorSID match), account was created by domain/enterprise/builtin admins, or account owner is in Allow computer account re-use during domain join GPO. NetJoinLegacyAccountReuse registry removed August 2024.

**Solution**: 1) Use same account that created the computer account. 2) Delete stale computer account and rejoin. 3) Rename computer to use new account name. 4) Configure Domain controller: Allow computer account re-use during domain join GPO. WARNING: Do NOT use NetJoinLegacyAccountReuse registry - removed August 2024.

---

### Domain join fails with error 'The specified domain either does not exist or could not be contacted'. nltest /dsgetdc returns ERROR_NO_SUCH_DOMAIN (...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Required ports between the client and Domain Controller are blocked. Most commonly UDP 389 (LDAP Ping for DC locator) is overlooked - customers verify TCP 389 but miss UDP 389. Other required ports include TCP/UDP 53 (DNS), TCP 88 (Kerberos), TCP 135 (RPC), TCP 445 (SMB), and TCP 1024-65535 (RPC ephemeral).

**Solution**: Verify all required ports are open using Test-NetConnection for TCP and PortQryUI (portqry -n DC_FQDN -p UDP -e 389) for UDP. Ensure firewall rules and antivirus/Windows Defender are not blocking domain join traffic. Check both TCP and UDP 389 connectivity.

---

### Domain join fails with error 'An account with the same name exists in Active Directory. Re-using the account was blocked by security policy.'
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: KB5020276 introduced domain join hardening that enforces additional validation when reusing existing computer accounts. Only users with proper permissions (Administrators, Domain Administrators, or users with delegated permissions) can reset/reuse an existing computer account.

**Solution**: Either (1) delete the existing computer object in AD, (2) ensure the joining user has proper permissions per KB5020276 requirements (owner of the computer object or delegated permissions), or (3) use a different unique name for the new machine. Review C:\Windows\Debug\netsetup.log for detailed error information.

---

### Domain join fails with error 0x32 (ERROR_NOT_SUPPORTED, decimal 50). Netsetup.log shows "NetUseAdd to \DC\IPC$ returned 50" and "NetpJoinDomainOnDs...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The security policy "Network security: Restrict NTLM: Incoming NTLM traffic" on the Domain Controller is incorrectly set to "Deny all accounts", blocking NTLM authentication required for domain join SMB session establishment. When NTLM is restricted on the DC, non-domain-joined clients cannot authenticate via Kerberos and the SMB IPC$ connection fails.

**Solution**: Change the "Network security: Restrict NTLM: Incoming NTLM traffic" policy on the affected DC to "Allow All" (or add appropriate exceptions), then refresh group policy (gpupdate /force). Note: there are 7 NTLM-related security policies controlling client outgoing, server incoming, and DC validation roles. Review all three restriction policies and the two exception lists to ensure domain join traffic is permitted.

---

### Domain join fails with error 0x534 (ERROR_NONE_MAPPED / No mapping between account names and security IDs was done). Netsetup.log shows NetpCreateC...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Transient error when domain join UI calls NetDomainJoin API without create flag first to locate a pre-created computer account. If no account found, 0x534 is logged before retrying with create flag. Also occurs when machine password change cannot find the computer account on the targeted DC (replication latency or failure).

**Solution**: 0x534 is usually transient - check if a second NetDomainJoin call with create flag succeeds. Focus on the options flag bits (25, 27, 425, 427) to determine if join relies on pre-existing accounts or creates new ones. If persistent, check AD replication health to the targeted DC.

---

### Domain join fails with error 0x569 (ERROR_LOGON_TYPE_NOT_GRANTED / Logon failure: the user has not been granted the requested logon type at this co...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The user account performing the domain join lacks the Access this computer from network user right on the domain controller servicing the join operation.

**Solution**: 1) Verify the domain join user (or their security group) has Access this computer from network right in Default Domain Controllers Policy. 2) Ensure the policy is linked to the OU hosting the DC computer account. 3) Confirm the DC is successfully applying the user rights settings from the policy.

---

### Domain join fails with error 0xa8b (NERR_SetupCheckDNSConfig / An attempt to resolve the DNS name of a DC in the domain being joined has failed). N...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Workgroup computer points to invalid DNS server (ISP DNS, stale DNS), DNS server missing required zones (_msdcs, target domain forward lookup zone), missing or incorrect host A records for DC, problematic DNS names (single-label, disjoint namespace, numeric TLD), or network connectivity issues.

**Solution**: 1) Verify client DNS server IPs are valid internal DNS servers (not ISP). 2) Check DNS servers host forward lookup zone for target domain and _msdcs zone. 3) Verify LDAP SRV records exist in _msdcs zone. 4) Verify DC host A record exists with correct IP. 5) Check for special domain names. 6) Test network connectivity.

---

### Access Denied error (0x5) when renaming computer name targeting Windows Server 2016 Domain Controller using NetUserSetInfo. Renaming succeeds when ...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Windows Server 2016 introduced the RestrictRemoteSam security policy (Network access: Restrict clients allowed to make remote calls to SAM) under Security Settings > Local Policies > Security Options. This policy restricts remote SAM RPC access via registry HKLM\system\CurrentControlSet\Control\Lsa\RestrictRemoteSam, and the calling account security group is not in the allowed SDDL.

**Solution**: Remove the RestrictRemoteSam registry value on target Server 2016+ DCs: reg delete "HKLM\system\currentControlSet\control\lsa" /v restrictRemoteSam /f. This restores the default SDDL granting everyone read permissions. No reboot required. Also check Server 2012 R2 DCs with KB4012219 as the policy was backported. Note: customized SDDL may cause failures in admin tools, RDP to RDS servers, and AuthZ-based applications.

---

## Phase 8: Ad Database
> 6 related entries

### Domain Controller fails to boot with stop code 0xc00002e1 or 0xc00002e2. AD database (ntds.dit) is in dirty/inconsistent state after crash or uncle...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ESE/JET database is dirty - transactions remain in transaction log files and have not been committed to the database. The database is inconsistent and cannot be loaded by LSASS on boot.

**Solution**: Boot into DS Restore Mode. Dump database header with esentutl /mh ntds.dit to verify state is DIRTY and identify required log range (Log Required Low/High). Verify all required log files are present on disk. Copy all DB + logs to a safe directory, then run soft recovery: esentutl /r edb /d (MUST use /d flag). After recovery, verify state is Clean with esentutl /mh. Restart normally.

---

### AD replication fails or is blocked by a corrupted/bad object. Events may include NTDS ISAM errors, Event ID 2108/1084 during inbound replication, o...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: A corrupted or inconsistent object in the Active Directory database (ntds.dit) blocks replication. Common causes include hardware/storage failures, unexpected shutdowns, failed schema extensions, snapshot restores on virtual DCs, or third-party recovery tool interference.

**Solution**: Delete the bad object to unblock replication. Use online dumpdatabase feature (KB315098 via LDP.exe) to identify the problematic object by DN or GUID. Check for: phantomized objects (OBJ=FALSE), different PDNT chains across DCs, inconsistent attribute data. If DSID is found in Directory Services event log, collaborate with ADS Pod SEE/EE for investigation. For large dump files, use NOREPAD from CSS tool collection.

---

### AD database corruption detected via integrity checks or semantic analysis. Secondary index corruption in ntds.dit. May present as replication error...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Secondary index corruption in the ntds.dit ESE database, commonly caused by hardware/storage subsystem issues, file system errors, or unplanned reboots. Lost page flush events (KB2518779) may indicate underlying hardware problems.

**Solution**: 1) Collect data: event logs (Application, System, Directory Services, DFS Replication, DNS), dumpdatabase export (KB315098), check for storage/filesystem errors. 2) Run non-destructive checks: NTDSUTIL FILES INTEGRITY, semantic database analysis (KB315136). 3) For secondary index corruption: run offline defragmentation (KB232122) - this leaves original DB intact, copy compacted DB to replace. 4) WARNING: Do NOT run destructive esentutl /r or /p. 5) Check DB paths/settings per KB4042791.

---

### AD replication error 1127: While accessing the hard disk, a disk operation failed even after retries. May also see lost page flush events in Direct...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Hardware or storage subsystem problems causing disk I/O failures when accessing the AD database. Lost page flush detection (KB2518779) confirms hardware-level write failures where pages were not properly persisted to disk.

**Solution**: 1) Check hardware and storage subsystem health. 2) Review system event log for storage subsystem and file system errors. 3) Check for unplanned reboots before first corruption report. 4) Use lost page flush detection (KB2518779/KB4016886) to identify hardware write failures. 5) If hardware confirmed faulty, migrate DC to healthy storage. 6) Run offline defragmentation (KB232122) and JET Flush Map file verification (KB4016886) after hardware remediation.

---

### Active Directory database (NTDS.dit) grows abnormally large on Windows Server 2008 R2 / Windows 7 environments, link table is bloated
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Credential Roaming feature enabled causes massive link table growth in the DIT as roaming credentials (certificates, keys) are replicated across DCs and stored as linked attributes

**Solution**: Disable the Credential Roaming Group Policy setting, then follow KB guidance to clean up existing roaming credential data and perform offline defrag to reclaim space. See public KB: AD DS database size increases significantly when the Credential Roaming feature is enabled.

---

### AD database grows due to excessive deleted DNS record objects; large collection of deleted DNS objects visible in DIT analysis
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Dynamic DNS (DDNS) updates delete existing DNS records and create new ones instead of updating the registration timestamp on the existing record, or DNS scavenging is configured with arbitrarily short values causing premature deletion

**Solution**: Apply preventative DNS fixes on all DNS-enabled Domain Controllers. Review and correct DNS scavenging interval configuration. Check if AD-integrated zones were converted to zone files. Verify all DCs have the fix to avoid record deletion during DDNS updates.

---

## Phase 9: Lsass
> 5 related entries

### LSASS.exe exhibits a handle and memory leak on a Domain Controller or member server. Handle count grows continuously (e.g., 60,000+ unreleased hand...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Logon session leak caused by an application or service repeatedly creating new logon sessions (via LsaLogonUser or AcceptSecurityContext/InitializeSecurityContext) without properly closing them. The leaking application runs under a specific service account, creating thousands of Kerberos logon sessions that are never destroyed.

**Solution**: 1) Collect ADPerf Scenario 5 data (WPR Handle trace + perfmon). 2) Open LSASS dump in WinDbg, run '!handle 0 0' to confirm Token handle leak. 3) Use MEX extension (!mex.lsass > Logon Session List) to identify which user account has excessive sessions. 4) Run '!ul !grep Username !exec -x "!kerbsess"' to count sessions per user. 5) Identify the application running under that account and fix its session cleanup logic. 6) If needed, collect TTD trace of LSASS + tasklist during 2-3 min window to trac

---

### After installing June 2024 (6B.2024) cumulative update on Active Directory domain controllers, LSASS memory grows continuously due to kdcsvc memory...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Memory leak bug in kdcsvc service introduced in the June 2024 cumulative update for Windows Server

**Solution**: Install a later cumulative update that contains the fix for the kdcsvc memory leak

---

### Small memory leak in LSASS on Windows Server 2016 and older domain controllers after installing April 9, 2024 update, occurring in cross-forest run...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PAC hardening protections in April 2024 (4B.24) Windows Update cause memory leak on pre-1809 operating systems in cross-forest authentication paths

**Solution**: Install the fix from May 2024 (5B.24) cumulative update which resolves the PAC hardening memory leak on older OS versions

---

### LDAP Arena Heap and SAM RSO queue memory leak in LSASS on April 9, 2024 patched domain controllers servicing authentication requests at hyper-scale
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: RSO worker thread fails to clear SAM RSO queue, exposed by NTLM auth forwarding bug in the Kerberos PAC Validation security update (4B.24)

**Solution**: Install the fix that addresses the RSO queue memory leak on DCs with hyper-scale authentication workloads

---

### LSASS on Windows Server 2012 R2 and 2016 domain controllers consumes all available memory, becomes unresponsive to LDAP and other requests while do...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Multiple arena heap bugs in LDAP processing on WS2012R2/2016 cause memory growth with long-running LDAP transactions and high LDAP workloads

**Solution**: Identify LDAP clients generating load via 1644 events using Event1644Reader.ps1, optimize or eliminate expensive queries; apply all available cumulative patches for WS2012R2/2016

---

## Phase 10: Strong Cert Mapping
> 5 related entries

### Certificate-based authentication fails on Domain Controller with KDC System Event 39 (Kerberos-Key-Distribution-Center). Certificate is valid but K...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Certificate could not be mapped to a user account in a strong way per KB5014754 enforcement. Weak certificate mappings (e.g., UPN-only mapping without SID extension) are no longer accepted after strong mapping enforcement date.

**Solution**: Implement strong certificate mapping per KB5014754: 1) Add the SID extension (OID 1.3.6.1.4.1.311.25.2) to certificate templates via CA, or 2) Create explicit strong mapping via altSecurityIdentities attribute (X509:<SHA1-PUKEY>hash or X509:<I>issuer<SR>serial). Reference: https://support.microsoft.com/topic/kb5014754

---

### Certificate-based authentication denied on Domain Controller with KDC System Event 40 (Kerberos-Key-Distribution-Center). User certificate is valid...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The certificate was issued (NotBefore date) before the user account was created in Active Directory. KB5014754 strong mapping enforcement rejects certificates that predate the mapped account as a security measure.

**Solution**: Re-enroll/re-issue the certificate after the user account exists, so the certificate NotBefore date is after the account creation date. Alternatively, create an explicit strong mapping via altSecurityIdentities (X509:<SHA1-PUKEY> or X509:<I><SR>) which bypasses the date check. Reference: https://support.microsoft.com/topic/kb5014754

---

### Certificate-based authentication denied on Domain Controller with KDC System Event 41 (Kerberos-Key-Distribution-Center). Certificate appears valid...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The SID embedded in the certificate new SID extension (OID 1.3.6.1.4.1.311.25.2) does not match the target user account SID in Active Directory. This implies the certificate was issued to a different user account than the one being authenticated.

**Solution**: Verify the certificate ownership: check which user the SID in the certificate extension belongs to. If cert was issued to wrong user, re-issue to correct user. If template misconfiguration, fix the certificate template to include correct SID. Reference: https://support.microsoft.com/topic/kb5014754

---

### Certificate mapping fails on Domain Controller with KDC Operational Event 313. Strong certificate mapping enforcement rejects authentication attempts.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Invalid tuple configuration in the certificate mapping rules. The faulting line contains typos or extra characters that prevent the KDC from parsing the mapping tuples correctly.

**Solution**: Examine KDC Operational Event 313 details to identify the faulting tuple line. Check for typos, extra characters, or incorrect syntax in the certificate mapping configuration. Fix the tuple and verify with a test authentication.

---

### KDC System Event 39 logged on Domain Controller AND Group Policy configured with Process even if the Group Policy objects have not changed (NoGPOLi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: KDC policy settings (UseStrongNameMatches=1 at HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\KDC\Parameters) may be incompatible with GPO registry policy processing setting NoGPOListChanges=1. GPO reprocessing resets registry-based KDC settings on each policy refresh cycle.

**Solution**: Review the interaction between KDC strong mapping policy and GPO processing: either exclude KDC Parameters registry from GPO processing, or configure strong mapping settings via Group Policy instead of direct registry edits to prevent GPO refresh from overwriting manual settings.

---

## Phase 11: Credential Guard
> 5 related entries

### Windows 10 client machines with Credential Guard enabled cannot access file shares on IBM file servers. Error: 0xc0020023 RPC_NT_INVALID_BOUND (The...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: IBM file server NTLM implementation sends parameters incompatible with Credential Guard protected NTLMv2 authentication. Third-party server-side issue.

**Solution**: Contact IBM for a fix. This is a third-party issue where IBM file server NTLMv2 handling is incompatible with Credential Guard. Reference: https://internal.evergreen.microsoft.com/topic/4012080

---

### Windows 10 client machines with Credential Guard enabled cannot access Internet through Cisco Connector. Error: 0xc0020023 RPC_NT_INVALID_BOUND (Th...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Cisco Connector sends empty ServerName string inside NTLM Challenge message. Dual defect: NTLM code fails to generate challenge response when no target info is provided, and Cisco side sends empty string which is insecure.

**Solution**: Bug 11205373 filed for Windows RS1 fix. Server-side: Cisco needs to fix NTLM Challenge message to include proper ServerName. Client-side: Windows NTLM should handle missing target info gracefully. Reference: https://internal.evergreen.microsoft.com/topic/4020927

---

### NTLM authentication fails to generate a challenge response when Credential Guard is enabled, NTLMv2 is used, and no target information is provided ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When Credential Guard is active and NTLMv2 is negotiated, the isolated LSA process (LsaIso) cannot compute the challenge response if no target information (server SPN/domain info) is included in the NTLM challenge message. This is a known Windows bug.

**Solution**: Apply the fix for Bug 11205373. As a workaround, ensure the target server provides target information in the NTLM challenge (Type 2) message, or consider switching to Kerberos authentication which is not affected.

---

### Credential Guard doubles bad password counts, causing premature account lockouts even when only one incorrect password attempt was made (Bug 10280633)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: A Windows security bug (Bug 10280633) in Credential Guard causes each failed password attempt to be counted twice by the domain controller, effectively halving the account lockout threshold.

**Solution**: Apply the fix for Bug 10280633. As a temporary workaround, consider increasing the account lockout threshold to compensate for the doubled count, or disable Credential Guard if lockouts are critical.

---

### ADMT (Active Directory Migration Tool) user migration fails with error 'No credentials are available in the security package' when Credential Guard...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Credential Guard blocks ADMT from accessing the NTLM credential material needed for the migration process. ADMT relies on legacy credential delegation that Credential Guard is designed to prevent.

**Solution**: Disable Credential Guard on the ADMT server during migration operations. Credential Guard is incompatible with ADMT user migration workflows that require NTLM credential delegation.

---

## Phase 12: Dclocator
> 4 related entries

### Netlogon Event ID 5719 or Group Policy Event 1129 logged during domain member boot indicating no domain controllers are available; domain-joined ma...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Netlogon service starts before the network stack is fully initialized during system boot, so DCLocator DNS SRV queries fail or time out before network connectivity is established

**Solution**: This is typically transient and self-recovers once the network is ready. For SQL Server or other services that start early with domain service accounts or GMSA, configure delayed automatic start with network trigger: sc.exe triggerinfo SQLServiceName start/networkon and sc.exe config SQLServiceName start= delayed-auto

---

### DNS SRV records for demoted domain controllers reappear in DNS after manual deletion; systems continue attempting to contact old/demoted DCs during...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AD-integrated DNS zones store SRV records as multi-valued attributes on DNS objects. Active Directory replication conflict resolution (last-write-wins) can reanimate previously removed SRV records for demoted DCs when conflicting updates from other DCs replicate

**Solution**: Manually clean up the conflicting DNS objects on all DCs holding the AD-integrated zone. Follow detailed guidance at https://techcommunity.microsoft.com/t5/microsoft-entra-azure-ad-blog/a-complicated-scenario-regarding-dns-and-the-dc-locator-srvs/ba-p/243139. Use DcDiag to verify DC advertising status after cleanup

---

### DCLocator responses from domain controllers are slow or time out, causing delays in LDAP, Kerberos, and DC locator operations
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Domain controller fails to map the client IP address to an AD site via DsAddressToSite API, triggering an exhaustive search through all known IP addresses before responding

**Solution**: Apply Windows update KB https://support.microsoft.com/en-us/topic/5a9a62a5-348d-50ce-5e0b-019f42142b3c. Verify client subnet definitions exist in Active Directory Sites and Services. Test IP-to-site mapping with NLTEST /DSADDRESSTOSITE: /ADDRESSES:x.x.x.x on the DC

---

### Application or service communicates with domain controller in a remote/unoptimized site instead of the closest one; Netlogon log shows NO_CLIENT_SI...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Client IP address is not mapped to any AD site because subnet definitions are missing or incorrect in Active Directory Sites and Services, so DCLocator returns a random DC instead of the nearest one

**Solution**: Run NLTEST /DSADDRESSTOSITE: /ADDRESSES:x.x.x.x on a DC to test IP-to-site mapping. Add missing subnet definitions in Active Directory Sites and Services. Verify DC server objects are in the correct sites. For cross-forest scenarios, ensure matching site names exist in both forests

---

## Phase 13: Gmsa
> 4 related entries

### gMSA creation or password retrieval fails shortly after KDS root key creation. gMSA host cannot retrieve password. Service using gMSA fails to star...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: KDS root key has not reached its effective time. By default DCs wait 10 days after root key creation to allow AD replication convergence. Even with Add-KdsRootKey -EffectiveImmediately, there is up to 10 hours delay due to time-slice algorithm (EffectiveTime in NTTE format divided into 10-hour slices).

**Solution**: For production: wait for KDS root key effective time (up to 10 days default). Verify Event 4004 in KDS event log. For test/lab only: Add-KdsRootKey -EffectiveTime ((get-date).addhours(-10)). Do NOT recommend for production. Check root key replication across all DCs.

---

### After creating a new KDS root key via PowerShell (Add-KdsRootKey), gMSA password operations on Domain Controllers still use the old root key.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: KDS service maintains an MRK (Master Root Key) cache ordered by recency, created upon service start. When a new key is created via PowerShell/LDAP (kdscli), kdssvc is not notified and the cache is not updated until the service restarts.

**Solution**: Restart the KDS service (kdssvc) on the Domain Controller to refresh the MRK cache with the newly created root key. Verify the active root key by following the internal KB for identifying the RootKey in use for gMSA.

---

### Service fails to start under gMSA with Error 1069. PrincipalsAllowedToRetrieveManagedPassword is set to a security group, but the computer still ca...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The computer account is either not a member of the security group specified in PrincipalsAllowedToRetrieveManagedPassword, or the group membership has not been replicated to domain controllers, or the membership change has not taken effect on the client system (stale Kerberos ticket).

**Solution**: 1) Verify group membership with Get-ADGroupMember. 2) Run 'GPResult /v' on the affected computer to confirm updated group membership. 3) Collect AD object metadata for both the gMSA and the security group to verify replication. 4) Restart the computer or run 'klist purge' to refresh Kerberos tickets.

---

### Service using gMSA fails to start with 'Error 1069: The service did not start due to logon failure', or Install-ADServiceAccount fails with 'An uns...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Domain Controllers experienced a time skew (often caused by Secure Time Seeding / UtilizeSslTimeData) which caused the gMSA password to roll to a future date. UtilizeSslTimeData does not adhere to W32Time large time skew protections. Commonly seen with Microsoft Defender for Identity (MDI) installations.

**Solution**: Create a new gMSA account for the service (there is no documented method to force password change on a broken gMSA). Disable Secure Time Seeding on Domain Controllers via Group Policy or registry to prevent future time jumps.

---

## Phase 14: Contentidea Kb
> 4 related entries

### Attempts to update Active Directory (AD) attribute (such as personalPager, otherPager, or extensionAttribute5) user account fail in both ADSI Edit ...
**Score**: 🟢 8.0 | **Source**: KB

**Root Cause**: The affected user object has a very large number of entries in the userCertificate attribute. This is causing directory limits or constraints to be hit for that object. This is a data/volume issue on a single object, not a schema defect.

**Solution**: Perform a safe cleanup of the userCertificate attribute values for the impacted user. Steps: 1) Assess Current Values with Get-ADUser. 2) Back Up/Export Existing Values. 3) Clean Up Redundant/Stale Certificates - remove duplicates, expired, or no-longer-required certificates. 4) Re-run the Intended Attribute Updates. 5) Post-validation. Important: Do not modify the AD schema for a single-user data condition.

---

### We have setup a new Intermediate issuing CA on a Windows Server 2016  Incoming/Outgoing NTLM disabled via GPO  Network security: Restrict NTLM: Inc...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: This seems to be a behavior by design.

**Solution**: WORKING SCENARIONTLM not blocked on the CA server. Client sending the certificate request and we can see WCCE:ICertREquest2 reaching the CA7573 1:00:47 PM 1/31/2019 95.1802960 certsrv.exe 192.168.2.102 192.168.2.103 WCCE WCCE:ICertRequestD2:Request2 Request, *Encrypted* Post this, CA does a EPMP request to a DC for UUID {E3514235-4B06-11D1-AB04-00C04FC2DCD2}7579 1:00:47 PM 1/31/2019 95.1835475 lsass.exe 192.168.2.103 192.168.2.100 EPM EPM:Request: ept_map: NDR, DRSR(DRSR) {E3514235-4B06-11D1-AB0

---

### Attempts to update Active Directory (AD) attribute (such as personalPager, otherPager, or extensionAttribute5) user account fail in both ADSI Edit ...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: Inspection
reveals that the affected user object has a very large number of entries in the
userCertificate attribute, while a typical user has none or very few. This is
causing directory limits or constraints to be hit for that object. This is a data/volume issue on a single object, not a schema
defect. Modifying the schema attribute data type for this single case is not
recommended and cannot be undone once applied.

**Solution**: Perform
a safe cleanup of the userCertificate attribute values for the impacted user.
After cleanup, re-attempt the attribute updates. Recommended
Steps: 
 Assess Current Values
     Use PowerShell to review and count the current userCertificate values:    
Get-ADUser <ImpactedUserID> -Properties userCertificate | Select-Object
SamAccountName,
@{Name='CertificateCount';Expression={$_.userCertificate.Count}} 
 Back Up/Export Existing Values
     Export the current values for audit or rollback. Co

---

### CloudSync or Azure application error: "The specified directory service attribute or value does not exist." Log shows ConfigSyncDirectoriesPage caug...
**Score**: 🔵 7.0 | **Source**: KB

**Root Cause**: Directory Services is not responsible for troubleshooting this error. It is the application team's responsibility to troubleshoot and improve their logging.

**Solution**: If collab owner, do not proceed without an ICM created by Azure application's team. If case owner, do not allow Azure application's team to resolve collaboration until they provide the object and nature of failures. For CritSit, use LDAP client tracing to investigate.

---

## Phase 15: Version Store
> 3 related entries

### Version store errors (Event ID 623, 1519) on domain controllers after deleting large numbers of group membership links in Active Directory, causing...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Arena Heap memory issue triggered by ADREPL processing large-scale link deletions, exhausting version store buckets

**Solution**: Apply relevant hotfix per KB e52d4cdc. As best practice, increase Version Store size to 850MB on domain controllers. For Server 2016 and older, size is based on CPU count; for Server 2019+, it is based on RAM.

---

### Version store outages and bucket exhaustion on domain controllers running DeviceLock DLP software, leading to AD database operation failures
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: DeviceLock DLP software interferes with ESE database operations on domain controllers, causing version store bucket exhaustion

**Solution**: Remove or update DeviceLock to a compatible version on affected DCs. See KB c1352901. Increase Version Store size to 850MB as preventive measure.

---

### High CPU utilization in LSASS process combined with version store exhaustion on domain controllers running StealthIntercept AD monitoring tool
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: StealthIntercept AD monitoring tool causes excessive version store consumption and sustained LSASS high CPU on domain controllers

**Solution**: Remove or reconfigure StealthIntercept AD monitoring tool on affected domain controllers. See KB 3a17ef01. Increase Version Store size to 850MB as interim mitigation.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AD replication error 8451: the domain controller encounters a problem with th... | Active Directory database (ntds.dit) corruption or incons... | 1) Try semantic database analysis (ntdsutil) to check dat... | 🟢 9.5 | ADO Wiki |
| 2 | Domain join fails with error 0xaac (NERR_AccountReuseBlockedByPolicy) when tr... | Windows updates from October 2022+ (CVE-2022-38042) block... | 1) Use same account that created the computer account. 2)... | 🟢 9.5 | ADO Wiki |
| 3 | AADLoginForWindows VM extension fails with exit code -2145648523 (DSREG_SECUR... | VM is joined to Active Directory and cannot switch to Sec... | AAD login via extension not supported on domain-joined VM... | 🟢 8.5 | ADO Wiki |
| 4 | Provisioning Agent fails with LdapException: The operation was aborted becaus... | Provisioning Agent unable to get timely responses from AD... | Increase timeout via registry: HKEY_LOCAL_MACHINE\SOFTWAR... | 🟢 8.5 | ADO Wiki |
| 5 | Group name claims (sAMAccountName format) not working for cloud-only groups o... | Group name claims in sAMAccountName/NetbiosDomain/DNSDoma... | For cloud-only groups, use group ObjectID format in claim... | 🟢 8.5 | ADO Wiki |
| 6 | TAP not immediately available as sign-in option, up to 10 minute delay after ... | Activation delay during Private Preview; replication late... | Wait up to 10 minutes after TAP creation. This delay was ... | 🟢 8.5 | ADO Wiki |
| 7 | RDP from non-MEDS-joined client to MEDS-joined server fails when NTLM passwor... | Customer hardened MEDS security by disabling NTLM hash sy... | Workarounds: (1) Domain-join the client machine, (2) Re-e... | 🟢 8.5 | ADO Wiki |
| 8 | Higher total authentication latency (400-500ms vs 200-300ms) when user signs ... | AAD Gateway nearest to user proxies request to ESTS in te... | Expected behavior by design. Check GatewayDC and env_clou... | 🟢 8.5 | ADO Wiki |
| 9 | New-ADServiceAccount -CreateDelegatedServiceAccount fails with error "Key doe... | KDC Root Key (KdsRootKey) has not been created in the Act... | Create a KDC Root Key by running: Add-KdsRootKey -Effecti... | 🟢 8.5 | ADO Wiki |
| 10 | LDAP clients fail to connect or authenticate after deploying/upgrading to Win... | Windows Server 2025 enforces LDAP Signing by default for ... | Check GPO LDAP server signing requirements Enforcement (D... | 🟢 8.5 | ADO Wiki |
| 11 | Domain controller restore fails after enabling Database 32k pages optional fe... | Enabling the Database 32K pages optional feature is irrev... | Before enabling 32K pages: 1) Ensure ALL DCs in forest ru... | 🟢 8.5 | ADO Wiki |
| 12 | AD object creation or modification fails because multi-valued attribute (e.g.... | JET 8K page database architecture limits the number of mu... | Upgrade all domain controllers to Windows Server 2025 and... | 🟢 8.5 | ADO Wiki |
| 13 | Name/SID resolution fails for domain accounts; unable to add domain users to ... | LSARPC network ports (RPC endpoint mapper port 135 and ep... | 1) Verify connectivity: Test-NetConnection -ComputerName ... | 🟢 8.5 | ADO Wiki |
| 14 | Domain Controller fails to boot with stop code 0xc00002e1 or 0xc00002e2. AD d... | ESE/JET database is dirty - transactions remain in transa... | Boot into DS Restore Mode. Dump database header with esen... | 🟢 8.5 | ADO Wiki |
| 15 | AD replication fails or is blocked by a corrupted/bad object. Events may incl... | A corrupted or inconsistent object in the Active Director... | Delete the bad object to unblock replication. Use online ... | 🟢 8.5 | ADO Wiki |
| 16 | Domain controller fails to boot with blue screen error 0xc00002e1 or 0xc00002... | NTDS.DIT database file is placed on storage drives (SAN/N... | Ensure NTDS.DIT is placed on drives available at boot tim... | 🟢 8.5 | ADO Wiki |
| 17 | AD database corruption detected via integrity checks or semantic analysis. Se... | Secondary index corruption in the ntds.dit ESE database, ... | 1) Collect data: event logs (Application, System, Directo... | 🟢 8.5 | ADO Wiki |
| 18 | AD replication fails with error 8464 (Synchronization attempt failed). Global... | The partialAttributeSet on read-only partitions became ou... | Use Get-PAS.ps1 script or repadmin /showattr to compare e... | 🟢 8.5 | ADO Wiki |
| 19 | AD replication error 1256 (Remote Server is Unavailable) logged in repadmin /... | Error 1256 is a secondary/cascading error. It occurs when... | Ignore error 1256 and focus on resolving the other replic... | 🟢 8.5 | ADO Wiki |
| 20 | AD replication fails with error 1726 (RPC call cancelled) or error 1727 (RPC ... | Network-related failure where an intermediate network dev... | Capture two-sided simultaneous network traces on both dom... | 🟢 8.5 | ADO Wiki |
| 21 | AD replication error 8606: Insufficient attributes were given to create an ob... | Lingering objects exist on the source domain controller. ... | 1) Use Lingering Object Liquidator (LOL) tool to identify... | 🟢 8.5 | ADO Wiki |
| 22 | AD replication error 1908: Could not find the domain controller for this doma... | Broken DNS delegation for the child domain. DNS queries f... | 1) Enable verbose Netlogon logging: nltest /dbflag:2080ff... | 🟢 8.5 | ADO Wiki |
| 23 | AD replication error 8453: Replication access was denied. RODC fails to adver... | Enterprise Read-Only Domain Controllers security group is... | 1) Open ADSIEDIT.msc on a writable DC hosting the affecte... | 🟢 8.5 | ADO Wiki |
| 24 | USN rollback detected on domain controller. Event ID 2095 logged in Directory... | Domain controller was restored using an unsupported metho... | The supported recovery method is to forcefully demote the... | 🟢 8.5 | ADO Wiki |
| 25 | Domain Controller becomes unresponsive or enters a hung state. Users cannot a... | Third-party components hooking into the LSASS I/O path or... | 1) Check if any third-party security/audit software was r... | 🟢 8.5 | ADO Wiki |
| 26 | LSASS.exe exhibits a handle and memory leak on a Domain Controller or member ... | Logon session leak caused by an application or service re... | 1) Collect ADPerf Scenario 5 data (WPR Handle trace + per... | 🟢 8.5 | ADO Wiki |
| 27 | ADLDS replication fails, instances cannot authenticate to each other for repl... | msDS-ReplAuthenticationMode values differ between ADAM/AD... | Use ADSIEDIT to connect to each ADLDS configuration parti... | 🟢 8.5 | ADO Wiki |
| 28 | ADLDS replication fails with access denied or permission errors between repli... | Computer accounts or service accounts for LDS instances a... | Add the computer account SID or service account of the pr... | 🟢 8.5 | ADO Wiki |
| 29 | After installing June 2024 (6B.2024) cumulative update on Active Directory do... | Memory leak bug in kdcsvc service introduced in the June ... | Install a later cumulative update that contains the fix f... | 🟢 8.5 | ADO Wiki |
| 30 | Small memory leak in LSASS on Windows Server 2016 and older domain controller... | PAC hardening protections in April 2024 (4B.24) Windows U... | Install the fix from May 2024 (5B.24) cumulative update w... | 🟢 8.5 | ADO Wiki |
