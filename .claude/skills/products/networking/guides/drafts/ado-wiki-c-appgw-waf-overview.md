---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/WAF for Application Gateway/Web Application Firewall (AppGW - WAF)"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FWeb%20Application%20Firewall%20(AppGW%20-%20WAF)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Gateway WAF

[[_TOC_]]

# Feature Overview
----

Web application firewalls help secure your web applications by inspecting inbound web traffic to block SQL injections, Cross-Site Scripting, malware uploads & application DDoS and other attacks. It also inspects the responses from the back-end web servers for Data Loss Prevention (DLP). Combined with the isolation and additional scaling provided by App Service Environments, this provides an ideal environment to host business critical web applications that need to withstand malicious requests and high volume traffic.  


**What is ModSecurity?**

ModSec is an Open-source Web Application Firewall (WAF) developed by Trustwave's SpiderLabs and it was originally designed for Apache Web Server for HTTP request and response filtering capabilities and later extended to other platforms such as Microsoft IIS and NGINX. Even though it is an open source technology, its reliability and availability has made it one of the most popular WAF service available, which also made us use it for our Application Gateway.

ModSec uses OWASP (Open Web Application Security Project) Core Rule Set (CRS), a set of rules written in ModSecs SecRules language for protection against various security threats such as HTML injection, SQL injection, Cross Side Scripting (XSS) and other know attacks. Several other rule sets are also available, but for the AppGw, we use CRS 2.2.9 and CRS 3.0.

To detect threats, the ModSecurity engine is deployed embedded within the webserver or as a proxy server in front of a web application. This allows the engine to scan incoming and outgoing HTTP communications to the endpoint. Dependent on the rule configuration the engine will decide how communications should be handled which includes the capability to pass, drop, redirect, return a given status code, execute a user script, and more. ModSec also boasts of a wide variety of features such as HTTP traffic logging, auditing, uploads memory limits, security monitoring and filtering, URL encoding validation, etc. which we can leverage.


# Case Handling
----
The Azure Networking POD (ANP) supports AppGw WAF.

## Teams
----
Use the Teams Channel:
- [App Gateway](https://teams.microsoft.com/l/channel/19%3a47d113be696e4d9a8246eacc76497bbb%40thread.skype/App%2520Gateway?groupId=c3e00ac7-3f76-4350-ba3b-e335a6bbbe21&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

And use these AVA commands:
- ava involve beta
- ava involve pg


# How It Works / Architecture
----

## Architecture Overview
----

WAF uses a Windows Server which already has IIS installed. It has Visual C++ Redistributable 2013 installed for both x64 and x86 packages, as it requires both along with the other dependencies.

ModSec for IIS (<https://modsecurity.org/download.html>)

By default, ModSec is enabled for all of the Websites configured in IIS, if you want to remove the Module for any site, you can use the following in the web.config code.

*\<modules\>*

*\<remove name="ModSecurityIIS" /\>*

*\</modules\>*

ModSec logs its detected and denied requests in the Application Logs on Windows (from where it is being sent to the internal storage account and to the customer storage account when diagnostics is enabled on AppGw).

## Architecture Flow

NRP --> RNM --> BrkGWM --> GWT (Windows/IIS/ARR + ModSecurity rule set)


# Known Issues and Limitations
----

1.  Azure Traffic Manager status is degraded when AppGtw WAF is in prevention mode. Traffic manager probes are missing the Accept Header, and this traffic is dropped in Prevention Mode.
2.  Web sockets (HTTP packets missing the **accept** or **user agent** headers will be blocked in Prevention Mode)
3.  HTTP methods other than GET, HEAD and POST are blocked in Prevention Mode.
4.  Application Gateway does not support redirects (not specifically related to WAF but to AppGtw)

5. **WAF exclusions limit changed (40 new / 100 old)**:
   - WAF policy exclusions limit: 40
   - AppGW exclusions limit: 40 (sum of all exclusions on all attached policies)
   - Old limit was 100. Newer AppGW NRP validation will fail if over 40 exclusions.
   - Error: `The number of Exclusions exceeds the maximum allowed value. The number of Exclusions is '41' and the maximum allowed is '40'`

**Performance considerations and hard limits:**

- Every request must be buffered by AppGW until fully arrived before WAF rule check — causes latency for large uploads (30MB+)
- **Default file upload limit:** ~100MB (SecRequestBodyLimit 104857600)
- **Default max. request size (No files):** ~128KB (SecRequestBodyNoFilesLimit 131072)
- **Default request body buffer (in memory) limit:** ~128KB (SecRequestBodyInMemoryLimit 131072)


# Troubleshooting and Tools
----

## Log Sources
----

### Jarvis > Logs — HowTo: View AppGateway WAF Firewall Operational Logging
----

MDM Query: ApplicationGatewayFirewallLog
- Endpoint: Diagnostics PROD
- Namespace: AppGWT
- Events: ApplicationGatewayFirewallLog
- Scoping: Tenant == \<deployment ID of AppGw\>
- Filtering: resourceId contains \<SubscriptionID\>

### How to Track Down Specific Rules

AppGw WAF supports OWASP Core Rule Sets v2.2.9 and v3.0.
- [OWASP CRS v2.2.9](https://github.com/SpiderLabs/owasp-modsecurity-crs/tree/v2.2/master/base_rules)
- [OWASP CRS v3.0](https://github.com/SpiderLabs/owasp-modsecurity-crs/tree/v3.0/master/rules)

To find a rule: locate the `.conf` file referenced in the FirewallLog entry, find the specific line number.

## Troubleshooting Scenarios
----

### Customer Traffic Getting Detected or Prevented — 403 Forbidden
----

1.  Client receives: **403 - Forbidden: Access is denied.**
    1.  Usually WAF blocking based on a specific rule set
    2.  Use MDM query to find what caused the block — filter by client public IP address
    3.  Review the `action` and `message` fields in the log entry

### Mandatory Rules (949110, 980130) — Cannot Be Disabled
----

Anomaly scoring rules:
- **949110**: Inbound Anomaly Score Exceeded (sum ≥ 5)
- **980130**: Inbound Anomaly Score Exceeded (outbound)

Severity → Anomaly Score mapping:
- Critical (2): Score +5
- Error (3): Score +4
- Warning (4): Score +3
- Notice (5): Score +2

**Solution**: Don't try to disable 949110/980130 — they can't be disabled. Instead, identify and disable the **contributing rules** that are accumulating score. Check `ApplicationGatewayFirewallLog` for all rule hits, then disable those contributing rules (e.g., if rule 913100 = Critical → contributes 5 → triggers 949110 alone → disable 913100).

### Rule 200002 — Failed to Parse Request Body
----

```json
{
  "ruleId": "200002",
  "message": "Mandatory rule. Cannot be disabled. Failed to parse request body.",
  "action": "Blocked",
  "details": { "message": "Access denied with code 400 (phase 2). Match of \"eq 0\" against \"REQBODY_ERROR\" required.", "data": "JSON parsing error: lexical error: invalid char in json text." }
}
```

**Cause**: mod_security blocking potentially malicious upload — content contains special character (single/double quote in filename), or Content-Type mismatch.

**Solution**: Fix the `Content-Type` header to match actual content (e.g., use `image/jpeg` instead of `application/json` when uploading binary).

### Rule 0 — WAF Cannot Parse Request
----

```json
{ "ruleId": "0", "message": "", "action": "Blocked", "details": { "message": "JSON parsing error: lexical error: invalid char in json text." } }
```

**Cause**: WAF cannot parse request — content length is 0 or invalid character in JSON.

**Solution**: Validate the JSON payload against [JSONLint](https://jsonlint.com/).

### Rule 200004 — Possible Multipart Unmatched Boundary
----

Triggered when a line in form/multipart input starts with `--` but wasn't a real boundary (e.g., binary file like docx containing lines starting with `---`).

**Solution** (as of 7/6/2018): Rule 200004 can be disabled. Customer can disable it via portal or change application to avoid lines starting with `---`.

### Common Misconception: Blocked Action in Prevention Mode with Notice Severity
----

Some rules (e.g., rule 920320 "Missing User Agent Header", rule 920330 "Empty User Agent Header") have `severity: NOTICE` which corresponds to anomaly score +2. In Prevention Mode (threshold = 5), a Notice-severity rule alone will NOT block traffic — it only logs. The request appears as "Blocked" in logs but is actually allowed.

Reference: https://github.com/SpiderLabs/owasp-modsecurity-crs/issues/620

## PowerShell — Test Protocol Anomalies
----

```powershell
# Test1: Missing UserAgent
$useragent = " "
Invoke-WebRequest -Uri "http://<AppGW-VIP>/" -Method Default -UseDefaultCredentials -Headers $headers -UserAgent $useragent

# Test2: SQL injection in body
$body = "drop table; insert into table test"
Invoke-WebRequest -Uri "http://<AppGW-VIP>/" -Method post -Body $body -UseDefaultCredentials -Headers $headers

# Test3: Numeric IP in host header (rule OWASP_960017)
Invoke-RestMethod -Method Get -Uri "http://<AppGW-IP>/"

# Test4: XSS in body
$body = "<script>var test</script>"
Invoke-WebRequest -Uri "http://<AppGW-VIP>/" -Method post -Body $body -UseDefaultCredentials -Headers $headers
```

# Public Documentation
----

- Overview: https://azure.microsoft.com/en-us/documentation/articles/application-gateway-webapplicationfirewall-overview/
- Create via Portal: https://azure.microsoft.com/en-us/documentation/articles/application-gateway-web-application-firewall-portal/
- Create via PowerShell: https://docs.microsoft.com/en-us/azure/application-gateway/application-gateway-web-application-firewall-powershell
- Create via CLI: https://docs.microsoft.com/en-us/azure/application-gateway/application-gateway-web-application-firewall-cli
