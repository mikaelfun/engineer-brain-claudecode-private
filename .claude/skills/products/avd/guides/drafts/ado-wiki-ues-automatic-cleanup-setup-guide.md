---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/UES Automatic Cleanup/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FIn-Development%20Content%2FUES%20Automatic%20Cleanup%2FSetup%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# UES Automatic Cleanup - Setup Guide

## Step 1: Access policy storage settings
- Navigate to the User Storage Control Center, open the target policy, select Settings

## Step 2: Configure cleanup behavior
- Set the inactivity threshold (X days)
- Optionally enable Only delete when at or exceeding policy limit

## Step 3: Enable automatic cleanup
- Toggle Automatic Cleanup to ON
- Review and accept the permanent deletion consent dialog

## Step 4: Save configuration
- Confirm settings are saved
- Verify indicator reflects cleanup status as enabled

## Key Notes
- Cleanup runs every 24 hours, only unattached storage is deleted
- Forced deletion still occurs after exceeded tolerance period
