---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/Bkup/Connection Flow"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/In-Development%20Content/Outdated%3F%20-%20Needs%20review%20if%20still%20useful/Bkup/Connection%20Flow"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# MSRDC

## Connection Flow
per discussion with Sergey

**Step 0**: ... irrelevant. We don't use P2P certificates in AVD scenario. This is controlled by 'fUseAadP2PCertificate' setting in the RDP listener config. For AVD it is always set to 0.

**Step 1**: ... TermSrv picks the RDS AAD Auth protocol (TS_NEG_PROTOCOL_RDSAAD = 0x10). There is no protocol version.

**Step 2**: ... RDP client gets the target DeviceID during orchestration step. It prefers it to the hostname when requesting a token. So, in AVD environment you should only see token requests for DeviceID.

**Step 3**: ... Since DeviceID is used in the request, duplicate devices in the directory should not be an issue.

**Step 3.5**: Using the HTTPS connection, the RDP client on the source device requests a nonce (this is a random or semi-random number generated for a specific use) from Azure AD. Azure AD responds with a Nonce AAD.

**Step 4**: RDP client on the source device establishes a TLS connection to (RDS/TermSrv) on the target device. The Target Device Certificate is validated by comparing it with the certificate received during orchestration. This step is the same with all protocols used in AVD.

**Step 5**: ... This step happens earlier. See Step 3.5.

**Step 6**: On the target device RDP stack obtains 'server nonce' from CloudAp and sends it to the client.

**Step 7**: ok. We call the blob RDP client generates "RDP Assertion".

**Steps 8 - 13**: You need to verify them with CloudAp team (Vadim Tsarik) and Gus.

From my perspective the following happens:
- RDP stack receives RDP Assertion from the client and passes it to CloudAp for validation.
- If validation succeeds, CloudAp returns a credential blob.
- RDP stack uses the credential blob to perform network logon and then access check (this step is the same with all RDP auth protocols).
- This credential blob is then passed to TermService and then to LogonUI.
- We have a special Credential Provider plugin to handle this blob (Gus knows the details).


# MSTSC

## Connection Flow
Terms referenced in this flow:
- **RDP Client**: The host machine on which the user is initiating an AVD connection using msrdc.
- **WAM/MSAL**: The Azure AD clients facilitating authentication between client and server (aka: target).
- **Terminal Service**: TermSrv.dll is a Remote Desktop Service that allows users to connect interactively to a remote computer.
- **LSA/CloudAP**: Local Security Authority (LSA) and Cloud Authentication Provider is a protected subsystem on the target-machine that authenticates and logs users onto the local system.

**Step 0**: CloudAP updates the P2P device certificate on the target device every 8 hours and when device reboots. This is an existing functionality which is used today for PKU2U Network Level Authentication handshake.

**Step 1**: RDP client on the source device negotiates the protocol version with TermSrv on the target device. TermSrv picks the TLS-based protocol and replies with the protocol version.

**Step 2**: RDP client on the source device requests a Delegation Token (DT) for the target device from Web Accounts Manager (WAM), or an MSAL library on 3rd party platforms. RDP client generates an RSA binding key pair and include the public key into the token request. The client does this by providing the hostname or FDQN of the device the user is trying to connect to. There is also the ability for the client to specify a target device ID if it's known.

**Note**: In the flow the DT is called the Bootstrap token.

**Step 3**: WAM on the source device handles the Delegation Token (DT) token request by passing the User credential (auth code during UI logon, PRT assertion), Client binding public key (RSA), Target device host name or device ID in a request to Azure AD.

   - ESTS validates there are no duplicate devices in the directory and mints a delegation token (DT) that is bound to the target device and contains the Client Binding Key obtained in Step 2. Azure AD also creates an additional json token called an AT that contains a hash of the DT, target device ID, user ID/SID and signs it with the Tenant P2P Root Cert. The ID Token response contains the DT, AT and the Tenant Root P2P certificate.
   - In order for WAM to work without changes to down-level clients the DT + RDP Server Access Token response are returned in the form of a single JSON blob. This allows WAM to handle it as if it was a token. Tenant P2P certificates can be part of the ID token.

**Step 4**: RDP client on the source device establishes a TLS connection to (RDS/TermSrv) on the target device, which provides the Target Device P2P Certificate that was signed with the tenant root cert. The source device validates the Target Device P2P Certificate and Device ID

**Step 5**: Using the TLS connection, the RDP client on the source device requests a nonce from Azure AD. Azure AD responds with a `Nonce AAD`.

**Step 6**: RDP client on the source device requests a nonce. On the target device the RDS Service calls into LSA/CloudAP/AAD Plugin and generates a nonce. The target device responds with a `Nonce TS`.

**Step 7**: RDP client on the source device signs the DT from Step 3, along with the nonce from Steps 5 and 6 with the client binding key and sends them over to the TermSrv service running on the target device.

**Step 8**: The LSA/CloudAP/AAD Plugin on session store performs *RDP server pre-authorization steps* by validating the RDP client request. This process covers:
   - a. validating the AT which is required to validate that user and server belong to the same tenant.
   - b. matching the delegation token (DT) from the AT to the delegation token sent by the client to make sure that the DT or AT were not changed by the client.
   - c. comparing the target device in the AT to the server's device ID in order to validate that AT and DT are bound to the target device.
   - d. validating the TS-Nonce to prevent any replay-attacks before launching LSA logon.
   - e. packaging the DT, AAD-nonce and the DT + AAD-nonce signature into a cred buffer.

**Step 9**: LSA/CloudAP/AAD Plugin on the target device performs a network logon with the cred buffer from the previous step.

**Step 10**: LSA/CloudAP/AAD Plugin on the target device derives a key from the DT in Step 8 using these steps:
   - a. *Non-cached-request*: If the DT is new, LSA performs an interactive logon:
      - CloudAP plugin crafts a logon request with the DT from Step 7 and the nonce from Step 8. The request is signed with the device key
   - Azure AD does the following:
      - i. validates the device key signature and checks that the key used for signing belongs to the same device the DT is bound to.
      - ii. extracts the client key from the DT key and validates the client key signature.
      - iii. validates DT and Azure AD nonce.

   - b. *Cached-logon request*: If the key can be used to decrypt the cache, LSA will perform a cached-logon-request and create an async call to Azure AD to refresh the PRT.

**Step 11**: LSA the target computer receives an encrypted token from Azure AD which LSA sends to the TermSrv service.

**Step 12**: TermSrv completes the user authorization and launches an interactive logon.

**Step 13**: Winlogon completes the interactive logon which connects user to the session.
