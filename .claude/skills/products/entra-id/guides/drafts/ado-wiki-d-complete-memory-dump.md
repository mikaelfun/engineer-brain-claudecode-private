---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/SBSL - Slow Logon/Workflow: SBSL: Data collection/Complete Memory Dump"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/SBSL%20-%20Slow%20Logon/Workflow:%20SBSL:%20Data%20collection/Complete%20Memory%20Dump"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1248093&Instance=1248093&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1248093&Instance=1248093&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**
This guide provides instructions on setting up Windows Performance Analyzer (WPA) for ETL analysis, including symbol configuration and loading the SBSL profile.

[[_TOC_]]

# Get the internal WPA version

http://aka.ms/getwpa

# Recommended symbols configuration

The `symcache` service has faster symbol loading compared to `symweb` and `symweb.azurefd.net`. This service centralizes creating symcache files from PDBs and caches the results for everyone to use. Best case, you should get an order of magnitude speedup if someone else previously requested that symbol, and worst case, it should be no slower and maybe even still multiple times faster.

Here is the configuration:

![WPA symbols path](/.attachments/WPASymbolsPath-248ccb38-be15-4a2a-84c2-f2b3ec55a439.png)

![WPA symcache](/.attachments/WPASymcache-5164d490-c63e-4ec3-87b9-2e3e4093ac27.png)

> :memo: **Note:** Configure an empty folder as WPA seems much happier with some kind of symbols directory, even if its empty. Also, these folders must exist; otherwise, WPA will display a "Symbol loading was cancelled or experienced an error" message.

## Alternative

The `symcache` service has access to many symbols, including Windows builds and Office builds, but does not have access to every internal symbol source. We are happy to consider adding support for more permission groups upon request. If you have access to extra-special symbols, such as Xboxs symbols, `symcache` wont have permissions to access them, and you may want to leave your normal symbols paths enabled as a backup. See the settings below:

![Alternative symbols configuration 1](/.attachments/image-ee010b3b-5ab2-4c3e-97c0-bbdf416fe488.png)

![Alternative symbols configuration 2](/.attachments/image-c3dd7bf8-dc90-4bee-8c91-381cef0ea772.png)

# Load the SBSL profile

- Copy the attached file locally. This is the configuration XML file for WPA:

  [SBSL-CSS.wpaProfile](/.attachments/SBSL/SBSL-CSS.wpaProfile)

- Open WPA and go to Profiles.

- Apply and browse, then select the above SBSL WPA profile.

  <IMG  src="https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=/WindowsDirectoryServices/.attachments/WPAProfile-03dafcc7-bb21-4d01-86a7-8a0476627517.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=master"  alt="WPAProfile.png"/>
