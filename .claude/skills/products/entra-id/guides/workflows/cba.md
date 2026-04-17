# Entra ID Certificate-Based Auth (CBA) — 排查工作流

**来源草稿**: ado-wiki-a-cba-auth-strengths-advanced.md, ado-wiki-b-cba-ca-scoping.md, ado-wiki-b-cba-how-to-build-your-lab.md, ado-wiki-b-cba-introduction.md, ado-wiki-b-cba-new-trust-store.md, ado-wiki-c-pki-smartcard-logon.md, ado-wiki-d-avd-federated-cba.md, ado-wiki-h-cba-case-scoping-questions.md, ado-wiki-h-cba-cert-revocation-lists.md, ado-wiki-h-cba-data-analysis.md... (+3 more)
**场景数**: 10
**生成日期**: 2026-04-07

---

## Scenario 1: Feature overview
> 来源: ado-wiki-a-cba-auth-strengths-advanced.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting sign-in failure due to wrong user certificate**
   - *Error Code 500187**
   - > **AADSTS500187**: Selected certificate does not meet the criteria.

### 相关错误码: AADSTS500187

---

## Scenario 2: CBA: CA Scoping Scoping Groups to Certificate Authorities
> 来源: ado-wiki-b-cba-ca-scoping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps to enable CA scoping feature**
   - 1. Sign in to the [Microsoft Entra admin center](https://entra.microsoft.com/) as at least an [Authentication Policy Administrator](https://review.learn.microsoft.com/en-us/entra/identity/role-based-a
   - 2. Browse to **Entra ID** > **Authentication methods** > **Certificate-based Authentication**.
   - 3. Under **Configure**, go to **Certificate issuer scoping policy**

---

## Scenario 3: CBA: How to build your lab
> 来源: ado-wiki-b-cba-how-to-build-your-lab.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Create your Entra ID tenant**
   - *You can skip this section if your lab is already created using https://aka.ms/SupportSubscriptions instructions.**
   - Follow the guidance at https://aka.ms/SupportSubscriptions to create a tenant if you don't already have a suitable lab tenant.
2. **Step 2: Enable Intune Cloud PKI trial**
   - 1. Browse the https://intune.microsoft.com portal
   - 2. Navigate to Tenant Administration - Intune Add-ons
   - 3. Click on view details link for the "Cloud PKI" option
3. **Step 3: License the users for Intune Cloud PKI**
   - Use the https://admin.microsoft.com portal to assign licenses to users.
4. **Step 4: Configure 2-tier Cloud PKI**
   - Follow instructions at https://learn.microsoft.com/en-us/mem/intune/protect/microsoft-cloud-pki-configure-ca
   - For EKU selection at the very least include "Client Authentication" and "Smart Card Logon".
   - Choose the longest duration possible for each CA created. Download the certs for each CA for use in later steps.
5. **Step 5a: Configure Intune policies to deploy trusted certs**
   - Trusted Root and Intermediate certs via the "trusted certificate" template. You may have done this already as part of the earlier step.
6. **Step 5b: Configure Intune policies to deploy certs via SCEP**
   - For deploying certs for use with Windows Hello for Business see https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/rdp-sign-in?tabs=intune#deploy-certificates to
   - For regular user certificates unrelated to WHfB you can use the same settings as for RDP but choose a different KSP such as "Enroll to Trusted Platform Module (TPM) KSP if present, otherwise Software 
   - Ensure you have "Digital Signature" in key usage selected and the SAN should have {{UserPrincipalName}}.
7. **Step 6: Enable CBA in Entra**
   - See https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-certificate-based-authentication.
   - You should now be able to logon using a web browser to Entra using any certs received via SCEP from your PKI.

---

## Scenario 4: CBA: New Trust Store
> 来源: ado-wiki-b-cba-new-trust-store.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Admin uploads CAs to new store while they still exist in old store with Issuer Hints enabled → no delay for existing CAs
- 2. Admin rolls an expired CA (delete old, upload new) → no impact if CA subject name remains the same
- 3. Admin adds new CA → users with certs from new CA must wait for cache propagation
- 4. Admin deletes CA → deleted CA remains in hints cache until propagation completes; users presenting cert from deleted CA will fail

---

## Scenario 5: ado-wiki-c-pki-smartcard-logon
> 来源: ado-wiki-c-pki-smartcard-logon.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**
   - ###**Smartcard local logon to a device (not RDP) preliminary steps**
   - The Smartcard logon process is all accomplished via Kerberos.
   - ####Check the System event log on the domain controller for relevant smartcard events

---

## Scenario 6: Compliance note
> 来源: ado-wiki-d-avd-federated-cba.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Download the oldest version of the tool (6558.1.080229-1800) from `\\winsect\backup\Smartcard\Simulator`.
- 2. Download the latest copy of *CardUtil.exe* from here `\\winsect\backup\Smartcard\Simulator\Current\amd64\CardUtil.exe`
- 3. Turn on Test mode on your Windows 10 computer by running this command and rebooting the computer.  This needs to be done on the client and on the AVD host pool VMs.
- 4. Copy the 6558.1.080229-1800 folder to C:\temp on the client and the AVD VMs.
- 5. From an elevated command prompt run this command to create the *C:\MSCARD* folder:
- 6. Add this registry value to the client and the AVD VMs.
- 7. Copy **CardUtil.exe** that was downloaded earlier into the root of the C:\MSCARD folder.
- 8. From an elevated command prompt run these commands and have it end with a reboot:
- 9. Sign-in to Console or Basic session.
- 10. Make sure the **Certificate Propagation** and **Start Smart** card service

---

## Scenario 7: CBA: Certificate Revocation Lists (CRL)
> 来源: ado-wiki-h-cba-cert-revocation-lists.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Do NOT use short validity periods (shorter than a week) for CRL
- 2. Publish delta CRL for rapid/recent changes (revocations)
- 3. Stamp "next CRL publish" field in CRL (Windows Server PKI supports this; Intune Cloud PKI does not)
- 4. If no internet-accessible CRL for some CAs, leave path blank and use `exemptedCertificateAuthoritiesSubjectKeyIdentifiers` in `crlValidationConfiguration` to exclude specific CAs from CRL checks

---

## Scenario 8: CBA: Data Analysis
> 来源: ado-wiki-h-cba-data-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Steps (Native & Federated CBA)**
   - 1. Have user close all apps on the device
   - 2. Go to https://myaccount.microsoft.com → **Sign out everywhere**
   - 3. Admin: Azure AD Portal → user account → **Authentication methods** → **Revoke MFA sessions**
2. **Diagnostic Logs - Key Checks**
   - *DataForConditionEvaluation**:
   - Native: `"IsFederatedCertAuthDone":false`
   - Federated: `"IsFederatedCertAuthDone":true`

---

## Scenario 9: Azure AD Native Certificate Based Authentication (CBA)
> 来源: ado-wiki-h-native-cba.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Entra Portal → Protection → Authentication methods → Certificate-based authentication
- 2. Enable and Target tab: All users or Select groups
- 3. Configure tab: Issuer hints, Protection level, Affinity Binding, Username bindings
- 1. CRL validation of up to 5 CAs in chain
- 2. Windows interactive login: Win10 20H1+, Win11 21H2+, Server 2019+ (AADJ and HAADJ with PRT)
- 3. Non-routable UPN support via certificateUserIds
- 4. High affinity binding (SKI, SHA1PublicKey)
- 5. CRL size limit increase (20MB/45MB foreground, 45MB/150MB background)
- 6. MRU authentication method
- 7. Improved user account lookup (UPN-based, not certificate-based)

---

## Scenario 10: Certificate-Based Authentication (CBA) Setup for 21Vianet (Mooncake)
> 来源: onenote-cba-setup-21vianet.md | 适用: Mooncake ✅

### 排查步骤
1. **Step 1 — Open Certification Authority Console**
   - On the CA server, run: `certsrv.msc`
2. **Step 2 — Export CA Certificate**
   - 1. Right-click CA server name → **Properties** → **General** tab → **View Certificate**
   - 2. Go to **Details** tab → **Copy to File**
   - 3. Select format: **Base-64 encoded X.509 (.CER)**
3. **Step 3 — Upload to Entra ID PKI Trust Store**
   - Create PKI container object and upload the Root Certificate via Microsoft Graph API.

---
