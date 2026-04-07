# Common APP Data Transfer Scenarios

> Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/data-transfer-scenarios)

## Scenario: Cannot Transfer Files Between Managed Apps
- Check **Send org data to other apps** setting → if set to "None", no transfers allowed
- Verify setting in both admin center and on-device (via Edge)

## Scenario: Cannot Receive Files from Unmanaged Apps
- Check **Receive data from other apps** → if "None", no incoming transfers
- Check **Open data into org documents** → "Allow users to open data from selected services"

## Scenario: Need to Transfer to Unmanaged Apps
- Check **Select apps to exempt** setting for data transfer exemptions
- See troubleshoot-data-transfer-exemptions guide

## Scenario: Cannot Save to Local Storage
- **Send org data to other apps** set to "None" blocks local saves
- **Allow user to save copies to selected services** must include "local storage"

## iOS Share Extension Customization

### Option A: MDM Managed Devices
- Set **Block viewing corporate documents in unmanaged apps** = Yes
- Deploy allowed apps via Intune; don't deploy others
- Only managed apps appear in Share extension

### Option B: APP Managed (MAM-WE)
- Set **Send org data to other apps** = "Policy managed app with Open-In/Share filtering"
- Share extension filtered to apps supporting Intune APP only

## Android Sharing Control
- Work profile: users can only share between apps in work profile
- Use managed Google Play to deploy allowed apps

## Universal Links (URLs) in Policy-Managed Apps
- Microsoft Edge must be installed on device (and in work profile for Android Enterprise)
- Without Edge: error "organization requires the application to view the link"
