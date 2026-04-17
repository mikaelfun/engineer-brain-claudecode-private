# MS Authenticator Log Collection

## Overview
Procedure for collecting Microsoft Authenticator app diagnostic logs for MFA troubleshooting.

## Steps

### 1. Ask Customer to Collect Logs
Instruct the end user to:
1. Open Microsoft Authenticator app
2. Go to Settings > Send feedback
3. Select "Having trouble?" or "Report a bug"
4. The app will generate and upload diagnostic logs automatically

### 2. Access PowerLift Portal
- URL: https://powerlift.acompli.net/#/incidents
- **Permission required**: Must be a member of SG "Authenticator log readers"
- If you don't have access, request to join the security group

### 3. Download Logs
1. Navigate to PowerLift portal
2. Input the incident ID provided by the customer or search by timestamp
3. Go to **Files** tab
4. Download the log files for analysis

## Notes
- PowerLift is the primary log collection mechanism for MS Authenticator app
- Logs contain authentication flow details, push notification events, and error traces
- Useful for diagnosing: push notification failures, TOTP code issues, account registration problems

## Source
- OneNote: Mooncake POD Support Notebook > MFA > MS Authenticator > Log collection
