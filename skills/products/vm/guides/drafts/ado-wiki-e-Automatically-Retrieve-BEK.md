---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FAzure%20Disk%20Encryption%20%28ADE%29%2FHow%20to%20Automatically%20Retrieve%20the%20BEK_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.Azure-Encryption
- cw.Reviewed-04-2023
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::

 

[[_TOC_]]


##Summary
This PowerShell script was designed to be used locally or from Azure Cloud Shell, to eliminate the need of PowerShell prerequisites needed in the manual process which caused delays or additional issues due to the diversity of environments in terms of PowerShell version, OS version, user permissions, internet connectivity etc.


##Advantages

- The duration for this process using this script is an average of 3 minutes, which is far more less than the manual process which can take hours depending on the complexity of scenarios, environment variables, customer limitations, level of expertise.<br>
- Reduced risk of human errors in gathering and using encryption settings.<br>
- No internet access is required on the Rescue VM, which is useful for users with restricted environments if it is used from Azure Cloud Shell.<br>
- Insignificant number of initial input data needed to run this script.<br>
- Additional checks during this process to reduce or prevent the risk of a script failure due to the variety of environments.<br>
- Additional explanatory details are offered during the process, which helps the user to learn theoretical aspects along the way.<br>
- Error handling for the most common errors in terms of auto-resolving or guidance for the manual process of resolving the issue.<br>
- Offers the possibility of using the script multiple times if the troubleshooting scenario requires this.<br>

##Supported scenarios

- Retrieve secrets (BEK or KEK) for Windows or Linux VMs encrypted with Single Pass managed disks (OS or data).<br>

##Unsupported scenarios
**Note: The same unsupported scenarios applies for both Windows and Linux VMs.**
- Retrieve secrets (BEK or KEK) for encrypted VMs with **Single Pass unmanaged disks** (OS or data).<br>
- Retrieve secrets (BEK or KEK) for encrypted VMs with **Dual Pass managed disks** (OS or data).<br>
- Retrieve secrets (BEK or KEK) for encrypted VMs with **Dual Pass unmanaged disks** (OS or data).<br>

##Requirements

- If run locally, VM from which you are running the script, needs to have internet access.<br>
- If run from Azure Cloud Shell, user needs access to Azure Cloud Shell.<br>
- The user needs to have access to assign the proper permissions if they do not already have them.<br>
   - Permission that will be assigned by the script based on the two scenarios: <br>
      - If permission model on the Key Vault is 'Access policy’ based:<br>
         - It will set for current user “list” and “unwrapkey” permissions on the keys from the Key Vault.<br>
         - It will set for current user ‘list” and “get” permissions on secrets from the Key Vault.<br>
      - If permission model on the Key Vault is ‘RBAC’ based:<br>
        - It will assign to current user the "Key Vault Administrator" role.<br>
   
##Troubleshooting scenarios

- When can the script be used locally:<br>
   - When cx cannot create a new VM due to cost, permissions, does not have access to Azure Cloud Shell or complexity of the operation, but already has an existing VM with internet access that he can use.<br>
- When can script be used in Azure Cloud Shell:<br>
   - When user has access to Azure Cloud Shell but cannot create a new VM due to cost, permissions, complexity of the operation or does not have an existing VM or existing VM with internet access that he can use.<br>

##Rescue VM Preparation

1. Take a snapshot of the encrypted disk and create a disk from that snapshot.<br>
2. Create or use an existing Rescue VM.<br>
3. Attach the Disk as a Data Disk.<br>

##Collect Disk and Subscription Information

1. Go to Azure portal: https://ms.portal.azure.com <br>
2. Select the Rescue VM that you attached the Encrypted Disk (1) --> Select Disks (2) --> Select the Disk you need to retrieve the BEK file (3).<br>
   - <br/>![RetrieveBEK1](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-image-1.png) <br>
3. Collect and Save the Disk Name (1 + 2) --> Collect and Save the Subscription ID (3).<br>
   - <br/>![RetrieveBEK2](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-image-2.png) <br>


##Local Windows - Inside the Rescue VM

1. Download the “GetSecret” script file to your profile folder.<br>
   - Option 1: In your computer, open the PowerShell with administrator permissions and run the following commands to download the script:<br>
      - [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 <br>
      - Invoke-WebRequest -Uri "https://raw.githubusercontent.com/gabriel-petre/ADE/main/GetSecret/GetSecret_1.0.ps1" -OutFile c:\$env:HOMEPATH\GetSecret_1.0.ps1 <br>
      - It will be saved inside in the current User Directory: “C:\users\<username>” <br>
         <br/>![RetrieveBEK3](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-inside-rescueVM-1-image-3.png)  <br>

   - Option 2: Manually download the file in your computer: <br>
      - Access this link: GetSecret_Script_Download --> Right click in the screen --> Save as --> Save as type select “All Files (*) --> File Name: GetSecret_1.0.ps1 --> Save in a directory of your choice. <br>
         <br/>![RetrieveBEK4](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-inside-rescueVM-2-image-4.png) <br>

      - Access the Rescue VM --> Copy the Script to the folder “C:\Users\<username>”. <br>
      - Right click in the script file inside your computer --> Copy --> Paste inside Rescue VM in “C:\Users\<username>” <br>
         <br/>![RetrieveBEK5](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-inside-rescueVM-3-image-5.png) <br><br>

2. In the Rescue VM --> Disk Management --> Check if the Data Disk is initialized --> also Check if it is locked in Windows Explorer: <br>
        <br/>![RetrieveBEK6](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-inside-rescueVM-4-image-6.png) <br>
        <br/>![RetrieveBEK7](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-inside-rescueVM-5-image-7.png) <br><br>

3. Open an elevated PowerShell. <br>
       <br/>![RetrieveBEK8](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-inside-rescueVM-6-image-8.png) <br><br>

4. Access your user Directory and Check if the “GetSecret” file was saved: “dir $env:HOMEPATH” <br>
   - cd  $env:HOMEPATH <br>
   - dir $env:HOMEPATH <br>
      <br/>![RetrieveBEK9](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-inside-rescueVM-7-image-9.png) <br><br>
    
5. Run the GetSecret Script to retrieve the BEK file, replacing the variables with the data collected: <br>
   - ./GetSecret_1.0.ps1 -Mode "local" -subscriptionId **"SubscriptionID"** -DiskName **"DiskName"** <br>
   - Example <br>
       <br/>![RetrieveBEK10](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-inside-rescueVM-8-image-10.png) <br><br>

6. Script will install all required dependencies and modules. <br>
       <br/>![RetrieveBEK11](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-inside-rescueVM-9-image-11.png) <br>
       <br/>![RetrieveBEK12](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-inside-rescueVM-10-image-12.png) <br><br>
   - After installing the dependencies, it will request you to log in: <br>
       <br/>![RetrieveBEK13](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-inside-rescueVM-11-image-13.png) <br><br>
   - After you complete the login step, the script will get all information and will unlock the disk automatically. Once it is unlocked, the disk will be opened and displayed in your screen:<br>
       <br/>![RetrieveBEK14](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-inside-rescueVM-12-image-14.png) <br>
       <br/>![RetrieveBEK15](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-inside-rescueVM-13-image-15.png) <br>
       <br/>![RetrieveBEK16](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-inside-rescueVM-14-image-16.png) <br><br>

##Azure Cloud Shell

1. ./GetSecret_1.0.ps1 -Mode **"cloudshell"** -subscriptionId **"SubscriptionID"** -DiskName **"DiskName"** <br>
2. Follow Step 3 from "Collect Disk and Subscription Information" to collect the data you will need: Subscription ID and Disk Name. <br>
3. Go to Azure Portal: https://ms.portal.azure.com <br>
4. Open a Azure Cloud Shell: <br>
      <br/>![RetrieveBEK17](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-cloudshell-1-image-17.png) <br><br>
5. Download the Script using the following command:<br>
   - “Invoke-WebRequest -Uri "https://raw.githubusercontent.com/gabriel-petre/ADE/main/GetSecret/GetSecret_1.0.ps1" -OutFile $home/GetSecret_1.0.ps1” <br>
      <br/>![RetrieveBEK18](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-cloudshell-2-image-18.png) <br><br>

6. If you are already connected to the right subscription and using a user with the correct permission, run the Script without the “-UseDeviceAuthentication” parameter <br>
   - ./GetSecret_1.0.ps1 -Mode "cloudshell" -subscriptionId **"<SubscriptionID>"** -DiskName **"<DiskName>"** <br>
      - **It will not request a user or password and it will proceed directly to step 9 for Windows.** <br>
      <br/>![RetrieveBEK19](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-cloudshell-3-image-19.png) <br><br>

7. If you need to select or change the subscription connected, you will need to add the “-UseDeviceAuthentication” parameter as in the below command: <br>
   - ./GetSecret_1.0.ps1 -Mode "cloudshell" -subscriptionId **"<SubscriptionID>"** -DiskName **"<DiskName>"** -UseDeviceAuthentication <br>
      <br/>![RetrieveBEK20](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-cloudshell-4-image-20.png) <br><br>

8. Log in using the code provided and return to the Azure Cloud Shell page. <br>
      <br/>![RetrieveBEK21](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-cloudshell-5-image-21.png) <br><br>

9. Windows: After completing the execution:
   - Download the BEK File --> Save it in your computer --> Copy to the Rescue VM under “C:\Users\<username>” <br>
      <br/>![RetrieveBEK22](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-cloudshell-6-image-22.png) <br>
   - Open the Windows Explorer and check the Drive Letter that is locked: <br>
      <br/>![RetrieveBEK23](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-cloudshell-7-image-23.png) <br>
   - Manually unlock the disk: Open an elevated PowerShell --> run the following command: <br>
      - “manage-bde -unlock 'DriveLetterOfDiskToUnlock' -RecoveryKey 'SecretPath'” <br>
         - Example: <br>
           <br/>![RetrieveBEK24](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-cloudshell-8-image-24.png) <br>
      - After unlocking --> go to Windows explorer --> This PC --> The disk will be unlocked. <br>
         <br/>![RetrieveBEK25](/.attachments/SME-Topics/Azure-Encryption/How-to-Automatically-Retrieve-the-BEK-cloudshell-9-image-25.png) <br><br>
::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::
