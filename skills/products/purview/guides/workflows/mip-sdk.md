# Purview MIP SDK 集成 — 排查工作流

**来源草稿**: `ado-wiki-a-licensing-redirection.md`, `ado-wiki-a-mip-sdk-escalating-to-engineering.md`, `ado-wiki-a-office-mip-logging.md`, `ado-wiki-a-required-information-mip-sdk.md`, `ado-wiki-mip-client-versions.md`, `onenote-mip-sdk-oauth2-testing.md`
**Kusto 引用**: 无
**场景数**: 36
**生成日期**: 2026-04-07

---

## Scenario 1: Introduction
> 来源: ado-wiki-a-licensing-redirection.md | 适用: 未标注

### 排查步骤
MSIPC uses registry settings and DNS SRV records for licensing redirection. How does the MIP SDK do the same?

`[来源: ado-wiki-a-licensing-redirection.md]`

---

## Scenario 2: Premise
> 来源: ado-wiki-a-licensing-redirection.md | 适用: 未标注

### 排查步骤
Protected content is stamped with the licensing URLs of the service used for the protection. This is how the consuming client knows where to go to request access.

In migration scenarios one must have a way for the client to redirect from the old URL to the new active RMS service. This is the common scenario when migrating from AD RMS to AIP.

`[来源: ado-wiki-a-licensing-redirection.md]`

---

## Scenario 3: AD RMS Keys
> 来源: ado-wiki-a-licensing-redirection.md | 适用: 未标注

### 排查步骤
Below is the AD RMS centrally managed key.

`[来源: ado-wiki-a-licensing-redirection.md]`

---

## Scenario 4: Licensing URLs
> 来源: ado-wiki-a-licensing-redirection.md | 适用: 未标注

### 排查步骤
Below is the AD RMS licensing URL. In this case there is only the intranet URL. Some customers may have both the intranet and extranet licensing URLs.

`[来源: ado-wiki-a-licensing-redirection.md]`

---

## Scenario 5: Imported AD RMS keys
> 来源: ado-wiki-a-licensing-redirection.md | 适用: 未标注

### 排查步骤
The AD RMS key was successfully imported into AIP.

`[来源: ado-wiki-a-licensing-redirection.md]`

---

## Scenario 6: Publishing License
> 来源: ado-wiki-a-licensing-redirection.md | 适用: 未标注

### 排查步骤
From an MSIPC *.ipclog file:

```
++++++++ INFORMATION: PL details: ++++++++
          Intranet Licensing Url: "https://irm.moose.local/_wmcs/licensing",
          Extranet Licensing Url: "NULL",
          IssuerName: "AD_RMS_Key"
          Owner: "user1@moose.local",
          ContentId: "{4AD75267-638D-4085-8141-3FCF50BB1C07}",
          Content Valid until: "NULL".
```

`[来源: ado-wiki-a-licensing-redirection.md]`

---

## Scenario 7: Redirection - the SDK way
> 来源: ado-wiki-a-licensing-redirection.md | 适用: 未标注

### 排查步骤
The redirection is included in the access attempt.
1. The MIP SDK connects to `https://api.aadrm.com`.
2. The [AD RMS] licensing URL is presented and a lookup is performed.
3. The public key (SLC) used in the protection is provided for the look up.
4. If the protection key is imported into an AADRM tenant the access attempt processing continues.
5. AADRM determines if the requesting user is granted access.

`[来源: ado-wiki-a-licensing-redirection.md]`

---

## Scenario 8: Example
> 来源: ado-wiki-a-licensing-redirection.md | 适用: 未标注

### 排查步骤
In this example an AD RMS protected file is being queried with `Get-AIPFileStatus` PowerShell cmdlet.
 - The AD RMS key is imported into AIP.
 - The user running the cmdlet is an AIP service super user.

`[来源: ado-wiki-a-licensing-redirection.md]`

---

## Scenario 9: MIP SDK log
> 来源: ado-wiki-a-licensing-redirection.md | 适用: 未标注

### 排查步骤
The flow:
 - The publishing license is read to determine what service was used.
 - An AD RMS licensing URL `https://irm.moose.local/_wmcs/licensing` is found.
 - The default AADRM endpoint `https://api.aadrm.com` is used to request access.
 - Access is granted.

The request appears as the following in the log:
```
Sending HTTP request: ID: 2c56ef74-..., Type: POST, Url: https://api.aadrm.com/my/v2/enduserlicenses, ...
```

Since the requesting user is a super user they get full access (HTTP 200).

`[来源: ado-wiki-a-licensing-redirection.md]`

---

## Scenario 10: Kusto
> 来源: ado-wiki-a-licensing-redirection.md | 适用: 未标注

### 排查步骤
The lookup/redirection part in Kusto:
- The AD RMS (non-Azure) licensing URL is presented.
- The publishing license (the SLC) is used in the lookup.
- The key is found in an AADRM tenant.
- The AADRM licensing URL is used for the access transaction.

`[来源: ado-wiki-a-licensing-redirection.md]`

---

## Scenario 11: Redirection - Legacy
> 来源: ado-wiki-a-licensing-redirection.md | 适用: 未标注

### 排查步骤
MIP SDK clients (including M365 Office) use the previous mechanism.

Legacy applications used MSIPC (instead of MIP SDK). MSIPC used registry settings to manage licensing redirection.

`[来源: ado-wiki-a-licensing-redirection.md]`

---

## Scenario 12: Redirection registry settings
> 来源: ado-wiki-a-licensing-redirection.md | 适用: 未标注

### 排查步骤
```
HKLM\SOFTWARE\Microsoft\MSIPC\ServiceLocation\LicensingRedirection
Name:  https://<OnPremRMS>/_wmcs/licensing
Type:  REG_SZ
Value: https://<CloudRMS>/_wmcs/licensing

HKLM\SOFTWARE\Wow6432Node\Microsoft\MSIPC\ServiceLocation\LicensingRedirection
Name:  https://<OnPremRMS>/_wmcs/licensing
Type:  REG_SZ
Value: https://<CloudRMS>/_wmcs/licensing
```

`[来源: ado-wiki-a-licensing-redirection.md]`

---

## Scenario 13: 1. Understand the Issue
> 来源: ado-wiki-a-mip-sdk-escalating-to-engineering.md | 适用: 未标注

### 排查步骤
Before creating a ICM (Customer Management) incident, gather the following information:

- **Platform**: What platform is the app built on?
- **Operating System**: Which OS does the app run on?
- **MIP SDK Version**: Identify the version and platform details.
- **Logs**: Collect MIP SDK logs while reproducing the issue.
  Reference: [MIP SDK Logs - Overview](https://supportability.visualstudio.com/Developer/_wiki/wikis/Developer/2021218/MIP-SDK-Logs)
- **Screenshots**: Capture screenshots of any errors, if possible.

---

`[来源: ado-wiki-a-mip-sdk-escalating-to-engineering.md]`

---

## Scenario 14: 2. Create the Incident
> 来源: ado-wiki-a-mip-sdk-escalating-to-engineering.md | 适用: 未标注

### 排查步骤
Use the following template to create an ICM entry for MIP SDK:
- Reference: [Create Incident - IcM](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=C3jZ2v)
- Work with the customer to fill in the ICM template and provide all requested data.

---

`[来源: ado-wiki-a-mip-sdk-escalating-to-engineering.md]`

---

## Scenario 15: 3. ICM Configuration
> 来源: ado-wiki-a-mip-sdk-escalating-to-engineering.md | 适用: 未标注

### 排查步骤
- **ICM Type**: Select **CSS Escalated**
- **Description**: Mention all collected information:
  - Platform and OS
  - MIP SDK version
  - Logs and screenshots
  - Any impacted files (e.g., PDFs, Word documents)
- **Attachments**:
  - Upload MIP SDK logs
  - Upload other relevant files (e.g., impacted documents)

---

`[来源: ado-wiki-a-mip-sdk-escalating-to-engineering.md]`

---

## Scenario 16: 4. Submit
> 来源: ado-wiki-a-mip-sdk-escalating-to-engineering.md | 适用: 未标注

### 排查步骤
Click **Submit** to route the ICM to the **CXECARE/CEMPURVIEW** queue.

`[来源: ado-wiki-a-mip-sdk-escalating-to-engineering.md]`

---

## Scenario 17: Office MIP Logging
> 来源: ado-wiki-a-office-mip-logging.md | 适用: 未标注

### 排查步骤
Office is moving M365 versions to using the MIP SDK for file encryption/decryption. This replaces the MSIPC client. Office will continue using the MSIPC client for fallback purposes.

Office on Windows legacy MSIPC encryption/decryption functions log their transactions in the MSIPC logs: `%localappdata%\Microsoft\MSIPC\Logs`.

`[来源: ado-wiki-a-office-mip-logging.md]`

---

## Scenario 18: Compliance Utility Tool
> 来源: ado-wiki-a-office-mip-logging.md | 适用: 未标注

### 排查步骤
One may use the [Compliance Utility](https://aka.ms/ComplianceUtility/manual) to configure and collect the Office diagnostic logging.
- [Record a problem](https://github.com/microsoft/ComplianceUtility/blob/main/Manuals/3.2.1/Manual-Win.md#record-problem) will configure for the diagnostic logging.
- [Compress Logs](https://github.com/microsoft/ComplianceUtility/blob/main/Manuals/3.2.1/Manual-Win.md#z-compress-logs---compresslogs-) gathers all the logging (and more!) into a .zip archive.

`[来源: ado-wiki-a-office-mip-logging.md]`

---

## Scenario 19: Manual Collection
> 来源: ado-wiki-a-office-mip-logging.md | 适用: 未标注

### 排查步骤
While Office has default logging the MIP SDK activities are not captured there. One must enable advanced Office logging to capture these events.
- This is covered in [Collecting Office IRM Diagnostic Logs (OWiki)](https://www.owiki.ms/wiki/IRM/Microsoft/Documentation/IRM_Troubleshooting_FAQ#Collecting_Office_IRM_Diagnostic_Logs)
- NOTE: When you are finished, be sure to clear the registry values again since logging slows Office down somewhat and consumes disk space.
- NOTE: The registry values below are specified in hexadecimal.
- Launch the application, run through the scenario, then close the app.
- Wait a minute to make sure the logfile buffer is written to disk.
- MSIPC logs will be at `%LOCALAPPDATA%\Microsoft\MSIPC\Logs\*.ipclog`

#### M365 Office builds starting 16.0.10301.10000

```registry
[HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\Common\Logging]
"EnableLogging"=dword:00000001
"DefaultMinimumSeverity"=dword:00000064
```

The log will end up in your temp directory (`%TEMP%`) with a name like `COMPUTERNAME-yyyymmdd-<number>.log`.

`[来源: ado-wiki-a-office-mip-logging.md]`

---

## Scenario 20: Determine if MIP SDK is being used
> 来源: ado-wiki-a-office-mip-logging.md | 适用: 未标注

### 排查步骤
The presence of any/all of the following folders indicates the MIP SDK is in use:
- `%localappdata%\Microsoft\Word\MIPSDK\mip`
- `%localappdata%\Microsoft\Excel\MIPSDK\mip`
- `%localappdata%\Microsoft\PowerPoint\MIPSDK\mip`
- `%localappdata%\Microsoft\Outlook\MIPSDK\mip`

Newer versions of the Office apps use:
- `%localappdata%\Microsoft\Office\MIPSDK\`

`[来源: ado-wiki-a-office-mip-logging.md]`

---

## Scenario 21: Clearing the Cache
> 来源: ado-wiki-a-office-mip-logging.md | 适用: 未标注

### 排查步骤
Do not clear the cache for every issue. Only clear when:
1. Seeing inconsistent behavior across Office builds
2. Seeing inconsistent behavior between users
3. Using encryption for the first time and it fails or gives an error

To clear the cache:
1. Delete the contents of `%localappdata%\Microsoft\<APPNAME>\MIPSDK\mip` and `%localappdata%\Microsoft\Office\MIPSDK\`
2. Also delete the content of `%LocalAppData%\Microsoft\Office\CLP` folder.
3. Restart the app and retry

`[来源: ado-wiki-a-office-mip-logging.md]`

---

## Scenario 22: Reading Office MIP Logs
> 来源: ado-wiki-a-office-mip-logging.md | 适用: 未标注

### 排查步骤
These logs are ULS logs. They may be parsed by any text editor. However there is a ULS specific Microsoft tool.

`[来源: ado-wiki-a-office-mip-logging.md]`

---

## Scenario 23: Tools
> 来源: ado-wiki-a-office-mip-logging.md | 适用: 未标注

### 排查步骤
- Download the ULS Viewer from [here](https://www.microsoft.com/en-us/download/details.aspx?id=44020).

`[来源: ado-wiki-a-office-mip-logging.md]`

---

## Scenario 24: ULS Logs
> 来源: ado-wiki-a-office-mip-logging.md | 适用: 未标注

### 排查步骤
1. Using the ULS Viewer review each log generated during the logging session.
2. Most MIP items should contain a `MIPLOG` string. This may be used as a filter.

`[来源: ado-wiki-a-office-mip-logging.md]`

---

## Scenario 25: Required Information: MIP SDK
> 来源: ado-wiki-a-required-information-mip-sdk.md | 适用: 未标注

### 排查步骤
Collect the following information before escalating or working a MIP SDK case.

`[来源: ado-wiki-a-required-information-mip-sdk.md]`

---

## Scenario 26: Tenant Info
> 来源: ado-wiki-a-required-information-mip-sdk.md | 适用: 未标注

### 排查步骤
- Domain
- contextid
- account id (if available)
- Is this a GCC High customer?
- Is there a workaround available?
- How impactful is the broken function/API call?

`[来源: ado-wiki-a-required-information-mip-sdk.md]`

---

## Scenario 27: Customer Business Impact
> 来源: ado-wiki-a-required-information-mip-sdk.md | 适用: 未标注

### 排查步骤
- **Impact** (No. of Devices or AAD users affected):
- **UserId**:
- **Application id**:
- **OS Type**:
- **SDK version** (if applicable):
- **CorrelationID/TimeStamp** (if applicable):

`[来源: ado-wiki-a-required-information-mip-sdk.md]`

---

## Scenario 28: Issue Summary & Problem Description
> 来源: ado-wiki-a-required-information-mip-sdk.md | 适用: 未标注

### 排查步骤
- **Error Message(s)** (Screenshots/video — add the URL):
- **Expected Behavior**:
- **Observed Behavior**:
- Did this ever work as expected? If yes, when did it last work?

`[来源: ado-wiki-a-required-information-mip-sdk.md]`

---

## Scenario 29: Attachments & Logs
> 来源: ado-wiki-a-required-information-mip-sdk.md | 适用: 未标注

### 排查步骤
- **Attachment**:
- **Collected Logs**:
- **Test User**:
- Additional information/observation (if applicable):

`[来源: ado-wiki-a-required-information-mip-sdk.md]`

---

## Scenario 30: Escalation
> 来源: ado-wiki-a-required-information-mip-sdk.md | 适用: 未标注

### 排查步骤
Once all data is collected, escalate via this template: [Create Incident - IcM](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=C3jZ2v)

`[来源: ado-wiki-a-required-information-mip-sdk.md]`

---

## Scenario 31: Purpose
> 来源: onenote-mip-sdk-oauth2-testing.md | 适用: Mooncake ✅

### 排查步骤
Python script to test MIP SDK OAuth2 token generation and SyncFile API in 21Vianet (Mooncake) environment.

`[来源: onenote-mip-sdk-oauth2-testing.md]`

---

## Scenario 32: Key Endpoints (Mooncake)
> 来源: onenote-mip-sdk-oauth2-testing.md | 适用: 未标注

### 排查步骤
| Component | Endpoint |
|-----------|----------|
| Authority | `https://login.partner.microsoftonline.cn/{tenantId}` |
| Resource | `https://syncservice.o365syncservice.com/` |
| SyncFile API | `https://cn01b.dataservice.protection.partner.outlook.cn/PsorWebService/v1/SyncFile` |

`[来源: onenote-mip-sdk-oauth2-testing.md]`

---

## Scenario 33: Usage
> 来源: onenote-mip-sdk-oauth2-testing.md | 适用: 未标注

### 排查步骤
```bash
python test.py -a https://login.partner.microsoftonline.cn/{tenantId} -r https://syncservice.o365syncservice.com/ -c <client_appid>
```

`[来源: onenote-mip-sdk-oauth2-testing.md]`

---

## Scenario 34: Flow
> 来源: onenote-mip-sdk-oauth2-testing.md | 适用: 未标注

### 排查步骤
1. Uses MSAL `PublicClientApplication` with device code flow
2. Acquires token with scope `{resource}/.default`
3. Calls SyncFile API with bearer token
4. Parses XML response to list available labels/SIT types

`[来源: onenote-mip-sdk-oauth2-testing.md]`

---

## Scenario 35: Headers Required
> 来源: onenote-mip-sdk-oauth2-testing.md | 适用: 未标注

### 排查步骤
```
Authorization: Bearer {token}
Content-Type: application/xml;charset=utf-8
ClientInfo: mip_ver=1.8.102;os_name=win;os_ver=6-2-9200;runtime=msvc-1916;arch=x64
```

`[来源: onenote-mip-sdk-oauth2-testing.md]`

---

## Scenario 36: SyncFile Types
> 来源: onenote-mip-sdk-oauth2-testing.md | 适用: 未标注

### 排查步骤
- `TenantDlpSensitiveInformationType` - List tenant DLP sensitive info types
- Other types available per MIP SDK documentation

`[来源: onenote-mip-sdk-oauth2-testing.md]`

---
