---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Credential Guard Troubleshooting/Generic | New Scenario"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FCredential%20Guard%20Troubleshooting%2FGeneric%20%7C%20New%20Scenario"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Credential Guard Troubleshooting - Generic / New Scenario

This guide provides steps for troubleshooting issues related to Credential Guard when the scenario does not match known specific issues.

---

## Support Topic

If you have a different type of issue to the ones described in specialized pages, follow the default steps below:

### Scope it
- Determine when the problem occurs.
- Check if the problem persists when Credential Guard runs in Debug/training Mode.
  - For more information on this mode, see [Putting Credential Guard in debug mode](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/417890/Debug-Mode-for-LsaIso-Enable-Disable-CredGuard).

### Get some data
- The basic set of data should include:
  - SDP (System Diagnostic Package) from the machine.
  - Collect logs using the CSS Authentication Scripts (Authscripts) [HERE](http://aka.ms/authscripts).
  - If the issue occurs in Debug Mode and it is a crash, collect a dump of LsaIso.

### Involve your escalation team ASAP
- Provide the SR# (Service Request number) and a description of the problem symptoms.
- Specify the data location.

---

By following these steps, you can effectively troubleshoot and escalate issues related to Credential Guard.
