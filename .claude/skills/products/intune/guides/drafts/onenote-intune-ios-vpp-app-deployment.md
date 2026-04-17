# iOS VPP App Deployment via Intune

## Overview
Steps to deploy Apple Volume Purchase Program (VPP) apps through Intune.

## Prerequisites
- Apple Business Manager account
- VPP token from Apple

## Steps

1. **Download VPP Token from Apple**
   - Go to https://business.apple.com/#/main/preferences/myprofile
   - Download the VPP token file

2. **Upload VPP Token to Intune Portal**
   - Navigate to Intune > Tenant administration > Connectors and tokens > Apple VPP tokens
   - Upload the downloaded token

3. **Add VPP App in Apple Business Manager**
   - Return to Apple Business Manager website
   - Purchase/assign the app to the specified location associated with your VPP token

4. **Sync VPP Token in Intune**
   - In Intune portal, navigate to the VPP token
   - Click "Sync" to pull the latest app assignments from Apple

5. **Verify App Appears in App List**
   - After sync, the VPP app should appear in Intune > Apps > All apps
   - Assign the app to target user/device groups

## Notes
- VPP token sync may take a few minutes
- Apps must be purchased/assigned in Apple Business Manager before they appear in Intune
- For Mooncake (21Vianet), ensure the VPP token is compatible with the China region

## Source
- OneNote Case Study: 2308160010000983
