---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Windows/How-To/How to parse MAEventTable.CSV files during AMA for Windows troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FAzure%20Monitor%20Agent%20(AMA)%20for%20Windows%2FHow-To%2FHow%20to%20parse%20MAEventTable.CSV%20files%20during%20AMA%20for%20Windows%20troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

Applies To:
- Azure Monitor:- Azure Monitor Agent (Windows)

Note: All IPs and machine names in this page are from test lab and don't compromise any Pii data.

[[_TOC_]]

##Description:

When we perform our troubleshooting trying to resolve issues related to the Azure Monitor Agent for Windows extension (AMA), we come across a huge amount of information that we must filter to isolate the cause of the problem. 

Among the logs that we can collect using the troubleshooter script available and mentioned in our official documentation to help us in our log collection, perhaps, the most important is MAEventTable.CSV

However, this file may contain numerous information that must be filtered. To facilitate the process, there is a web application developed by PG (Victor Lu) that allows us to parse the information in a graphic way and highlight our findings in a simple way.


<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note!**

If you have come to this link looking for how to capture logs, you may want to start by visiting first the following related links:

https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/620123/Troubleshooting-Azure-Monitor-Agent-(AMA)-for-Windows

https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/540637/How-to-Capture-Event-Table-Logs-for-Azure-Monitor-Agent-for-Windows
   
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/817902/How-to-collect-logs-before-opening-IcM-incident

https://learn.microsoft.com/azure/azure-monitor/agents/use-azure-monitor-agent-troubleshooter
 
</div>

Basically what we have to do is access the application and select the file that we want to parse. The result will look something like this.

![MAEVENTABLEparser.png](/.attachments/MAEVENTABLEparser-345e8664-6b48-427a-be80-eac4e717a51c.png)

![MAEVENTABLE.png](/.attachments/MAEVENTABLE-bd9c8ced-de58-4ead-9e5e-95cfb5ef05a1.png)

##Link to the tool:

To execute this tool you must access using the following link below.

https://victlu.github.io/www/

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#FD7158">

**Important!**

THIS IS AN INTERNAL TOOL, DO NOT SHARE THIS LINK WITH CUSTOMERS
</div>

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#FD7158">

**Important!**

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</div>





