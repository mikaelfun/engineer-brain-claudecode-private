---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Tools/RsoP - GPresult"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Tools/RsoP%20-%20GPresult"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1179797&Instance=1179797&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1179797&Instance=1179797&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides guidance on retrieving Resultant Set of Policy (RSoP) information for users and computers using RSoP or gpresult. It emphasizes the preference for gpresult due to its comprehensive capabilities.

[[_TOC_]]

# Description
Get Resultant Set of Policy (RSoP) information for a user, a computer, or both by using RSoP or gpresult.

# RSoP
RSoP is deprecated. Although it can still be used, gpresult is recommended because certain settings cannot be viewed through RSoP.

# gpresult
The gpresult command displays the resulting set of policy settings that were enforced on the computer for the specified user when the user signed in.

The error message "_The user does not have RSOP data_" typically occurs when attempting to retrieve RSoP data for a user who has never logged into the computer. If the troubleshooting does not involve user-specific Group Policy settings, you can skip them and retrieve computer settings only to prevent that error.

Find the required parameter at the [gpresult](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/gpresult) public article or [Get-GPResultantSetOfPolicy](https://learn.microsoft.com/en-us/powershell/module/grouppolicy/get-gpresultantsetofpolicy?view=windowsserver2022-ps) public documentation.

# Tips
- The gpresult command provides a report of the applied Group Policies, but it does not always guarantee that the settings are correctly implemented at the registry level. By checking the corresponding registry keys, you can verify that the settings are actually applied and functioning as intended.
- While gpresult can assist with the initial troubleshooting steps, using Troubleshooting Support Scripts (TSS) will allow you to efficiently collect a full dataset and expedite the troubleshooting process. Please refer to [Workflow: GPO: Data Collection - Starter](/Group-Policy/Workflow:-GPO:-Data-Collection-%2D-Starter) or the TSS scenario that aligns with your needs.
