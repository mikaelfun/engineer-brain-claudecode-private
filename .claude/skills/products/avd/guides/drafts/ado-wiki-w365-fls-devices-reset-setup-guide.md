---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/FLS Devices automatically reset/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FIn-Development%20Content%2FFLS%20Devices%20automatically%20reset%2FSetup%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# FLS (Frontline Shared) Devices Automatically Reset - Setup Guide

## Step 1: Provision Frontline Shared Cloud PC
- Verify a Frontline Shared Cloud PC is provisioned successfully
- Confirm device reaches Provisioned state in the portal

## Step 2: Autopilot Device Preparation
- Ensure required system components are installed:
  - VPN client
  - Security software
  - Configuration scripts

## Step 3: Capture Restore Point
- Confirm restore point captures the desired known-good system state during post-provisioning

## Step 4: User Sign-In and Usage
- User signs in and completes productivity tasks
- Validate apps are available and functional

## Step 5: Sign-Out and Reset Validation
- User signs out
- Verify automatic reset to restore point completes (~30 seconds)
- Confirm Cloud PC returns to the available pool
