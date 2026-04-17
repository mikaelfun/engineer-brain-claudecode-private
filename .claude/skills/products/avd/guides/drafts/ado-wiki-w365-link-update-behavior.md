---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Link/Components/NXT OS/Update Behavior"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Link/Components/NXT%20OS/Update%20Behavior"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## TL;DR

* Link devices update via the same Windows Update services as Windows 11. When powered on, they periodically check, silently download updates, and install at the next reboot or at 3:00 AM (local time) when the device isn't in use. Driver/firmware updates are applied at reboot and, when possible, combined with OS updates into one reboot.
* Customer-configured Intune policies (update rings, deadlines, grace period, active hours, autoreboot-beforedeadline) govern restart timing and can override defaults, which is why reboots can occur during the day when a deadline is reached.

---

## How updates work on Link

1. **Detection & Download** - Devices periodically check Windows Update. If powered on, they silently download available updates.
2. **Install window** - Installation occurs on next reboot or at 3:00 AM (scheduled maintenance) if the device is powered on but isn't in use. If driver/firmware and OS updates arrive together, Link attempts to consolidate into a single reboot.
3. **Restarts are policy-driven** - Actual reboot timing follows Intune update policy (deadlines, grace period, active hours, and the Auto reboot before deadline switch). When a deadline passes, a forced reboot can occur even during the day if policies allow it.
4. **Manual update** - Users may manually check and install latest updates from the logon screen.

---

## Defaults vs. customer policy

Link devices have a default 3:00 AM maintenance behavior that checks and installs updates if the device is running but it is not in use. However, customers can configure their own update ring policies (deadlines, grace period, active hours). Devices follow the configured policy, not the illustrative defaults.

Key Intune controls affecting restarts:
* **Use deadline settings** — Set deadline (days) for quality/feature updates and a grace period. When the deadline expires, restart becomes mandatory.
* **Auto reboot before deadline** — If Yes, a device that is outside active hours may auto-restart before the deadline once install is complete; if No, it will wait until deadline + grace before forcing a restart.
* **Active hours** — Windows doesn't auto-restart during these hours; set appropriately for the customer's workday.

**NOTE:** Starting with 25'9B the defaults very likely would have been:
- Feature Update Deadline: 2 days
- Feature Update Grace: 5 days
- Quality Update Deadline: 2 days
- Quality Update Grace: 5 days

The net result is a max 7 days before a device is forced to reboot to apply an update. These settings can all be overridden by their own Intune Policies.

---

## 3:00 AM scheduled check — what it does (and doesn't)

* **What it does**: A scheduled task checks for updates around 3:00 AM (local time) and installs during that maintenance window only if conditions/policy permit (device on, not in use, not blocked by active hours).
* **What it doesn't do by itself**: It doesn't force a reboot unless a deadline has passed or policy explicitly allows a pre-deadline restart. Device must be powered on at that time for the check to occur.

---

## Diagnostics — verify which policies actually applied

When customers see unexpected reboot timing, confirm effective policy on the device.

### Option A — Collect Intune Diagnostic Logs
* Collect Intune diagnostic logs for the Link device and analyze which Windows Update Policies are coming down to the Link device.

### Option B — Cross-check Intune
* In the Intune admin center, review the Update rings assigned to the Link device/device group and verify Use deadline settings, Grace period, Active hours, and Auto reboot before deadline. Differences from expected defaults commonly explain daytime restarts.

---

## Troubleshooting workflow

1. Confirm device power/maintenance window. Was the device on at 3:00 AM (local time)? If not, the maintenance check didn't run.
2. Collect Intune Diagnostic logs and note Update CSP values (deadline, grace, active hours, AllowAutoUpdate). Create Collab with Intune team if needed.
3. Compare with Intune policy actually targeted to the device (ring priority, scope tags, device filters). Customer policy overrides defaults.
4. Look for daytime reboots near a passed deadline or when Auto reboot before deadline = Yes and the device was outside active hours.
5. Document outcome and align settings: adjust deadlines, grace period, and active hours to match the business window; avoid surprises.

---

## FAQ

**Q1. Why did my Link device reboot in the middle of the workday?**
A deadline likely expired (and grace period ended), or Auto reboot before deadline allowed an out-of-hours restart earlier than expected; both are customer policy choices.

**Q2. Does the device always install updates at exactly 3:00 AM (local time)?**
It checks around 3:00 AM (local time) and installs when policy allows. Reboot happens at next reboot or when policy requires it (deadline), not simply because it is 3:00 AM. Device must be powered on.

**Q3. How does the system determine "when the device isn't in use"?**
The task that runs at 3:00 AM (local time) checks if there is an active connection to a Cloud PC.

---

## What to capture from customers (for escalations)

* Intune Diagnostic Logs from the Link device and (if relevant) the Cloud PC.
* Screenshots or export of the Intune Update Ring assigned to the device (deadline, grace, active hours, auto reboot before deadline).
* Exact local time and timezone when the reboot occurred, and whether the device was on at 3:00 AM (local time).

---

## References

* [Windows 365 Link — Update behavior & control](https://learn.microsoft.com/en-us/windows-365/link/update-behavior-control)
* [Manage device restarts after updates](https://learn.microsoft.com/en-us/windows/deployment/update/waas-restart)
* [Manage Windows 365 Link devices with Intune](https://learn.microsoft.com/en-us/windows-365/link/device-management-overview)
* [Collect diagnostics from an Intune managed device](https://learn.microsoft.com/en-us/intune/intune-service/remote-actions/collect-diagnostics)
