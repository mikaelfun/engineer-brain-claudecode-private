---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Credential Guard Troubleshooting/HIGH CPU with CG ON/Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FCredential%20Guard%20Troubleshooting%2FHIGH%20CPU%20with%20CG%20ON%2FData%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Credential Guard - High CPU Data Collection

This document provides detailed steps for collecting ETL traces and process dumps for troubleshooting high CPU issues related to the LsaIso process, particularly in Debug Mode.

> **Note:** These cases are extremely difficult due to the inability to debug the LsaIso process in normal mode.

---

## Data Collection (When Issue is Reproducible in Debug Mode)

1. Collect ETL (Event Trace Log) traces using the scripts provided in the internal Tracing.zip package.

2. Start an Xperf trace using the following command:
   ```
   xperf -on PROC_THREAD+LOADER+PROFILE+INTERRUPT+DPC -stackwalk Profile -BufferSize 1024 -MinBuffers 526 -MaxBuffers 1024 -MaxFile 1024 -FileMode Circular
   ```

3. **Collect 2-3 process dumps of the LsaIso process** a few minutes apart (or whichever process is spiking, usually LsaIso).
   - Ensure dumps are more than 0 bytes.
   - **Note:** If the dump is 0 bytes, you have not enabled Debug Mode properly. Check your steps!

4. Stop the Xperf trace:
   ```
   xperf -stop -d Highcpu.etl
   ```

## Data Collection (When Issue is NOT Reproducible in Debug Mode)

- When LsaIso is in normal mode, it cannot be dumped or debugged.
  - Most importantly, check if you can reproduce the problem in-house.
- An Xperf trace can be collected but will not show any stacks in LsaIso. If a different process is spiking, it would be useful.
- **Contact Escalation team ASAP.**
