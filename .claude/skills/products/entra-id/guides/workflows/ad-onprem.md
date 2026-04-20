# Entra ID On-Premises AD/LDAP — 排查工作流

**来源草稿**: ado-wiki-a-ad-forest-restore.md, ado-wiki-a-ad-replication-general-approach-troubleshooting.md, ado-wiki-a-ad-replication-unknown-solution-investigation.md, ado-wiki-a-dc-lsass-high-memory-data-analysis.md, ado-wiki-a-dc-lsass-high-memory-data-collection-adperf.md, ado-wiki-a-dc-lsass-high-memory-data-collection-tss.md, ado-wiki-a-dfsr-cloning.md, ado-wiki-a-dfsr-event-log-verbosity.md, ado-wiki-a-dfsr-unknown-solution-investigation.md, ado-wiki-a-dfsrdiag-syntax.md... (+61 more)
**场景数**: 49
**生成日期**: 2026-04-07

---

## Scenario 1: CSS engineers scope
> 来源: ado-wiki-a-ad-forest-restore.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 192.168.189.0/24
- 1. Install Windows Server Backup on Production Virtual Machines:
- 2. Configure Windows Server Backup for a Full Server Backup:
- 3. Chose local E: drive for destination:
- 4. Chose these options for full backup:
- 5. Create a new Test Virtual Machine to perform BMR. (TestRootDC02)
- 6. Attach W2012R2 ISO and attach E: Drive from original RootDC02
- 7. Boot from DVD:
- 8. Follow defaults, click Next:
- 9. Pick Repair your computer:

---

## Scenario 2: General Approach to Troubleshooting AD Replication
> 来源: ado-wiki-a-ad-replication-general-approach-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Use tools**: AD Replication Status Tool or `repadmin`
- 2. **One server at a time**: `repadmin /showrepl` for status
- 3. **Fix errors one by one**: Replication uses pull model
- 4. **Root domain first**: Fix contoso.com before child domains
- 1. Pick a DC, run `repadmin /showrepl`
- 2. Identify failing partners and error codes
- 3. Focus on one partner, resolve its error
- 4. Move to next partner after fix
- 5. Fix root domain -> child domains -> cross-domain
- 1. Fix intra-domain replication in root domain

---

## Scenario 3: ADPerf script data collection
> 来源: ado-wiki-a-dc-lsass-high-memory-data-collection-adperf.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 4: ado-wiki-a-dc-lsass-high-memory-data-collection-tss
> 来源: ado-wiki-a-dc-lsass-high-memory-data-collection-tss.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Check known issues
- 2. Ensure the Domain Controller is on the latest fixes - Especially if the DC is 2012 R2 because there were many leaks in the LDAP Arena Heap memory allocation mechanism on WS 2012 R2 which were all f
- 1. Use a PowerShell Terminal as administrator and use the following command to capture with TSS while the issue is present.
- 2. Select the option 3. to start the traces immediately.
- 3. After passed 3-5 minutes while the memory is high stop the command with the option prompted **Press the enter key to stop it. **
- 4. Verify the data collected and ask the customer to upload it to the workspace
- 1. Use a PowerShell Terminal as administrator and use the following base example to make a trigger start capture using the TSS
- 2. Select the option 4. and ask the customer what memory usage percentage they consider it as high. You can choose to run the logs during 3-5 minutes when the threshold is triggered.
- 3. Verify the data collected and ask the customer to upload it to the workspace
- 1. Use the steps at the beginning of this document to download the internal TTD version of TSS.

---

## Scenario 5: DFSR Unknown Solution Investigation — Troubleshooting Methodology
> 来源: ado-wiki-a-dfsr-unknown-solution-investigation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Is DFSR Service Running?**
   - Ensure the DFSR service is running. If it cannot start or starts with errors/warnings, resolve that first.
2. **Step 2: SYSVOL or Other RG/RF?**
   - Determine if the issue is in SYSVOL or another Replication Group/Replicated Folder. SYSVOL requires special treatment.
3. **Step 3: SYSVOL Troubleshooting**
   - SYSVOL contains GPT (Group Policy Template) part of all GPOs, replicated among all DCs.
   - *Common symptoms:**
   - 1. **Group Policy application failure** — error message suggests missing files:
4. **Step 4: Other RG/RF Troubleshooting**
   - For non-SYSVOL replication groups:
   - 1. Clarify the RG, RF, and servers involved
   - 2. Ensure DFSR service is running on all servers
5. **Step 5: DFSR Replication Issue Analysis**

---

## Scenario 6: DFSRDIAG — DFS Replication Diagnostics Command Reference
> 来源: ado-wiki-a-dfsrdiag-syntax.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 7: Setting the context: Domain and Forest Functional Levels
> 来源: ado-wiki-a-domain-forest-functional-level-ws2025.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 8: Whats New with LDAP Signing in Windows Server 2025 Domain Controllers?
> 来源: ado-wiki-a-ldap-signing-channel-binding-ws2025.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Event ID 2886**: **LDAP Signing not required**
- 2. **Event ID 2887**: **Unsigned LDAP binds detected**
- 3. **Event ID 2888**: **LDAP Signing disabled for all communications**
- 4. **Event ID 2889**: **Signed LDAP communications**
- 1. **Event ID 3039**: **Channel Binding not supported by the client**
- 2. **Event ID 3040**: **Channel Binding failure**
- 3. **Event ID 3041**: **Channel Binding successful**
- 1. **Enable Auditing**: To capture these events, make sure that auditing for LDAP Signing and Channel Binding is enabled. This can be done through the **Advanced Audit Policy Configuration** in Group 
- 2. **Monitor Event Logs**: Regularly monitor event logs in **Event Viewer** under the **Directory Service** category for LDAP Signing and Channel Binding events. This can help detect when unsigned or 
- 3. **Identify Problematic Clients**: If you see frequent logs for **Event ID 2887** or **Event ID 3039**, investigate the clients or applications generating these requests. You may need to update the 

---

## Scenario 9: ADPerf - scoping - LSASS high handles
> 来源: ado-wiki-a-lsass-high-handles-scoping.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 10: ado-wiki-a-ntlm-failed-auth-across-trust
> 来源: ado-wiki-a-ntlm-failed-auth-across-trust.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting NTLM Authentication Failure Across a Trust**
   - *Summary:** This article helps troubleshoot an NTLM authentication failure for a user trying to access a file server share in a trusting domain. The issue is diagnosed through error logs and network t
   - *Scenario:**
   - A user with the account Contoso\testuser cannot access a file server share hosted on a server from the trusting domain cigar.ga while logged on in the domain contoso.local.

---

## Scenario 11: ado-wiki-a-ntlm-maxconcurrentapi
> 来源: ado-wiki-a-ntlm-maxconcurrentapi.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 12: ado-wiki-a-ntlm-scoping-questions
> 来源: ado-wiki-a-ntlm-scoping-questions.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 13: DFSR Deletion Forensics - Determining Where and When
> 来源: ado-wiki-b-dfsr-deletion-forensics.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Get the Replicated Folder GUID**
   - *WMIC (elevated prompt):**
   - wmic /namespace:\\root\microsoftdfs path DfsrReplicatedFolderInfo get ReplicatedFolderGuid,ReplicatedFolderName
2. **Step 2: Query the Database Record for the Deleted File**
   - wmic /namespace:\\root\microsoftdfs path DfsrIdRecordInfo WHERE (filename='critical.txt' and replicatedfolderguid='ADDB9740-7113-44B9-8E54-464C7573550F') get filename,flags,updatetime,GVsn
3. **Step 3: Convert DatabaseGuid to Server Name**
   - *dfsrdiag:**
   - dfsrdiag guid2name /guid:F04AC256-027D-4D99-A9D0-E593F41DA730 /RGName:"contoso.com\dfsn\corpinstall"

---

## Scenario 14: Enable LDAP Search Statistics in LDP
> 来源: ado-wiki-b-enable-ldap-search-statistics-ldp.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. Open LDP tool
   - 2. Modify the **search options** to **Extended**
   - 3. Click on **Controls**

---

## Scenario 15: Child-SP RetAddr Call Site
> 来源: ado-wiki-b-lsass-crash-dump-analysis.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 16: ADPerf script data collection
> 来源: ado-wiki-b-lsass-high-memory-member-server-data-collection.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 17: AADDS LDAPS Troubleshooting
> 来源: ado-wiki-c-aadds-ldaps-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. In Azure Portal → Microsoft Entra Domain Services → Properties, verify:
- 2. Download and install [PortQryUI](https://www.microsoft.com/en-us/download/details.aspx?id=24009)
- 3. Test TCP port 636 connectivity to the Secure LDAP external IP:
- 4. **If connectivity fails** → Check the MEDS NSG:
- 1. Export/copy the MEDS LDAPS certificate (identified by thumbprint).
- 2. Import into **Computer** certificate store on the client workstation.
- 3. Retry LDAPS bind with LDP.exe.

---

## Scenario 18: ado-wiki-c-adlds-replication-troubleshooter
> 来源: ado-wiki-c-adlds-replication-troubleshooter.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Tips**
   - ADLDS replication works like Active Directory (AD), with the main difference being the static port usage for Remote Procedure Call (RPC) configured for the ADLDS LDAP port.
   - The commands used for ADLDS are the same as for AD, but you need to add the port number after specifying the source and destination. For example:

---

## Scenario 19: ADPERF: LSASS High CPU Data Collection Guide (Manual)
> 来源: ado-wiki-c-adperf-lsass-high-cpu-data-collection-manual.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Sessions**
   - ADPERF Troubleshooting Sessions: http://aka.ms/adperfninja
   - Lesson 1 & 2: Overview, Scoping and Data Collection

---

## Scenario 20: Walkthrough of data analysis for SAM workload (using Process Dumps)
> 来源: ado-wiki-c-adperf-lsass-high-cpu-sam-workload-process-dumps.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Resolution**
   - After disabling/disconnecting CheckPoint Identity Awareness, CPU load on DCs returned to normal. Customer contacts CheckPoint support for further investigation.

---

## Scenario 21: Walkthrough of data analysis for SAM workload (using WPR)
> 来源: ado-wiki-c-adperf-lsass-high-cpu-sam-workload-wpr.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Resolution**
   - After stopping the script execution, the CPU load decreased.

---

## Scenario 22: ADPERF: LSASS High CPU Scoping Questions
> 来源: ado-wiki-c-adperf-lsass-high-cpu-scoping.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 23: DFSR troubleshooting guide
> 来源: ado-wiki-c-dfsr-data-collection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Root cause analysis**
   - Replication is now operating properly, but the customer wishes to investigate a prior failure:
   - **TSS-SDP**/Support Diagnostic from both members (must be collected as soon as possible as debug logs are circular).
   - Request s**pecific file names and paths** of affected data and timeframe of the issue (as closely as possible). The customer needs to provide exact path information when RCA focus is about specific fi

---

## Scenario 24: DFSR service: components and dependencies
> 来源: ado-wiki-c-dfsr-dependency-info.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 25: How to reinitialize Sysvol on a Domain Controller
> 来源: ado-wiki-c-dfsr-reinitialize-sysvol.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Log on to the Domain Controller where you are connecting to in ADSIedit.msc.
- 2. Open an elevated command prompt and run the following command:
- 1. In the ADSIEDIT.MSC tool, modify the following distinguished name (DN) value and attribute on each of the domain controllers (DCs) that you want to make non-authoritative:
- 2. Force Active Directory replication throughout the domain.
- 3. Run the following command from an elevated command prompt on the same servers that you set as non-authoritative:
- 4. You'll see Event ID **4114** in the DFSR event log indicating Sysvol replication is no longer being replicated.
- 5. On the same DN from Step 1, set **msDFSR-Enabled=TRUE**.
- 6. Force Active Directory replication throughout the domain.
- 7. Run the following command from an elevated command prompt on the same servers that you set as non-authoritative:
- 8. You'll see Event ID **4614** and **4604** in the DFSR event log indicating Sysvol replication has been initialized. That domain controller has now done a **D2** of Sysvol replication.

---

## Scenario 26: Support topic
> 来源: ado-wiki-c-dfsr-sysvol-scoping.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 27: ado-wiki-c-repadmin-forest-wide-replication-health
> 来源: ado-wiki-c-repadmin-forest-wide-replication-health.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 28: ado-wiki-c-repadmin-single-dc-replication-status
> 来源: ado-wiki-c-repadmin-single-dc-replication-status.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 29: Slow DFS-replication performance
> 来源: ado-wiki-d-dfsr-slow-replication-in-depth.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. On one Server A, content is updated and triggers a USN change notification to the local DFSR service.
- 2. Server A's DFSR database is updated with the metadata for the update.
- 3. Replication partner Server B is notified that updates are available.
- 4. Server B requests a version vector exchange and identifies that it requires the update.
- 5. Server B requests the updates from Server A.
- 6. Server A builds the response and sends the update to Server B.
- 7. Server B processes the update.

---

## Scenario 30: How to Identify Top Expensive / Inefficient LDAP Searches
> 来源: ado-wiki-d-identify-expensive-ldap-searches.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. Save off and then increase the Directory Service event log size on all DCs in one of the affected sites
   - 2. Enable 1644 event logging on all DCs in one site:
   - Note: this will cause one event 1644 to be logged for each LDAP query exceeding a threshold

---

## Scenario 31: Lsass Crash Scoping Questions
> 来源: ado-wiki-d-lsass-crash-scoping.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 32: Lsass High CPU Customer-Ready Data Collection Steps
> 来源: ado-wiki-d-lsass-high-cpu-data-collection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Click Start, click Administrative Tools, and then click Reliability and Performance Monitor.
- 2. Double-click Data Collector Sets, double-click System, right-click Active Directory Diagnostics, and then click Start.
- 3. The collector will automatically gather performance and diagnostic data and stop after 5 minutes. Then, it will compile the data into a report.
- 4. The contents of the `c:\perflogs\adds\<DATE>` folder may be compressed and uploaded to our workspace.
- 1. Open Performance area in Computer Management under data collector sets folder
- 2. Right-Click the "User defined" Folder and select "New\Data Collector Set"
- 3. Give the set a decent name
- 4. Select the System AD Data Collector as the template
- 5. Click "Finish"
- 6. Right-click the new set and select "Data Manager..." to customize:

---

## Scenario 33: ado-wiki-e-ldap-client-data-collection-tss
> 来源: ado-wiki-e-ldap-client-data-collection-tss.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Identify the process generating the LDAP traffic, you can use the method you prefer, such as: Network trace, Procmon or any other.
- 2. Modify the "tss_config.cfg" file adding in the _LDAPcliProcess parameter the actual process name generating the traffic. I.E.
- 3. Start the TSS log collection from the elevated Powershell with the command:
- 2. Let the script start its logs captures and then reproduce the issue
- 3. Stop the TSS traces once the issue was reproduced by focusing back the Powershell previously opened and pressing "Y" key
- 4. Verify the necessary logs have been collected properly under the folder "C:\MS_DATA"
- 5. Have the customer share the data using the case DTM
- 1. Start the TSS log collection from the elevated Powershell with the command:
- 2. Select the option 1. to start the traces immediately.
- 3. Stop the TSS traces once the issue was reproduced by focusing back the Powershell previously opened and pressing "Y" key

---

## Scenario 34: Scoping
> 来源: ado-wiki-e-ldap-client-scoping-data-collection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. From elevated command prompt run the following to trace "mmc.exe" (can be replaced with any other process name):
- 2. Reproduce what is being traced in the process configured in the previous step.
- 3. Stop the trace:

---

## Scenario 35: ADPerf - data analysis - LSASS high handles
> 来源: ado-wiki-e-lsass-high-handles-data-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Load the WPR ETL into WPA.exe.
- 2. Configure symbols via Trace -> Configure Symbol Paths menu.
- 3. You will see Loading symbols...and eventually, it will complete. This may take a while.
- 4. Open the Handles graph by dragging it over to the right-hand side of WPA.
- 5. Configure your view by adding columns like Owning Process, Closing Process, Create Stack, or use the WPR Profile for High Handles ([HighHandlesWPAProfile.zip](/.attachments/HighHandlesWPAProfile-77
- 6. Look for lsass.exe on the list, expand it, and check what Handle Type is overconsumed.
- 7. Drill through the Create Stack column to better understand where handles are opened.

---

## Scenario 36: ado-wiki-e-lsass-high-handles-data-collection
> 来源: ado-wiki-e-lsass-high-handles-data-collection.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 37: Walkthrough of Troubleshooting a Logon Session Leak in LSASS
> 来源: ado-wiki-e-lsass-logon-session-leak-walkthrough.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 0.000>  !count !grep LogonId !exec -x "!kerbsess"
- 0.000>  count !grep LogonId !exec -x "!kerbsess"

---

## Scenario 38: Overview
> 来源: ado-wiki-e-meds-resource-forest.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting tools**
   - Network traces to analyze traffic flows and authentication
   - PortqueryUI.exe to check for blocked ports
   - Nltest.exe /trusted_domains to list trusts

---

## Scenario 39: How to configure Active Directory and LDS diagnostic event logging
> 来源: ado-wiki-e-replication-diagnostic-logging.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 40: ado-wiki-e-replication-priority-boost
> 来源: ado-wiki-e-replication-priority-boost.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 41: Domain controller notification of changes
> 来源: ado-wiki-e-replication-schedule-change-notification.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Open ADSIEdit.msc.
- 2. In ADSI Edit, expand the Configuration container.
- 3. Expand Sites, navigate to the Inter-Site Transports container, and select `CN=IP`.
- 4. Right-click the site link object for the sites where you want to enable change notification, such as `CN=DEFAULTSITELINK`, and click Properties.
- 5. In the Attribute Editor tab, double-click on options.
- 6. Click OK.

---

## Scenario 42: Scenario based troubleshooting
> 来源: ado-wiki-f-account-lockout-ntlm-auth-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 540.1604> SPM-Trace: Creating session for [650.0]
- 540.3516> SPM-Trace: Creating session for [328.0]
- 540.3516> SPM-Trace: Creating session for [bf8.0]
- 540.3516> SPM-Trace: Creating session for [bd0.0]
- 540.1604> SPM-Trace: Creating session for [f74.0]
- 540.1604> SPM-Trace: Creating session for [e2c.0]
- 540.3516> SPM-Trace: NewTokenInfo : 1767f00
- 540.3516> SPM-Trace: TokenSize : 4d0
- 540.3516> SPM-Trace: CurrentSid : 17680c0
- 540.3516> SPM-Helpers: [3c0] LsapDupHandle(aa4, 1080 (@146eb50)) = 0

---

## Scenario 43: ado-wiki-f-dfsr-connectivity-failures
> 来源: ado-wiki-f-dfsr-connectivity-failures.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Root Cause**
   - When a file is updated on a server, that partner sends a notification to replication partner(s) so the update may be requested. The downstream server is unable to establish a connection with the upstr
2. **Troubleshooting Steps**
   - 1. **RPCDump**: Query the remote partner's endpoint mapper to verify registered endpoints:
   - Look for the specific dynamic port used by DFSR
   - Check if the port is accessible

---

## Scenario 44: ado-wiki-f-ldap-detailed-network-traffic
> 来源: ado-wiki-f-ldap-detailed-network-traffic.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.2.840.48018.1.2.2 (MS KRB5 - Microsoft Kerberos 5)</P>
- 1.2.840.113554.1.2.2 (KRB5 - Kerberos 5)</P>

---

## Scenario 45: Introduction
> 来源: ado-wiki-f-ldap-network-traffic-netmon.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 46: Introduction
> 来源: ado-wiki-f-ldap-server-data-collection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Open Performance Monitor on the domain controller
- 1. To use the built-in AD Data Collector Set, go to Data Collector Sets --> System --> Active Directory Diagnostics
- 1. Start it, by default it runs for 5 minutes
- 1. Once the data collection is completed, you will find a report.html output file that you can review and look for outstanding numbers in LDAP performance
- 1. Set the Field Engineering registry entry to 5 on the DC:
- 2. Configure the values for the registry-based filters for expensive, inefficient and long running searches:
- 3. After the above registry values are set, you will start seeing event ID 1644 in the Directory Service event log
- 1. Collect enough data (~30 minutes during peak time should be enough), then export the Directory Service event log and disable the diagnostic logging by reverting the Field Engineering registry to 0.
- 1. Use the Event1644Reader.ps1 script to analyze the data - you can download it from this blog: [How to find expensive, inefficient and long running LDAP queries in Active Directory - Microsoft Commun
- 1.	Start tracing:

---

## Scenario 47: What can be controlled on server side?
> 来源: ado-wiki-f-ldap-server-policies-controls.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.	The client sends the server a search request with the Simple Paged Results control (OID 1.2.840.113556.1.4.319), an empty cookie and the initial page size
- 2.	The server returns the number of entries specified by the page size and the cookie, which contains information about where to continue the search later
- 3.	The client sends the next search request with the same parameters and the same cookie included
- 4.	The server sends the next set of results based on the information from the cookie, then updates the cookie as well to know where to continue later. If the number of objects doesnt fill the page, th
- 5.	If no cookie is returned by the server, the client must consider the paged search to be successfully complete
- 1. The client specifies the range and the attribute it would like to query. For example, to retrieve the 1st through the 1500th values of the member attribute, the attributes list in the SearchRequest
- 2. The server will then return the range and specify what it was: "member;0-1499=cn=User1"
- 3. When continuing, client specifies value range it wants to see. For example, to return all the remainder values starting with the 1501st: "member;1500-*"
- 4. The last set of values returned by the server has an open-end range specifier to let the client know that it returned all the values: "member;1500-*=cn=User1"
- 1. The client sends the server a search request with the Sort control, which specifies the sort keys. Each sort key consists of an AttributeType, an Ordering Rule, and a flag that indicates whether en

---

## Scenario 48: Collect LSASS dump when CPU > 80%
> 来源: ado-wiki-f-xperf-resources-lsass-high-cpu.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 49: Common troubleshooting flow for account lockout issues
> 来源: ado-wiki-g-account-lockout-ntlm-caller-process.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Enable audit and Netlogon debug log on all domain controllers (DCs) and wait for the next occurrence.
- 2. After re-occurrence, find event 4740 containing the concerned username on all DCs.
- 3. Filter out event 4771/4776 containing the concerned username on all DCs.
- 1. Identify the server from netlogon.log of the DC where event 4771 is logged.
- 2. Enable audit of logon events and capture Process Monitor log for network activities on that server.
- 3. Wait for event 4625 containing the concerned username on that server. Get client hostname, IP address, and source port.
- 4. Use source IP and port to filter out events in the Process Monitor log, and then get the server port. With the server port, the listening process can be determined.
- 5. If needed, capture Process Monitor log on the client to identify the process.

---


---

## Incremental Scenarios (2026-04-18)

## Scenario 50: Customer is unable to install Azure AD Password Protection DC Agent, after uninstalling all previous versions, because o...
> Source: contentidea-kb (entra-id-3650) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: Customer is unable to install Azure AD Password Protection DC Agent, after uninstalling all previous versions, because of the following error:CheckForNonUpgradeableApps - a nonupgradeable app was foun...
2. **Root cause**: Uninstalling Azure AD Password Protection DC Agent' - '1.1.10.3' did not clear the registry key, found in SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall
3. **Solution**: The issue was resolved after cleaning the registry key of Azure AD Password Protection DC Agent' - '1.1.10.3', found in SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall

---

## Scenario 51: While joining a Linux VM in a step we need to run kinit <User's UPN> this step may throw the below errors,kinit: Cannot ...
> Source: contentidea-kb (entra-id-3655) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: While joining a Linux VM in a step we need to run kinit <User's UPN> this step may throw the below errors,kinit: Cannot find KDC for realm '<Domain FQDN>' while getting initial credentialskinit: Resou...
2. **Root cause**: kinit: Cannot find KDC for realm '<Domain FQDN>' while getting initial credentialsNo definition for the domain FQDN in krb5.conf file.kinit: Resource temporarily unavailable while getting initial cred...
3. **Solution**: 1) kinit: Cannot find KDC for realm '<Domain FQDN>' while getting initial credentials  This      error occurs if there is no definition in the /etc/krb5.conf file for the      kdc of domain you are tr...

---

## Scenario 52: Attempts to update Active Directory (AD) attribute (such as personalPager, otherPager, or extensionAttribute5) user acco...
> Source: contentidea-kb (entra-id-3683) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: Attempts to update Active Directory (AD) attribute (such as personalPager, otherPager, or extensionAttribute5) user account fail in both ADSI Edit and PowerShell.  On ADSI Edit or PowerShell the error...
2. **Root cause**: Inspection reveals that the affected user object has a very large number of entries in the userCertificate attribute, while a typical user has none or very few. This is causing directory limits or con...
3. **Solution**: Perform a safe cleanup of the userCertificate attribute values for the impacted user. After cleanup, re-attempt the attribute updates. Recommended Steps:   Assess Current Values      Use PowerShell to...

---

## Scenario 53: Attempts to update Active Directory (AD) attribute (such as personalPager, otherPager, or extensionAttribute5) user acco...
> Source: contentidea-kb (entra-id-3688) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: Attempts to update Active Directory (AD) attribute (such as personalPager, otherPager, or extensionAttribute5) user account fail in both ADSI Edit and PowerShell. Error code: 0x2024 The administrative...
2. **Root cause**: The affected user object has a very large number of entries in the userCertificate attribute. This is causing directory limits or constraints to be hit for that object. This is a data/volume issue on ...
3. **Solution**: Perform a safe cleanup of the userCertificate attribute values for the impacted user. Steps: 1) Assess Current Values with Get-ADUser. 2) Back Up/Export Existing Values. 3) Clean Up Redundant/Stale Ce...

---
