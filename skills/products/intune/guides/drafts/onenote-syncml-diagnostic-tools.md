# SyncML & MDM Diagnostic Tools

## SyncML Viewer

Real-time viewer for SyncML commands between Intune and Windows devices.

### Downloads
- Internal: `\\shmsd\SHMSD\Readiness\Products\Azure\Intune\Tools\SyncmlViewer`
- Public (latest): [SyncMLViewer on GitHub](https://github.com/okieselbach/SyncMLViewer)

### Capabilities
- Verify if settings/policies from Intune have been received
- See which CSPs are called when a policy is configured
- View CSP command internals (Get/Add/Delete/Replace)
- Send CSP commands manually to reproduce issues

### Usage
1. Deploy a new policy from Intune
2. Capture SyncML sessions in the **SyncML Messages** tab
3. View Source/Target in each message
4. Example: Msg 3 = Intune sends Get for Firewall status → Msg 4 = Device returns status 200, value 0
5. Save captured sessions for sharing/future research
6. Manual CSP commands: input/output in `dmtools/input.syncml` and `dmtools/out.xml`

### References
- [IntuneWiki SyncML Viewer](https://www.intunewiki.com/wiki/Windows_SyncML_Viewer)
- [Oliver Kieselbach - MDM monitoring](https://oliverkieselbach.com/2019/10/11/windows-10-mdm-client-activity-monitoring-with-syncml-viewer/)

## SyncML Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | ITEM_ADDED |
| 202 | FOR_PROCESSING |
| 204 | NO_CONTENT |
| 205 | RESET_CONTENT |
| 212 | AUTHENTICATION_ACCEPTED |
| 400 | BAD_REQUEST |
| 401 | INVALID_CREDENTIALS |
| 403 | FORBIDDEN |
| 404 | NOT_FOUND |
| 405 | COMMAND_NOT_ALLOWED |
| 406 | OPTIONAL_FEATURE_NOT_SUPPORTED |
| 409 | CONFLICT |
| 415 | UNSUPPORTED_MEDIA_TYPE_OR_FORMAT |
| 418 | ALREADY_EXISTS |
| 500 | COMMAND_FAILED |
| 503 | SERVICE_UNAVAILABLE |
| 507 | ATOMIC_FAILED |
| 508 | REFRESH_REQUIRED |
| 516 | ATOMIC_ROLLBACK_FAILED |

Full list: 101-517 range covers progress, success, redirects, client errors, and server errors.

## WMI Tester (wbemtest) for MDM CSPs

Query MDM CSPs locally using Windows Management Instrumentation:

1. Run `wbemtest` with admin permissions
2. Connect to namespace: `root\cimv2\mdm\dmmap`
3. Choose **Enum Classes** (Recursive)
4. Find WMI class for the policy (e.g., `MDM_Policy_Config01_DeviceLock02`)

Reference: [How to use PowerShell to run any MDM CSP locally](https://deviceadvice.io/2019/04/26/powershell-run-mdm-csps-locally/)

---
*Source: OneNote — SyncML, SyncML response status code, Troubleshoot SyncML, Windows Management Instrumentation Tester*
