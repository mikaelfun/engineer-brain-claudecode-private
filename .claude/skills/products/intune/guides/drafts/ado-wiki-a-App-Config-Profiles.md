---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/App Config Profiles"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Config%20Profiles"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# What are App Configuration Profiles

App configuration policies can help you eliminate app setup problems by letting you assign configuration settings to a policy that is assigned to end-users before they run the app. The settings are then supplied automatically when the app is configured on the end-users device, and end-users don't need to take action. The configuration settings are unique for each app.

Supported platforms:
- iOS/iPadOS
- Android

The available configuration parameters are ultimately decided by the developers of the app. Documentation from the application vendor should be reviewed to see if an app supports configuration and what configurations are available.

## Two Options for App Config Policies

| Option | Description |
|--------|-------------|
| **Managed devices** | Device managed by Intune as MDM provider. App must be designed to support app configuration. |
| **Managed apps** | App developed to integrate Intune App SDK. Must be targeted with Intune App Protection policy. |

## Four Variations by Platform and Type

### 1. Android Enterprise Managed Device
- App config policies supply settings to Managed Google Play apps on managed Android Enterprise devices
- App developer exposes Android-managed app configuration settings
- Microsoft Office apps are MAM aware and use same parameters as MAM
- Policy assigned to user groups; settings used when app checks (typically first run)

### 2. Android Managed App
- Can be applied to any Android device supporting Intune App Protection policies
- MAM policy applied → device notified to download configuration file
- Intune App SDK-enabled apps support key/value pair configurations
- Not every Intune SDK enabled app supports all parameters

### 3. iOS Managed Device
- Configuration settings based on app supplier direction
- Must get configuration keys and values from the app supplier
- Settings can be specified as key/value pairs or XML

### 4. iOS Managed App
- Applied to any app supporting Intune App Protection policies
- Same mechanism as Android Managed App (MAM channel)
- Key/value pair configurations via Intune App SDK

## In-House LOB Apps

For managed apps: wrap an app to implement and support the Intune App SDK.
For managed devices (iOS): see Managed App Configuration in iOS developer documentation.
Android Enterprise: requires publishing to Managed Google Play Store, uses AppConfig Community parameters.

## How to Configure App Configuration Profiles

1. In Intune, select **Apps** > **App configuration policies** > **Add**
2. Enter Name, Description
3. Select **Device enrollment type**: Managed devices
4. Select **Platform**: Android
5. Select **Associated App** from approved Managed Google Play apps
6. Configure using **Configuration designer** or **JSON editor**
7. Select OK > Add

### Configuration Designer
- For Managed Google Play apps designed to support configuration settings
- Set Value type (data type) and Configuration value for each key
- Variable or certificate profile can be used for String value types

### JSON Editor
- For apps requiring JSON-formatted configuration data
