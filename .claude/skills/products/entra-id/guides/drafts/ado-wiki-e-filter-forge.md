---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Tools/TextAnalysisTool.Net/Filter Forge (Text Analysis Tool Filters)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Tools/TextAnalysisTool.Net/Filter%20Forge%20%28Text%20Analysis%20Tool%20Filters%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1986477&Instance=1986477&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1986477&Instance=1986477&Feedback=2)

___
<div id='cssfeedback-end'></div>

## What is Filter Forge?
FilterForge is a log analysis enhancement tool designed to improve engineers' productivity by applying structured filters to log files. These filters help engineers quickly identify relevant information, reducing the time spent manually searching through logs.

## Why Should Engineers Use Filter Forge?
- **Efficiency:** Automates log filtering to highlight essential data.
- **Clarity:** Uses color-coded results for easy interpretation.
- **Customization:** Offers a variety of pre-configured filters tailored to common log analysis needs.
- **Consistency:** Standardizes log parsing to improve troubleshooting accuracy.

## Available Filters
FilterForge provides a range of filters, each serving a specific purpose in log analysis. Below is an overview of the currently available filters:

| Filter Name         | Description |
|---------------------|-------------|
| **Kerberos**        | Analyses Kerberos etl logs for troubleshooting authentication issues. |
| **TLS**            | Filters logs related to TLS handshake issues. |
| **Windows Time**    | Checks logs related to Windows Time synchronization and time source issues. |
| **Netsetup**       | Identifies errors related to machine account setup, domain joins, and connectivity issues. |

## How to Use FilterForge
1. **Get Filter Forge**: Filter Forge filters are available with the Text Analysis Tool, which at the same time is available with the Insight Client App. Get the tool following the steps bellow:

   a. Connect your computer to the VPN 

   b.  Access the official Knowledge base article: http://aka.ms/insightclient

   c.  Use the Download link to download and install the latest version specified in the knowledge Base article

   d.  After installed, you will find an option to open any text file with the Text Analysis tool by right-clicking and selecting Open with: TextAnalysisTool.net

2. **Convert and open the Logs**: Open and convert the log file in Text Analsys Tool. (For Windows Time Debug Logs, you may need to convert the File to UTF-8 Encoding for the tool to open properly)
2. **Apply a Filter**: Press Crtl+D to open the filter repository, Expand **"DS_Official"**, and select a predefined filter based on your analysis needs.
3. **Review Results**: The filtered results will be highlighted based on the applied rules.
4. **Follow the reference link**: Once you spotted the error code, follow the reference link posted in the filter description for actionable steps.

## What Do the Colors Mean?
FilterForge uses color coding to differentiate log entries:

:green_circle: **Green:** Successful operations or expected relevant functions, the description provides understanding of what is about to occur in the log or confirmation that a function finished properly, it helps you scoping at what phase the issue is.

:yellow_circle: **Yellow:** Provides identifiable information, such as usernames, computer names, server names, IP addresses, etc It helps you finding if the marked line is related or not to the problem.

:red_circle: **Red:** Errors or failed operations that need investigation. It also provides a follow up link in the description for you to take specific actions to resolve the problem


## How to Provide Feedback
User feedback is essential for improving FilterForge. Please report any inaccurate, missing filter, wrong description, broken links or simply give us your kudos: http://aka.ms/supportenablement

---
