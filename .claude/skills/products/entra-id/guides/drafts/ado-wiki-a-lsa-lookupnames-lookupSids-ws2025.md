---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Changes in Windows Server 2025 and Windows 11 24H2/Netlogonless Lookups/LSA LookupNames and LSALookupSids"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Changes%20in%20Windows%20Server%202025%20and%20Windows%2011%2024H2%2FNetlogonless%20Lookups%2FLSA%20LookupNames%20and%20LSALookupSids"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1688276&Instance=1688276&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1688276&Instance=1688276&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]



If you wish to learn about "**Remove Netlogon dependency** from LSALookups feature introduced in Windows Server 2025 and Windows11 23H2 then using the TOC jump to the section "What's new about LSALookups in Windows Server 2025 and Windows11 24H2"

[Click here to navigate](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1689711/Remove-Netlogon-dependency-of-LSALookups)
---


# Technical Documentation: LSALookupNames and LSALookupSIDs APIs


**Setting the Context:** Below is the technical information regarding the LSALookupNames and LSALookupSID APIs. These APIs assist applications in resolving Names to SIDs and SIDs to Names. They have been available since Windows 2000 and continue to be supported in Windows Server 2025 and Windows 11 24H2, with some modifications related to the authentication method used to retrieve the information. Previously, these two APIs utilized the Netlogon SSP (yes, you heard this correct there is a Netlogon SSP similar to Kerberos or NTLM SSP), but they now use Kerberos as their authentication protocol. 

## 1. Overview: General overview of LSALookupNames and LSALookupSIDs APIs

**LSALookupNames** and **LSALookupSIDs** are essential Windows API functions that help applications resolve security identifiers (SIDs) to human-readable names and vice versa. These functions are part of the Local Security Authority (LSA) and are used by system processes, applications, and services to manage access control, security audits, and account information.

**LSALookupNames:** <br>
The LsaLookupNames function retrieves the security identifiers (SIDs) that correspond to an array of user, group, or local group names.
The LsaLookupNames function is superseded by the LsaLookupNames2 function. Applications should use the LsaLookupNames2 function to ensure future compatibility.
The LsaLookupNames function can also retrieve computer accounts.

Use fully qualified account names (for example, domain_name\user_name) instead of isolated names (for example, user_name). Fully qualified names are unambiguous and provide better performance when the lookup is performed. This function also supports fully qualified DNS names (for example, example.example.com\user_name) and user principal names (UPN) (for example, someone@example.com).

**LSALookupSIDs:**<br>
The LsaLookupSids function looks up the names that correspond to an array of security identifiers (SIDs). If LsaLookupSids cannot find a name that corresponds to a SID, the function returns the SID in character form or account SIDs, the string returned in the Name member is the isolated name of the account (for example, user_name). If you need the composite name of the account (for example, Acctg\user_name), get the domain name from the ReferencedDomains buffer and append a backslash and the isolated name.

##Applications that uses LSALookupNames and LSALookupSID's <br>
- Windows Object Picker 
- Active Directory Object Picker
- SQL
- Exchange 
- PSGETSID.exe (Sysinternals utility which can help troubleshoot LSALookupNames and LSALookupSID's)

(There are several applications that uses the two API's and the above listed is some of the examples) 


**PSGETSID:** 

**PSGetSID** is a command-line tool from the **Sysinternals Suite** developed by Mark Russinovich, designed to simplify the process of retrieving and viewing security identifiers (SIDs) for both local and remote machines, users, and groups. SIDs are essential for security management in Windows environments, as they uniquely identify user accounts, groups, and other entities in Windows systems. The **PSGetSID** tool can help administrators quickly determine the SID of a user or group, or resolve a SID back to a human-readable name.


**PSGetSID** is a lightweight utility that provides a straightforward way to query and retrieve SIDs, complementing the more complex API calls like `LSALookupNames` and `LSALookupSIDs`. With this tool, administrators can quickly retrieve:
- The SID of a local or remote computer.
- The SID of a specified user or group.
- The account name corresponding to a given SID.


### Key Features of PSGetSID

1. **Local and Remote SID Lookup**:
   - Retrieve SIDs for local users and groups or remote machines across the network.
   
2. **Resolve SIDs to Account Names**:
   - Convert a SID to its corresponding account name, simplifying the identification of users or groups associated with a specific SID.
   
3. **SID Consistency Checks**:
   - PSGetSID allows for easy verification of SID consistency across different machines in the network, ensuring accurate identity management for users and groups.


#### Syntax

The typical usage of **PSGetSID** follows this syntax:

```bash
psgetsid [Computer | Account | SID]
```

- If no parameters are specified, the tool returns the SID of the local computer.
- You can provide a **computer name**, **account name**, or **SID** to query the specific entity you're interested in.

#### Example Usages

1. **Retrieve the SID of the local computer**:
   ```bash
   psgetsid
   ```

2. **Get the SID for a local user or group**:
   ```bash
   psgetsid <username>
   ```

   Example:
   ```bash
   psgetsid Administrator
   ```

   This command retrieves the SID of the "Administrator" account on the local machine.

3. **Get the SID for a remote computer**:
   ```bash
   psgetsid \\RemoteComputer
   ```

4. **Resolve a SID to its account name**:
   ```bash
   psgetsid S-1-5-21-1234567890-123456789-1234567890-500
   ```

   This command resolves the given SID to its corresponding user or group name.

### How PSGetSID Complements LSALookupNames and LSALookupSIDs

While **LSALookupNames** and **LSALookupSIDs** provide programmatic access for applications to resolve names and SIDs, **PSGetSID** offers a simpler, command-line interface for administrators to perform similar tasks without the need for custom scripts or code. It can be a quick alternative for resolving names and SIDs without the need for interacting directly with the APIs.

**PSGetSID** is especially useful for:
- Quick, ad-hoc lookups of SIDs for troubleshooting.
- Resolving SIDs found in logs or error messages.
- Verifying SID consistency across multiple systems.


#**How it works:**

**1. When the Account belongs to the same domain** 

- The client application psgetsid.exe initiates an LSALookupName request to the domain controller to resolve the name contoso\johnb.
- The Domain Controller receives this request via the LSARPC interface.
- The Domain Controller converts the username johnb to its corresponding SID.
- The SID information is then sent back to the client machine.


![Samedomain.png](/.attachments/Samedomain-84363f40-14aa-44ed-af09-22c19d8bad0d.png =300x300) 

___

**2. When the account belongs to a user in the same forest**

- The client application psgetsid.exe issues an LSALookupName request to the domain controller to resolve the name emea\sara.
- The domain EMEA is a child domain within the contoso.com forest.
- The Domain Controller within the contoso.com forest receives this request via the LSARPC interface.
- The Domain Controller recognizes that the account resides in emea.contoso.com. Since this Domain Controller also functions as a Global Catalog, it possesses information about the child domain.
- The Domain Controller translates the username emea\sara to its corresponding SID.
- The SID information is then transmitted back to the client machine.

![SameForest.png](/.attachments/SameForest-1db5a042-d806-452a-b8b4-1ca73e6fcd6c.png =450x350)

___

**3. When the account belongs to a user in a different forest**

- The client application psgetsid.exe issues an LSALookupName request to the domain controller to resolve the name fabrikam\simond.
- The domain FABRIKAM is a domain in a different forest where the contoso.com and Fabrikam.com has a Forest or External trust
- The Domain Controller within the contoso.com forest receives this request via the LSARPC interface.
- The Domain Controller recognizes that the account resides in fabrikam.com. Since there is a trust with fabrikam.com
- The Contoso Domain Controller would forward the request to the domain controller in fabrikam.com 
- The Domain Controller in fabrikam.com translates the username fabrikam\simond to its corresponding SID.
- The SID information is then transmitted back to the contoso.com Domain Controller
- The Domain Controller would then forward the request to the Client machine

![image.png](/.attachments/image-8f9529a4-a6e5-4f96-835b-5ccdc9aeb3e9.png =700x350)

___

## Network trace analysis of a Client machine sending a LSALookupName to a domain controller

**Client Network trace:**

**1. Client performing a TCP 3-Way handshake to the secure Channel domain controller over the RPC Port 135:**

```
893	13.397379	ClientMachine	Domain Controller	TCP	54	49928  135 [ACK] Seq=1 Ack=1 Win=262656 Len=0
892	13.397321	Domain Controller	ClientMachine	TCP	66	135  49928 [SYN, ACK, ECE] Seq=0 Ack=1 Win=65535 Len=0 MSS=1460 WS=256 SACK_PERM
893	13.397379	ClientMachine	Domain Controller	TCP	54	49928  135 [ACK] Seq=1 Ack=1 Win=262656 Len=0
```

**2. Client performing an RPC bind (Authenticating to the RPC Endpoint mapper on the Domain Controller)**

```
894	13.397447	ClientMachine	Domain Controller	DCERPC	214	Bind: call_id: 2, Fragment: Single, 3 context items: EPMv4 V3.0 (32bit NDR), EPMv4 V3.0 (64bit NDR), EPMv4 V3.0 (6cb71c2c-9812-4540-0300-000000000000)
895	13.398300	Domain Controller	ClientMachine	DCERPC	162	Bind_ack: call_id: 2, Fragment: Single, max_xmit: 5840 max_recv: 5840, 3 results: Provider rejection, Acceptance, Negotiate ACK
```

**3. The client requests the RPC Endpoint Mapper service to obtain the ephemeral port for LSARPC. The Domain Controller responds with port 49673, which is the port on which LSARPC is listening on the Domain Controller.**

```
896	13.398422	ClientMachine	Domain Controller	EPM	222	Map request, LSARPC, 32bit NDR
897	13.399180	Domain Controller	ClientMachine	EPM	226	Map response, LSARPC, 32bit NDR
DCE/RPC Endpoint Mapper, Map
    Operation: Map (3)
    [Request in frame: 896]
    Handle: 0000000000000000000000000000000000000000
    Num Towers: 1
    Tower array:
        Max Count: 4
        Offset: 0
        Actual Count: 1
        Tower pointer:
            Referent ID: 0x0000000000000003
            Length: 75
            Length: 75
            Number of floors: 5
            Floor 1 UUID: LSARPC
            Floor 2 UUID: 32bit NDR
            Floor 3 RPC connection-oriented protocol
            Floor 4 TCP Port:49673 ---------------------------------->>>> Domain Controller is listening LSARPC on port 49673
            Floor 5 IP:Domain Controller
    Return code: 0x00000000
```

**4. The client now performs a three-way handshake to the LSARPC ephemeral port 49673**

```
898	13.399704	ClientMachine	Domain Controller	TCP	66	49929  49673 [SYN, ECE, CWR] Seq=0 Win=64240 Len=0 MSS=1460 WS=256 SACK_PERM
899	13.400036	Domain Controller	ClientMachine	TCP	66	49673  49929 [SYN, ACK, ECE] Seq=0 Ack=1 Win=65535 Len=0 MSS=1460 WS=256 SACK_PERM
900	13.400066	ClientMachine	Domain Controller	TCP	54	49929  49673 [ACK] Seq=1 Ack=1 Win=262656 Len=0
```

**5. The client now performs BIND (Authenticate) operation to the LSARPC interface using the Netlogon SSP provider**

```
901	13.400198	ClientMachine	Domain Controller	DCERPC	264	Bind: call_id: 2, Fragment: Single, 3 context items: LSARPC V0.0 (32bit NDR), LSARPC V0.0 (64bit NDR), LSARPC V0.0 (6cb71c2c-9812-4540-0300-000000000000)
    Auth Info: NETLOGON Secure Channel, Packet privacy, AuthContextId(0)
        Auth type: NETLOGON Secure Channel (68)
        Auth level: Packet privacy (6)
        Auth pad len: 0
        Auth Rsrvd: 0
        Auth Context ID: 0
        Secure Channel NL_AUTH_MESSAGE
902	13.400631	Domain Controller	ClientMachine	DCERPC	182	Bind_ack: call_id: 2, Fragment: Single, max_xmit: 5840 max_recv: 5840, 3 results: Provider rejection, Acceptance, Negotiate ACK
```

**6. The client sends the LookupName request and the Domain Controller translate the information and sends back the response**

```
903	13.400800	ClientMachine	Domain Controller	LSARPC	318	lsa_LookupNames4 request
Operation: lsa_LookupNames4 (77)
904	13.401775	Domain Controller	ClientMachine	LSARPC	366	lsa_LookupNames4 response
```

**Client machine LSP.log:**

**Reviewing the below logs you can observe:**

- Username that is being requested by the client machine is contoso\johnb
- Process on the client machine that is made the request is PsGetsid.exe
- Domain Controller that the client machine forwarded the request is vNextDC01.contoso.com
- Domain Controller responded back to the request successfully (You would not find the translated SID in the LSP.log) 

**LSP.log**

## How to enable LSP.log

**Enable**
```
Set-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Control\Lsa -Name LspDbgInfoLevel -Value 0x40000800 -Type dword -Force

Set-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Control\Lsa -Name LspDbgTraceOptions -Value 0x1 -Type dword -Force
```

**Disable**

```
Set-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Control\Lsa -Name LspDbgInfoLevel -Value 0x0 -Type dword -Force

Set-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Control\Lsa -Name LspDbgTraceOptions -Value 0x0 -Type dword -Force
```

**Analyzing LSP.log**

```
[ 9/25 10:31:08] 792.868> LspDsLookup - LookupNames request for 1 names with level=1, mappedcount=0, options=0x0, clientRevision=2 is being processed. Names are;
[ 9/25 10:31:08] 792.868> LspDsLookup - 		Names[ 0 ] = contoso\johnb
[ 9/25 10:31:08] 792.868> LspDsLookup - 	Requestor details: Local Machine, Process ID = 3696, Process Name = C:\Users\administrator.CONTOSO\Desktop\PsGetsid.exe
[ 9/25 10:31:08] 792.868> LspDsLookup - 1 names remain unmapped
[ 9/25 10:31:08] 792.868> LspDsLookup - LookupNames chain request (using Netlogon) to \\2016DC.contoso.com for 1 names will be made with level=2, mappedcount=0, options=0x0, serverRevision=0. Names are;
[ 9/25 10:31:08] 792.868> LspDsLookup - 		Names[ 0 ] = contoso\johnb
[ 9/25 10:31:08] 792.868> LspDsLookup - Lookup request (using Netlogon) to \\2016DC.contoso.com.contoso.com returned with 0x0 and mappedcount=1, serverRevision=0
[ 9/25 10:31:08] 792.868> LspDsLookup - LookupNames request for 1 names with level=1, mappedcount=0, options=0x0, clientRevision=2 is being processed. Names are;
[ 9/25 10:31:08] 792.868> LspDsLookup - 		Names[ 0 ] = contoso\johnb
[ 9/25 10:31:08] 792.868> LspDsLookup - 	Requestor details: Local Machine, Process ID = 3696, Process Name = C:\Users\administrator.CONTOSO\Desktop\PsGetsid.exe
[ 9/25 10:31:08] 792.868> LspDsLookup - 1 names remain unmapped
[ 9/25 10:31:08] 792.868> LspDsLookup - LookupNames request for emea\deeksha is satisfied using Sid-Name cache
```



___
## 2. API Usage by Applications

### 2.1 LSALookupNames

- **Purpose**: The `LSALookupNames` API converts one or more human-readable account names (e.g., usernames or domain names) into their corresponding SIDs.
- **Usage**: Applications use this API when they need to convert user or group names to SIDs, which are unique identifiers for security principals.
  - **Example**: An access control application might use `LSALookupNames` to obtain the SID of a user based on their username for permissions validation.

### 2.2 LSALookupSIDs

- **Purpose**: The `LSALookupSIDs` API resolves one or more SIDs into human-readable names.
- **Usage**: Applications use this API to display user-friendly names when working with security logs, auditing, or permissions.
  - **Example**: A security monitoring tool might use `LSALookupSIDs` to translate SIDs in event logs into readable names to help administrators understand who accessed or modified resources.

## 3. How It Works

### 3.1 LSALookupNames Workflow

1. The application sends a request with a list of account names to the `LSALookupNames` API.
2. The API interacts with the Local Security Authority (LSA) to resolve these names into their corresponding SIDs.
3. If the accounts are local to the machine then the SID's are retrived and sent back to the application
4. If the names are a part of a domain then the request is forwarded to a domain controller which the client has a secure channel to translate the name to a SID
5. If the nameas are a part of a different domain in the same forest then the request is forwarded to a domain controller which the client has a secure channel, the domain controller would query its global catalog to translate the information
6. If the names are a part of a different forest then the request is forwarded to a domain controller which the client has a secure channel and the domain controller would forward the request to the forest which it has a trust. 

### 3.2 LSALookupSIDs Workflow

1. The application sends a request with a list of account SIDs to the `LSALookupSID` API.
2. The API interacts with the Local Security Authority (LSA) to resolve these SID's into their corresponding names.
3. If the accounts are local to the machine then the names are retrived and sent back to the application
4. If the names are a part of a domain then the request is forwarded to a domain controller which the client has a secure channel to translate the SID to a Name
5. If the nameas are a part of a different domain in the same forest then the request is forwarded to a domain controller which the client has a secure channel, the domain controller would query its global catalog to translate the information
6. If the names are a part of a different forest then the request is forwarded to a domain controller which the client has a secure channel and the domain controller would forward the request to the forest which it has a trust. 

## 4. Architecture Explanation

### 4.1 Local Security Authority (LSA)
- LSA is responsible for managing local security policies and interacting with both the Security Accounts Manager (SAM) and Active Directory.
- It handles account and group lookups for local and domain accounts.

### 4.2 Active Directory Integration
- For domain-joined machines, when resolving domain accounts, both APIs may interact with the domain controller via LSA.
- Queries are sent to Active Directory for account name or SID resolution.

### 4.3 Caching Mechanism
- LSA implements caching to speed up lookups for frequently requested names and SIDs.
- This ensures better performance by avoiding repeated lookups to external services such as Active Directory.

## 5. Known Issues

1. **Delayed Responses**: 
   - Resolving domain SIDs or account names can be slow if there are network issues or domain controllers are unreachable.
   - **Resolution**: Verify connectivity and domain controller health.

2. **Multiple Account Matches**: 
   - When querying names, there may be ambiguity if multiple accounts share the same name across different domains.
   - **Resolution**: Applications should specify the domain explicitly to avoid confusion.

3. **Account Not Found**: 
   - When an account or SID no longer exists (due to deletion or replication issues), these APIs may fail to resolve them.
   - **Resolution**: Ensure the account or SID is still valid and check for replication delays.


### 6. Logs to Collect

For troubleshooting issues related to `LSALookupNames` and `LSALookupSIDs`, the following logs should be collected:

1. **LSP Logs**: 
   - LSP logs needs to be enabled via Registry keys to view the transcations of LSALookupNames and LSALookupSID's

2. **SysInternals Tools**: 
   - Use **SysInternals Process Monitor** to trace API calls in real-time and identify potential failures or delays.

### 7. Known Issues

1. **Isolated name lookups causes application slowness:** <br>

By default, when the LookupAccountName function or the LsaLookupNames function resolves isolated names to security identifiers (SIDs) in Windows Server, a remote procedure call (RPC) is made to domain controllers on external trusted domains. (An isolated name is an ambiguous, non-domain-qualified user account.) In situations in which the primary domain has many external trust relationships with other domains or in which many lookups are performed at the same time, performance may decrease. You may see increased memory usage and increased CPU usage on the domain controllers.

The lookup functions accept names that use the following formats:
- NetBIOSDomainName\AccountName
- DnsDomainName\AccountName
- (UPN) AccountName@DnsDomainName
- (Isolated) AccountName

For the first three name formats in the list, the lookup functions can directly target a domain controller on the appropriate domain because these name formats contain the domain that is authoritative for the security principal.

The fourth name format, (Isolated) AccountName, is ambiguous. The lookup functions must systematically try to resolve the name to an SID by making an RPC to every trusted domain. For environments where many external trusts exist, this operation may require a serial enumeration of the trusted domains that involves making an RPC to a domain controller on each domain. In this scenario, performance decreases as the number of trusted domains increases.

The problem may show up when you have many trusted domains or forests (applies to both external and forest trusts), and/or some of these domains or forests are offline or slow to respond.

When the functions are called for an isolated name (the format is AccountName in contrast to domain\AccountName), a remote procedure call (RPC) is made to domain controllers on all trusted domains/forests. This issue might occur if the primary domain has many trust relationships with other domains/forests or if it's doing many lookups at a same time. For example, a script is configured to run at the startup of many clients, or many trusted domains/forests use the same script simultaneously

**Example:** An application trying to resolve a User by named **johnb** vs **contoso\johnb**  

[How to disable Isolated Name lookups](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/poor-performance-calling-lookup-functions)

2. **Network Port Blocks causing applications unable to translate SID to Names:** <br>

Consider a scenario where you have a shared folder which you wish to collaborate with your colleages and want to provide permissions to Johnb.  You open the Security tab of the shared folder and search for Johnb and add him to the list.  Consider the LSARPC ports blocked between the client and the domain controller then the Lookup's will fail.

This is not just for Security tab on a shared folder but think about applications that use the translation will also fail if the ports are blocked. 

3. **Active Directory Performance Issues:**

There are known issues where applications would send LookupNames or LookupSID's calls to the Domain controller causing LSASS.exe process to spike on the domain controller.  

## 8. Conclusion

The `LSALookupNames` and `LSALookupSIDs` APIs are critical in translating between user-friendly account names and SIDs. Applications relying on security and identity management extensively use these APIs. By understanding their architecture, known issues, and proper log collection, system administrators and developers can efficiently diagnose and resolve problems related to SID lookups.

---