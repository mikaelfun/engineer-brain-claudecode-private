# USB Write Access Control via Intune Admin Template

## Scenario
Block all users' write access to USB removable disks while allowing specific users to retain write access on the same device.

## Solution: Admin Template Policy (User-scoped)

The policy writes to `HKEY_CURRENT_USER\Software\Policies\Microsoft\Windows\RemovableStorageDevice\{xxx}`.

### Steps
1. Set "Removable Disk Deny Write Access" = **Not configured** in any existing ASR policy first (to avoid conflicts)
2. Create an Admin Template policy with:
   - Setting Name: **Removable Disks: Deny write access**
   - Setting Type: **User**
3. Deploy the policy to a **User group** containing users who should be blocked
4. Add specific user groups to **Excluded group** under Assignment — these users will retain write access
5. Pick 1-2 sample devices for testing before broad deployment

## Key Notes
- This is a **user-scoped** policy, not device-scoped
- The exclusion group approach is simpler than creating separate allow/deny policies
- Test on sample devices before deploying to production

## Source
- OneNote: MCVKB/Intune/Windows/How to block all user's write access to USB while.md
