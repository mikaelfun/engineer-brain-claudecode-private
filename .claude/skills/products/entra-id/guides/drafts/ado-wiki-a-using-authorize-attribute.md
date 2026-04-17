---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/DotNet/AspNet AspNetCore/Using Authorize Attribute"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Developer/Developer%20Scenarios/DotNet/AspNet%20AspNetCore/Using%20Authorize%20Attribute"
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

# Using the [Authorize] Attribute

[[_TOC_]]

# Overview

# Validating Roles

### MVC

~~~
[Authorize(Roles = "Admin,Member")]
~~~

### Blazor/Razor

# Authentication Schemes

### MVC

~~~
[Authorize(AuthenticationSchemes =
  JwtBearerDefaults.AuthenticationScheme)]
~~~

### Blazor/Razor 

## Transcluded templates (1)
 
 

- Template: MBIInfo
([View](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?wikiVersion=GBmaster&pagePath=%2f.templates%2fShared%2fMBIInfo%0d))
