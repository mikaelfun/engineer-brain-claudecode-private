# Win32 App Deployment with Chocolatey via IME - Troubleshooting Guide

> Source: Case 2406110030001764 (MorganStanley)

## Architecture

Customer uses Chocolatey to install apps via Intune:

1. Package the Chocolatey installation package (`.nupkg`) into `.intunewin`
2. Deploy via Intune and set the Chocolatey installation command
3. IME execution flow:
   - App detect rule check
   - App download
   - Unzip downloaded zip file to `C:\Program Files (x86)\Microsoft Intune Management Extension\Content\Staging`
   - Create installer process (Chocolatey)

## Distinguishing IME vs Chocolatey Issues

### Part 1-3: Intune Service / IME Side
- Check IME logs for download, unzip, and installer process creation
- If IME successfully creates the installer process, the issue is on the Chocolatey side

### Part 4: Chocolatey Side
- Check Chocolatey logs: `C:\ProgramData\chocolatey\logs`
- Check Chocolatey installation cache for failed packages: `C:\ProgramData\chocolatey\lib-bad`
- If IME unzipped successfully and the installer was triggered, the package will appear under `lib-bad` on failure

## Key Log Locations

| Component | Log Path |
|---|---|
| IME | `C:\ProgramData\Microsoft\IntuneManagementExtension\Logs\IntuneManagementExtension.log` |
| Chocolatey | `C:\ProgramData\chocolatey\logs` |
| Failed packages | `C:\ProgramData\chocolatey\lib-bad` |
| Staging | `C:\Program Files (x86)\Microsoft Intune Management Extension\Content\Staging` |

## Troubleshooting Flow

1. Check IME log for app download and unzip status
2. Confirm installer process creation in IME log
3. If installer process created successfully -> check Chocolatey logs
4. If package found in `lib-bad` -> Chocolatey installation failed, review Chocolatey error
5. If no installer process -> IME-side issue, check download/unzip errors
