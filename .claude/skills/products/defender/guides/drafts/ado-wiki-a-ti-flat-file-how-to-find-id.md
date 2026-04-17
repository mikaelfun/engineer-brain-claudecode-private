---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Troubleshooter guides/[TSG] - Threat Intelligence/[TSG] - Import of indicators from a flat file/How to find ID"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FTroubleshooter%20guides%2F%5BTSG%5D%20-%20Threat%20Intelligence%2F%5BTSG%5D%20-%20Import%20of%20indicators%20from%20a%20flat%20file%2FHow%20to%20find%20ID"
importDate: "2026-04-07"
type: troubleshooting-guide
---

When opening an IcM about some issue with a file import, it's always very useful to include the file id, so we can find it in our logs. This page explains how to find a file's id.

1. Go to "manage imports" blade:
![4.png](/.attachments/4-15e5655b-3ae5-45af-8fbe-592d03c79785.png)

2. Open the browser's developer tools (you can do it by pressing F12 in most browsers).
3. Go to the network tab: 

![5.png](/.attachments/5-506eabe6-ed35-4e74-9156-1acb1eef9015.png)
4. Refresh the page using the refresh button:
![6.png](/.attachments/6-ab6dcc5a-0cb8-409b-b2bd-00cde7e1d3a3.png)

5. You will see that a single call was sent:
![7.png](/.attachments/7-677c8b4e-626e-4fc8-8d93-df29a577fbaa.png)

6. click that row and go to "Preview". The response will look like this:
![8.png](/.attachments/8-04311109-7a3d-4ec5-8446-46a4c8ea2312.png)

7. you can find the file you're looking for based on its location in the grid. For example, if you want to file the id for the second file in the grid, you would go to index 1, expand it, and you will see the id:
![9.png](/.attachments/9-f6ef2d2a-13d7-49b7-98ea-ce63dad7618d.png)

You can verify that this is the right file based on its "properties" - name, createTime, etc.
![10.png](/.attachments/10-17c0fe6a-82e9-4cdb-adac-a1c6bf77c10d.png)

Please attach this file id when you open an IcM.
