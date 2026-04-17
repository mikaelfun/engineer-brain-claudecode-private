---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/OneAuth MSAL/MacOS/Learnings From ICMs - MacOS"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FOneAuth%20MSAL%2FMacOS%2FLearnings%20From%20ICMs%20-%20MacOS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MacOS OneAuth Log Collection Guide

When troubleshooting OneAuth/MSAL sign-in and authentication issues on macOS (especially Teams), ensure verbose OneAuth logs are captured.

## Enable Verbose Logging for Teams on MacOS

Follow the instructions in the UC wiki for configuring verbose OneAuth log capture:

- [Enable Verbose Logging for Teams on MacOS](https://dev.azure.com/Supportability/UC/_wiki/wikis/UC.wiki/643048/IcM-Requirements-Teams-Identity-and-Auth?anchor=macos---new-teams-(t2.1))

## When to collect logs

- Before reproducing the sign-in issue, enable verbose logging
- Reproduce the issue while logging is active
- Collect and attach the logs to the case for analysis
