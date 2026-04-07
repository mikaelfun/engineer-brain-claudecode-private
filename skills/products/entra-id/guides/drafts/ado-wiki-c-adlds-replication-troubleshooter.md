---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADLDS/ADLDS replication/ADLDS replication troubleshooter"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADLDS%2FADLDS%20replication%2FADLDS%20replication%20troubleshooter"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:** This guide provides steps to diagnose and troubleshoot Active Directory Lightweight Directory Services (ADLDS) replication issues.

### Scoping

1. What behavior is the customer seeing?
2. What error messages are appearing?
3. When did the problem start?
4. How long has it been since replication last occurred?
5. Is replication taking place with any other servers?
6. Is there network connectivity between the servers?
7. Is name resolution working between the servers?
8. Is Server Message Block (SMB) or another protocol working between the servers? Can you use Universal Naming Convention (UNC) to IPC$ via server name and IP?
9. Is the topology configured correctly to allow replication? Are these servers direct replication partners?
10. How many replication partners should there be? Are they all showing up when running _repadmin_? Check the _msDS-NC-Replica-Locations_ attribute on the application partition GUID container in the Partitions container in the Configuration partition.

### Data to Gather
1. Run `repadmin /showrepl localhost:<port> >%computername%_<instancename>_repadminoutput.txt`.
2. Gather a double-sided network trace to rule out network issues.
3. Use Portqry to check for blocked ports related to replication issues.
4. Collect a double-sided network trace of the issue (if network-related) for replication issues.

### Troubleshooting Tips

ADLDS replication works like Active Directory (AD), with the main difference being the static port usage for Remote Procedure Call (RPC) configured for the ADLDS LDAP port.

The commands used for ADLDS are the same as for AD, but you need to add the port number after specifying the source and destination. For example:

```
Repadmin /replicate destination:port source:port dc=instance1,dc=local 
Repadmin /add dc=instance1,dc=local  destination:port source:port
Repadmin /showrepl server:port
```

You can use the above `repadmin /replicate` or `repadmin /add` commands to trigger the issue.

### Check SPN Registered in ADLDS Service Account

ADLDS will use the following Service Principal Names (SPNs) to complete Kerberos authentication for replication:

```
E3514235-4B06-11D1-AB04-00C04FC2DCD2-ADAM/netbiosname:port 
E3514235-4B06-11D1-AB04-00C04FC2DCD2-ADAM/dnshostname:port 
Ldap/netbiosname:port 
Ldap/dnshostname:port
```

### Check Replication Security

All ADAM instances should have the same value for _msDS-ReplAuthenticationMode_. Use ADSIEDIT to connect to the ADLDS configuration partition to confirm.

### Check Instances Role Membership

Make sure the LDS permissions are set to allow replication. By default the NCs allow the "Instances" role this access:
- Allow CN=Instances,CN=Roles,CN=Configuration,CN={GUID} — Replicating Directory Changes
- Allow CN=Instances,CN=Roles,CN=Configuration,CN={GUID} — Replication Synchronization
- Allow CN=Instances,CN=Roles,CN=Configuration,CN={GUID} — Manage Replication Topology
- Allow CN=Instances,CN=Roles,CN=Configuration,CN={GUID} — Replicating Directory Changes All

All machines hosting an LDS instance and the service accounts used need to be members of the role:
```
dn: CN=Instances,CN=Roles,CN=Configuration,CN={GUID}
member: CN=S-1-5-18,CN=ForeignSecurityPrincipals,...  (SYSTEM)
member: CN=S-1-5-20,CN=ForeignSecurityPrincipals,...  (NetworkService)
member: CN=<machine-SID>,CN=ForeignSecurityPrincipals,...
```

The membership may be missing for a problem LDS instance. The object picker will allow to select a domain computer account or a user service account if this type of service account is used.

### Summary of Data Needed

1. Screenshot of the error message.
2. _msDS-ReplAuthenticationMode_ value of all ADAM instances.
3. SPNs registered for the ADAM service account.
4. `repadmin` command results.
