---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Analytics/ASC - ASI Alert Analytic Rule Cleanup"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Analytics/ASC%20-%20ASI%20Alert%20Analytic%20Rule%20Cleanup"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Cleanup of Analytic Rule

In case of a ASI rule Alert troubleshooting the Analytic Rule is given with break characters in Azure Support Center.

### Example:
```
set query_now = datetime(2022-02-03T14:00:56.1270265Z);\r\n OfficeActivity\r\n | where TimeGenerated > ago(1d)\r\n | where MailboxOwnerUPN contains \".be\"\r\n | extend DateHour = bin(TimeGenerated, 1h)\r\n | where OfficeWorkload=~ \"Exchange\" and Operation =~ \"HardDelete\" and ResultStatus =~ \"Succeeded\"\r\n | summarize HourlyCount=count(), TimeGeneratedMax = arg_max(TimeGenerated, *), IPAdressList = make_set(Client_IPAddress), SourceIPMax= arg_max(Client_IPAddress, *), ClientInfoStringList= make_set(ClientInfoString) by MailboxOwnerUPN, Logon_Type, TenantId, UserType, TimeGenerated = bin(TimeGenerated, 1h) \r\n // | project TimeGenerated, MailboxOwnerUPN, Folder, \r\n// Only considering operations with more than 25 hourly count to reduce False Positivies \r\n | where HourlyCount > 20 //change here\r\n | order by HourlyCount desc","Query Start Time UTC":"2022-02-02 14:00:56Z","Query End Time UTC":"2022-02-03 14:00:56Z","Analytic Rule Ids// | project TimeGenerated, MailboxOwnerUPN, 
```

The following python script can help you clean up the query from the "\r\n" characters and comments:

```python
dirtyAnalytic = "<InsertAnalyticRuleHere>"

commentindex=dirtyAnalytic.find("//")

while (commentindex != -1):
    stringa= dirtyAnalytic[:commentindex-1]
    stringb= dirtyAnalytic[commentindex:]
    
    stringa=stringa.replace("\r\n", "")
    dirtyAnalytic=stringa+stringb
    commentindex=dirtyAnalytic.find("//")

    endofstringindex=dirtyAnalytic.find("\r\n")
    substring1 = dirtyAnalytic[commentindex:endofstringindex]
    
    dirtyAnalytic=dirtyAnalytic.replace(substring1,"")

step1string=dirtyAnalytic.replace("\r\n","")
cleanAnalytic= step1string.replace('\"','"')

print (cleanAnalytic)
```

### Steps:
1. Copy and Paste the code in a Python IDE or use an online Python runner
2. Add your Analytic Rule to the designated field
3. Run the code - the result will be the clean Analytic Rule
