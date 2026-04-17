---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Internal Content Specs & readiness/TPM articles/Various Questions about TPM/Pin Lockout full steps"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Hello%20and%20Modern%20Credential%20Providers/WHfB/WHFB%3A%20Internal%20Content%20Specs%20%26%20readiness/TPM%20articles/Various%20Questions%20about%20TPM/Pin%20Lockout%20full%20steps"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1762333&Instance=1762333&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1762333&Instance=1762333&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**  
This document provides all the steps when a user is filling in the wrong PIN, thus triggers the lockout mechanism.

[[_TOC_]]

#Platform
tests were performed on a VM running Windows 11 23h2 22631.4391 (October 2024 updates).  
![image.png](/.attachments/image-20731d66-e4cc-4e24-984b-4c710bae807e.png)

#Reference
[Windows Hello for Business Frequently Asked Questions (FAQ) | Microsoft Learn](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/faq#what-happens-when-an-unauthorized-user-gains-possession-of-a-device-enrolled-in-windows-hello-for-business)

# Steps with screenshots

attempt 1 to 3 give:
  
![image.png](/.attachments/image-b6ec0e00-6bde-4967-bb0e-0a5df61757ee.png =300x200)

attempt n4 ask a passphrase  

![image.png](/.attachments/image-5508f84c-79ec-4f6a-aff9-f52630e2c8c1.png =300x200)

attempt n5  

![image.png](/.attachments/image-b6ec0e00-6bde-4967-bb0e-0a5df61757ee.png =300x200)  
then   
![image.png](/.attachments/image-e621e46d-a348-420a-88a7-71065b203bfa.png =300x200)

Restart the device

attempt6 to 8 give:     
![image.png](/.attachments/image-eb3d7c1b-15a4-4acf-9067-08b16d585ef3.png =300x200)

attempt n9   
![image.png](/.attachments/image-eb3d7c1b-15a4-4acf-9067-08b16d585ef3.png =300x200)    
and    
![image.png](/.attachments/image-f7db2512-9e87-44fd-85ce-7761d4e3b961.png =300x200) 

wait 30s and fill the passphrase  
![image.png](/.attachments/image-68eccdb5-341a-43aa-b2d1-0e3f000ef583.png =300x200)

attempt n10  
![image.png](/.attachments/image-eb3d7c1b-15a4-4acf-9067-08b16d585ef3.png =300x200)   
and  
![image.png](/.attachments/image-f00c0466-f874-432c-90ea-4b3242d71de2.png =300x200)

Restart the device

same sequence then (11 + 12 + 13)    
14th:    
![image.png](/.attachments/image-0e16d254-265a-4aa4-867f-5842839e01eb.png =300x200)  

wait 1 min + passphrase  
![image.png](/.attachments/image-68eccdb5-341a-43aa-b2d1-0e3f000ef583.png =300x200)  
     
15 --> need to restart the device  

same sequence then (16 + 17 + 18)    
19th:    
![image.png](/.attachments/image-d3e00ffd-a442-4892-9c54-a66c34bf8e7e.png =300x200)  

wait 2 min + passphrase    
![image.png](/.attachments/image-68eccdb5-341a-43aa-b2d1-0e3f000ef583.png =300x200)  
     
20 --> need to restart the device   
![image.png](/.attachments/image-eb3d7c1b-15a4-4acf-9067-08b16d585ef3.png =300x200)       
and      
![image.png](/.attachments/image-f00c0466-f874-432c-90ea-4b3242d71de2.png =300x200)  

Restart the device

same sequence then (21 + 22 + 23)    
24th    
![image.png](/.attachments/image-943e225f-58bb-42b9-8c36-abfd8adcaf9f.png =300x200)

wait 5 min + passphrase  
25 --> need to restart the device  

same sequence then (26 + 27 + 28)   
29    
![image.png](/.attachments/image-50524717-03c6-403d-ae93-c83b8d1401da.png =300x200)

wait 10 min + passphrase  

30 --> need to restart the device   

31:  
![image.png](/.attachments/image-eb3d7c1b-15a4-4acf-9067-08b16d585ef3.png =300x200)

32:  
![image.png](/.attachments/image-34a2d98b-47b1-4ced-9e28-9f720fefd0c6.png =300x200)

After 10 minutes, one authorization failure is forgotten and the number of authorization failures remembered by the TPM drops to 31. The TPM leaves the locked state and returns to normal operation.