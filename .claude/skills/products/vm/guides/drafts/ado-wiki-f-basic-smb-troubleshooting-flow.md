---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/SMB Troubleshooting/Basic SMB Troubleshooting Flow"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FSMB%20Troubleshooting%2FBasic%20SMB%20Troubleshooting%20Flow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.TSG
- cw.Reviewed-10-2025
---


::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]


# Summary
This article provides a structured troubleshooting workflow for engineers performing end-to-end SMB connectivity analysis. It focuses on identifying and isolating issues across all layers involved in SMB communication, from the client, through the network path, to the Azure Files (or target SMB server) endpoint.
The guide outlines supported connectivity scenarios, typical failure patterns, and validation steps to ensure correct SMB operation. It applies primarily to hybrid identity environments (e.g., users authenticated via Active Directory or Microsoft Entra ID Kerberos), but the network validation steps remain applicable to any SMB-based workload.

## SMB troubleshooting flow

:::mermaid
graph TD
      A([START]):::start --> B{DNS resolve OK?}
      B -- " No" --> E1[[System Error 53/67<br>DNS failure or bad network path]]
      B -- " Yes" --> C{TCP 445 Open?}
      C -- " No" --> E2[[System Error 53<br>Port 445 blocked by firewall/ISP]]
      C -- " Yes" --> D{SMB Negotiate OK?}
      D -- " No" --> E3[[System Error 64<br>Packets dropped / Timeout / Firewall inspection]]
      D -- " Yes" --> F{Authentication OK?}
      F -- " No" --> E4[[System Error 5<br>Access Denied / Logon Failure]]
      F -- " Yes" --> G{Command Syntax OK?}
      G -- " No" --> E5[[System Error 87<br>Invalid parameter / Syntax error]]
      G -- " Yes" --> H([Mounted Successfully]):::success

      classDef start fill:#c6f7d0,stroke:#2e7d32,stroke-width:1px,color:#000;
      classDef decision fill:#e7f0fd,stroke:#0056b3,stroke-width:1px,color:#000;
      classDef errorCritical fill:#fde2e1,stroke:#b71c1c,stroke-width:1px,color:#000;
      classDef errorAuth fill:#ffecc7,stroke:#b45f06,stroke-width:1px,color:#000;
      classDef success fill:#c6f7d0,stroke:#2e7d32,stroke-width:1px,color:#000;

      class B,C,D,F,G decision;
      class E1,E2,E3 errorCritical;
      class E4,E5 errorAuth;
:::


| Error | Description | Phase | Root Cause | Action |
| -- | -- | -- | -- | -- |
| <span style="color: red;">5</span> | Access Denied | Authentication | Wrong credentials, clock skew, Kerberos failed | Check time, username/password, AD policies |
| <span style="color: red;">53</span> | Network path not found | DNS / TCP | Invalid DNS or port 445 blocked | Testing nslookup, Test-NetConnection -Port 445 |
| <span style="color: red;">64</span>| Network name no longer available | SMB Negotiate | Dropped packages, firewall/IPS | Capture trace, validate retransmissions |
| <span style="color: red;">67</span>| Network name cannot be found | DNS | Incorrect resolution or non-existent share | Confirm share name and correct DNS |
| <span style="color: red;">87</span>| Invalid parameter | Mount Command | Incorrect syntax in the net use command | Review complete syntax and parameters |

# Azure File Share Mount Failures (Wireshark Deep Analysis)

## Objective
Using a network capture, diagnose the exact phase where communication fails between the client and Azure File Share (*.file.core.windows.net) and determine the root cause of the System

## Checklist
Scenario: Windows client attempts to mount `\\mystorageaccount.file.core.windows.net\sharename`
Capture: Must include net use or mount from the beginning (e.g., <span style="font-family: Consolas">`netsh trace start capture=yes persistent=no tracefile=c:\trace.etl`</span> or Wireshark)
Wireshark main filters: <span style="font-family: Consolas">`tcp.port == 445 or dns.qry.name contains ".file.core.windows.net"`</span>
Relevant protocols: DNS -> TCP -> SMB2 -> NTLM/Kerberos

# Troubleshooting step by step

## PHASE 1  DNS Resolution
1. Purpose:
    The client must resolve the file shares FQDN (e.g., `mystorageaccount.file.core.windows.net`) to an IP address before attempting any network connection.

2. Filter: 
    <span style="font-family: Consolas">`dns.qry.name contains ".file.core.windows.net"`</span>

3. What to Expect:
	- `Standard query A mystorageaccount.file.core.windows.net`
    - `Standard query Response A 20.x.x.x`

   **Example Wireshark DNS resolution with success**

   ![image](/.attachments/SME-Topics/Azure-Files-All-Topics/SMB-Troubleshooting/PHASE1DNS.png)

   **Example Wireshark DNS resolution with NO success**

   ![image](/.attachments/SME-Topics/Azure-Files-All-Topics/SMB-Troubleshooting/PHASE1DNS_1.png)

4. Diagnosis:

| Evidence | Interpretation | Result |
| -- | -- | -- |
| Query and response with public | IP DNS OK | <span style="color: green;">Continues</span> |
| "Name error" / no response | DNS failed | <span style="color: red;">Error 53/67</span> |
| Response points to incorrect private IP Wrong | private DNS | <span style="color: red;">Error 53/67</span> |

5. Action:
   	- Test manually: `nslookup mystorageaccount.file.core.windows.net`
    - Validate local DNS / VPN / Private Link

## PHASE 2  TCP 445 Connectivity
1. Purpose:
    Once the hostname is resolved, the client must establish a TCP session to the SMB endpoint on port 445, which is used for SMB over TCP.

2. Filter: 
    initial handshake -> <span style="font-family: Consolas">`tcp.port == 445 and (tcp.flags.syn == 1 and tcp.flags.ack == 0)`</span>
    complete handshake -> <span style="font-family: Consolas">`tcp.port == 445 and (tcp.flags.syn == 1 or tcp.flags.ack == 1) and tcp.len == 0`</span>


3. What to Expect (3-way handshake):
    Client -> SYN -> Server (SA)
    Server -> SYN,ACK
    Client -> ACK

   **Example Wireshark 3-way handshake with success**

   ![image](/.attachments/SME-Topics/Azure-Files-All-Topics/SMB-Troubleshooting/PHASE2TCP.png)

4. Diagnosis:

| Evidence | Interpretation | Result |
| -- | -- | -- |
| handshake complete | TCP OK | <span style="color: green;">Continues</span> |
| Only SYN has no response | Firewall/ISP blocks port 445 | <span style="color: red;">Error 53</span> |
| ICMP Unreachable | Explicit Block | <span style="color: red;">Error 53</span> |

5. Action:
    - `Test-NetConnection mystorageaccount.file.core.windows.net -Port 445`

## PHASE 3  SMB Negotiate Protocol
1. Purpose:
    After the TCP handshake, the SMB client initiates the SMB2 NEGOTIATE request to agree on protocol dialect, capabilities, and security modes supported by both client and server.
2. Filter: 
    <span style="font-family: Consolas">`tcp.port == 445 and (smb2.cmd == 0 or tcp.analysis.retransmission or tcp.flags.reset == 1)`</span>

3. What to Expect:
    Client -> SMB2 Negotiation Protocol Request
    Server -> SMB2 Negotiation Protocol Response

   **Example Wireshark SMB Negotiation without success + Successive retransmissions**

   ![image](/.attachments/SME-Topics/Azure-Files-All-Topics/SMB-Troubleshooting/PHASE3SMBNEGO.png)

4. Diagnosis:

| Evidence | Interpretation | Result |
| -- | -- | -- |
| Immediate response from Server | SMB OK  | <span style="color: green;">Continues</span> |
| Successive retransmissions + no response | Packets DROPPED | <span style="color: red;">Error 64</span> |
| Response -> RST / Timeout | Intermediate Interruption | <span style="color: red;">Error 64</span> |

5. Action:
	- Identify the public IP and check for a gap between the Request and Response.
    - If "Request Retransmission" appears 3 times in a row, you have packet loss.

6. Suggested viewing:
    Statistics -> Conversations -> TCP -> check retransmissions and RTT

## PHASE 4  Authentication (NTLM or Kerberos)
1. Purpose:
    Once SMB negotiation succeeds, the client must authenticate using NTLM (for local key) or Kerberos (for domain/Entra ID-based authentication).

2. Filter:
    <span style="font-family: Consolas">`smb2.cmd == 1 or kerberos or ntlmssp`</span>

3. What to Expect:
    Session setup request
    Session setup response (STATUS_SUCCESS)

4. Diagnosis:

| Evidence | Interpretation | Result |
| -- | -- | -- |
| STATUS_SUCCESS | Authentication OK | <span style="color: green;">Continues</span> |
| STATUS_LOGON_FAILURE | Incorrect credentials | <span style="color: red;">Error 5</span> |
| STATUS_ACCESS_DENIED | Insufficient permissions | <span style="color: red;">Error 5</span> |
| Kerberos KRB5KRB_AP_ERR_SKEW | Time skew | <span style="color: red;">Error 5</span> |
| TCP RST after auth Server | Rejects session | <span style="color: red;">Error 5</span> |

5. Action:
	- Validate credentials (username/password)
	- Synchronize time (w32tm /resync)
    - Verify that the Storage Account uses AD DS

## PHASE 5  Command/Syntax Validation
1. Purpose:
    Finally, the client issues the Net Use command or mount request to access the share. The command syntax and parameters must be valid before execution.

2. Filter: 
    <span style="font-family: Consolas">`No additional traffic is needed`</span>

3. What to Expect:
    If Wireshark shows only TCP/SMB success, but the command fails -> <span style="color: red;">Error 87</span>

4. Typical causes:

| Incorrect syntax  | Correct example |
| -- | -- |
| Missing prefix Azure\  | net use Z: \\storage.file.core.windows.net\share /user:Azure\<StorageAccount> <key> |
| Use of incorrect quotation marks | "\\storageaccount.file.core.windows.net\share" |
| Misplaced parameter | /user: must come before key |

::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::