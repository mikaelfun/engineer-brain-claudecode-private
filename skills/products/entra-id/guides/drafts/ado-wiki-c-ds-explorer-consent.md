---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Troubleshooting tools/DS Explorer - Finding who consented to an application"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Troubleshooting%20tools%2FDS%20Explorer%20-%20Finding%20who%20consented%20to%20an%20application"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
# Finding who consented to an application

If the information is missing in DS Explorer, then consent has not been completed. Once consent is completed, then both of these types of objects should be present.  

1.  Find the object ID for the service principal for the application.
2.  Go to the **Entitlement Grants** Tab.
3.  What was scopes where consented to by the principal?
    1.  Put the Object ID into the Source: edit control.
    2.  Select "ServicePrincipal" from the dropdown.
    3.  Hit the hour glass icon to perform the search.
    4.  On the right, there will be list of permission scopes that have been consented too. The list contains the scope IDs for the tasks lists. You can look up the target object IDs listed to find the application/principal the permission was granted along with the entitlement ID:
        <div class="center">
        <div class="thumb tnone">
        <div class="thumbinner" style="width:852px;">
        <br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/65f883a7-27c4-7018-0f8d-44e8b0a4eff9Object_IDs.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="Object IDs.png" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/65f883a7-27c4-7018-0f8d-44e8b0a4eff9Object_IDs.png" width="850" height="463" class="thumbimage"></a><br/>
        <div class="thumbcaption">
        <div class="magnify">
        
        </div>
        </div>
        </div>
        </div>
        </div>
4.  Who consented to the application:
    1.  Put the object ID in the Target edit control.
    2.  Select "ServicePrincipal" from the dropdown.
    3.  Click the hour glass to execute the search.
    4.  On the right, there will be a list of objects that represent who consented to the application.
    5.  The source object represents what consented to the application. The ObjectID can be used to locate who consented. You can use the Single Object tab to locate the actual object to confirm.
        <div class="center">
        <div class="thumb tnone">
        <div class="thumbinner" style="width:853px;">
        <br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/c895b8ec-6c1b-3cb2-62a0-8b5e1eaa3bc2Single_object.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="Single object.jpg" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/c895b8ec-6c1b-3cb2-62a0-8b5e1eaa3bc2Single_object.jpg" width="851" height="464" class="thumbimage"></a><br/>
        <div class="thumbcaption">
        <div class="magnify">
        
        </div>
        </div>
        </div>
        </div>
        </div>
