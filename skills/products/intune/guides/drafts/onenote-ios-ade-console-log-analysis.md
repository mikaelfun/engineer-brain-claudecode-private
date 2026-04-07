# iOS ADE Enrollment Console Log Analysis

**Source**: OneNote > Mooncake POD Support Notebook > iOS TSG > Analyzing Console logs to check the Enrollment

## How to Collect Mac Console Logs

1. Open **Console** app on Mac (Launchpad > Console)
2. Enable debug logging: **Action** menu > enable both:
   - "Include Info Messages"
   - "Include Debug Messages"
3. Connect iOS/iPadOS device via USB cable
4. If device has passcode, tap "Trust this Device" on the device
5. Reproduce the enrollment issue
6. Select all events (Cmd+A), copy (Cmd+C), paste into TextEdit, save

## Key Log Entries During ADE Enrollment

### 1. Apps & Data Screen
```
Setup Current device is enrolled in DEP; not offering migration
```

### 2. Remote Management Screen
```
Bundle: <private>, key: REMOTE_MANAGEMENT_TITLE, value: , table: Localizable
```

### 3. SCEP Certificate Request (after authentication)
```
profiled Performing synchronous URL request: https://fef.msuc05.manage.microsoft.com/StatelessIOSEnrollmentService/DeviceEnrollment/PKI/SCEP2/...
profiled Attempting to retrieve issued certificate...
```

### 4. MDM Authentication Complete
```
profiled Authentication with MDM finished.
```

### 5. MDM Profile Installation
```
mdmd Attempting to write dictionary ... ConfigurationProfiles/MDMOutstandingActivities.plist
```

### 6. Intune Device ID Visible
```
"Common Name"; value = "{device-guid}"
```
The Common Name value is the Intune Device ID.

### 7. Valid MDM Installation Confirmed
```
mdmd MDMConfiguration: readConfigurationOutError: Valid MDM installation found.
```

### 8. Device Information Collection
```
mdmd Starting MDM power assertion with reason: mdmd-Request-DeviceInformation
```

### 9. Home Screen Reached
Enrollment complete.

## Reference
- Detailed steps: https://internal.evergreen.microsoft.com/en-us/topic/da09cdb3-de81-ef4a-80da-f61f0f0a39b1
