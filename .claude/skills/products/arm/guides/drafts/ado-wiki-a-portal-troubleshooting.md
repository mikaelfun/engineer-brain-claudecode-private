---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Portal troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FTroubleshoting%20Guides%2FPortal%20troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Determining Portal blade
Pressing `Ctrl+Alt+D` in the Azure Portal enables diagnostic tools in the form of yellow boxes over the Portal UI.

Each yellow box has a title, which indicates the name of the blade. This name usually helps determine who owns that blade as well:
- If it says *Hubs*, that means the blade is generic and owned by the Portal team.
- If it does not say *Hubs*, then the name of the blade should point to the service that built that blade.

## Looking at the Portal code
The portal JavaScript code is minified by default, which means it is almost impossible to read by a human. However, this [link](https://ms.portal.azure.com/?clientOptimizations=false) can be used to remove the portal optimizations:
```
https://ms.portal.azure.com/?clientOptimizations=false
```
What this means now is that rather than seeing optimized JavaScript code, which is harder to debug as you need to map them to the TypeScript files. This will load the source in developer tools with the TypeScript code.

By [determining the Portal blade](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623818/Portal-extension-analyzer?anchor=determining-portal-blade), the title of the blade will indicate which TS file to look at. Search for `<Title>.ts` in the JavaScript console to locate the TypeScript file that contains the code for that blade.

## Use the extension analyzer
See [[TOOLS] Portal extension analyzer](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623818).

## Use external public portal instead of internal portal
By default, when internal MSFT users go to portal.azure.com they are redirected to ms.portal.azure.com which is an internal version of the portal where new features are tested.  To bypass this redirection, append the `feature.customportal=false` parameter.
```
https://portal.azure.com/?feature.customportal=false
```
