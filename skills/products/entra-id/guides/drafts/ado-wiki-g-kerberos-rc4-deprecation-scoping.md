---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos RC4 Deprecation/Scoping and Log collections"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%20RC4%20Deprecation/Scoping%20and%20Log%20collections"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

<span style="color:CornflowerBlue">Kerberos RC4 Deprecation Scoping & Log Collection
=======================================================

As we move through the 2026 enforcement phases, diagnosing Kerberos failures requires a surgical approach to differentiate between standard connectivity issues and the intentional retirement of the **RC4-HMAC (EType 23)** cipher. This guide provides support engineers with a logical scoping workflow and log collection checklist.



**<span style="color:Coral">Part 1: Logical Scoping Workflow**
--------------------------------

The following questions should be asked in order to determine if the failure is a direct result of the **CVE-2026-20833** hardening phases.

### **1. Timeline & Patch Correlation**

**Question:** "When exactly did the issue begin, and does it align with the January 13th, April, or July 2026 Patch Tuesday cycles?"
*   **Context:** The **January** update introduced auditing (Warn); **April** introduced AES-only defaults (Soft Enforcement); **July** removes the rollback capability (Hard Enforcement).
    
*   **Narrowing to RC4:** A failure occurring immediately after an April 2026 DC update is a primary indicator that a legacy dependency has hit the new "AES-only" default.
    

### **2. Identifying the "Requestor" and "Target"**

**Question:** "Is the failure happening for all users, or only for a specific application, service account, or non-Windows device (NAS, Linux, Printer)?"
*   **Context:** Broad failures suggest a domain-level policy issue. Isolated failures suggest an account-level key problem.
    
*   **Narrowing to RC4:** If only legacy devices or service accounts fail, it suggests they lack AES keys or the client is incapable of negotiating AES.
    

### **3. Password Lifecycle History**

**Question:** "When was the last time the password for the failing service account or computer object was reset?"
*   **Context:** Accounts that haven't had a password reset in 10+ years (pre-Server 2008 era) likely do **not** have AES hashes in the Active Directory database.
    
*   **Narrowing to RC4:** If an account only possesses RC4 keys, the KDC cannot issue an AES ticket to it. A password reset is the "Fix of Choice" for Scenario 1 failures.
    

### **4. Configuration: Explicit vs. Implicit**

**Question:** "Is the `msDS-SupportedEncryptionTypes` attribute populated for the affected account, or is it `<Not Set>`?"
*   **Context:** The April 2026 change **only** impacts accounts where the attribute is **NULL/Not Set**. Explicitly configured accounts are exempt from the default shift.
    
*   **Narrowing to RC4:** If the attribute is `<Not Set>`, the KDC now forces AES. If it is explicitly set to `0x4` (RC4), the account should still work, meaning the issue may not be the deprecation itself but a different protocol error.
    

### **5. Client Capability & Non-Windows Integration**

**Question:** "Does the client/device support AES-SHA1, and if using a keytab (Linux/Appliance), was it generated with AES support?"
*   **Context:** Non-Windows devices often have "hard-coded" keytabs or legacy Kerberos libraries (e.g., old Java versions) that only understand RC4.
    
*   **Narrowing to RC4:** Check if the client advertises AES in its initial `AS_REQ`. If it only lists EType 23, the KDC will reject it in Enforcement mode.
    



**<span style="color:Coral">Part 2: Evidence Collection Checklist**
-------------------------------------

Use the following table to identify which logs provide the "Smoking Gun" for RC4 dependencies.

### **Event Log Reference Table**

| **Log Location** | **Event ID** | **Source** | **Significance** |
| --- | --- | --- | --- |
| **System** | **201, 202** | **KDCSVC** | **Audit/Warning:** Client or Service is using RC4. Visible in Phase 1 (Jan 2026). |
| **System** | **203, 204** | **KDCSVC** | **Failure:** RC4 request was **blocked**. Visible in Phase 2 (April 2026). |
| **System** | **205** | **KDCSVC** | **Policy Risk:** `DefaultDomainSupportedEncTypes` is explicitly set to include RC4. |
| **Security** | **4768 / 4769** | **Kerberos** | Check the **Ticket Encryption Type** field. `0x17` (23) indicates RC4 usage. |
| **System** | **4081** | **KDC** | Legacy audit event for RC4 ticket issuance. |



**<span style="color:Coral">Part 3: Tool-Based Diagnostics**
------------------------------

Before opening a high-severity case, engineers should run the following telemetry checks:
*   **Registry Verification:** Check `HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters` for the value `RC4DefaultDisablementPhase`.
    *   `1` = Audit Mode (Jan 2026 behavior)
        
    *   `2` = Enforcement Mode (April 2026 behavior)
        
*   **PowerShell Audit:** Run Microsoft-provided scripts to identify at-risk accounts:
    *   `Get-KerbEncryptionUsage.ps1`: Identifies which ETypes are currently being negotiated in your environment.
        
    *   `List-AccountKeys.ps1`: Directly queries AD to see which accounts are missing AES-SHA1 keys.
        



**<span style="color:Coral">Summary of Narrowing Logic**
--------------------------

| **Observation** | **Likely Root Cause** | **Recommended Action** |
| --- | --- | --- |
| **Event 202 / 204** | Target Service Account lacks AES keys. | Reset Service Account Password. |
| **Event 201 / 203** | Requesting Client/Device is RC4-only. | Update Client OS/Firmware or Keytab. |
| **Event 205** | Explicit Domain Policy is insecure. | Remove RC4 from the `DefaultDomainSupportedEncTypes` registry/GPO. |
| **Error `0x12` (KDC_ERR_ETYPE_NOSUPP)** | Protocol Mismatch (Enforcement Active). | Check account attributes and client capabilities. |

![Gemini_Generated_Image_tawps0tawps0tawp.png](/.attachments/Gemini_Generated_Image_tawps0tawps0tawp-c2082436-af54-45fb-95d5-4865f18d7635.png)

###<span style="color:Coral"> PowerShell Audit Scripts

Microsoft provides PowerShell scripts in the **Kerberos-Crypto** GitHub repository to audit RC4 usage efficiently:

*   **`List-AccountKeys.ps1`** � Queries the Security Event Log for the Available Keys field, enumerating what encryption key types are available for accounts found in the event logs. If an account shows only RC4 without AES key types, that account needs attention.

*   **`Get-KerbEncryptionUsage.ps1`** � Queries events to see which encryption types Kerberos used within the environment. Filtering by RC4 helps pinpoint clients or services still using the weak cipher.

##<span style="color:Coral">Logs to Collect from the Customer

In summary, request the following from the customer:

1.  **System event logs** from all DCs (filter for Event IDs 201�209, source KDCSVC)
2.  **Security event logs** from all DCs (Event IDs 4768, 4769 around the failure times)
3.  **`msDS-SupportedEncryptionTypes` attribute values** for affected accounts
4.  **`DefaultDomainSupportedEncTypes` registry value** from DCs (if set)
5.  **`RC4DefaultDisablementPhase` registry value** from DCs
6.  Output from **`List-AccountKeys.ps1`** and **`Get-KerbEncryptionUsage.ps1 -Encryption RC4`** if the customer can run them
7.  Any error codes or messages from client applications experiencing failures
8.  Network traces (NetMon or Wireshark) from the DC if the issue is ambiguous and needs protocol-level validation of the Kerberos exchange 

**TSS - Authentication scripts reproducing the issue on the client and the authenticating domain controller** 

***
