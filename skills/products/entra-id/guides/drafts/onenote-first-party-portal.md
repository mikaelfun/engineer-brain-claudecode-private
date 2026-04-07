# First Party Portal & Source Code Guide

## Overview
Tools for looking up Microsoft first-party application configurations, owners, manifests, and credentials in Azure AD.

## Option 1: First Party Portal (Web UI)
- URL: https://firstpartyportal.msidentity.com/SignInOptions/SignInOptions?returnUrl=%2FViewApplications%2FAll
- **Only accessible via SAW machine**
- Login with microsoft.com account
- For NOAM members: set route via VPN

### Usage
1. Access portal → Click "View all applications"
2. Login with microsoft.com account
3. Search by keyword or App ID
4. Click GUID to check configuration:
   - **Owner** tab: owner team info
   - **Manifest** tab: app manifest
   - **Credential** tab: credentials/thumbprints (compare with eSTS logs)

## Option 2: Source Code Repo (Alternative)
- URL: https://msazure.visualstudio.com/One/_git/AAD-FirstPartyApps?path=/Customers/Configs/AppReg
- Permission request: https://coreidentity.microsoft.com/manage/entitlement/entitlement/aadfirstpart-2m44 (choose Read-Only)

### Usage
- **App ID → App Name**: Browse any app, replace app ID in URL
- **App Name → App ID**: Search app name in quotes, find AppReg.json or AppReg.Parameters.Environment.json

## Source
OneNote: Mooncake POD Support Notebook > Troubleshooting Tools > General Tools > First Party portal
