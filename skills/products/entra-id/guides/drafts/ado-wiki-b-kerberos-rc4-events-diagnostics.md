---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos RC4 Deprecation/Events and Diagnostics"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FKerberos%2FKerberos%20RC4%20Deprecation%2FEvents%20and%20Diagnostics"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# <span style="color:CornflowerBlue">Relevant Windows Events and How to Interpret Them

 **Existing Security Events for RC4 Auditing**

| **Event ID** | **Log**  | **What It Tells You**                                                                                                                                                                                                                                                                                                                                                              |
| ------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **4768**     | Security | A Kerberos TGT was requested. Shows encryption types supported by the account and the session/ticket encryption used. **Note:** TGT events do NOT trigger KDCSVC 201�209 events |
| **4769**     | Security | A Kerberos service ticket was requested. Includes encryption type fields for the target service. This is the event type that correlates with KDCSVC 201�209 events.                                                                                                                                                                                                                |

**These events contain several fields relevant to RC4 diagnostics:**

*   **msDS-SupportedEncryptionTypes** � Shows the encryption types supported by the target account. If this field is **undefined** or **0**, the account relies on the domain's default assumptions (which change with RC4 enforcement). If it is explicitly defined, the account is outside the scope of the enforcement changes. 

*   **Available Keys** � Lists which key types exist for the account in AD. If this shows **only RC4 and no AES** for a service account, that account is vulnerable and needs remediation (a password reset to generate AES keys).

*   **Session Encryption Type** / **Ticket Encryption Type** � The actual ciphers used. If these show RC4 (0x17) for a successful authentication, it indicates RC4 was negotiated. After enforcement, these should show AES (0x12 or 0x13) for all requests handled by the new defaults.

*   **Advertised Etypes** (Network Information section) � Shows what encryption types the client advertised as supported. If a client only advertises RC4 (0x17) and DES, that's a legacy or misconfigured client. Modern Windows should list AES alongside RC4. 

**Important Note on 4768 vs. 4769:** As observed in engineering testing, the 4768 (TGT) events are **not associated with the new KDCSVC audit events** because those audit events only apply to service ticket requests. Therefore, seeing an RC4-related 4768 event does not necessarily mean a KDCSVC event will be logged. Focus your analysis of KDCSVC events on 4769 (service ticket) events where RC4 was used. 


The table below summarizes the new KDCSVC audit events introduced with the January 2026 update. Remember that these are **only logged for service ticket requests**, not TGT requests. 
#<span style="color:CornflowerBlue">New KDCSVC System Events (201�209)

| **Event ID** | **Type/Phase**                  | **Meaning**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **201**      | Warning (Audit)                 | The KDC detected that a client only supports insecure encryption types (RC4) and the target service's `msDS-SupportedEncryptionTypes` is **not defined** (relies on default). This will fail under enforcement. Transitions to **Error 203** in Enforcement mode.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **202**      | Warning (Audit)                 | The target service account's `msDS-SupportedEncryptionTypes` is **not defined** and the **service account only has insecure (RC4) keys** � no AES keys present  This is the most common scenario: a service account whose password hasn't been reset since before AES was introduced. Transitions to **Error 204** in Enforcement.                                                                                                                                                                                                    |
| **203**      | Error (Enforcement)             | The KDC **blocked** a service ticket because the client only supports insecure types and the service has no explicit encryption config. This is the enforcement counterpart of Event 201.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **204**      | Error (Enforcement)             | The KDC **blocked** a service ticket because the service account only has insecure keys and has no explicit encryption config. This is the enforcement counterpart of Event 202                                                                                                                                                                                                                                                                                                                                                      |
| **205**      | Warning (Audit and Enforcement) | The KDC detected that the domain controller has `DefaultDomainSupportedEncTypes` **explicitly** defined to include insecure encryption (RC4)  Microsoft will **not** automatically override this � the admin must change it. No enforcement counterpart exists for this event. |
| **206**      | Warning (Audit)                 | The target service's `msDS-SupportedEncryptionTypes` is explicitly set to **AES-only**, but the client doesn't advertise AES-SHA1 (client only offers RC4). Transitions to **Error 208** in Enforcement.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **207**      | Warning (Audit)                 | The target service's `msDS-SupportedEncryptionTypes` is explicitly set to **AES-only**, but the service account **doesn't have AES-SHA1 keys** (password not reset).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **208**      | Error (Enforcement)             | The KDC **denied** a service ticket because the client doesn't support AES-SHA1 and the service requires it. Enforcement counterpart of 206.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **209**      | Error (Enforcement)             | The KDC **denied** a service ticket because the service requires AES-SHA1 but has no AES keys. Enforcement counterpart of 207.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

###

### Key Interpretation Notes

*   The **presence of any Events 201, 202, 206, or 207** in the System Event Log means you are at risk for breaking changes upon moving to enforcement mode. These should be investigated and resolved before April 2026.
*   The **absence of KDCSVC audit events** does **not** guarantee that all systems will function correctly after enforcement. Remember that these events only cover service ticket requests for accounts relying on the default encryption type. Explicitly configured accounts, TGT requests, and non-Windows devices may still have issues that aren't surfaced by these events. 
*   **Event 205** is unique � it warns that an administrator has intentionally configured RC4 as an allowed encryption type via registry or policy. Microsoft will not override this, but the configuration leaves accounts vulnerable to CVE-2026-20833.
*   In the Security log events, **Session Encryption Type = 0x17** indicates RC4-HMAC was used; **0x12** indicates AES256-CTS-HMAC-SHA1-96.

***

## <span style="color:Coral">Applying Event Data to Troubleshooting Techniques

Once you have identified relevant events, use them to guide your troubleshooting steps systematically:

### Identify the Affected Accounts or Services

The KDCSVC events mention a **service account name or client computer name** in their details. Event 202/204 identifies the service account that has only RC4 keys. Event 201/203 and 206/208 mention the client principal or machine that only supports RC4. Immediately focus on these accounts and systems.

### Confirm with Security Log Details

For the accounts/devices flagged by the System events, check Security log entries around the same time:

*   If an Event 202 flagged "service account X only has insecure keys," find the 4769 event for service ticket requests to that service. The **Available Keys** and **Session Encryption Type** fields should confirm RC4 was in use.
*   If an Event 201/203 flagged "client Y only supports insecure types," look at the **Advertised Etypes** field in the 4769 event � it should show only RC4 and possibly DES, but no AES.

## <span style="color:CornflowerBlue">Determine Root Cause and Apply Targeted Fix Using the Three Criteria

Each event type maps to an implied remediation action, and **the mitigation for outages is to break one of the three criteria**:

*   **Event 202/204 (Service account with only RC4 keys):** Root cause � password too old (no AES keys). **Solution:** Reset the password on a modern OS DC to generate new AES keys. If immediate password reset is impossible, define `msDS-SupportedEncryptionTypes` on the target service account to include RC4, or define the `DefaultDomainSupportedEncTypes` registry key on the KDC (both break one of the three criteria). 

*   **Event 201/203 (RC4-only client):** Root cause � an outdated client or device that doesn't support AES-SHA1. **Solution:** Upgrade the device. If not immediately possible, explicitly set the `msDS-SupportedEncryptionTypes` on the service account it's accessing to include RC4 (breaking criterion #2). As a last resort, define the `DefaultDomainSupportedEncTypes` registry key on the KDC to include RC4 (breaking criterion #3), but this re-enables the vulnerability domain-wide. 

*   **Event 206/208 (Client RC4-only, service explicitly AES-only):** Root cause � mismatch between a legacy client and a hardened service configuration. **Solution:** Update the client if possible. If not, the service account might temporarily need its `msDS-SupportedEncryptionTypes` adjusted to also allow RC4.

*   **Event 207/209 (Service AES-only but no AES key):** Root cause � an account was set to "AES-only" but was never given an AES key (password never reset). **Solution:** Reset the account's password on a DC that generates AES keys.

*   **Event 205 (Domain allowing RC4 by explicit config):** Root cause � an admin or policy explicitly left RC4 enabled domain-wide. **Solution:** Update the Kerberos encryption policy to remove RC4. Change the `DefaultDomainSupportedEncTypes` registry to **0x18** (AES-only).

### Handling Client-Side Failures Without Corresponding DC Events

If you observe an authentication failure on a client but no KDCSVC event on the DC, consider whether the failure is **client-side**. As discussed in the scenario above, a Windows Server 2025 DC may have processed the TGT request successfully, but the client's Kerberos logic failed because it received keys it didn't expect or couldn't handle. In these cases, a **network trace** is the best diagnostic tool to see what was actually exchanged at the protocol level.

