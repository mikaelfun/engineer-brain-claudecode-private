# Purview 扫描连接与凭据问题 — 排查工作流

**来源草稿**: `ado-wiki-configure-azure-sql-db-sql-auth.md`, `ado-wiki-salesforce-test-connection-failure.md`
**Kusto 引用**: 无
**场景数**: 6
**生成日期**: 2026-04-07

---

## Scenario 1: Data Collection
> 来源: ado-wiki-salesforce-test-connection-failure.md | 适用: 未标注

### 排查步骤
1. **HAR File** - Collect a HAR file from the browser to capture the correlation ID.
2. **Correlation ID** - Use the correlation ID from the HAR file to query logs.

`[来源: ado-wiki-salesforce-test-connection-failure.md]`

---

## Scenario 2: Log Analysis
> 来源: ado-wiki-salesforce-test-connection-failure.md | 适用: 未标注

### 排查步骤
**If using Azure IR:**

```kql
ScanningLog
| where CorrelationId == "<Correlation_ID>"

QueryPackageActivityEvent  // need to run on local cluster
| where CorrelationId == "<Correlation_ID>"
```

**If using Self-Hosted IR (SHIR):**

Ensure you have the SHIR Report ID, then run:

```kql
ScanningLog
| where CorrelationId == "<Correlation_ID>"

cluster('azuredmprod.kusto.windows.net').database('AzureDataMovement').TraceGatewayLocalEventLog
| where UserReportId == "UserReportid"
```

`[来源: ado-wiki-salesforce-test-connection-failure.md]`

---

## Scenario 3: Sample Log Output
> 来源: ado-wiki-salesforce-test-connection-failure.md | 适用: 未标注

### 排查步骤
```
[Miti] ThreadID: main; TimeStamp: 10/22/2025 16:39:47; Code: BLIB_D0029; Type: DEBUG; Message: Connecting to: https://company.my.salesforce.com//services/oauth2/token;
[Miti] ThreadID: main; TimeStamp: 10/22/2025 16:39:48; Code: BLIB_D0029; Type: DEBUG; Message: Error : '{"error":"invalid_grant","error_description":"authentication failure"}';
[Miti] ThreadID: main; TimeStamp: 10/22/2025 16:39:48; Code: MBC_SLFS_S0180; Type: ERROR; Message: Server returns ResponseCode:'400';
```

From these logs, identify:
- The endpoint URL being used
- The error details (e.g., `invalid_grant`)

`[来源: ado-wiki-salesforce-test-connection-failure.md]`

---

## Scenario 4: Verification Checklist
> 来源: ado-wiki-salesforce-test-connection-failure.md | 适用: 未标注

### 排查步骤
1. **Registration URL** - Enter the Salesforce sign-in endpoint URL as Domain URL:
   - `https://login.salesforce.com` (standard)
   - Company instance URL: `https://na30.salesforce.com`
   - My Domain URL: `https://myCompanyName.my.salesforce.com/`
   - Sandbox URL: `https://myCompanyName.sandbox.my.salesforce.com/`

2. **Password & Security Token**:
   - If IR machine IP is trusted: use password only
   - If IP is untrusted: concatenate password + security token
   - Example: password=`123`, token=`456` -> store as `123456` in Key Vault

3. **User Login History** - Verify user's login attempts and failures in Salesforce

`[来源: ado-wiki-salesforce-test-connection-failure.md]`

---

## Scenario 5: Token Generation Test via API Client
> 来源: ado-wiki-salesforce-test-connection-failure.md | 适用: 未标注

### 排查步骤
Using **Username-Password Flow** (same as Purview):

> The OAuth 2.0 Username-Password Flow is disabled by default in external client apps. To use this flow, turn on **Allow OAuth Username-Password Flows** in the external client app settings.

**Required parameters:**

| Parameter | Description |
|-----------|-------------|
| `grant_type` | Must be `password` |
| `client_id` | Consumer key of the connected app |
| `client_secret` | Consumer secret of the connected app |
| `username` | Username of the user |
| `password` | Password (+ security token if untrusted network) |

**Sample Request:**
- Method: `POST`
- URL: `https://login.salesforce.com/services/oauth2/token`

**Expected Successful Response:**

```json
{
  "access_token": "00DJ0000003Q47b!AR0AQGo...",
  "instance_url": "https://testcs10.my.salesforce.com",
  "id": "https://test.salesforce.com/id/...",
  "token_type": "Bearer",
  "issued_at": "1763547998196",
  "signature": "FQJrLHQ/LI2sQvCoJakB3wdGwFD..."
}
```

`[来源: ado-wiki-salesforce-test-connection-failure.md]`

---

## Scenario 6: Decision Points
> 来源: ado-wiki-salesforce-test-connection-failure.md | 适用: 未标注

### 排查步骤
- **If API test fails** -> Issue is on Salesforce side. Verify config and login history, ask customer to verify from Salesforce end.
- **If API test succeeds but Purview still fails** -> Verify login history on Salesforce shows successful, then raise an AVA after verifying all steps above and collecting all needed info.

> **Note**: Sometimes the error displayed in Purview UI test connection is misleading (e.g., "Configuration file Conf/ModelbridgeList.xml is invalid"). Always check actual logs to verify the exact error.

`[来源: ado-wiki-salesforce-test-connection-failure.md]`

---
