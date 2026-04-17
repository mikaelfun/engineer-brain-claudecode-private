---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/General/How To Capture a HAR file"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FGeneral%2FHow%20To%20Capture%20a%20HAR%20file"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

This article has been deprecated and partially replaced with the following one: [How to capture a browser trace (HAR) for troubleshooting](/Azure-Monitor/How%2DTo/General/How-to-capture-a-browser-trace-\(HAR\)-for-troubleshooting)
</div>



[[_TOC_]]

#Browser F12 Network Trace
Most browsers have the ability to capture network data on a webpage which will show data such as request headers, response headers, and duration times. We often use this to troubleshoot issues with the Azure LA Portal UI loading.

## Steps to capture F12 Network Trace
1. 	Open your browser and navigate to webpage experiencing the issue
1. 	Push F12 on your keyboard, this will open the developer tools
1. 	Click on the Network tab and ensure that recording is occurring
		a. In IE, it looks like a Play button
 		b. In Chrome, it looks like a red Record button
1. 	Click into the address bar and hit enter to reload the page, please do NOT refresh it. Reproduce the issue. 
1. 	Click the Stop button to stop recording
1. 	Please save out the trace, zip it, and reply with it attached to the case owner  
a. In IE, click the icon that looks like a floppy disk
<br> b. In Chrome, right click on the first line under the Name column on the network tab and select: Save as HAR with content


#Fiddler 
Sometimes a simple browser network trace is insufficient as the behavior is happening on a client application (CLI) or spans multiple browser tabs. In such cases we turn to Fiddler trace, which will capture the same kind of decrypted HTTPS network data, but can be run independent of a single browser tab. 

## Steps to capture Fiddler Trace
1. Download and install Fiddler: https://www.telerik.com/download/fiddler/fiddler4
1. Close any instances of your web browser.
1. Launch Fiddler by clicking **Start, All Programs,** and **Fiddler**.
1. Pull down Fiddler�s **Tools** menu and choose **Fiddler Options**.
1. Click the **HTTPS** tab, make sure there are checks in both the **Capture** and **Decrypt** checkboxes.
1. When asked if you want to **Trust the Fiddler Root certificate**, click **Yes**.
1. When asked **Do you want to install this certificate**, click **Yes**.
1. When asked to **Please confirm that you wish to Add the following certificate to your PC�s Trusted Root List**, click **Yes**
1. Click **OK** on the **TrustCert Success** dialog.
 Once completed with the HTTPS tab it should look similar the following
![image.png](/.attachments/image-c15cc5cc-11db-4e03-9236-9fcfc85c948a.png)
1. Click **OK** on the **Fiddler Options** dialog.
1. Reproduce the problem. 
1. Pull down Fiddler�s **File** menu and choose **Save All Sessions**.
1. Type a file name and click **Save**.
1. Pull down Fiddler�s **File** menu and choose **Exit**.
1. Please upload the .Har capture to your IcM**



