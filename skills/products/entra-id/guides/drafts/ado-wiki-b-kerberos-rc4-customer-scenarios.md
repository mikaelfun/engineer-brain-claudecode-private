---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos RC4 Deprecation/Customer Scenarios"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FKerberos%2FKerberos%20RC4%20Deprecation%2FCustomer%20Scenarios"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]
 



##<span style="color:CornflowerBlue">Support Scenarios for Kerberos RC4 Deprecation


This document outlines the standard support scenarios that technical engineers (Directory Services, Identity, and Security) are likely to encounter following the release of the Kerberos RC4 hardening phases (**CVE-2026-20833**).
A **Support Scenario** represents a real-world, customer-impacting situation that arises from the transition from legacy RC4-HMAC to AES-only encryption.



<span style="color:Coral">**1. Advisory & Strategic Planning**


_This scenario usually occurs prior to or during Phase 1 (Initial Deployment)._
*   **Customer Inquiry:** "We heard RC4 is going away. What is the impact on our specific environment, and what is the risk of doing nothing?"
    
*   **Engineer Context:** Customers need a risk assessment. You must explain the difference between **Audit** (Phase 1) and **Enforcement** (Phase 2).
    
*   **Key Discussion Points:**
    *   Identifying legacy Windows versions (Server 2003/XP).
        
    *   Identifying non-Windows dependencies (Linux, SAP, Oracle, NAS/SAN).
        
    *   The importance of the **January 2026** updates for visibility.
        



<span style="color:Coral">**2. PowerShell Tooling & Automation Issues**


_Customers utilize Microsoft-provided scripts to identify at-risk accounts._
*   **Customer Inquiry:** "The `Get-KerbEncryptionUsage.ps1` script is failing with 'Access Denied' or is returning thousands of lines I can't interpret."
    
*   **Engineer Context:** This is a "blocker" issue. If they can't run the scripts, they can't audit.
    
*   **Common Troubleshooting Steps:**
    *   **Permissions:** Ensuring the user has `Read` permissions to the `msDS-SupportedEncryptionTypes` attribute across the domain.
        
    *   **Performance:** Scripts querying 50,000+ objects may time out or impact DC performance; advise on batching or targeting specific OUs.
        
    *   **Interpretation:** Helping the customer distinguish between "Interactively logged in users" (low risk) and "Service Accounts/SPNs" (high risk).
        



<span style="color:Coral">**3. Phase 1: Audit Interpretation (January 2026+)**


_The "Warn but don't block" stage._
*   **Customer Inquiry:** "Our Event Logs are flooded with **Event ID 201/202**. Does this mean authentication is failing right now?"
    
*   **Engineer Context:** You must reassure the customer that Phase 1 is **non-breaking**.
    
*   **Support Actions:**
    *   Clarify that **Event 201** indicates a client requested RC4, and **Event 202** indicates a service ticket was issued using RC4.
        
    *   Use these logs to build a "Hit List" of accounts that **must** have their passwords reset before Phase 2.
        



<span style="color:Coral">**4. Phase 2: Service Outages (April 2026+)**


_The "Soft Enforcement" stage where defaults change to AES-only._
*   **Customer Inquiry:** "We just patched our DCs and now our [Application Name] is failing with 'Encryption Type Not Supported' errors."
    
*   **Engineer Context:** This is a high-priority "Down" scenario. The KDC is now refusing to issue tickets because the account lacks AES keys or the client is RC4-only.
    
*   **Support Logic Table:**
    
| **Symptom** | **Probable Cause** | **Immediate Action** |
| --- | --- | --- |
| **Event 203** | Client is RC4-only (Legacy OS/Device). | Update client or regenerate Keytab with AES. |
| **Event 204** | Target Service Account lacks AES keys. | **Reset Service Account Password.** |
| **KDC_ERR_PREAUTH_FAILED** | Pre-auth requires RC4, but DC is enforcing AES. | Update client's Kerberos configuration/GPO. |



<span style="color:Coral">**5. Phase 3: Hard Enforcement & Registry Failures (July 2026+)**


_The "No Rollback" stage._
*   **Customer Inquiry:** "We tried to use the `RC4DefaultDisablePhase` registry key to roll back to Audit mode, but it's not working. RC4 is still blocked."
    
*   **Engineer Context:** This is a "Works as Intended" scenario for Microsoft, but a crisis for the customer.
    
*   **Key Technical Fact:** In Phase 3, the KDC logic **ignores** the registry override.
    
*   **Resolution:** The customer **cannot** roll back. You must assist them in modernizing the failing service immediately (password reset or software update).
    



<span style="color:Coral">**6. OEM & Development Dependencies**


_Third-party vendors or in-house developers needing Microsoft assistance._
*   **Customer Inquiry:** "Our proprietary storage appliance (OEM) only supports RC4. We need an exception or a custom patch from Microsoft Dev."
    
*   **Engineer Context:** This is an escalation scenario. DS engineers act as the liaison between the customer and Microsoft Product Groups (PG).
    
*   **Support Actions:**
    *   Gather the specific **EType** requested by the OEM device.
        
    *   Document why the OEM cannot support AES (e.g., legacy crypto library, hardware limitation).
        
    *   Note: Generally, Microsoft will **not** grant exceptions for RC4; the focus is on forcing the OEM to provide a firmware update.
        



<span style="color:CornflowerBlue">**Summary of Phase-Specific Support**


| **Phase** | **Deployment Date** | **Support Focus** | **Registry Key Influence (RC4DefaultDisablePhase)** |
| --- | --- | --- | --- |
| **Phase 1: Audit** | Jan 13, 2026 | Log Interpretation & Scripting | **0 or 1:** Enables auditing; no blocking. |
| **Phase 2: Soft Enforcement** | April 2026 | Troubleshooting Service Failures | **2:** Default. Can be set back to `1` for temporary fix. |
| **Phase 3: Hard Enforcement** | July 2026 | Modernization & "No Fix" Scenarios | **Value is ignored.** Hard Enforcement is permanent. |



<span style="color:Coral">**Final Review for Engineers**


When taking a call for "Kerberos Problems," always check the **Registry Value** on the Domain Controller first to see which Phase the customer has manually or automatically entered:

> `HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters\RC4DefaultDisablePhase`

*   **Value 1:** They are in **Audit**. Find the legacy accounts.
    
*   **Value 2:** They are in **Enforcement**. They need password resets or keytab updates.
    
*   **Value 3:** They are in **Hard Enforcement**. There is no turning back.
    


<span style="color:Coral">**Technical Context: The Phased Rollout**


Understanding the timeline is crucial for diagnosing symptoms.
| **Deployment Phase** | **Release (approximate)** | **Key Change** | **DC Behavior** |
| --- | --- | --- | --- |
| **1B (Warning Phase)** | January 2026 Updates | Initial deployment of new code, enabling auditing. | Logs Warning Event IDs if RC4 is used. Authentication still succeeds. |
| **4B (Enforcement Phase)** | April 2026 Updates | Hard enforcement of AES defaults. | **Rejects authentication requests that require RC4.** |



<span style="color:CornflowerBlue">**1. Primary Failure Scenarios (Windows Server 2025 / GE and Newer)**


With the introduction of Windows Server 2025 (GE release), the KDC logic has been significantly hardened. While older releases (FE and prior) had four or five different edge-case fallback scenarios that could cause confusion, Server 2025 focuses on two primary vectors.

### <span style="color:Coral">**Scenario 1 � Target service account does not have AES-SHA1 keys**

*   **Description:** The target service account has been relying upon the assumed supported encryption type (the domain default) and does not possess AES-SHA1 keys.
    
*   **Root Cause:** The account hasn't had its password reset since before AES became the standard (roughly the Windows Server 2008 era). The account only holds legacy RC4 keys.
    
*   **Manifestation:** After the enforcement update, the KDC cannot issue a ticket to that service because it lacks the necessary long-term keys to encrypt it.
    
*   **Symptoms:**
    *   **Proactive (1B Phase):** A warning event is logged indicating authentication _will_ break upon enforcement.
        
    *   **Enforcement (4B Phase):** Authentication fails explicitly. The event log states the service ticket failed because the target service account does not have AES-SHA1 keys.
        
*   **Resolution:** **Perform a password reset for the target service account on a modern DC.** This generates new long-term keys supporting all available (modern) encryption types.
    

### <span style="color:Coral">**Scenario 2 � Requesting machine only advertises support for RC4**

*   **Description:** The requesting machine only advertises support for RC4 in its Kerberos initial request.
    
*   **Root Cause:** The realistic instance of this is a non-Windows device or Windows Server 2003 (which has been out of support for over 11 years) that natively _only_ speaks RC4.
    
*   **Technical Detail (Server 2025):** This is not technically a scenario on a Windows Server 2025 DC because Server 2025 **refuses to issue RC4 TGTs in any facility.** The request effectively cannot happen on a 2025 KDC.
    
*   **Technical Detail (Older DCs):** On older DC versions (FE and prior) _while the enforcement update is applied_, if this client configuration existed, authentication would fail because there would be no shared Kerberos ETypes between the requesting machine and the target service.
    
*   **Resolution:** Update the legacy client to support AES, or decomission the unsupported asset.
    



**2. Common Technical Scenarios & Symptoms (Combined Input & Research)**


These scenarios represent common real-world manifestations engineers will encounter.

### <span style="color:Coral"> **Scenario A: Legacy Service Accounts ("One service failing")**

*   **Root Cause:** A legacy service account, scheduled task, or automated process only holds an RC4 key (password not reset in >15 years).
    
*   **Symptoms:** Authentication works for 99% of users and services, but one specific application or automated task fails after a DC update. Interactive user logins remain unaffected.
    
*   **Diagnostic:** Domain Controller audit events will explicitly flag the failed attempt.
    
*   **Resolution:** Reset the service account password on a modern Windows DC.
    

###<span style="color:Coral"> **Scenario B: Cross-Platform or Third-Party Integration Breakdown**

*   **Root Cause:** Many non-Windows systems (Linux servers, NAS devices, SAN appliances, etc.) use Kerberos via **keytab files**. These keytabs were often generated containing _only_ RC4 encryption types.
    
*   **Symptoms:** Cross-platform services or storage devices suddenly lose connectivity to the Windows environment.
    
*   **Resolution:**
    1.  Regenerate the keytab files on the respective systems to explicitly include AES encryption types.
        
    2.  If the device/software is too old to support AES, it must be updated or replaced.
        

###<span style="color:Coral"> **Scenario C: DC Updates trigger Domain-wide errors (Explicit Policy)**

*   **Root Cause:** An administrator previously explicitly configured the entire domain to only use RC4 via domain policy (GPO) or registry (`DefaultDomainSupportedEncTypes` registry value).
    
*   **Symptoms:** Users or admins notice Kerberos errors across the entire domain immediately following the application of the Jan/April updates.
    
*   **Diagnostic:**
    *   **Event ID 205** is logged on Domain Controllers.
        
    *   This event warns that `DefaultDomainSupportedEncTypes` is explicitly defined to include insecure encryption.
        
*   **Policy Note:** Since this is an explicit administrator configuration, **Microsoft will not automatically override it.** The organization is responsible for this vulnerable state.
    
*   **Resolution:** Update the domain's encryption policy (registry/GPO) to prefer and allow AES.
    

###<span style="color:Coral"> **Scenario D: Explicitly Configured RC4 Account Working Fine**

*   **Root Cause:** An administrator has explicitly defined insecure encryption types on a _specific_ account using the `msDS-SupportedEncryptionTypes` attribute.
    
*   **Symptoms:** The service account continues to work without issue, and **no KDC audit events are generated for it** during the phased updates.
    
*   **Explanation:** The upcoming enforcement (4B) changes _only_ alter the default encryption behavior. Explicitly set values on accounts are honored regardless.
    
*   **Warning:** These explicitly insecure configurations remain a massive security risk, even though they are not immediately blocked by the deprecation roadmap.
    

### <span style="color:Coral">**Scenario E: Pre-Authentication Failure due to RC4 Usage**

*   **Root Cause:** A client attempts initial Kerberos pre-authentication by sending an encrypted timestamp using RC4, but the KDC (now enforcing AES) rejects the use of EType 23 for pre-auth.
    
*   **Symptoms:** Authentication fails immediately during the initial `AS_REQ`.
    
*   **Resolution:** Identify why the client is using RC4 for pre-authentication (e.g., GPO restriction, local registry key) and configure it to use AES.
    

###<span style="color:Coral"> **Scenario F: Hardcoded Application Configurations**

*   **Root Cause:** Very old, legacy applications (often compiled 15+ years ago) may have hardcoded logic that attempts to specifically force the negotiation of RC4 via the Kerberos API.
    
*   **Symptoms:** Deep application failure that cannot be remediated via AD configuration or password resets.
    
*   **Resolution:** Application must be updated by the vendor or replaced. This highlights the critical risk of unsupported legacy applications.
    

*** * ***

<span style="color:CornflowerBlue">**3. Comparison Chart: Provided Input Failure Scenarios**


| **Feature** | **Scenario 1: Target Service No AES Keys** | **Scenario 2: Requesting Machine Only RC4** | **Legacy Accounts (Scenario A)** | **Explicit Policy (Scenario C)** | **Explicit Account (Scenario D)** |
| --- | --- | --- | --- | --- | --- |
| **Primary Root Cause** | Target lacks AES long-term keys (Password needs reset) | Non-Windows/Server 2003 client lacks AES ability. | Legacy account password never reset since pre-AES era. | Admin explicitly defined RC4-only policy domain-wide. | Admin explicitly defined RC4-only on single account. |
| **Symptom Manifestation** | Proactive Warning (1B) or Ticket Failure (4B). | Authentication failure (In Server 2025, request never generated). | Single service failure, most users/services work. | Domain-wide Kerberos errors after updates. | **No outage. No KDC audit events.** |
| **Diagnostic Key** | Audit event: ticket failed, target account lacks AES-SHA1 keys. | Authentication failure; on Server 2025, refusal of RC4 TGT. | KDC audit logs flag the specific legacy account. | **Event ID 205** (DC warning). | (N/A) Security Risk only. |
| **Microsoft Policy** | Outage expected if ignored. | Refusal of legacy config on modern KDCs. | Outage expected if ignored. | **Will NOT automatically override explicit config.** | Explicit values are honored. |
| **Resolution** | **Reset password on modern DC.** | Update client/hardware to support AES. | Reset account password on modern DC. | Update Domain Policy/Reg to AES. | Reconfigure account attribute `msDS-SupportedEncryptionTypes` to include AES. |



<span style="color:Coral">**4. Comparison Chart: Additional Researched Scenarios**


| **Feature** | **Scenario B: Cross-Platform Keytabs** | **Scenario E: Pre-Authentication Failure** | **Scenario F: Hardcoded App Config** |
| --- | --- | --- | --- |
| **Primary Root Cause** | Linux/NAS using keytabs generated with _only_ RC4 ETypes. | Client uses RC4 for initial `AS_REQ` timestamp, rejected by enforcing KDC. | Legacy application forces RC4 negotiation in code. |
| **Symptom Manifestation** | NAS/Linux connectivity loss to AD. | Auth fails immediately during initial request. | Application fails deep logic, config change doesn't help. |
| **Diagnostic Key** | Audit logs on target device. Recheck keytab creation settings. | KDC rejection of EType 23 usage during initial request. | Deep analysis by application vendor. |
| **Microsoft Policy** | Outage expected. Org responsibility. | Outage expected. Org responsibility. | Outage expected. Org responsibility. |
| **Resolution** | **Regenerate keytabs** to include AES types. Update legacy hardware. | Configure client to use AES via GPO/Registry. | Vendor must patch/update app, or replace app. |



#<span style="color:CornflowerBlue">**5. Critical Engineering Notes**


### <span style="color:Coral">**Warning: Silent Failures in Background Processes**

If unaddressed, the RC4 deprecation can cause critical failures in background services, scheduled tasks, or automated processes (like backups or batch jobs). These failures may not be immediately obvious, especially if interactive user logins continue normally.
**Support engineers must emphasize proactive detection using audit events and scripts rather than waiting for enforcement (April 2026) to discover critical background infrastructure failures.**

###<span style="color:Coral"> **Case Study: Client-side error with no corresponding DC audit event**

Microsoft testing observed a specific scenario where a Windows 11 24H2 client (specifically configured to _only_ support RC4 and DES) attempted to log on against a Windows Server 2025 DC.
*   **Observations:** The DC logged a **successful 4768 TGT event**. However, the **client experienced a logon failure.**
    
*   **Explanation:** This is a **client-side failure**, not a server-side failure. The DC successfully processed the TGT request and did its job, which is why no KDCSVC audit event was generated. The failure occurred within the client's own Kerberos logic, which anticipated different keys than those received.
    
*   **Takeaway:** If an organization explicitly imposes an insecure configuration on a modern client, Microsoft's interest in supporting it is very limited, as no supported Windows OS requires it.
