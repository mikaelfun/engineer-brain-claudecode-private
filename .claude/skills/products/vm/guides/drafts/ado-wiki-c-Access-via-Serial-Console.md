---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Access via Serial Console_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/Access%20via%20Serial%20Console_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Summary

Azure Serial Console feature is tool you will use for emergency type of access to a machine and could work even if the machine doesn't have connectivity. This feature work in both windows and Linux machines however to do so, the guest OS needs to be setup properly to allow this connection.

## Reference

  - For more information on this feature, its limitation and how it works, please refer to [Azure Serial Console](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496037)

## Prerequisite

  - For Linux VMs, the guest OS needs to be setup to allow log in via ttyS0

  - For Windows VMs, the following flags should be setup on the boot configuration data:
    
    <span class="small"></span>
    
    ```
        {bootmgr} displaybootmenu yes
        {bootmgr} timeout 5
        {bootmgr} bootems yes
        /ems {current} on 
        /emssettings EMSPORT:1 EMSBAUDRATE:115200
    ```

  - For more information and ways to set this up, refer to [Azure Serial Console](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496037) on the section *How to enable this feature*

## Instructions



::: template /.templates/SME-Topics/Cant-RDP-SSH/Azure-Virtual-Machine-RDPSSH-UseEMS-Template.md
:::



::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::