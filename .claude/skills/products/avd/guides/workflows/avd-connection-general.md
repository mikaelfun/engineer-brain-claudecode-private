# AVD 连接通用 — 排查工作流

**来源草稿**: ado-wiki-a-determine-disconnection-source.md, ado-wiki-a-w365-avd-error-code-mapping.md, ado-wiki-b-avd-vs-mstsc-connection-flows.md, ado-wiki-b-connection-failed-no-resources.md, ado-wiki-cloudpc-redeploying.md, ado-wiki-cloudpc-restart-oce.md, ado-wiki-connection-flows-websocket-and-udp.md, ado-wiki-dump-cloudpc.md, ado-wiki-rename-cloudpc.md
**Kusto 引用**: connection-tracking.md, gateway-broker.md, rdp-core-events.md, user-activity.md
**场景数**: 32
**生成日期**: 2026-04-07

---

## Scenario 1: 1. Session Host triggered disconnect on UDP
> 来源: ado-wiki-a-determine-disconnection-source.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **First** event reported by **Client**, **second** event (seconds later) by **RDBroker**
   - Key pattern: Broker reporting comes a few seconds after Client event

## Scenario 2: 2. Session Host triggered disconnect on TCP/Websocket
> 来源: ado-wiki-a-determine-disconnection-source.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Usually **4 events** in order: Gateway, Client, Broker
   - Client & Gateway share the same ActivityId, Broker has next index (0100)

## Scenario 3: 3. Client machine triggers disconnect on TCP/Websocket
> 来源: ado-wiki-a-determine-disconnection-source.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - When client network goes down, error codes indicate client disconnect
   - But reported by **Gateway**, NOT the Client
   - Only **two** entries visible

## Scenario 4: 4. Client machine triggers disconnect on UDP
> 来源: ado-wiki-a-determine-disconnection-source.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - When client network breaks on UDP connection
   - Report does NOT show Client as source
   - Error reported by **Stack**

## Scenario 5: Cut network NOW
> 来源: ado-wiki-a-determine-disconnection-source.md | 适用: \u901a\u7528 \u2705

### 排查步骤
New-NetFirewallRule -DisplayName "SimNetCut" -Direction Outbound -Action Block -Enabled True
New-NetFirewallRule -DisplayName "SimNetCutIn" -Direction Inbound -Action Block -Enabled True

## Scenario 6: Schedule cleanup on next boot (self-deleting)
> 来源: ado-wiki-a-determine-disconnection-source.md | 适用: \u901a\u7528 \u2705

### 排查步骤
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument `
"-NoProfile -Command `"Remove-NetFirewallRule -DisplayName 'SimNetCut'; Remove-NetFirewallRule -DisplayName 'SimNetCutIn'; Unregister-ScheduledTask -TaskName 'RemoveNetCut' -Confirm:`$false`""
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName "RemoveNetCut" -Action $action -Trigger $trigger -RunLevel Highest -User "SYSTEM"

## Scenario 7: Simulate Client network drop:
> 来源: ado-wiki-a-determine-disconnection-source.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Just disconnect Wi-Fi or LAN on the client machine.

## Scenario 8: Kusto Query: Identify which side dropped first
> 来源: ado-wiki-a-determine-disconnection-source.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
//Last Packets (Last per Leg)
macro-expand isfuzzy=true force_remote=true AVD_Prod as X
(
 X.RDInfraTrace
 | where ActivityId == "<activity-id>"
 | where Msg contains "Last 10"
 | parse Msg with "[" ConnectionId:string "] " Direction:string " Last 10  " Type:string " packets: " PacketData:string
 | mv-apply Packet = split(PacketData, "],[") to typeof(string) on (
 extend Packet = replace_string(replace_string(Packet, "[", ""), "]", "")
 | parse Packet with PacketTimestamp:string ";" PacketSize:long
 )
 | extend PacketTimestamp = todatetime(PacketTimestamp)
 | extend Leg = case(
 Direction == "Reverse" and Type == "incoming", "SH -> GW",
 Direction == "Reverse" and Type == "outgoing", "GW -> SH",
 Direction == "Direct" and Type == "incoming", "Client -> GW",
 Direction == "Direct" and Type == "outgoing", "GW -> Client",
 "Unknown")
 | summarize arg_max(PacketTimestamp, PacketSize)
 by TIMESTAMP, ActivityId, ConnectionId, Leg
 | project TIMESTAMP, ActivityId, ConnectionId, Leg,
 LastPacketTime = PacketTimestamp, LastPacketSize = PacketSize
 | sort by LastPacketTime asc
 | extend DropOrder = row_number()
)
| sort by DropOrder asc
```
`[来源: ado-wiki-a-determine-disconnection-source.md]`

## Scenario 9: Reading the results:
> 来源: ado-wiki-a-determine-disconnection-source.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **SH side drop**: SH stopped sending data to GW, connection dropped after ~20 sec (8s warning state, 12s drop)
   - **Client side drop**: Client stopped sending data to GW first, then SH-GW leg drops ~29 seconds later

## Scenario 10: |WVD Error Code|CPC Error Code  |Error Description  |Recommendation  |
> 来源: ado-wiki-a-w365-avd-error-code-mapping.md | 适用: \u901a\u7528 \u2705

### 排查步骤
|--|--|--|--|
|ConnectionFailedClientDisconnect  |CPCClientDisconnect  |The user's network connection to their Cloud PC was unexpectedly interrupted.  |Advise the user to try connecting to their Cloud PC again. If the issue persists, there might be a problem with the user's network configuration.   |
|ConnectionFailedNoHealthyRdshAvailable  |CPCNoHealthyResourceAvailable  |The user's Cloud PC is currently not available or in a reachable state  |Advise the user to try connecting to their Cloud PC again. If the issue persists, check that the user has a Cloud PC assigned to them and advise the user to restart it via the end user web portal.  |
|UnexpectedNetworkDisconnect  |CPCUnexpectedNetworkDisconnect  |The user's connection to their Cloud PC was lost due to an unexpected network error. Poor network quality or invalid network configuration may cause such problems.  |Advise the user to try connecting to their Cloud PC again. If the issue persists, there might be a problem with your Virtual Network configuration. Check firewalls settings and/or make sure there are no network appliances that could block http traffic to the Cloud PC service.  |
|ConnectionFailedUserHasValidSessionButRdshIsUnhealthy  |CPCNoHealthyResourceAvailable  |The user's Cloud PC is currently not available or in a reachable state  |Advise the user to try connecting to their Cloud PC again. If the issue persists, check that the user has a Cloud PC assigned to them and advise the user to restart it via the end user web portal.  |
|SavedCredentialsNotAllowed  |CPCSavedCredentialsNotAllowed  |The user connection to their Cloud PC failed to establish because the Cloud PC configuration does not allow using saved credentials  |Advise user to use their credentials and not their saved credentials, or change session host configuration to allow for the use of saved credentials.  |
|InvalidCredentials  |CPCInvalidCredentials  |The user provided invalid authentication information (e.g. username/password) while connecting to the Cloud PC.  |Advise user to check their input credentials and try again.   |
|ReverseConnectResponseTimeout  |CPCConnectResponseTimeout  |The user's connection to their Cloud PC was lost due to an unexpected network timeout. Poor network quality or high resource usage on the Cloud PC may cause such problems.   |Advise the user to try connecting to their Cloud PC again. Make sure the user has good connection quality. If the issue persists, consider upgrading the user to a Cloud PC with higher specs.   |
|ConnectionFailedReverseConnectStackDNSFailure  |CPCConnectionFailedConnectStackDNSFailure  |The user's connection to their Cloud PC failed because the Cloud PC was not able to establish a connection to the Cloud PC service due to a DNS failure.   |Make sure DNS configuration on the Cloud PC network is correct and the DNS service is reachable and try connecting again  |
|AutoReconnectNoCookie  |CPCAutoReconnectFailed  |The user's connection to their Cloud PC failed because the Cloud PC client tried to reconnect to a session that is either new or whose connection information was reset  |Advise the user to try connecting to their Cloud PC again. If the issue persists, contact your admin  |
|ConnectionInitiationSequenceTimeout  |CPCConnectionSequenceTimeout  |The user connection to their Cloud PC failed due to a timeout waiting for the connection initiation sequence to complete. This may be because of pending credential prompt on the client  |Advise the user to try connecting to their Cloud PC again. If the issue persists, contact your admin  |
|NotAuthorizedForLogon  |CPCUserNotAuthorizedForLogon  |The user authentication failed because the user is not authorized to logon to the Cloud PC   |Make sure the user is authorized to logon to the assigned Cloud PC, and try connecting again  |
|OutOfMemory  |CPCOutOfMemory  |The user connection to their Cloud PC was lost due to memory exhaustion in the Cloud PC  |Advise the user to try connecting to the Cloud PC again. If the issue persists, consider upgrading the user to a Cloud PC with higher RAM/specs.   |
|PasswordExpired  |CPCPasswordExpired  |The user authentication failed because the user password is expired.  |Please reset the user's password  |
|UserAccountLocked  |CPCUserAccountLocked  |The user authentication failed because the user account is locked.  |Please unlock the user's account  |

## Scenario 11: Connection Flows
> 来源: ado-wiki-b-avd-vs-mstsc-connection-flows.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Differences between AVD and a regular RDP connection (AVD-specific steps highlighted in yellow in original)

## Scenario 12: MSTSC
> 来源: ado-wiki-b-avd-vs-mstsc-connection-flows.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. User enters the target hostname into MSTSC and clicks Connect.
1. The client sends X.224 Connection Request to the target [(MS-RDPBCGR: Negotiation-Based Approach)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-rdpbcgr/db98be23-733a-4fd2-b086-002cd2ba02e5). If RDP file had enablerdsaadauth:i:1 property set, the client adds PROTOCOL_RDSAAD (0x10) to the list of requested protocols.
1. The target receives X.224 Connection Request and checks if it can accept RDS AAD Auth. The protocol is accepted if ALL below conditions are satisfied:
1. RDS AAD Auth is not disabled in Group Policy (SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services\fEnableRdsAadAuth registry value is absent or set to 1).
1. The device is AAD-Joined or Hybrid-AAD-Joined.
1. Attempt of getting TS Nonce value from CloudAP security package succeeds.
1. The target sends X.224 Connection Confirm to the client with Selected Protocol set to PROTOCOL_RDSAAD.
1. The client generates an RSA 2048 key pair. This is done once per life of the client process and is used as a Binding Key when requesting RDP Access Token.
1. The client requests RDP Access Token from AAD using the target hostname [(ModernRdpUsingTLS)](https://msazure.visualstudio.com/One/_git/ESTS-Docs?version=GBmaster&path=/Protocols/RDP/ModernRdpUsingTLS.md&_a=preview). Together with the token the client obtains:
1. Target's AAD Device ID.
1. AAD Tenant's P2P root certificate.
1. The client makes a separate HTTP request to AAD and obtains an AAD Nonce value.
1. The client starts a TLS handshake with the target.
1. The target uses AAD P2P Server certificate in TLS handshake. This certificate is located in the computer's Personal certificate store and is issued by MS-Organization-P2P-Access [year].
1. When TLS handshake ends, the client validates the target's certificate by verifying that it was issued by the AAD Tenant's P2P root certificate obtained in step 6, and that certificate's subject name equals the target's AAD Device ID (also obtained in step 6).
1. The target obtains a TS Nonce from CloudAP and sends it to the client.
1. The client creates an RDP Assertion by putting together RDP Access Token, AAD Nonce and TS Nonce and signing them with the Binding Key.
1. The client sends RDP Assertion to the target.
1. The target passes RDP Assertion to CloudAP for validation. If validation succeeds CloudAP returns a Credential Blob.
1. The target performs Network Logon using the Credential Blob. If logon succeeds, the target uses the resulting NT Token to perform access check.
1. The target sends the result of logon and access check to the client.
1. If RDP Assertion validation, logon or access check failed, the target closes the connection, otherwise main RDP protocol starts.

## Scenario 13: AVD (differences from MSTSC)
> 来源: ado-wiki-b-avd-vs-mstsc-connection-flows.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **[AVD only]** User clicks an AVD endpoint icon.
1. **[AVD only]** The client connects to the AVD Gateway and starts Orchestration. During Orchestration the client receives the target's AAD Device ID and server certificate.
1. The client sends X.224 Connection Request to the target. Same as MSTSC.
1. Target checks if it can accept RDS AAD Auth. Same conditions as MSTSC.
1. Target sends X.224 Connection Confirm with PROTOCOL_RDSAAD.
1. The client generates RSA 2048 key pair (Binding Key). Same as MSTSC.
1. **[AVD only]** The client requests RDP Access Token from AAD **using the Device ID received during Orchestration (step 2)** instead of hostname.
1. The client makes separate HTTP request to AAD for AAD Nonce. Same as MSTSC.
1. TLS handshake starts. Same as MSTSC.
1. **[AVD only]** The target uses a **regular RDP server certificate** in TLS handshake (not the AAD P2P cert used by MSTSC).
1. **[AVD only]** Client validates target certificate **by comparing it with the certificate received during Orchestration (step 2)** (not via AAD P2P root cert chain).
1. Target obtains TS Nonce from CloudAP and sends to client. Same as MSTSC.
1. Client creates RDP Assertion (RDP Access Token + AAD Nonce + TS Nonce, signed with Binding Key). Same as MSTSC.
1. Client sends RDP Assertion to target. Same as MSTSC.
1. Target passes RDP Assertion to CloudAP for validation → Credential Blob. Same as MSTSC.
1. Target performs Network Logon with Credential Blob. Same as MSTSC.
1. Target sends logon/access check result to client. Same as MSTSC.
1. Connection proceeds or closes based on result. Same as MSTSC.

## Scenario 14: Key Differences Summary
> 来源: ado-wiki-b-avd-vs-mstsc-connection-flows.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Step | MSTSC | AVD |
|------|-------|-----|
| Target discovery | User enters hostname | Gateway Orchestration provides Device ID + certificate |
| Token request | Uses hostname | Uses Device ID from Orchestration |
| TLS cert used | AAD P2P Server cert (from Personal cert store) | Regular RDP server cert |
| Cert validation | Verify against AAD P2P root cert + Device ID | Compare against cert from Orchestration |

## Scenario 15: First Step
> 来源: ado-wiki-b-connection-failed-no-resources.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Verify the VM is powered on
2. Identify the activity ID from the failure
3. Query `RDInfraTrace` using the activity ID, filter to only show warnings and errors:
```kql
// Get RDInfraTrace using Activity ID and only show errors and warnings
// [Query not fully documented in source]
```
`[来源: ado-wiki-b-connection-failed-no-resources.md]`

## Scenario 16: Decision Branches
> 来源: ado-wiki-b-connection-failed-no-resources.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Based on the error found in RDInfraTrace, follow the appropriate path:

## Scenario 17: Are services running?
> 来源: ado-wiki-b-connection-failed-no-resources.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Is WVD Agent service running?
   - Is WVD listener working?

## Scenario 18: Registration Issue?
> 来源: ado-wiki-b-connection-failed-no-resources.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - → INVALID_REGISTRATION_TOKEN
   - → NAME_ALREADY_REGISTERED

## Scenario 19: Anything in logs?
> 来源: ado-wiki-b-connection-failed-no-resources.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - → Collecting data with WVD-Collect
   - → Collect VM logs with Inspect IaaS Disk

## Scenario 20: JIT Access Preparation
> 来源: ado-wiki-cloudpc-redeploying.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Same as other OCE APIs - JIT elevate to CMDCPCSupport-JIT-PE-PlatformServiceOperator via Torus.

## Scenario 21: 1. Get Device Data (Kusto)
> 来源: ado-wiki-cloudpc-redeploying.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
let GetDataFrom = (clusterName:string)
{
cluster(clusterName).database('WVD').RDAgentMetadata
| join kind=leftouter (
cluster('cpcdeedprptprodgbl.eastus2.kusto.windows.net').database('Reporting').DeviceEntity_MV
) on $right.DeviceResourceId == $left.AzureResourceId
| where HostInstance contains "<Managed Device Name>"
| top 1 by Timestamp desc
| project UniqueId, TenantId, HostInstance
};
GetDataFrom('rdsprodus.eastus2') | union GetDataFrom('rdsprodeu.westeurope') | union GetDataFrom('rdsprodgb.uksouth')
```
`[来源: ado-wiki-cloudpc-redeploying.md]`

## Scenario 22: 2. Call OCE API
> 来源: ado-wiki-cloudpc-redeploying.md | 适用: \u901a\u7528 \u2705

### 排查步骤
CloudPC OCE > ResourceMgmt Actions > Trigger Device Action:
   - TenantId, Device Id from Kusto
   - Device Action Type = 16 (Redeploy)
   - Batch mode available

## Scenario 23: > **Stop**: This information should only be followed by WCX PMs and SaaF teams. These steps do not apply to CSS.
> 来源: ado-wiki-cloudpc-restart-oce.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Full Action Type List: https://dev.azure.com/microsoft/CMD/_git/CMD-Svc-ResourceMgmt?path=/src/ResourceMgmt.Data/Enums/ActionType.cs

## Scenario 24: WebSocket connection flow:
> 来源: ado-wiki-connection-flows-websocket-and-udp.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. User opens RD Client or web client and makes a feed request to RD Web.
2. RD Web redirects the client Azure AD to receive a valid token for the service.
3. If AAD is the authentication engine:
   *   User is asked to enter their creds and that is passed to AAD.
   *   If auth passes, then AAD issues a token to the RD Client.
4. If AAD is not the final authentication engine (uses third party SSO/Identity Management Provider, for example Ping/Octa):
   *   AAD responds with a redirect to SSO/Identity Management Provider .
   *   RD Client communicates with Ping and user enters their creds.
5. User opens a remote app or desktop on the client.
6. The request goes to AFD (azure front door) which redirects the connection to nearest gateway based on source ip address
   *   Connection will use the gateway assigned to the client
   *   Note: Client may not always go to close gateway based on geo location. Its based upon latency from Front Door to all instances of the gateway and existing user load. So for a user geographically located in India its possible that Singapore has lower latency at times and hence user traffic will be sent via there.
7.The gateway validates the user connection and contacts a broker
8.The broker has a continuous connection to the RDAgent running on the Cloud PC.
9.The broker provides the details needed to create the session to the RD Agent
10.The RDAgent instructs the SxS Stack to reach out to the specific gateway
11.RDP Stack then sends the session to the user via the gateway

## Scenario 25: UDP Connection flow:
> 来源: ado-wiki-connection-flows-websocket-and-udp.md | 适用: \u901a\u7528 \u2705

### 排查步骤
All connections begin by establishing a TCP-based reverse connect transport over the Azure Virtual Desktop Gateway. Then, the client and session host establish the initial RDP transport, and start exchanging their capabilities. If RDP Shortpath is enabled on the session host, the session host then initiates a process called candidate gathering:
1. The session host enumerates all network interfaces assigned to a session host, including virtual interfaces like VPN and Teredo.
2. The Windows service Remote Desktop Services (TermService) allocates UDP sockets on each interface and stores the IP:Port pair in the candidate table as a local candidate.
3. The Remote Desktop Services service uses each UDP socket allocated in the previous step to try reaching the Azure Virtual Desktop STUN Server on the public internet. Communication is done by sending a small UDP packet to port 3478.
4. If the packet reaches the STUN server, the STUN server responds with the public IP (specified by you or provided by Azure) and port. This information is stored in the candidate table as a reflexive candidate.
5. After the session host gathers all the candidates, the session host uses the established reverse connect transport to pass the candidate list to the client.
6. When the client receives the list of candidates from the session host, the client also performs candidate gathering on its side. Then the client sends its candidate list to the session host.
7. After the session host and client exchange their candidate lists, both parties attempt to connect with each other using all the gathered candidates. This connection attempt is simultaneous on both sides. Many NAT gateways are configured to allow the incoming traffic to the socket as soon as the outbound data transfer initializes it. This behavior of NAT gateways is the reason the simultaneous connection is essential.
8. After the initial packet exchange, the client and session host may establish one or many data flows. From these data flows, RDP chooses the fastest network path. The client then establishes a secure TLS connection with the session host and initiates RDP Shortpath transport.
9. After RDP establishes the RDP Shortpath transport, all Dynamic Virtual Channels (DVCs), including remote graphics, input, and device redirection move to the new transport.

## Scenario 26: Scenario 1: Cloud PC/VM No Boot or Stuck on Restarting
> 来源: ado-wiki-dump-cloudpc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Cause**: Azure Host level changes (e.g., VMs in certain Cluster/Host version)
   - **Action**: Engage **RDOS DRI (OCE)** to capture dump via IcM
   - **Method**: FcShell/Orb to Watson. See: How To: Capture a memory dump of a running container
   - **Pre-requisites**: Get NodeId, ContainerId, VMId from CPCD Tool or Kusto:
```kql
cluster('azurecm.kusto.windows.net').database('AzureCM').LogContainerSnapshot
| where PreciseTimeStamp between (_startTime .. _endTime)
| where virtualMachineUniqueId has_any (vmid)
| project PreciseTimeStamp, nodeId, containerId, virtualMachineUniqueId, AvailabilityZone, Region
```
`[来源: ado-wiki-dump-cloudpc.md]`
   - **AVD**: Can leverage Serial Console to check VM first

## Scenario 27: Scenario 2: Application Crash in Booted Cloud PC
> 来源: ado-wiki-dump-cloudpc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Ask end user to collect dump via Windows Error Reporting: Collecting User-Mode Dumps
   - Share dump file via DTM
   - **AVD**: Same, or use Diagnostic Settings > Crash Dumps

## Scenario 28: Scenario 3: Windows App Dependencies Hang/Crash
> 来源: ado-wiki-dump-cloudpc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Ask end user to capture dump via Task Manager (right-click process > Create dump file)
   - If crashed, follow Scenario 2 from client machine
   - **AVD**: Same approach

## Scenario 29: Scenario 4: Cloud App (App Streaming) Hang/Crash
> 来源: ado-wiki-dump-cloudpc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Still under discussion for CPC
   - **AVD**: Connect to session host or use Diagnostic Settings > Crash Dumps

## Scenario 30: Dump Solutions Reference
> 来源: ado-wiki-dump-cloudpc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Solution | Applies To | Dump Store |
|----------|-----------|------------|
| Diagnostic Settings - Crash Dumps | All Azure Windows VMs (AVD only, not CPC) | Azure Storage Container |
| Fleet Diagnostic (FD) | 1P Azure VM/VMSS only | Watson DiagSpaces VM |
| Get More Data (GMD) | All Windows client/server VMs | Watson |
Note: Previous Fabric Control dump method unavailable since FC deprecation (May 2023).

## Scenario 31: Rename CloudPC (OCE API)
> 来源: ado-wiki-rename-cloudpc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> This information should only be followed by WCX PMs and SaaF teams. These steps do not apply to CSS.

## Scenario 32: Rename Steps
> 来源: ado-wiki-rename-cloudpc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Navigate to: CloudPC OCE > Provision Actions > Create VmExtension Request
Use **CPCD Tool** to get:
   - **Endpoint** = ScaleUnit
   - **Tenant ID** = TenantId of the customer
   - **DeviceID** = DeviceId of CloudPC
   - **Computer Name** = Original CloudPC Name
RunVmExtension parameter:
```json
{
  "scriptName": "SetComputerName",
  "devices": [
    {
      "deviceId": "XXX",
      "parameters": {
        "ComputerName": "XXX",
        "NeedRestart": ""
      }
    }
  ]
}
```
Confirm with customer if the CPC name has been changed after execution.

---

## 关联 Kusto 查询参考

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where ActivityId == "{ActivityId}"
| where PreciseTimeStamp > ago(2d)
| project PreciseTimeStamp, Level, Category, Role, HostInstance, HostPool, Msg
| order by PreciseTimeStamp asc
```
`[来源: connection-tracking.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDClientTrace
| where ActivityId == "{ActivityId}"
| where TIMESTAMP > ago(3d)
| project TIMESTAMP, TaskName, ChannelName, ClientOS, ClientType, ClientIP, Msg
| order by TIMESTAMP asc
```
`[来源: connection-tracking.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDPCoreTSEventLog
| where ActivityId == "{ActivityId}"
| where TIMESTAMP >= ago(9d)
| project TIMESTAMP, Level, TaskName, ProviderName, Message
| order by TIMESTAMP asc
```
`[来源: connection-tracking.md]`

```kql
let activityId = "{ActivityId}";
let infraLogs = cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where ActivityId == activityId
| where PreciseTimeStamp > ago(2d)
| project Timestamp = PreciseTimeStamp, Source = "InfraTrace", Level, Role, Message = Msg;
let clientLogs = cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDClientTrace
| where ActivityId == activityId
| where TIMESTAMP > ago(3d)
| project Timestamp = TIMESTAMP, Source = "ClientTrace", Level, Role = ClientType, Message = Msg;
union infraLogs, clientLogs
| order by Timestamp asc
```
`[来源: connection-tracking.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where PreciseTimeStamp > ago(9d)
| where ActivityId == "{ActivityId}"
| where Category == "Microsoft.RDInfra.Diagnostics.AspExtensions.RequestHeadersLoggingMiddleware"
| where Msg contains "Host"
| project PreciseTimeStamp, ActivityId, Level, Category, Role, Msg
| order by PreciseTimeStamp asc
```
`[来源: gateway-broker.md]`

```kql
let ids = datatable(Id:string)
[
    "{ActivityId1}", 
    "{ActivityId2}", 
    "{ActivityId3}"
];
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where PreciseTimeStamp > ago(14d)
| where ActivityId in (ids)
| where Category == "Microsoft.RDInfra.Diagnostics.AspExtensions.RequestHeadersLoggingMiddleware"
| where Msg contains "rdgateway-"
| project PreciseTimeStamp, ActivityId, Level, Category, Role, Msg
| distinct Role, Msg
```
`[来源: gateway-broker.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where UserName contains "{UPN}"
| where env_time >= ago(8h)
| project env_time, Id, ActivityId, Type, Outcome, Status, 
          SessionHostName, SessionHostPoolName, ClientIPAddress, ClientOS, ClientType
| order by env_time desc
```
`[来源: user-activity.md]`
