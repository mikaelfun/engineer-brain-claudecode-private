---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/WAF for Application Gateway/TS WAF RULE"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTS%20WAF%20RULE"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting WAF Rule with Regular Expression Tool

## Introduction

This guide walks through troubleshooting a WAF rule block by using a regex enumeration tool to identify the **atomic pattern** that matched the customer's string.

**Key Concepts:**
- **Atomic pattern**: One specific regex pattern that cannot be divided further. In `(?:A|B|C)`, A, B, and C are each atomic patterns.
- **Challenge**: Complex regex with nested `|` (OR logic) is hard to read directly. The tool peels the expression layer by layer and enumerates all combinations.

## Prerequisites

- Python 3.9+ (tested with 3.11/3.12)

## Steps

### 1. Identify the WAF Rule

1. Go to WAF logs (Geneva portal or diagnostic logs) and find the blocked request and Rule ID.
2. Find the rule's regular expression on GitHub CoreRuleSet:
   - https://github.com/coreruleset/coreruleset/blob/v3.2/dev/rules/

Example for rule 942200:
```
SecRule REQUEST_COOKIES|... "@rx (?i:(?:(?:(?:(?:trunc|cre|upd)at|renam)e|(?:inser|selec)t|de(?:lete|sc)|alter|load)\s*?\(\s*?space\s*?\(|,.*?[)\da-f\"'`][\"'`](?:[\"'`].*?[\"'`]|[^\"'`]+|\Z)|\Wselect.+\W*?from))"
```

### 2. Tool Structure

```
enumerate_all_combination.py   # Main program
test_string.txt                # Place the regex here
my_reg_function.py             # Helper functions
squre_identify.py              # Helper functions
```

### 3. How to Use

**Step 1**: Copy the regular expression (without the `@rx` prefix and outer quotes) into `test_string.txt`.
> ⚠️ No `\n` or `\r\n` at end of file.

**Step 2**: Run from PowerShell:
```powershell
python .\enumerate_all_combination.py 1 0
```
- First parameter: layer depth to analyze (start with 1)
- Second parameter: index of the "OR" combination to expand (start with 0)

**Step 3**: The tool outputs all "OR logic" atomic combinations at that layer. Copy each combination to https://regex101.com/ to test if it matches the customer's string.

**Step 4**: Recursively drill down into matching branches until you find the specific atomic pattern.

> ⚠️ **Tool v1 limitation**: Cannot recursively check the regex automatically. User must copy combinations manually to regex101.com for matching. A v2 to automate this is planned.

## Common WAF Rules to Investigate

| Rule ID | Description |
|---------|-------------|
| 942200 | MySQL comment/space-obfuscated injection + backtick termination |
| 949110 | Inbound anomaly score exceeded |
| 980130 | Outbound anomaly score exceeded |

## Tips

- When the customer has a false positive, identify the exact atomic pattern, then create a WAF exclusion rule targeting that specific pattern or argument.
- Use Geneva portal link format: https://portal.microsoftgeneva.com/s/E25333A3 to find WAF firewall logs.
