# Entra ID FIDO2/Passkey Passwordless Auth — 排查工作流

**来源草稿**: ado-wiki-a-fido2-android-brokered-apps.md, ado-wiki-a-fido2-android-data-collection.md, ado-wiki-a-fido2-data-collection.md, ado-wiki-a-fido2-how-it-works.md, ado-wiki-a-fido2-introduction.md, ado-wiki-a-fido2-lab-setup.md, ado-wiki-a-fido2-looking-at-logs.md, ado-wiki-a-fido2-passkey-profiles-entra-id.md, ado-wiki-a-ms-authenticator-passwordless-detailed.md, ado-wiki-a-querying-passwordless-credentials-graph.md... (+20 more)
**场景数**: 8
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting FIDO2 on Android Devices
> 来源: ado-wiki-a-fido2-android-data-collection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Install [Android Studio](https://developer.android.com/studio/install) on the computer you want to debug from.  To use WiFi debugging you will need the computer to be on the same network as the dev
- 1. At first launch you will get a welcome screen, click **New Project**.
- 1. Under Phone and Tablet choose **No Activity**.
- 1. Give your project a meaningful name.
- 1. Wait for the packages to load.  You should get a Defender notification, be sure to allow network access for Android Studio or the connection will fail.
- 1. Enable [Developer mode](https://developer.android.com/studio/debug/dev-options) on device.
- 1. Enable USB/Wireless Debugging on the device.  **Note:** if you are using a USB security key, you will want to use Wireless debugging option as the USB port will be taken.
- 1. Connect device to the computer running Android Studio, by choosing the **Pair Devices Using Wi-Fi** button under Device Manager/Running Devices.
- 1. A QR code will appear in Android Studio.
- 1. On the device under Developer Options click on the **Wireless debugging** text (not the slider).  This will give you the option to scan the QR code.

---

## Scenario 2: Specify the on-premises Active Directory domain.
> 来源: ado-wiki-a-fido2-data-collection.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 3: Why use IDmelon?
> 来源: ado-wiki-a-fido2-lab-setup.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 4: What are the most useful log files?
> 来源: ado-wiki-a-fido2-looking-at-logs.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 5: Compliance note
> 来源: ado-wiki-a-fido2-passkey-profiles-entra-id.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Call the [Get authenticationMethodsPolicy](https://learn.microsoft.com/en-us/graph/api/authenticationmethodspolicy-get?view=graph-rest-1.0&tabs=http) Microsoft Graph API.
- 2. Save the JSON response as a .txt file.
- 3. Right-click the file > **Properties** > Check the file size.
- 1. Sign in as a **Global Administrator** or **Authentication Policy Administrator** (required to manage Authentication Methods).
- 2. Click *Opt-in to public preview* link in the banner.
- 3. From the updated banner, click **Edit the default passkey profile** and select at least one **Target type** to complete the opt-in.
- 4. Click **Edit the default passkey profile**, choose a **Target type**, and click **Save** to finalize the opt-in.
- 1. Go to [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer).
- 2. Sign into your admin account by clicking on the person icon in the top right corner.
- 3.  Under **Modify permissions**, make sure youve consented to the `Policy.Read.All` and `Policy.ReadWrite.AuthenticationMethod` permissions.

---

## Scenario 6: FIDO2 / Passkey Data Analysis Guide
> 来源: ado-wiki-c-fido2-data-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Diagnosing Errors Returned by the Key**
   - Check the WebAuthN event log (`Microsoft-Windows-WebAuthN/Operational`) for CTAP responses. CBOR-encoded responses can be decoded at cbor.me.
   - Key CTAP2 error codes:
   - `0x2E` — CTAP2_ERR_NO_CREDENTIALS: No valid credentials on key for this RP

### 关键 KQL 查询
```kql
let queryTimestamp = datetime(06/19/2025 23:04:00);
let queryTimespan = time(3m);
let start = queryTimestamp - queryTimespan;
let end = queryTimestamp + queryTimespan;
KeyProvisioningEvent
| where env_time > start and env_time < end
| where usage == "FIDO"
| where operationName in ("CreatePublicKeyCredential","CreatePublicKeyCredentialForCce")
| project env_time, correlationId, operationName, resultType, accountId, aaGuid, authenticatorDescription, additionalInfo, resultSignature
```
`[来源: ado-wiki-c-fido2-data-analysis.md]`

```kql
let queryTimestamp = datetime(06/19/2025 23:04:00);
let queryTimespan = time(3m);
let start = queryTimestamp - queryTimespan;
let end = queryTimestamp + queryTimespan;
AllRequestEvent
| where env_time > start and env_time < end
| where user_objectId == "replace with user objectid as appropriate"
| project env_time, operation_name, operation_id, gateway_request_id, request_responseCode, user_objectId
```
`[来源: ado-wiki-c-fido2-data-analysis.md]`

```kql
let queryTimestamp = datetime(06/19/2025 23:04:00);
let queryTimespan = time(3m);
let start = queryTimestamp - queryTimespan;
let end = queryTimestamp + queryTimespan;
AllDiagnosticEvent
| where env_time > start and env_time < end
| where ContainerName == "myaccess-container"
| where operation_id == "replace with x-ms-correlation-id header value if available"
| project env_time, operation_id, gateway_request_id, RequestPath, user_objectId, user_tenantId, message, FormattedMessage
```
`[来源: ado-wiki-c-fido2-data-analysis.md]`

---

## Scenario 7: FIDO2 / Passkey Data Collection Guidance
> 来源: ado-wiki-c-fido2-data-collection-guidance.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Hybrid authentication deployment** — enabling FIDO2 key-based interactive logon to hybrid Entra ID joined devices
- 2. **Browser based enrol/logon** via FIDO2 key
- 3. **Windows interactive logon** via FIDO2 key (Entra ID joined and hybrid Entra ID joined devices)
- 1. Reproduce the issue
- 2. Navigate to `edge://device-log` (Edge) / `chrome://device-log` (Chrome) / `brave://device-log` (Brave)
- 3. Set log level: **Debug**
- 4. Check **File info** and **Detailed Timestamps**
- 5. Click **Clear Types**, then check **FIDO**
- 6. Reproduce the FIDO2 issue (browser must be in **normal mode**, not private)
- 7. Go back to device-log tab, click **Refresh**

---

## Scenario 8: FIDO2/Passkey on Non-Windows OSes
> 来源: ado-wiki-h-fido2-non-windows-oses.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Apple PIN provisioning**: Apple cannot provision a new PIN on FIDO2 device. New keys must be set up on Windows first.
- 2. **Android NFC**: Not supported in any scenario.
- 3. **W365 mobile passkey**: Not currently supported (planned FY25).

---
