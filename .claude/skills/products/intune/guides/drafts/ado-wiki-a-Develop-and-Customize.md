---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Develop and Customize"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevelop%20and%20Customize"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Develop and Customize

Page Owner: Leon Zhu (yihzhu@microsoft.com)

## Overview

This section covers developer-facing Intune features - primarily how to enable Mobile Application Management (MAM) policies in apps developed in-house or distributed as line-of-business (LOB) apps.

Two main approaches to MAM-enable an app:

| Approach | Description | Use When |
|----------|-------------|----------|
| **App SDK integration** | Embed MAM SDK directly in app source code and rebuild | Customer **has source code access** and development resources |
| **App Wrapping Tool** | Post-process a compiled binary to inject MAM without source code changes | Customer **only has the compiled binary** (APK / IPA / PKG) |

> **NOTE**: Not all apps are wrappable. Apps with complex native dependencies (e.g., Azure Identity libraries on Android) may require the SDK path.

## App SDK Pages

### App SDK for Android
- Native Android (Java/Kotlin) apps
- Use when app uses complex dependencies blocking wrapping tool
- Key topics: SDK components (.aar, JAR files), MAM policy enforcement, manifest changes

### App SDK for iOS
- Native iOS (Objective-C/Swift) apps
- Key topics: Version compatibility matrix (SDK vs. Xcode vs. iOS version), integration steps

### App SDK for Xamarin
> **WARNING**: Xamarin support ended on **May 1, 2024**. Customers should migrate to **.NET MAUI**.
- Intune App SDK for .NET MAUI should be used going forward

## App Wrapping Tool Pages

### App Wrapping Tool for Android
- Wraps Android APK or AAB files on Windows using PowerShell
- Prerequisites: Java 11+, PowerShell
- Key topics: keystore signing, AAB-to-APK conversion, common errors from GitHub Issues

### App Wrapping Tool for iOS
- Wraps iOS IPA files on macOS using IntuneMAMPackager
- Key topics: Apple Developer Program requirements, signing certificates, provisioning profiles

### App Wrapping Tool for macOS
- Converts macOS .pkg LOB apps to .intunemac format for Intune deployment
> **NOTE**: Unlike iOS/Android, the macOS tool does **NOT** inject MAM app protection policies - it only packages for deployment. macOS LOB apps are managed via MDM device policies, not app protection policies.

## Microsoft Graph API & Scripting

### Graph API
- Common endpoints for Intune management automation
- Key topics: managed devices, compliance policies, configuration profiles, mobile apps

### Windows (PowerShell Scripting)
- Internal PowerShell scripting examples for common Intune automation tasks
> **IMPORTANT**: CSS does **not** support creating, maintaining, or troubleshooting custom scripting for customers. These examples are for **internal engineer reference only**.
