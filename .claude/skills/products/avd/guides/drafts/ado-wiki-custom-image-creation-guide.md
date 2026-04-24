---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Custom Images/How to create a custom image"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Custom%20Images/How%20to%20create%20a%20custom%20image"
importDate: "2026-04-21"
type: guide-draft
---

Useful articles:
1. [Device images in Windows 365 | Microsoft Learn](https://learn.microsoft.com/en-us/windows-365/enterprise/device-images#image-requirements)
2. [Deprovision or generalize a VM before creating an image - Azure Virtual Machines | Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-machines/generalize#windows)
3. [Create a legacy managed image in Azure - Azure Virtual Machines | Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-machines/capture-image-resource#create-a-managed-image-from-a-vm-using-the-portal)

---

*   Create a new VM in Azure.
*   When configuring the VM, it is recommended to use the Windows 365 images as they are already optimized for the Cloud PCs.
    * ![image.png](/.attachments/image-53d12740-0604-492f-9e81-c8e0750f6e2a.png)

  
*   Once the golden VM has been created, connect on the machine and start installing the required apps and making the necessary configurations. At the same time be aware of the requirements from [Device images in Windows 365 | Microsoft Learn](https://learn.microsoft.com/en-us/windows-365/enterprise/device-images#image-requirements).
    *   **Please do not domain join, Azure AD Join or enroll the golden VM in Intune.**

*   After the apps have been installed and made all the configurations, make sure to restart the golden VM before proceeding with the steps below.

*   Next, open CMD and run as **admin**.
*   Type **cd Sysprep**
*   Type **sysprep**
*   After the sysprep window shows up, select the **Generalize** option and set the Shutdown Options to **Shutdown**:
    *   ![image.png](/.attachments/image-aeaf6cd4-74f1-486e-8ad9-d385ebb2163d.png) 
  
*   Wait until the sysprep is completed, **you will be disconnected automatically**.
*   Wait until the VM reports as stopped within Azure:
    *   ![==image_0==.png](/.attachments/==image_0==-b046e9dc-3963-4f0f-bf32-6ae305ce21c8.png) 

*   Afterwards, click on capture from Azure.
    *   ![==image_1==.png](/.attachments/==image_1==-a368c3c8-391e-42d2-b3c9-ea0f36a38da2.png) 

*   Set the share image to Azure to:
    *   ![==image_2==.png](/.attachments/==image_2==-ffdd8f67-9999-4e43-9ed4-c904724ebe6c.png) 
*   Wait until the image has been successfully captured.
*   Now, navigate to Intune > Windows 365 > Custom images > Add.
*   Add a name and version and select the subscription and the image that you have just created.