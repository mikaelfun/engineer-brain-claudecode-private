---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/DotNet/AspNet AspNetCore/Listing Headers"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Developer/Developer%20Scenarios/DotNet/AspNet%20AspNetCore/Listing%20Headers"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Dev
- cw.AAD-Workflow
- cw.comm-devex
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
 

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Dev](/Tags/AAD%2DDev) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AAD-Dev-Training](/Tags/AAD%2DDev%2DTraining)    

:::template /.templates/Shared/MBIInfo.md
:::

# Listing Headers

[[_TOC_]]

# Overview

# Asp.Net

###### MVC

~~~
//.. Your Controller code..
ViewBag.Headers = HttpContext.Request.Headers;
//..

// index.cshtml
@foreach (var h in ViewBag.Headers)
            {
                <tr><td>@h.ToString()</td><td>@ViewBag.Headers.Get(h.ToString())</td></tr>
            }
~~~ 

## Transcluded templates (1)
 
 

- Template: MBIInfo
([View](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?wikiVersion=GBmaster&pagePath=%2f.templates%2fShared%2fMBIInfo%0d))
