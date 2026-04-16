# [Intune MAM] iOS App Protection Policy — Data Protection Settings User Experience

**Source:** Mooncake POD Support Notebook / Intune / App Protection_Configuration TSG / MAM behavior - User Experience  
**Type:** Reference Guide  
**ID:** intune-onenote-037  
**Product:** Intune (MAM)  
**Date:** 2026-04-04

---

## Overview

iOS MAM app protection policy enforces data protection **only in Work context** (when a user accesses corporate data). Personal use of the same managed app (e.g., personal Outlook account) is **not** affected. Understanding expected behavior per setting is critical to distinguishing normal MAM enforcement from genuine bugs.

---

## Data Protection Settings

### 1. Backup Org Data to iTunes / iCloud

| State | Behavior |
|-------|----------|
| Enabled | Corporate data is stored in a separate work-labeled storage. **Corporate data cannot be backed up to iTunes** even when backup is "enabled" — only personal data is backed up. |

> ℹ️ In iTunes, you'll see personal files but **not** corporate work files.

---

### 2. Send Org Data to Other Apps

| Option | Behavior |
|--------|----------|
| **Policy managed apps** | Fewer share targets listed for corporate files. Sharing corporate file to a non-managed app (e.g., Apple Notes) — the file appears but **corporate content cannot be opened**. Non-corporate files retain more share options. |
| **Policy managed apps with OS sharing** | Allows sharing via OS share sheet to managed apps |
| **Policy managed apps with Open-In/Share filtering** | Restricts using Open-In/Share to policy-managed apps only |
| **All apps** | No restriction on outbound data transfer |

---

### 3. Receive Data from Other Apps

| Option | Behavior |
|--------|----------|
| **Policy managed apps** | Only managed apps can send data in |
| **All apps** | Any app can send data in |
| **All apps with incoming Org data** | Accepts data from any app, but incoming files are treated as corporate data |

> ⚠️ A Word file received from Apple's native Files app is treated as **corporate data** — it can only be saved to the local **work** storage, not personal storage.

---

### 4. Save Copies of Org Data (Prevent "Save As")

| Setting | Behavior |
|---------|----------|
| **Block** | Corporate data cannot be saved to: personal OneDrive, local personal storage, SharePoint personal site |
| **Allow user to save to selected services** | Only permitted services (OneDrive for Business, SharePoint, Local Storage) are available; all others blocked |
| **OneDrive for Business** selected | Corporate data cannot be saved to local storage or personal data locations |

---

### 5. Restrict Cut, Copy, and Paste

| Option | Behavior |
|--------|----------|
| **Blocked** | No clipboard transfer allowed |
| **Policy managed apps** | Clipboard blocked to/from non-managed apps (bidirectional restriction) |
| **Policy managed with paste in** | Can paste **from any app INTO** managed apps; managed apps **cannot paste out** to non-managed apps |
| **Any apps** | No clipboard restriction |

> 📝 Cut and copy character limit (requires Intune SDK ≥ 9.0.14)

---

### 6. Printing Org Data

| Setting | Behavior |
|---------|----------|
| **Disable** | Print option is hidden / unavailable for corporate content in managed apps |

---

### 7. Share Web Content with Policy Managed Browsers

| Setting | Behavior |
|---------|----------|
| **Policy managed browsers** | Web links from managed apps (e.g., links in Outlook email) open only in Intune-managed browsers (Edge) |

---

### 8. Block Third-Party Keyboards

| Setting | Behavior |
|---------|----------|
| **Enabled** | Non-system keyboards are blocked within managed app Work context |

---

## Access Settings

### Required PIN

- PIN is **only prompted when accessing corporate data** in a managed app
- Personal-context use of the same app does **not** trigger PIN
- Word won't show PIN prompt until user opens a corporate file

### Recheck Access Requirements After (minutes)

- Set to 30 min: PIN re-prompted after 30 min of inactivity in managed apps

### Require Corporate Credentials for Access

- Forces AAD authentication before accessing corporate data

---

## Conditional Launch Settings

| Setting | Notes |
|---------|-------|
| Min OS version | Block access if device OS is below minimum |
| Max PIN attempts | Wipe app data after N failed PIN attempts |
| Offline grace period | Allow access for N days without network connectivity before blocking |
| Jailbroken / rooted devices | Optional: block access on compromised devices |
| Min app version | Optional: block access if app version is too old |
| Min SDK version | Optional: block access if Intune SDK version is too old |
| Device model(s) | Optional: restrict to specific device models |

> ℹ️ All conditional launch settings are **optional** — they trigger block/wipe actions rather than silently denying access.

---

## Troubleshooting Tips

- If user says "I can't share files" → check **Send Org data to other apps** setting and confirm which app they're trying to share to
- If user says "I can't paste" → check **Restrict cut/copy/paste** setting
- If user says "Save As is blocked" → check **Save copies of Org data** setting
- If user says "PIN keeps appearing" → check **Recheck access requirements after (minutes)** value
- If behavior only affects **corporate files but not personal files** → this is **expected MAM behavior**, not a bug
- Reference: [iOS/iPadOS app protection policy settings — Microsoft Learn](https://docs.microsoft.com/en-us/intune/app-protection-policy-settings-ios)
