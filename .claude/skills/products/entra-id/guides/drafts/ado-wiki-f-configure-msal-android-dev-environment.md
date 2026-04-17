---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/MSAL/Configure the MSAL Android development envrionment"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Developer/Supported%20Technologies/MSAL/Configure%20the%20MSAL%20Android%20development%20envrionment"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Configure MSAL Android Development Environment

## Prerequisites
- Android Studio (recommended: Electric Eel or earlier, avoid Flamingo+)
- Public Access Token (PAT) for IdentityDivision org with Packaging Read scope
- PAT setup at: https://identitydivision.visualstudio.com/_usersSettings/tokens

## Global Gradle Configuration
File: ~/.gradle/gradle.properties


## Setup Steps
1. Clone the android-complete repository
2. Register custom aliases and setup repos:
   
3. Open project in Android Studio from cloned folder (project: android_auth)
4. Set build variants to debug or localDebug (View > Tool Windows > Build Variants)
5. (OSX) Install PowerShell
6. Install Lombok Plugin manually (copy from /lombok subfolder to Android Studio/plugins)
7. Run the NativeAuthSample configuration (not Make Project)

## Troubleshooting

### 1. JDK Version
- Project requires JDK 11 (11.0.15 specifically)
- Fix: Preferences > Build Tools > Gradle > Gradle JDK = 11.0.15

### 2. Gradle Version
- Must be 6.8 - never accept Android Studio upgrade prompts
- Fix: File > Project Structure > Project > Gradle Version = 6.8

### 3. Insufficient Memory
- Add to gradle.properties:
  

### 4. Gradle Daemon Issues
- Check Gradle version is 6.8
- If JDK mismatch: Download JBR 11, replace Android Studio/jbr, set JAVA_HOME, invalidate cache

### 5. 401 Unauthorized (Maven Feed)
- Verify vstsMavenAccessToken in ~/.gradle/gradle.properties
- Create new PAT if expired
