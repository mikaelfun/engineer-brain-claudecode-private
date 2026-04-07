---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Host or AVD Agent/How to determine if a Session Host was created from a custom or from a gallery image"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Workflows/Host%20or%20AVD%20Agent/How%20to%20determine%20if%20a%20Session%20Host%20was%20created%20from%20a%20custom%20or%20from%20a%20gallery%20image"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]
##Purpose

The main idea of this article is to help you identify if a Session Host was created from a custom or from a gallery image using **Azure Support Center (ASC)**

##Steps to identify it

1. Open the case on ASC 
2. Go to the Resource Explorer module and select Resource Provider

![image.png](/.attachments/image-95eb229f-9be5-44e2-9344-14bc872d3ac3.png)

3. If you have the name of the Virtual Machine that you want to check, type its name on the search bar and then click on **Virtual machine name + (Microsoft.Compute/VirtualMachines)**

![image.png](/.attachments/image-7fd715cc-5f94-4f3e-9904-0deedd387666.png)


4. In case you do not have the name of the Session Host, _click_ on **Microsoft.DesktopVirtualization**, Hostpools, _click_ on the Host Pool and find the name of the **Session Host** on the right chart. After that, proceed with the **Step 3**

![image.png](/.attachments/image-489d138e-2162-46f9-832e-edb81258a0cb.png)

5. Once you _click_ on the **Virtual Machine** name, it will open the Virtual Machine section. By default, the tab **V2 Properties** is selected, but in case it is not opened, please open that tab.

![image.png](/.attachments/image-fc32394f-8a45-4b59-bdbe-085b3fef9f37.png)

6. Scroll down until the **Storage Profile** module and look for the **Create Option** setting

![image.png](/.attachments/image-9ceee791-3883-411c-92b2-5178614b80f3.png)

7. Also, scroll down until the **OS Profile** module and look for the **OS Created From** setting

![image.png](/.attachments/image-99b6c016-b036-492b-b3a8-f2fa65786e4c.png)

##Summary

- If **OS Created From** is set as **Platform Image** that means this Virtual Machine was created using a _Gallery_ Image
- If **OS Created From** is set as **Generalized Disk** that means the Virtual Machine was created using a _Custom_ Image
