---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Azure Files Identity/How to Get Entra Request ID from Entra Kerberos ticket request"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Azure%20Files%20Identity/How%20to%20Get%20Entra%20Request%20ID%20from%20Entra%20Kerberos%20ticket%20request"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---

Tags:

- cw.Azure-Files-All-Topics

- cw.How-To 

- cw.How-It-Works

- cw.Reviewed-06-2024

---



:::template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md

:::



<font size="5">  How to Get Entra Kerberos Request ID from Entra Kerberos ticket request

[[_TOC_]]



# Summary

If you suspect that `Entra Kerberos authentication` has a bug in how it handles Kerberos ticket requests, you can get in touch with the Entra ID team. They'll likely need a `Request ID` in order to investigate. Here's how to collect this. 



# Scenarios



- Microsoft Entra Kerberos for hybrid user identities



# Instructions



Once the ticket request has been captured from Fiddler, click on the request to `login.microsoftonline.com`, and inspect the Kerberos response: 



See [Use Fiddler Kerberos .NET extension to debug AAD Kerberos raffic_Storage](/SME-Topics/Azure-Files-All-Topics/How-Tos/Azure-Files-Identity/Azure-Active-Directory-\(AAD\)-Kerberos-Authentication/Use-Fiddler-Kerberos-.NET-extension-to-debug-AAD-Kerberos-raffic_Storage)





![Options](/.attachments/SME-Topics/Azure-Files-All-Topics/How-to-Get-Entra-Request-ID-from-Entra-Kerberos-ticket-request-img3.jpg)



## Get information from HTTP headers

If you are investigating a `KRB_ERROR` response, you can get `Client Request ID` information from the `HTTP headers` of the response.



1. Click on `Inspectors` option

2. Click on `Headers` option

3. Copy the following headers

    - **Date:** same information as the `Timestamp` in the `Etext field` in the Kerberos error response 

    - **x-ms-request-id:** same ID as the `Trace ID` in the `Etext field` in the Kerberos error response 



    ![Options](/.attachments/SME-Topics/Azure-Files-All-Topics/How-to-Get-Entra-Request-ID-from-Entra-Kerberos-ticket-request-img1.jpg)



    ```

    - Note that the HTTP headers do not contain any details about what Kerberos error happened. You must look in the Kerberos response for that. 

    - Also note that we get 200 OK even when the Kerberos response is an error. 



    ```





## Get information from EText

Alternatively, If you are investigating a `KRB_ERROR` response, you can get `Client Request ID` information from `EText`



1. Click on `Inspectors` option

2. Click on `Kerberos` option

3. Look for  `EText` field which should have the `KRB_ERROR` and `Client Request ID (Trace ID)`. You can right click on it and copy the value, e.g: 

4. Copy the following information

    - **Timestamp:** same information as the `Date` in `Headers section`. 

    - **Trace ID:** same ID as the `x-ms-request-id` in `Headers section`.





        ```

        AADSTS700016: Application with identifier 'cifs/xxxxxxxxxxxxx.file.core.windows.net' was not found in the directory 'Default Directory'. This can happen if the application has not been installed by the administrator of the tenant or consented to by any user in the tenant. You may have sent your authentication request to the wrong tenant. 



        Trace ID: 0e8350e0-d4cf-4dad-b267-2163d59a0f03 



        Correlation ID: 30b0058a-f700-4bc1-b96b-98466c9102a8 



        Timestamp: 2024-03-07 22:06:46Z 



            

        ```

    

    ![Options](/.attachments/SME-Topics/Azure-Files-All-Topics/How-to-Get-Entra-Request-ID-from-Entra-Kerberos-ticket-request-img2.jpg)





# References





:::template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md

:::
