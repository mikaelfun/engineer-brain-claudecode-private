---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Analyzing Windows Performance Recorder (WPR) data"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FAnalyzing%20Windows%20Performance%20Recorder%20(WPR)%20data"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::


In order to analyze WPR traces you will need Windows Performance Analyzer tool installed on your diagnostics machine. You can obtain it by installing Windows Performance toolkit from this location: https://docs.microsoft.com/windows-hardware/test/wpt/. After installation it will be installed in a location similar to this: C:\Program Files (x86)\Windows Kits\10\Windows Performance Toolkit\wpa.exe 

# Loading Traces:
1. Load WPR traces in WPA
   - Copy the Zip file containing the WPR traces from customer machine and expand into local folder. 
   - Load the HighCPU.etl in WPA UI. 

2. Configure and load symbols for WPA UI
   - Based on the MMA version installed on the customer machine, copy over agent version specific symbols locally from  following shares, below are paths to version 18001: 
```
   \\cdmbuilds\archive\OnPrem\MonAgentMain\MonAgent\builds\MonAgent.MonAgentMain\EN\18001\symbols\signed\amd64\dll 
   \\cdmbuilds\archive\OnPrem\MonAgentMain\MonAgent\builds\MonAgent.MonAgentMain\EN\18001\symbols\signed\amd64\exe 
```
3. In WPA UI, go to Trace � Configure Symbol Paths and add local folders containing the symbols download above. 
<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=%2F.attachments%2Fimage-98240b62-b148-48da-bc8f-7076f7c25958.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>

4. In WPA UI, click Trace � Load symbols and wait for symbols to get loaded.
<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=%2F.attachments%2Fimage-8633a090-8004-489e-ad5c-4104fce53b7d.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>

# Analyzing Traces

1. Double click Computation Pane in WPA UI. 

2. Drill down into the MonitoringHost.exe process, clicking on the stack frame with highest sample count. 

3. Do so until an OMS module is encountered. 

width=2336  height=774 
alt="3 MonitoringHost.exe (2504) &#10;[Root] &#10;l- ntdII.dII!RtIUserThreadStart &#10;kerneB2.dII!8aseThreadInitThunk &#10;clr.dII!ThreadpooIMgr:: CompletionPortThreadStart &#10;l- clr.dII!8indIoCompIetionCaIIbackStub &#10;clr oCompIetionCaIIbackStubEx &#10;clr oCompIetionCa118ack_Worker &#10;clr.dII!CaIIDescrWorkerWithHandIer &#10;clr.dII!CaIIDescrWorkerInternaI &#10;Ulnt32, System.Threading.NativeOverIapped*) &#10;- Ulnt32, System.Threading.NativeOverIapped*) &#10;l- Microsoft.EnterpriseManagement.Mom.ModuIes.LogWatcherForCIoudDataSource!Micrcscft.EnterpriseManagement.HeaIthSer.'ice.LcgIVat... &#10;4,839 &#10;4,812 &#10;4,812 &#10;4,785 &#10;4,785 &#10;4,685 &#10;4,356"/>

4. This is the OMS module that is causing high CPU. In our example above, that would be:  Microsoft.EnterpriseManagement.Mom.Modules.LogWatcherForCloudDataSource. 

5. Determine the team that owns this module
   - Search for the module name in AdvisorKnowledge repository. This is the repository where all OMS solutions are authored. 
   - In our example that would be :
https://msazure.visualstudio.com/DefaultCollection/One/_git/Mgmt-LogAnalytics-AdvisorKnowledge?path=%2Fsrc%2FProduct%2FIPacks%2FManagementPacks%2FLogManagement%2FCustomLogUpload%2FCustomLogModules.mpx&version=GBmaster&line=17&lineStyle=plain&lineEnd=22&lineStartColumn=1&lineEndColumn=32 
<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=%2F.attachments%2Fimage-734efe2f-146b-4e7e-b23a-15bcae50dc8a.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>
   - To determine who owns this module you can try a few things:
      - Look into History for recent check-ins 
      - Look for solutions listed here: [Owner - Wiki](https://microsoft.sharepoint.com/teams/Application_Insights/ServiceDelivery/_layouts/15/WopiFrame.aspx?sourcedoc={e7a12218-0d3c-4c1b-ad65-c33f294c5aa6}&action=view&wd=target%28Log%20Analytics.one%7C8fcdea55-13b4-4c4e-9c03-c6a9cf179105%2FSolution%20Owner%20-%20Wiki%7Cb2f62974-2934-4a45-8c9c-72efa2eb1819%2F%29&wdorigin=703) 
      

---
Sources
---
https://microsoft.sharepoint.com/teams/WAG/EngSys/Monitor/Shared%20Documents/Agent/MonitoringHost%20High%20CPU%20Analysis.docx?web
