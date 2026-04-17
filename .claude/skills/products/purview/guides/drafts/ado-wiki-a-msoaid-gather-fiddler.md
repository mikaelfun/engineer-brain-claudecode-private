---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Sensitivity Labels/How to: Sensitivity Labels/How To: Use MSOAID to gather a Fiddler"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FSensitivity%20Labels%2FHow%20to%3A%20Sensitivity%20Labels%2FHow%20To%3A%20Use%20MSOAID%20to%20gather%20a%20Fiddler"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How To: Use MSOAID to gather a Fiddler

## Introduction

Microsoft provides the [Microsoft Office Authentication/Identity Diagnostic (MSOAID)](https://learn.microsoft.com/en-us/microsoft-365/troubleshoot/diagnostic-logs/use-msoaid-for-authentication-issues). This tool gathers a Fiddler trace and PSR without the customer needing to install/configure Fiddler separately.

## Using MSOAID

### Download and Extract
1. [Download MSOAID](https://aka.ms/msoaid).
2. Extract the contents to some location.

### Gather Data

In most cases use the defaults for this tool.

1. Go to the extracted MSOAID content location.
2. Right-click `MSOAID-Win.exe` and _Run as administrator_.
3. In the first dialog choose `Next`.
4. The next dialog has all the options selected. Keep all checked. Note the second option is Fiddler with HTTPS decryption.
5. Note the output path results (and change, if desired).
6. The Fiddler certificate installation prompt will appear. Choose 'Yes'.
7. Once all the MSOAID diagnostics are enabled, the dialog with the `Finish` button appears. **NOTE**: There will be prompts opening/closing and the PSR app opens.
8. Reproduce the issue. When done, press `Finish`. The Fiddler certification deletion prompt appears. Choose `Yes`.
9. The final dialog provides the path to the gathered data.
