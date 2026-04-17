---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Client Applications/Windows App/Unified Mobius Clients/Android"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Client%20Applications/Windows%20App/Unified%20Mobius%20Clients/Android"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Windows App Android Client - Connection Flow & Troubleshooting

## Connection Flow

The Android client follows a specific connection flow (refer to WindowsAppAndroid threat model and design spec for architecture diagrams).

## Troubleshooting - Verbose UI Logging

To collect verbose logs from the Android client:

1. Enable verbose logging by navigating to **Help > Troubleshooting > Logging..** from the menu bar
2. Select **"Verbose"** under "UI log level"
3. Click **"Start logging"**
4. **Reproduce the issue**
5. Collect the log file from the location defined in the logging window

### Logging Flow

The logging flow follows the WindowsAppAndroid Design Spec architecture.

### Log Uploading with PowerLift

Debug build supported first - PowerLift log uploading is TBD.

## References

- WindowsAppAndroid threat model: Internal SharePoint document
- WindowsAppAndroid Design Spec: Internal SharePoint document
