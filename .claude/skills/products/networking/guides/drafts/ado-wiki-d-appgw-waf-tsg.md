---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/WAF for Application Gateway/Troubleshooting/Application Gateway WAF Troubleshooting Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FApplication%20Gateway%20WAF%20Troubleshooting%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Application Gateway WAF Troubleshooting Guide

## Training
Start with the 1-hour Cloud Academy training: [AppGW WAF Training Content](https://platform.qa.com/resource/appgw-specialist-module-05-web-application-firewall-waf-1854)

## How does WAF work?

Application Gateway WAF compares incoming requests against OWASP Core Rule Set (CRS) using regex patterns. WAF operates on an **anomaly scoring model**:

### Anomaly Scoring
- Each rule match increases the request's anomaly score by 2-5 points based on severity:
  - Notice: 2 (Missing User agent header, missing accept header, etc.)
  - Warning: 3 (malicious client rules)
  - Error: 4
  - Critical: 5
- When score reaches threshold (default 5), rule **949110** triggers and blocks the request
- Custom rules are evaluated BEFORE the entire managed ruleset

## Analyzing a request

**IMPORTANT: Have the customer confirm the request source is a legitimate user before creating exclusions.**

### 1. Components of a WAF log entry

View logs via ASC "WAF diagnostics" page or customer queries:

```kql
AGWFirewallLogs
| where Action contains "match" or Action contains "block"
```

```kql
AzureDiagnostics
| where ResourceProvider == "MICROSOFT.NETWORK" and Category == "ApplicationGatewayFirewallLog"
| where action_s contains "match" or action_s contains "block"
```

Key fields:
- **instanceId**: Which AppGW instance received the request
- **clientIp/clientPort**: Client identification for validation
- **requestUri**: Client's request URI
- **ruleSetType/Version**: CRS or DRS version (encourage CRS 3.2 or DRS)
- **ruleId**: Which rule matched
- **ruleGroup**: General function of triggered rule (e.g., SQL injection)
- **action**: Matched, Blocked, Allowed, or Logged
- **details.message**: Rule regex (note: escaped/encoded version, NOT the actual regex)
- **details.data**: Matched portion and location (cookies, headers, args)
- **details.file**: OWASP CRS rule file name
- **details.line**: Line number in the rule file
- **transactionId**: Correlate with reqresplogs
- **policyId**: WAF policy resource name (underscores instead of backslashes)
- **policyScope**: Global, Listener, or Pathmap level
- **engine**: "Azwaf" for 3.2/DRS, "modsec" for WAF 3.1

### 2. Exclusions

**What is an exclusion?**
Prevents a specified field from being evaluated by a specified rule, based on a value in that field's name.

- "values" and "names" match variables: exclude the VALUE of the field based on its NAME (they are the same, backwards compatibility)
- "keys" match variable: exclude the NAME of the field based on its NAME
- For REQUEST_x_NAMES: must use "keys"
- There is NO way to exclude VALUE based on its own contents

**How to create an exclusion:**
Key info needed: `ruleId`, `policyId`, and `data` fields from the log.

**Example 1 (ARGS):**
```
data: {":2900,"w found within [ARGS:worksheetPort:{"h":2900,"w":1912}],[ARGS:dashboardPort:...],[ARGS:storyPort:...]
```
- Match variable: "Request Arg Values"
- Operator: "Contains"
- Selector: "Port" (all three arg names contain "Port")

**Example 2 (COOKIES):**
```
data: etc/passwd found within [REQUEST_COOKIES:_cat:file:///etc/passwd]
```
- Match variable: "Request Cookie Names" or "Request Cookie Values" (same)
- Operator: "Equals"
- Selector: "_cat"

**Example 3 (COOKIE NAMES):**
```
data: if found within [REQUEST_COOKIES_NAMES:.AspNetCore.Antiforgery.xxx]
```
- Match variable: "Request Cookie Keys"
- Operator: "Equals"
- Selector: ".AspNetCore.Antiforgery.xxx"

### 3. Analyzing the match data (RCA)

1. Get rule regex from [OWASP CRS GitHub repo](https://github.com/coreruleset/coreruleset/tree/v3.2/master/rules)
2. Copy regex from AFTER `@rx ` to BEFORE final quote (NOT from logs — logs have escaped chars)
3. Use [Regex101](https://regex101.com/) to paste regex + test string to see what matched
4. **Alternatively: Use Copilot** to explain the regex and match in plain English

## WAF Body Size Limits

| Setting | Default | Description |
|---------|---------|-------------|
| Request Body Check | True | Whether request body is evaluated by WAF |
| Request Body Inspection Limit | 128 KB | Amount of body WAF evaluates |
| Request Body Enforcement | True | Whether max body size is enforced |
| Max Request Body Size | 128 KB | Maximum allowed request body |
| File Upload Enforcement | True | Whether max file upload is enforced |
| File Upload Limit | 100 MB | Maximum file upload size |

**Critical: Content-Type determines which limit applies.** For file uploads, Content-Type must be `image/jpeg` or `multipart/form-data` to trigger the file upload limit instead of body size limit.

All values configurable in OWASP 3.2+. Earlier versions require upgrade.

## Mandatory Rules

- Blocking rules: **949110**, **980130** (anomaly score threshold)
- File upload rules: **200002** (parse body failure), **200004** (multipart boundary), **0** (JSON error)

### Rule 200002
Content contains special chars in filename → mod_security blocks. Fix: correct Content-Type header.

### Rule 200004
Binary files (.docx/zip) contain lines starting with `---` resembling boundaries. Fix: disable rule 200004 (now customizable).

### Rule 0
Content-length is 0 or JSON parsing error. Fix: validate JSON with JSONLint.

## Common Misconceptions

WAF in Prevention mode does NOT block all matched requests. Rules with **Notice severity** (e.g., 920320 Missing User Agent Header) only log, not block — they only add 2 points to anomaly score. The "Blocked" action in logs for these rules is misleading; the actual behavior is "pass" due to severity level.
