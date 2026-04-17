---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/Entra External ID Troubleshooting/Known Issue: Local account guest users are redirected to federated login"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20(CIAM)%2FEntra%20External%20ID%20Troubleshooting%2FKnown%20Issue%3A%20Local%20account%20guest%20users%20are%20redirected%20to%20federated%20login"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.Entra External ID
- cw.comm-extidmgt
- CIAM
---

:::template /.templates/Shared/findAuthorContributor.md
:::

# Compliance note
This wiki contains test and/or lab data only.

   
Known Issue: Local account guest users are redirected to federated login if signup is disabled in userflow and home tenant has Alt login enabled
================================================================================================================================================

**AI-assisted content.** This article was partially created with the help of AI. An author reviewed and revised the content as needed. [Learn more](https://learn.microsoft.com/en-us/principles-for-ai-generated-content).
This article addresses a known issue where local account guest users are redirected to federated login if signup is disabled in the user flow, and the home tenant has Alternate Login ID enabled. It provides and offers a workaround for affected users.

Local account guest users redirected to federated login
-------------------------------------------------------

### Issue description

When using Microsoft Entra External ID, users may encounter a problem where local account guest users are redirected to a federated login page if signup is disabled in the configured user flow and the home tenant has Alternate Login ID enabled. This issue typically occurs under the following conditions:
1.  Guest users are either invited or manually created in the tenant.
2.  The user flow is configured with signup disabled.
3.  The home tenant of the guest user has Alternate Login ID enabled.
Upon entering their email address during login, users are redirected to a page displaying the home tenant's logo, followed by an error message. This issue does not occur if signup is enabled in the user flow. Error example when the issue occurs:

![A screenshot of a login page](/.attachments/image-dd479775-eccc-4e8c-b82b-2efd572997d3.png)

When signup is enabled, guest users can successfully log in without encountering this issue.
Successful login example with signup enabled:

![A screenshot of a login page](/.attachments/image-a0a4b428-5562-4a08-945f-9add7ca3da0f.png)

### Current status

This issue is actively being investigated under [Bug 3043172 [ESTS] Local account guest users are redirected to federated login if signup is disabled in userflow and home tenant has Alt log...](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/3043172) for resolution.

Workaround
----------

If you encounter this issue, you can implement the following workaround to allow guest users to access the system without disabling signup.

### Steps to implement the workaround

*   **Enable signup in the user flow:**
    *   Follow the instructions provided in [Create a User Flow - Microsoft Entra External ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-user-flow-sign-up-sign-in-customers).
*   **Configure a REST API call for** `**OnAttributeCollectionStart**`**:**
    *   Create a custom authentication extension to send a block page to users attempting to sign up.
    Example REST API response:

    `json`  
    `{`  
    `"data": {`  
    `"@odata.type": "microsoft.graph.onAttributeCollectionStartResponseData",`  
    `"actions": [`  
    `{`  
    `"@odata.type": "microsoft.graph.attributeCollectionStart.showBlockPage",`  
    `"message": "You cannot signup. Please use the email sent to you to login."`  
    `}`  
    `]`  
    `}`  
    `}`
    
References: 

[Custom authentication extensions - Microsoft Entra External ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-custom-extensions) 

[Retrieve and return data from an OnAttributeCollectionStart event (preview) - Microsoft identity platform | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity-platform/custom-extension-onattributecollectionstart-retrieve-return-data)

*   **Configure the custom authentication extension:**
    *   Set up the custom authentication extension in Microsoft Entra External ID. Example configuration:

    ![Configuration example 1](/.attachments/image-4d9eb6da-d7d3-44e0-b093-5129b8c0da6a.png)

    ![Configuration example 2](/.attachments/image-25045e51-db25-41d0-983a-c79ce0a7dd35.png)
    
*   **User experience with the workaround:**
    *   �**Configure the user flow to enable the �custom Extention atribute**�

        ![Enabling custom attribute](/.attachments/image-dd86f7ff-357b-4ecc-b065-df9f1bae162f.png)

        *   When users click "No account? Create one," they will be prompted to enter their email address and receive a verification code.
              
            ![Screenshot of entering email](/.attachments/image-e41838b9-d672-44bf-bcb8-c82ef398f603.png)
            
*   Enter email to receive the code:
      
    ![Screenshot of entering code](/.attachments/image-da0d6711-999b-45f1-aeac-f6eb55243987.png)
    
*   Enter the verification code:
*   After entering the code, they will see the block page:  
    ![Screenshot of block page](/.attachments/image-e12a67f1-63f3-4497-bf24-470ead189a0c.png)

This workaround ensures that Guest users can log in and users cannot signup.
