---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Viewing Alerts and Incidents/How to Export Incident"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Viewing%20Alerts%20and%20Incidents/How%20to%20Export%20Incident"
importDate: "2026-04-07"
type: troubleshooting-guide
---

This block has a brief introduction on how to export incidents with Details to PowerBI and make a monthly report as a dashboard.

First thing, first. You need to know where to get the data.

We will be using below API

https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.OperationalInsights/workspaces/{workspaceName}/providers/Microsoft.SecurityInsights/cases?api-version=2019-01-01-preview

making all the needed replacements for {subscriptionId}, {resourceGroupName}, and {workspaceName}.

## PowerBI - Getting Data

1. Start PowerBI desktop from your computer. When introduction Window opens, click on the Get Data link

2. Click on Other and then select Blank Query from the bottom of the list and click Connect

3. Open the Advanced Editor window, and enter below code

```
let
    GetCases = (Path) =>
        let
            Source = Json.Document(Web.Contents(Path)),
            NextList = @Source[value],
            result = try @NextList & @GetCases(Source[nextLink]) otherwise @NextList
        in
            result,
    AllCases = GetCases("https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.OperationalInsights/workspaces/{workspaceName}/providers/Microsoft.SecurityInsights/cases?api-version=2019-01-01-preview")
in
    AllCases
```

If prompted with the PowerBI login page, select Organizational account and login using the same credentials you use to login to Azure.

## Expanding Data in PowerBI

So now you have data but it is not that usable. Luckily PowerBI makes it easy to expand this information into something more usable.

Right click on the List entry (black text with orange background) and NOT any of the lines under it. Select the To Table entry. If your menu does not look like the one below, make sure you right clicked on the word List itself and not anything beneath it.

This will open a new window called To Table. Leave all the entries as is and click OK.

This still doesn't look too usable. It is just one column that is made up of Records. PowerBI can help with that as well!

On the right side of the Column1 entry is an icon with arrows pointing both ways. This will allow you expand that column into its underlying parts. Clicking on it will show you a listing of the field that make up the record.

Select the fields that you want to have expanded and click OK. Don't worry about selecting all the columns, you can delete them later if you decide you don't need them. This will expand the column.

The Column1.Properties column is also comprised of Records and also the expansion icon on the right side. Click it to expand that column.

You can continue to expand the other columns that have a Record data type as needed.

There are also some, like Column1.properties.labels that have a List data type. You can expand these as well but what they will do is duplicate the row for each entry in the List. So if a column is comprised of the values A, B, and C, there will be one row that has A as the value that column, one with B, and one with C.

## Conclusion

PowerBI can be used with the Azure Sentinel REST APIs to get Incident, and other information, that can then be used to generate reports. By using recursion in the web calls, you can assure that you get all the information you need to properly create the reports.
