---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/General Guidance/How to capture and read customer repro traces"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FGeneral%20Guidance%2FHow%20to%20capture%20and%20read%20customer%20repro%20traces"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---  
Tags:  
- cw.Entra  
- cw.EntraID  
- cw.comm-sync  
- cw.comm-orgmgt  
- cw.comm-extidmgt  
- cw.comm-secaccmgt  
- cw.comm-objprinmgt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

Problem Steps Recorder, Fiddler or HAR traces, and Network Captures can be used to capture trace data from a customer while they reproduce any service issue they are experiencing so that Microsoft may analyze the issue offline with support or engineering teams.  It is important to capture this level of detail from customer's on first quality response so you have the necessary level of details on the customer issue for proper debugging and escalations.

[[_TOC_]]

# Capturing Traces

Customer linkable public docs (https://aka.ms/problemstepsrecorder)

## How to capture a Problem Steps Recorder Trace
A problem steps recorder trace will take screenshots of each step a customer performs and output a single file which the customer can provide to support for review and helps us visually understand the steps taken and customer experience better.

1. To open Steps Recorder, select the Start button, and then search for Steps Recorder (in Windows 11), or select Windows Accessories > Steps Recorder (in Windows 10), or Accessories > Problem Steps Recorder (in Windows 7 or Windows 8.1).
2. Select Start Record.
3. Go through the steps to reproduce the problem you’re trying to diagnose. You can pause and resume the recording at any time.
4. (Optional) As you record, select Add Comment, use your mouse to select the part of the screen that you want to comment on, type your comment, and then select OK.
5. When you’re done, select Stop Record.
6. Review the record of the steps you followed to make sure it shows what you want it to show. Select Save, name the .zip file, choose where to save it, and then select Save. Now you can attach and send this .zip file to the person helping you troubleshoot the problem on your PC. It can be viewed in any web browser.

<hr>

## How to capture a HAR trace

Customer linkable public docs (https://aka.ms/hartrace)

A HTTP Archive (HAR) trace can be used to view any Http\Https web requests and responses made from your web browser. HAR traces are useful when you do not want to install a full application like Fiddler, as HAR files can be captured naively using most Web Browsers like Edge, Chrome, or Internet Explorer. Capturing this data can be very useful for analyzing errors encountered. To capture a HAR trace, follow the steps below

### To generate the HAR file for Internet Explorer
1. Open Internet Explorer and go to the page where the issue is occurring.
2. Press F12 on your keyboard(or click the gear icon > F12 Developer Tools)
3. Click the Network tab.
4. Reproduce the issue that you were experiencing before, while the network requests are being recorded.
5. Once done click the Save button to export as HAR (or press Ctrl+S).

6. Give the trace a filename and click the Save button which will save it as a .har file .
7. Provide this .har file to engineer troubleshooting your issue via uploading to DTM link provided by support engineer

### To generate the HAR file for Chrome
1. Open Google Chrome and go to the page where the issue is occurring.
2. From the Chrome menu bar select View > Developer > Developer Tools .
3. From the panel opened at the bottom of your screen, select the Network tab.
4. Look for a round red Record button ( )) in the upper left corner of the Network tab, and make sure it is red. If it is grey, click it once to start recording.
5. Check the box next to Preserve log .
6. Click the Clear button ( )) to clear out any existing logs from the Network tab.
7. Now try to reproduce the issue that you were experiencing before, while the network requests are being recorded.
8. Once you have reproduced the issue, right click anywhere on the grid of network requests, select Save as HAR with Content , and save the file to your computer.

9. Provide this .har file to engineer troubleshooting your issue via uploading to secure DTM link provided by support engineer

### To generate the HAR file for Edge
1. Browse to the URL where you are seeing the issue.
2. Navigate to Developer tools (use F12 as a shortcut) and select the “Network” tab.
3. Refresh the page to start capturing the traffic between the browser to the server, or click on a link with which you are seeing the issue. The aim is to reproduce the issue and capture the output.
4. Click on “Export as HAR” followed by Save As… to save the HAR file.

5. Provide this .har file to engineer troubleshooting your issue via uploading to secure DTM link provided by support engineer

### How to capture a HAR trace on Mobile Phones

Please review [Mobile Device Data Gathering](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1211660/)

### How to collect a HAR trace including multiple browser tabs or pop-ups

Upon troubleshooting, customers' applications might initiate the opening of numerous browser tabs or pop-up windows during the issue repro. In these cases, the default configuration of the browser when taking a HAR trace do not capture the traffic of the secondary tabs which leads to incomplete HAR traces. 

#### How to enable setting in Edge 

The following guide shows how to enable the 'Auto-Open DevTools for pop-ups' feature that allows the capture of traffic of multiple browser tabs in Edge. 


1.  From the Edge browser, go to More Tools > Developer Tools 

![screenshot of Edge options](/.attachments/image-9a34dfe6-ae53-41bb-b82f-a4d84eea1d56.png)

2. Once you've opened Developer Tools, click on the three dots on top > Settings 

![screenshot of Edge options](/.attachments/image-2a8d032a-a6b3-4a99-b225-9d4c8fc41645.png)

3. This take you to the Preferences page > Go to the Global section > select the 'Auto-open the DevTools for Popups' .

![screenshot of Edge options](/.attachments/image-deb6683b-8334-431b-b212-746111e6abd1.png)

4. To save the changes, close the browser and reopen it. 

5. You can now take the HAR trace while reproducing the issue. 


#### How to enable setting in Chrome

The following guide shows how to enable the 'Auto-Open DevTools for pop-ups' feature that allows the capture of traffic of multiple browser tabs in Chrome.

1. Open Google Chrome browser, go to the three dots on  top > More Tools > Developer Tools 

![screenshot of Chrome options](/.attachments/image-b4e18d65-ac85-40b3-89eb-a46779a11508.png) 

2. Once in Developer Tools, click on the gear on top, this will open the Preferences page 

![screenshot of Chrome options](/.attachments/image-016d4acd-d452-4690-8a6c-140c55249d6c.png)

3. Once in Preferences, scroll down to the Global section > Select 'Auto-open DevTools for popups'

![screenshot of Chrome options](/.attachments/image-d0f060e7-ec85-4e6d-90cb-3f17e5e95a6f.png)

4. To save the changes, close the browser and reopen it. 

5. You can now take the HAR trace while reproducing the issue. 


## How to capture a Fiddler trace

Customer linkable public docs (https://aka.ms/fiddlercap)

A Fiddler trace can capture HTTP\HTTPS traffic from ANY application running on the client system (not only the web browser).  It requires an application to be installed which some customers dont wish to perform.  In those cases a [HAR trace](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/335070/How-to-capture-and-read-a-Fiddler-or-HAR-Trace?anchor=how-to-capture-a-har-trace) is recommended instead.

1. Download Fiddler from [Fiddler download site](https://www.telerik.com/download/fiddler) and install it.
2. Run Fiddler and go to Tools -> Fiddler Options.
3. On the HTTPS page, verify that Capture HTTPS Connects is enabled.
4. Verify that Decrypt HTTPS traffic is enabled with the …from all processes option.
5. **NOTE**: If you are in a Federated environment, please also check Rules -> Automatically Authenticate.
6. In the very bottom left of the Fiddler application, ensure that you see “Capturing” displayed indicating that Fiddler is capturing traffic.
7. If Fiddler is not capturing. Choose File -> Capture Traffic (Or press F12)
8. Minimize Fiddler to tray.
9. Replicate the reported issue.
10. Once Complete, you can stop capturing by selecting File -> Capture Traffic again or pressing F12
11. Make sure to remove any password by completing the following:
12. Select a frame
13. CTRL+F – search for the password
14. All highlighted frames must be investigated
15. Press F2 on a highlighted frame to unlock for editing and delete the passwords
16. Go to File menu and click Save, choose All Sessions and save the trace as a .saz file

12. Save .SAZ file locally and then provide this .SAZ to engineer troubleshooting your issue via uploading to secure DTM link provided by support engineer
13. Once complete, Fiddler can be uninstalled from Windows Control Panel \ Programs and Features \ Uninstall “Progress Telerik Fiddler”

<br><br><hr>
# How to Analyze Traces for Errors
Once a customer has provided you a [.SAZ (fiddler)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/335070/How-to-capture-and-read-a-Fiddler-or-HAR-Trace?anchor=how-to-capture-a-fiddler-trace) or [.HAR (HAR trace)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/335070/How-to-capture-and-read-a-Fiddler-or-HAR-Trace?anchor=how-to-capture-a-har-trace) for review, you can analyze both types of traces in Fiddler after installing locally to your workstation.

To open a Fiddler trace, simply open Fiddler and choose File -> Load Archive -> Choose .saz file from your workstation.

To open a HAR trace in Fiddler, open Fiddler and choose Import Sessions -> Choose file type = "HTTP Archive" -> Then choose the .HAR file from your workstation.

Once you have the trace opened the below are a few examples of the data you are looking for.


## Finding unexpected response codes
1. Each web request made by customers browser will be captured in an individual line on left hand side of Fiddler.  Each line contains the URL of the request as well as the HTTP response code found in Fiddler's "Result" column. You will want to look for any responses codes outside of the 200-300 ranges. From Fiddler trace, review each request made where the HTTP code found in Fiddler's Result column isn't a 200-300 level response code

Example:
       ![Screenshot of Fiddler](/.attachments/image-73abcf31-7dda-42cc-92c1-0371fdd0ba7b.png)

Examples of response codes to look for and their descriptions  include the following:

|**HTTP code**| **Error Meaning**  | **Common Cause**  |
|--|--|--|
|400 | Bad Request | Customer made a request which isn't supported |
|401  | Unauthorized\Unauthenticated | Customer made a request without first being authenticated  |
|403  |Forbidden  | Customer made an authenticated request, but is not authorized via permissions |
|404  | Not Found | Customer made a request for a resource which doesn't exist  |
| 500 |Internal Server Error | Service side error that generally requires an ICM to service responsible team|
| 502 |Bad Gateway | Usually service side connectivity error, or a proxy error |
| 503 |Service Unavailable | Service side error that generally requires an ICM to service responsible team||
| 504 |Gateway Timeout | Service side error that generally requires an ICM to service responsible team||


2. On each request found, select the request in Fiddler then choose the "Inspectors Tab" on right hand side of the trace
3. The top half of the inspectors tab shows the details of the browser's request
4. The bottom half shows the response returned from the server and it's details
5. Review the request and response for any details such as Timestamps, Correlation IDs, Session IDs, Tokens, and Errors.  These are usually found within the Inspector tab's sub-tabs labelled Headers, WebForms, Raw, JSON, or XML

Example of Timestamp\Correlation IDs found in Inspectors -> Headers sub tab:
![Screenshot of Fiddler](/.attachments/image-1f1a92e2-89ca-4c20-aacd-56e3be03a359.png)

Example of Raw error found in Inspectors -> Response -> Raw subtab:
![Screenshot of Fiddler](/.attachments/image-afc24eb0-cd12-4e11-a59a-7a33b2b2a110.png)

For more in depth guide on analyzing Fiddler traces review [Introduction to Fiddler \ Inspectors tab](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/184220/Introduction-to-Fiddler?anchor=how-to-use-the-inspectors-tab)

<hr>

# Capturing Network Trace
Occasionally it is necessary to capture network layer captures rather than application layer like Fiddler captures.  To capture a network trace on Windows use the following steps

1. Create a folder at C:\Temp
2. Open administrative command prompt
3. Run cmd:  
    
       netsh trace start capture=yes tracefile="c:\temp\nettrace.etl" 
4. Reproduce the issue
5. Stop trace with cmd:
    
       netsh trace stop
6. Upload the nettrace.etl file and nettrace.cab file to Microsoft for review

NOTES:  .ETL file can be opened with [Microsoft Network Monitor](https://www.microsoft.com/download/details.aspx?id=4865) for analysis

<hr>

# Verifying Web Proxies

Customers utilizing web proxies may experience issues that are hard to capture with Fiddler, you can check if customer is using a proxy via the following steps

1. Select the “Start” button, then type “cmd“.
2. Right-click “Command Prompt“, then choose “Run as Administrator“.
3. Type “netsh winhttp show proxy“, then press “Enter“.
4. Check for user proxies via opening PowerShell prompt and Typing the following cmdlet

   (Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings').proxyServer

You can also check from the user's web browser settings

Firefox
1. Firefox on your computer. Click “Tools,” click “Options” and choose "Options from the menu that slides out.

2. Click the “Advanced” tab in the Options window. Click the “Settings” button in the Connection box.

3. Locate the selected connection option in the list on the Connection tab. If your Internet connection uses no proxy server, the “No Proxy” connection setting option is enabled. If either the “Use System Proxy Settings” or “Manual Proxy Configuration” setting is selected, then your computer accesses the Internet via a proxy server.

Edge
1. Open Microsoft Edge
2. Click the "..." -> Choose Settings in top right of browser.
4. Browse to System
5. Click link for "Open your computer's proxy settings"


Internet Explorer
1. Open Internet Explorer.
2. Click the “Tools” drop-down arrow in the upper-right portion of the browser window. Select “Internet Options.”
3. Click the “Connections” tab in the Internet Options window. Click the “LAN Settings” button. If there is a check mark in the box next to the “Us a proxy server for your LAN” option, then your PC accesses the Web through a proxy server. If there is no check mark in the box, your computer does not use a proxy server.

You can also have user visit a website such as http://www.whatismyproxy.com/ that may detect a proxy if in use

# Other Resources

|Description| Link  |
|--|--|
|CXP Fiddler Basics Training  | [Powerpoint Deck](/.attachments/Fiddler-feaf78d8-6984-4799-9a2d-594858bc4759.pptx)<BR>[sample_traces.zip](/.attachments/sample_traces-4c81a487-dd96-4d0b-b20d-cc259e1d3caf.zip)  |
