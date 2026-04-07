# Wrap Android APK for Intune MAM

## Prerequisites
- Intune App Wrapping Tool for Android (latest version)
- Java Runtime Environment (JRE) installed to `C:\ProgramData\Oracle\Java\javapath`
- Android SDK (for signing with Scheme V2)

## Steps

1. **Install Wrapping Tool** - Download and install the Intune App Wrapping Tool for Android
2. **Install JRE** - Ensure Java is available in PATH
3. **Create signing key** via `keytool.exe`
4. **Wrap the APK** using the wrapping tool
5. **Sign the APK**:
   - If signing fails with "Android Signature Scheme V2 signed" error, re-create the key
   - Use Android SDK `apksigner` tool instead of `jarsigner` for V2 signing
6. **Upload to Intune Portal** - Upload the wrapped `.apk` as a LOB app
7. **Assign to user group** as "Available" type
8. **Test** - Install from Company Portal for Android

## Known Issues
- APK signing may fail if the original APK uses Android Signature Scheme V2; use Android SDK's `apksigner` instead of `keytool`/`jarsigner`

## References
- [Prepare Android apps for app protection policies](https://docs.microsoft.com/en-us/intune/app-wrapper-prepare-android)
