# Apple Configurator Enrollment via macOS

> Source: OneNote - iOS TSG / How to - Apple Configurator enroll - via MacOS
> Status: draft (pending SYNTHESIZE review)

## Prerequisites

- macOS device with Apple Configurator 2 installed
- Intune portal access with Apple Configurator enrollment profile configured
- USB cable connecting iOS device to Mac

## Enrollment Steps

1. **Add device in Intune**: Add device serial/info to Intune Apple Configurator device list, assign enrollment profile
2. **Connect iOS device** to Mac, open Apple Configurator 2
3. **Configure Server**:
   - Go to Apple Configurator > Preferences > Server
   - Copy profile URL from Intune Portal
   - Convert to DEP URL format (usually auto-converts, but may need manual conversion)
   - Create Server entry in AC preferences
4. **Create Blueprints**: Configure device Blueprints in Apple Configurator
5. **Prepare Device**:
   - Select device > Prepare
   - Apply the Blueprints
   - AC will erase the device
6. **Complete enrollment**: iOS connects to MDM Server URL via TCP and completes profile installation

## Common Issues

- **DEP URL auto-conversion fails**: Manually convert the Intune enrollment URL to DEP format
- **TCP connection timeout**: Verify network connectivity between iOS device (via Mac) and MDM server
- Device must be erased during Prepare step - warn customer about data loss
