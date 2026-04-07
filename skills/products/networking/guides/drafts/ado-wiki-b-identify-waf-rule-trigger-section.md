---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/How to identify the section that triggered the WAF rule from the request"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20identify%20the%20section%20that%20triggered%20the%20WAF%20rule%20from%20the%20request"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to identify the section that triggered the WAF rule from the request

[[_TOC_]]

## Description

Instructions to detect the section of the HTTP request that triggered the WAF rule based on logs or a .har file. Use this to identify WAF false positives and determine appropriate exclusions or custom rules.

## Scenario / Issue Definition

Customer is asking for help with WAF blocking request — they have identified it as a false positive and need to create an exclusion.

## Cause

Azure Application Gateway uses OWASP as the rule set for the WAF rule engine. Some rules may match expected/legitimate traffic if dangerous patterns are detected.

## Resolution Steps

### Step 1: Read the WAF log entry

From the WAF log, identify:
- `ruleId` — the triggering OWASP rule
- `ruleSetVersion` — e.g., "3.2"
- `details.data` — contains "Matched Data: ... found within REQUEST_COOKIES:..." (URL encoded)

Example log:
```json
{"ruleId":"942200","ruleSetVersion":"3.2","message":"Detects MySQL comment-/space-obfuscated injections","action":"Matched","details":{"message":"Pattern match ... at REQUEST_COOKIES","data":"Matched Data: ,\"experienceCenter\":{\"id\":1, found within REQUEST_COOKIES:InfoModule: %7B%22module%22..."}}
```

Log source: https://portal.microsoftgeneva.com/s/FFACFDBB

### Step 2: URL-decode the matched data

Use https://www.urldecoder.org/ to decode the `data` field value.

Example:
- Encoded: `InfoModule: %7B%22module%22%3A1%2C%22experienceCenter%22...`
- Decoded: `InfoModule:{"module":1,"experienceCenter":{"id":1,"name":"CE PRUEBA","modules":5}}`

### Step 3: Get the OWASP rule regex

Browse the OWASP CRS repository: https://github.com/coreruleset/coreruleset/tree/v3.2/master/rules

Find the rule file (e.g., `REQUEST-942-APPLICATION-ATTACK-SQLI.conf`) and locate the rule by ID. Extract the regex after `@rx `.

### Step 4: Test with Regex101

Paste the extracted regex into Regex101 (https://regex101.com/) and test against the decoded matched data to identify which portion triggered the rule.

### Step 5: Create exclusion or custom rule

Once the triggering section is identified, configure a WAF exclusion or custom rule to allow the legitimate traffic.

## Troubleshooting: Matched Data Does Not Trigger with OWASP Regex

- **Verify rule ID and version**: Ensure you're using the correct ruleset version (e.g., OWASP 3.2 vs 3.1).
- **Check for other criteria**: Some rules use chained conditions or additional operators beyond regex (see ModSecurity operators: https://github.com/SpiderLabs/ModSecurity/wiki/Reference-Manual-(v2.x)-Operators#table-of-contents).
- **Check log format**: Ensure no extra escape sequences are altering the matched data.
- **Test the encoding**: Verify the encoding matches the regex expectation.
- **Escalate to Technical Advisors** if unresolved; provide full log entries and configuration details.

## Contributors

Ivan Acuña
