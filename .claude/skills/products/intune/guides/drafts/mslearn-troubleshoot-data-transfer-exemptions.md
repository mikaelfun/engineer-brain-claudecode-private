# Troubleshooting APP Data Transfer Exemptions

> Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-data-transfer-exemptions)

## Key Scenarios

### Copy/Paste Not Working for Exempted App
- Cut/copy/paste restrictions are **separate** from "Send org data" restrictions
- Exemptions do NOT apply to clipboard operations

### Exempted App Not in Share Menu
- Use the **Select apps to exempt** setting (OS Share functionality)
- Confirm both apps support data sharing when unmanaged

### Data Not Transferred Despite Showing in Share Menu
- Review SDK integration of the sending app
- Contact app developer about Intune App SDK integration

### iOS Open-In Not Working for Exempted App
- Data transfer exemptions do NOT apply to iOS Open-In functionality
- See: Use app protection with iOS apps

## Platform-Specific Format Requirements

| OS | Value Type | Example (Word) |
|----|-----------|----------------|
| Android | App Package ID | com.microsoft.office.word |
| iOS | URL protocol | ms-word |

## iOS Universal Link Exemptions

- If **Restrict web content transfer with other apps** is configured to "Microsoft Edge" or "Unmanaged browser", you may need to manually configure universal links to exempt
- Verify correct universal link with app developer
- Ensure app is installed on device
- Confirm link formatting matches developer specification

## Validation Steps
1. Confirm the behavior being tested (which transfer method?)
2. Confirm apps support data sharing (test without management)
3. Confirm exemptions are formatted correctly for OS type
4. For iOS: verify universal links if applicable
