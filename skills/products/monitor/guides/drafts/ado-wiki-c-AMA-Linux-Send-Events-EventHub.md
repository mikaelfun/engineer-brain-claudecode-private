---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Send events manually to Event Hub from Azure Linux VM"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Send%20events%20manually%20to%20Event%20Hub%20from%20Azure%20Linux%20VM"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This How-To article aims at simplifying troubleshooting the "_Use AMA to send data to Event Hubs preview feature below_":
[Send data to Event Hubs and Storage (Preview) - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-send-data-to-event-hubs-and-storage?tabs=windows%2Cwindows-1).

AMA collects data from the VM and sends it directly to an Event Hub.
During troubleshooting, we can wonder if the Events Hub is correctly set up to receive data from AMA.
This How-To can help to answer the following questions:

1. Does the VM has RBAC access to send data to the Events Hub?
2. Is the VM able to send data to the Events Hub using private link?
3. Is the VM able to push data to the Events Hub?

# Prerequisites
1. Azure Linux VM machine with a managed identity
2. Event Hub resource using at least the _Standard_ tier. 
The basic tier works fine too but does not have the networking setting below that allows controlling public network access and configuring private links:

![image.png](/.attachments/image-b301d54a-1556-4069-9bd7-c2ccdf0e7ee2.png =1000x)

More info on the event hub tiers below:
[Compare Azure Event Hubs tiers - Azure Event Hubs | Microsoft Learn](https://learn.microsoft.com/en-us/azure/event-hubs/compare-tiers#features)

# Walkthrough
## Step 1: Install PowerShell
```
sudo snap install powershell --classic
```
![image.png](/.attachments/image-58cafba0-0d7c-40c1-832b-623567435551.png)

## Step 2: Create a custom PowerShell script to send dummy data to the Event Hub

   ###a. Create a PowerShell file in your directory of choice
```
cd /tmp
mkdir test
cd test
touch send_events.ps1
ls
```
![image.png](/.attachments/image-e1bfecb0-e9e8-42ad-8710-aea21851267b.png)

###b. Open the file

```
nano send_events.ps1
```

###c. Add the custom script

Paste the following script inside the send_events.ps1 file

```
# This script sends test messages to an Azure Event Hub using the REST API and Managed Identity for Azure Resources.
# The VM utilized must have system assigned or managed assigned identity on it. This script uses the Azure meta-data service
# to get access to the event hub. 
#
# When running this script, it will send $loopCount messages to the event hub. The messages are string with the
# time the message was sent in UTC and the string "Test message". The script will wait 100 milliseconds between each message.
#
# This will allow a user to
# (1) Make sure the path from the VM to the event hub is open
# (2) Capture a sample of data in the event hub to test the arrival of the data
#
# This script was run on PowerShell Core 7.4, but should be compatible with PowerShell 5.1 and later.

# Variables to set
$eventHubNamespaceName = '<event_hub_namespace>'
$eventHubName = '<event_hub_name>'
$clientId = '<client_id>' # Client ID of the managed identity to authenticate with
$loopCount = 10

$tokenUrl = "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&client_id=$($clientId)&resource=https://eventhubs.azure.net"

try {
        $token = Invoke-RestMethod -Uri $tokenUrl -Headers @{ Metadata = "true" }
        $accessToken = $token.access_token
} catch {
       Write-Output "Error: $_"
}

$eventHubAddress = "https://$($eventHubNamespaceName).servicebus.windows.net:443/$eventHubName/messages"
$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

for ($i = 0; $i -lt $loopCount; $i++) {
    $body = @{
        "body" = "$(Get-Date ([datetime]::UtcNow)) - Test message"
    } | ConvertTo-Json

    Write-Output "Sending message $i"
	try {
       Invoke-RestMethod -Uri $eventHubAddress -Method Post -Headers $headers -Body $body
       
    } catch {
       Write-Output "Error: $_"
    }

   Start-Sleep -Milliseconds 100   
}

```

<div style="background-color: #ffcccc; color: black; padding: 10px; border-radius: 5px;">
 Warning: <br>Press 'Ctrl + S' to save and 'Ctrl + X' to exit the nano editor".

</div>

## Step 3: Specify your subscription details on the script

###1. Event Hub Namespace ($eventHubNamespaceName)
This is the name of your Event Hub Namespace.

   Example below:

   ![image.png](/.attachments/image-b6a314e8-6dbc-4ba6-8054-8f86599be2e2.png =300x)

###2. Event Hub Instance name ($eventHubName)
This is the name of your event hub instance.

   Example below:
   ![image.png](/.attachments/image-a5b0b5e0-9521-454c-be28-bff8f27b01ab.png =300x)

###3. Client ID of your VM's managed identity ($clientId)
This is the Microsoft Entra Client ID of your VM's managed identity

a. System-assigned identity example

   ![image.png](/.attachments/image-5bd9139b-471d-4cad-babd-4c379a45df5d.png)

<div style="background-color: #ffcccc; color: black; padding: 10px; border-radius: 5px;">
 Warning: <br>Type the VM name in the search bar and clear all filters on the search.
<br> Also make sure to search in "Enterprise Applications" and not in "App Registrations".

</div>

   b. User-assigned identity example

   ![image.png](/.attachments/image-fb73a08a-2795-42ce-969a-0b57ce1286fa.png =600x)
   ![image.png](/.attachments/image-98dedddd-0ad2-4826-8884-7073bbb12d49.png =600x)

## Step 4: Run the script and check the dummy events on Event Hub

###1. Run the script

```
pwsh send_events.ps1
```
![image.png](/.attachments/image-7aedc263-213a-4347-b877-8423a610d539.png =500x)

If sending the events succeeds as above, then this means that the Event Hub is set up correctly to receive data from AMA.

###2. Check the events on Event Hub

![image.png](/.attachments/image-0aa8d289-79fa-411a-95a5-c18ab3c1d00b.png)

# Some Failure scenarios

### 1. VM has no RBAC access on the Event Hub

Error Message:
_"Error: Response status code does not indicate success: 401 (SubCode=40100: Unauthorized : Unauthorized access for 'Send' operation on endpoint 'sb://<eventhubname>.servicebus.windows.net/<eventhubinstancename>/messages'. Tracking Id: f13db8ec-6a14-437a-87c1-af87a56d48b7_G2)"_

![image.png](/.attachments/image-1d679755-a190-4fb9-b013-c0eec9519de9.png =1000x)

<div style="background-color: #ffcccc; color: black; padding: 10px; border-radius: 5px;">
 Warning: <br>If you're using your MCAPS internal subscription to test this, we have seen in some cases that an automation tool automatically deletes role assignments as seen below in the event hub activity logs: <br> <br>

![==image_0==.png](/.attachments/==image_0==-b36a8f6a-b0e2-48a2-9026-a7428858320c.png) 

If this happens, use your MCAPS external subscription instead. <br>
More info below:
[Support Subscriptions - Overview](https://dev.azure.com/OneCommercial/NoCode/_wiki/wikis/NoCode.wiki/183/Support-Subscriptions)
</div>

### 2. Event Hub has no private endpoint set up and has Public network access disabled


![image.png](/.attachments/image-dad33f3b-ba55-4010-b909-6d62f0e7ef8e.png)

![image.png](/.attachments/image-c9835983-3509-4b8c-92db-bb9b06f98b70.png)

Error Message:
_"<Error>
  <ErrorCode>401</ErrorCode>
  <Detail>Ip has been prevented to connect to the endpoint.
           For more information see:
           Virtual Network service endpoints:
              Event Hubs: https://go.microsoft.com/fwlink/?linkid=2044192
              Service Bus: https://go.microsoft.com/fwlink/?linkid=2044235
           IP Filters:
              Event Hubs:  https://go.microsoft.com/fwlink/?linkid=2044428
              Service Bus: https://go.microsoft.com/fwlink/?linkid=2044183
     TrackingId:4f9e0fff-31c3-4c39-a735-1280ca63a0cc_G20, SystemTracker:log-playground-hub.servicebus.windows.net:hub2/messages, Timestamp:2025-01-29T11:43:33</Detail>
</Error>"_

![image.png](/.attachments/image-5cf2f0f3-d10d-40bb-8f1f-321410b47216.png =1000x)

### 3. DNS Resolution error due to private endpoint configuration
![image.png](/.attachments/image-04a8cbab-c48a-42bb-b549-02651c5f98dc.png =1000x)
![image.png](/.attachments/image-7f461e35-94f0-4c50-b66e-b95a89d8a4f9.png =1000x)

Error message:
_"Name or service not known"_

![image.png](/.attachments/image-7cde78f2-eb4f-4c24-a778-4d8ff0eee746.png =900x)