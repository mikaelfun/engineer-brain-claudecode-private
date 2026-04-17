# Apple Configurator Enrollment via iPhone

**Source**: OneNote > Mooncake POD Support Notebook > iOS TSG > How to - Apple Configurator enroll - via iPhone

## Prerequisites

- Apple Configurator app installed on an iPhone (NOT the device being enrolled)
- Access to Apple Business Manager (ABM)
- Intune admin portal access with enrollment profile configured

## Pre-enrollment: Device Preparation

If the device is already registered or in use:

1. **Erase locally** (NOT via Intune wipe): iOS Settings > General > Transfer or Reset > Erase All Content and Settings
   - This removes Find My / activation lock
   - Intune remote wipe does NOT remove activation lock, which will cause AC enrollment to fail
2. Delete the device from Intune portal

## Steps: Add Device to ABM via Apple Configurator

1. Launch Apple Configurator on your iPhone
2. Start up the target iPhone/iPad
3. Continue through Setup Assistant, **stop at "Choose a Country or Region" pane**
   - Note: Must restart if you go past the Wi-Fi Network pane
4. Bring iPhone with Apple Configurator close to the target device:
   - Scan the pairing image in Setup Assistant, OR
   - Tap "Pair Manually" and enter the 6-digit code
5. Device serial number is uploaded to ABM

## Steps: Intune + ABM Preparation

1. In Intune Portal: Add an enrollment profile for the device
2. In ABM: Confirm device is assigned to the correct MDM server
   - Can set auto-assign for new devices
   - If not auto-assigned, manually assign via ABM
3. In Intune: Sync to discover the newly added device
4. In Intune: Assign enrollment profile to the device

## Steps: ADE Enrollment

1. On the device, choose "Erase iPhone" to reset
2. Device restarts into Setup Assistant
3. After connecting to Wi-Fi, the ADE enrollment screen appears
4. If the device entered Apple activation without a profile assigned, erase again and retry
5. Complete enrollment, then sign in with Apple ID

## Common Pitfalls

- Using Intune wipe instead of local erase → activation lock persists → AC fails
- Going past Wi-Fi pane in Setup Assistant → must restart device
- Not assigning MDM server in ABM before proceeding → device won't get enrollment profile
