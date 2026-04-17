# Entra ID WHfB PIN/GPO/Registry Operations — 排查工作流

**来源草稿**: ado-wiki-a-adperf-version-store-scoping.md, ado-wiki-a-esr-scoping-questions.md, ado-wiki-a-gpo-scoping-aids.md, ado-wiki-a-gpo-scoping-workflow.md, ado-wiki-a-lcw-administration-unit-scoping.md, ado-wiki-a-whfb-and-tpms.md, ado-wiki-a-whfb-built-in-features.md, ado-wiki-a-whfb-device-registration.md, ado-wiki-a-whfb-error-0x00000bb-troubleshooting.md, ado-wiki-a-whfb-lab-deployment-guide.md... (+70 more)
**场景数**: 46
**生成日期**: 2026-04-07

---

## Scenario 1: ado-wiki-a-adperf-version-store-scoping
> 来源: ado-wiki-a-adperf-version-store-scoping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. How many Domain Controllers (DCs) are experiencing this issue?
- 1. Are all these DCs in the Same Site or Different Site?
- 1. What is the Operating System (OS) of these DCs?
- 1. What is the number of processors and RAM on the DCs? (for Windows Server 2016 and older, the size of the Version Store is based upon the number of CPUs, for Windows Server 2019 and newer it is base
- 1. Can we reproduce the Version Store issue on the DC by running some Tasks? (Script or a Specific Job on an Application)
- 1. Does the issue occur at a specific time of the Day or Week?
- 1. Does the customer have any Applications which is in the Known Issues Section of Version Store issues?
- 1. During the time of the issue are there any changes to a Security Group with a lot of Group Memberships?
- 1. If they have a Security Group with lot of Group Memberships are they Legacy Groups

---

## Scenario 2: Scoping
> 来源: ado-wiki-a-gpo-scoping-workflow.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 3: Lifecycle Workflows - Administration Unit Scoping
> 来源: ado-wiki-a-lcw-administration-unit-scoping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - Use standard LCW troubleshooting tools and TSGs. In ASC, use Graph Explorer:
   - All workflows: `/identityGovernance/lifecycleWorkflows/workflows`
   - Specific workflow: `/identityGovernance/lifecycleWorkflows/workflows/[Workflow ID]`

---

## Scenario 4: WHfB and TPMs
> 来源: ado-wiki-a-whfb-and-tpms.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 5: ado-wiki-a-whfb-device-registration
> 来源: ado-wiki-a-whfb-device-registration.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 6: WHfB Hybrid Key Trust - Error 0x00000bb Sign-in with PIN
> 来源: ado-wiki-a-whfb-error-0x00000bb-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Check the on-screen error**
   - **Incorrect PIN** → User entered wrong PIN
   - **"The request is not supported"** → See [S3 The request is not supported error](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1774610/S3-The-request-is-not-supported-error)
2. **Step 2: Check time since PIN setup**
   - User needs to wait **minimum 30 minutes** (AAD Connect minimum sync cycle time)
   - Trigger a delta sync on the AAD Connect server to sync keys from Azure AD to on-prem AD
   - The key syncs to attribute `msDS-KeyCredentialLink` on the user object
3. **Step 3: Verify key sync**
   - # Check if msDS-KeyCredentialLink is populated after delta sync
   - # If NOT populated, verify AAD Connect schema:
4. **Step 4: Verify Metaverse sync**
   - Search the Metaverse in AAD Connect to check if values synced from Azure to Connector space
   - If attribute is populated, verify machine can locate and communicate with Server 2016 DCs
   - Only 2016+ DCs can authenticate using `msDS-KeyCredentialLink`
5. **Step 5: Collect AAD event logs**
   - Event Viewer > Application and Service Logs > Microsoft > Windows > AAD
   - Select Analytic > Right click > Enable
6. **Step 6: Certificate trust chain**
   - Ensure client machine trusts DC certificate (root cert in "Trusted Root Certificate Authority" store)
   - Verify DC issuing cert in **NTAuth** store: `certutil -viewstore -enterprise NTAuth`
   - Validate DC certificate from client: `certutil -verify -urlfetch <.cer file>`
7. **Step 7: Verify DC is presenting correct certificate**
   - Collect network trace while connecting to DC using LDAPS (use `ldp.exe`)
8. **Step 8: CAPI2 logs**
   - Event Viewer > Application and Service Logs > Microsoft > Windows > CAPI2 > Operational
   - Right click > Enable > Reproduce issue > Analyze

---

## Scenario 7: Windows Hello for Business - How to Build Your Lab
> 来源: ado-wiki-a-whfb-lab-deployment-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step-by-Step Configuration**

---

## Scenario 8: Unable to access local resources with Azure AD Joined PC and Federated account (WHfB Key Trust)
> 来源: ado-wiki-a-whfb-unable-access-onprem-aadj.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Steps**

---

## Scenario 9: Domain Join: Scoping Questions
> 来源: ado-wiki-b-domain-join-scoping.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 10: WHfB Quick Start Checklist
> 来源: ado-wiki-b-whfb-case-scoping-questions.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Is the client Intune Managed?
- 2. Is this an Intune Autopilot scenario?
- 3. Does the Issue happen outside of the Intune Autopilot scenario?

---

## Scenario 11: WHfB Cloud Kerberos Trust - Checking If Feature Is Enabled
> 来源: ado-wiki-b-whfb-ckt-looking-at-logs.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 12: WHfB Cloud Kerberos Trust (CKT) - Feature Overview
> 来源: ado-wiki-b-whfb-cloud-kerberos-trust-overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Azure AD prelogon is performed (front-loading Azure AD authentication)
- 2. A partial TGT is obtained from Azure AD
- 3. Partial TGT is exchanged for a full TGT via TGS_REQ to on-premises DC
- 4. This is equivalent to RODC TGT exchange (not AS_REQ as in key/cert trust)
- 5. No DC certificate validation required (removes PKI dependency)

---

## Scenario 13: ado-wiki-b-whfb-identifying-trust-scenario-data-collection
> 来源: ado-wiki-b-whfb-identifying-trust-scenario-data-collection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Start with `dsregcmd.exe /status`** on the client PC that is unable to provision or authenticate.
- 2. **Event logs to review on client:**
- 3. **Prerequisites Check** (at bottom of `DSREGCMD /STATUS` output):

---

## Scenario 14: ado-wiki-b-whfb-key-trust-enrollment-troubleshooting
> 来源: ado-wiki-b-whfb-key-trust-enrollment-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 15: Prerequisites
> 来源: ado-wiki-b-whfb-prerequisites-summary-all-trust-models.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 16: ado-wiki-c-dmsa-scoping-questions-faq
> 来源: ado-wiki-c-dmsa-scoping-questions-faq.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. The dMSA account must be cached on the RODC.
- 2. The dMSA account must be manually added to the "PrincipalsAllowedToRetrieveManagedPassword" attribute of the machine using the `Set-ADServiceAccount` PowerShell command.
- 1. Creating a new dMSA account.
- 2. Reconfiguring the service to use the new dMSA account.
- 3. Retiring the old service accounts.
- 1. The service is still configured with the service account and will not automatically change to the dMSA account. Deleting the service account will stop the service.
- 2. The service account has forward and backward links to the dMSA account.

---

## Scenario 17: gMSA Scoping & Diagnostic Checklist
> 来源: ado-wiki-c-gmsa-scoping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Impacted OS versions** - List the impacted operating system versions
- 2. **Problem description** - Describe the gMSA issue (e.g., unable to start service, logon failure)
- 3. **Impacted applications** - List applications affected by the gMSA issue
- 4. **Error messages/events** - Capture screenshots, events from Application/Security/System logs
- 5. **Timeline** - When did the problem start? Was the same configuration working before?
- 6. **Pattern** - Does it occur post-reboot, intermittently, or after patching?
- 7. **Reproducibility** - Is the issue reproducible at will?
- 8. **Recent changes** - Was there a latest update/patch installed?

---

## Scenario 18: ado-wiki-c-mapping-entra-id-joined-device-sids
> 来源: ado-wiki-c-mapping-entra-id-joined-device-sids.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Open the script `*.ps1` file in PowerShell
- 2. Provide a SID with the prefix `S-1-12-1-` (Entra ID object SID) or an Entra ID object GUID
- 3. The script will parse through the value, determine if it's a valid SID or GUID, and convert it accordingly
- 1. Navigate to **Tenant Explorer** > **Directory object**
- 2. Search using the GUID value

---

## Scenario 19: Case handling
> 来源: ado-wiki-c-whfb-quick-start-check-list.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Production environment or non-production?
- 2. What is the client Windows OS version? (Example: Windows 10 1909 or Server 2016 1909 xxx for server; get the build number)
- 3. How many clients are impacted, or how many are they working with on this scenario?
- 4. Is this on-premises only, AADJ cloud only, or a hybrid WHFB deployment?
- 5. Is the client Intune managed?
- 6. AADJ cloud only?
- 7. WHFB Cert Trust or Key Trust deployment?
- 8. On-premises only?
- 9. Is the issue with the initial setup, user enrollment, or user sign-in for previous enrollment?
- 10. If initial setup, what deployment guide document are they following?

---

## Scenario 20: Investigations
> 来源: ado-wiki-c-whfb-quick-troubleshooting-provisioning.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 21: Problem statement
> 来源: ado-wiki-c-whfb-synchronous-cert-trust-deployment.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 22: Issue
> 来源: ado-wiki-c-whfb-that-option-temporarily-unavailable-deep-dive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting steps**
2. **Root cause**
   - We can see the Key ID for `msDS-KeyCredentialLink` in the AD database is as follows:
   - KeyID: cef8a780e7fxxx

---

## Scenario 23: Data collection and analysis - WHfB/FIDO2 over AVD/RDP
> 来源: ado-wiki-d-avd-rdp-whfb-fido2-data-collection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

---

## Scenario 24: Azure AD CA Specific Scoping Questions
> 来源: ado-wiki-d-ca-scoping-questions.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 25: Scoping
> 来源: ado-wiki-d-dc-no-boot-scoping.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 26: Initial Troubleshooting & Scoping : Group Policy
> 来源: ado-wiki-d-gpo-initial-troubleshooting-scoping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Steps**
   - *Step 1:** Identify if Computer Settings or User Settings are not getting applied
   - *Step 2:** Run the below commands based upon User or Computer settings not getting applied

---

## Scenario 27: Scoping
> 来源: ado-wiki-d-laps-scoping-workflow.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 28: About the WHFB-Cloud Trust feature
> 来源: ado-wiki-d-whfb-cloud-kerberos-trust-scoping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting questions:**
   - What is the operating system and build of the client machine?
   - What is the type of user? (Synced, Managed, Federated)
   - What is the type of WHFB deployment type configured?

---

## Scenario 29: Data collection
> 来源: ado-wiki-d-whfb-data-collection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Install IDNA (`\\dbg\privates\LKG\partner`).
- 2. Use auth scripts.
- 3. Log in as admin and start the auth script and configure IDNA to collect logonUI.exe.
- 4. When it is launched: `tttracer -onlaunch logonui.exe -out c:\ttt`.
- 5. Log in as user and lock the screen  select "forgot my pin" and go through the process.
- 6. Once it is complete, record the result and log off the user.
- 7. Log in as admin and stop the auth scripts.
- 8. Then stop the logonUI IDNA: `tttracer -delete logonui.exe`.
- 9. Save all the IDNA files (logonUI*.run and logonui*.out) and the auth scripts and make them available.

---

## Scenario 30: Helpful logs
> 来源: ado-wiki-d-whfb-hybrid-cert-trust-authentication.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 31: ado-wiki-d-whfb-issuing-ca-ntauth-verification
> 来源: ado-wiki-d-whfb-issuing-ca-ntauth-verification.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Export the certificate to a .cer file and run the following command:**
- 2. **Review `output.txt` for chaining errors and revocation errors.**
- 3. **Check `output.txt` for a 0x800b0112 error.**
- 4. **Check if the issuing Certificate Authority (CA) certificate is in the store.**
- 5. **Publish the certificate and force replication of the configuration partition.**
- 1. Does the client have the root certificate of the issuing CA?
- 1. Is the CRL published

---

## Scenario 32: Steps with screenshots
> 来源: ado-wiki-d-whfb-pin-lockout-full-steps.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 33: ado-wiki-e-dc-unresponsive-scoping
> 来源: ado-wiki-e-dc-unresponsive-scoping.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 34: Scoping Remote WebAuthn Issues
> 来源: ado-wiki-e-scoping-remote-webauthn-issues.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Verify supported OS**:
- 2. **Verify WHFB/FIDO2 registration**: User must have signed in using Windows Hello for Business (WHFB)/FIDO2 keys or registered WHFB/FIDO2 on the source machine. Note: You don't need to sign in to RD
- 3. **Verify client tool**: Must use Microsoft Terminal Services Client (MSTSC) or Microsoft Remote Desktop Client (MSRDC). Third-party tools like RDCMan or Citrix ICA are not supported for Remote WebA
- 4. **Try different browser**: Use Microsoft Edge. Can also use Procmon to identify if the browser is loading webauthn.dll.
- 5. **Use test website**: https://webauthn.io to isolate if the issue is with the target website or the platform.
- 6. **Check WebAuthn event logs**: If no events found, the problem is in the browser (not loading WebAuthn functions).
- 7. **Check for GPO/registry disabling WebAuthn**: Verify no Group Policy Object or manual registry keys disable WebAuthn redirection.
- 1. **Browser team**: No events in WebAuthn logs → browser has issues loading WebAuthn DLL. Enable Edge debug logs.
- 2. **Azure Identity**: Test website works but Azure MFA fails → engage Azure Identity team.
- 3. **Azure Identity**: WHFB/FIDO2 key sign-in problems → first triage by Azure Identity.

---

## Scenario 35: High-level Windows LAPS scoping
> 来源: ado-wiki-e-windows-laps-troubleshooting-issues-scoping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Description of the issue
- 2. What is the operating system and build number of the impacted client machines?
- 3. Are all client machines facing the issue or only some client machines?
- 4. For how long have they been facing the issue (1 day, week, or month)?
- 5. Is the issue intermittent or persistent (can we reproduce the issue anytime)?
- 1. Is the customer using legacy LAPS or Windows LAPS?
- 2. Is the customer using Windows LAPS?
- 3. Restoring Windows LAPS attribute values from backup

---

## Scenario 36: Issue verbatim
> 来源: ado-wiki-f-account-lockout-scoping.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 37: New authentication protocol for Remote Desktop connections
> 来源: ado-wiki-f-avd-rdp-whfb-fido2-rdp-deep-dive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. RDS AAD Auth is not disabled in Group Policy (fEnableRdsAadAuth registry value is absent or set to 1).
- 2. The device is AAD-Joined or Hybrid-AAD-Joined.
- 3. Attempt of getting TS Nonce value from CloudAP security package succeeds.
- 1. Navigate to AVD host pool > RDP Properties > Advanced tab
- 2. Add `;enablerdsaadauth:i:1` at the end
- 3. Click Save
- 1. Download/create .RDP file
- 2. Edit > Advanced tab > check "Use a web account to sign in to the remote computer"
- 3. Or manually set `enablerdsaadauth:i:1` in the .RDP file

### 相关错误码: AADSTS650041

---

## Scenario 38: "certutil -deleteHelloContainer"
> 来源: ado-wiki-f-whfb-delete-hello-container.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 39: Emerging issue
> 来源: ado-wiki-f-whfb-emerging-issues-index.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 40: Tips
> 来源: ado-wiki-f-whfb-hybrid-cert-trust-provisioning-logs.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 41: ado-wiki-f-whfb-hybrid-key-trust-provisioning-logs
> 来源: ado-wiki-f-whfb-hybrid-key-trust-provisioning-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step A "request access token from Azure DRS"**
   - here are the most interesting event ids that can be used in a filter:
   - <SPAN style="color:green">Microsoft-Windows-HelloForBusiness/Operational
   - 3045,8525</SPAN>
2. **Step B "enroll biometrics"**
   - After receiving a ADRS access token, the application detects if the device has a Windows Hello biometric compatible sensor.
   - If the application detects a biometric sensor, it gives the user the choice to enroll biometrics.
   - After completing or skipping biometric enrollment, the application requires the user to create a PIN and the default (and fall-back gesture when used with biometrics). The user provides and confirms t
3. **Step C**
   - The application sends the ADRS token, ukpub, attestation data, and device information to ADRS for user key registration. Azure DRS validates the MFA claim remains current. On successful validation, Az
   - <SPAN style="color:green">Windows Hello key registration started.</SPAN>
   - <SPAN style="color:purple">The NGC key registration request was successfully sent.
4. **Step D**
   - Azure AD Connect requests updates on its next synchronization cycle. Azure Active Directory sends the user's public key that was securely registered through provisioning. AAD Connect receives the publ
   - The newly provisioned user will not be able to sign in using Windows Hello for Business until Azure AD Connect successfully synchronizes the public key to the on-premises Active Directory.
   - You can check the attribute on AAD and AD:  **MsDs-KeyCredentialslLink** attribute

### 相关错误码: AADSTS50076

---

## Scenario 42: Step A
> 来源: ado-wiki-f-whfb-onprem-cert-trust-authentication-logs.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 43: User device registration event log
> 来源: ado-wiki-f-whfb-onprem-cert-trust-device-registration-logs.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 44: Tips
> 来源: ado-wiki-f-whfb-onprem-cert-trust-provisioning-logs.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 45: ado-wiki-f-windows-time-scoping
> 来源: ado-wiki-f-windows-time-scoping.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 46: NTRadPing: NPS + Azure MFA Extension RADIUS Testing Guide
> 来源: onenote-ntradping-nps-mfa-testing.md | 适用: Mooncake ✅

### 排查步骤
1. **Step 1: NPS Configuration**
   - 1. Register NPS in AD domain (add to "RAS and IAS Servers" security group)
   - 2. Configure **Network Policy**:
   - Target: domain users (for testing)
2. **Step 2: Configure RADIUS Client (NTRadPing Simulated Client)**
   - Set server IP, port, and shared secret (must match NPS RADIUS Client config)
   - Enter test user's UPN and password
3. **Step 3: Install NPS Extension for Azure MFA**
   - 1. Run the NPS extension setup script (modify parameters for your environment)
   - 2. Modify registry settings
   - 3. Verify certificate is uploaded to AAD
4. **Step 4: Testing Flow**

---
