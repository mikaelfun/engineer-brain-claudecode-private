---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Azure Active Directory Topics/Web Accounts Manager (WAM) - TokenBroker Service/Profile Pictures"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAzure%20Active%20Directory%20Topics%2FWeb%20Accounts%20Manager%20(WAM)%20-%20TokenBroker%20Service%2FProfile%20Pictures"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Profile Pictures - WAM / Token Broker

Both Microsoft 365 (formerly Office 365) and on-premises Exchange Server enable the option to include users profile photos in a number of places. Outlook, Teams, Outlook on the web (OWA), SharePoint, Skype for Business, OneDrive, Planner, Microsoft 365 Groups - all those services can show pictures of employees.

Pictures are downloaded as a part of the Primary Refresh Token (PRT) download from Azure Active Directory (Azure AD). Various issues can occur when downloading the profile pictures. The issues typically start with the Azure AD team, which would identify if it is a Web Account Manager (WAM) issue before collaborating further.

## How to verify if the picture of the user is present in Graph Endpoint

### Method 1

1. Open the [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer#).
2. Sign in using the user account of the tenant (customer's tenant).
3. Run the following query and change the User Principal Name (UPN) to the user's account:

```
https://graph.microsoft.com/v1.0/users/<UPN>/photo/$value
Example: https://graph.microsoft.com/v1.0/users/raviks@contoso.com/photo/$value
```

4. You would find the picture in the response view.

### Method 2

Using the same Graph Explorer, you can also add the following query after signing in with the user:

```
https://graph.microsoft.com/v1.0/me/photo/$value
```

## Issues

1. Unable to view profile pictures
2. Unable to view profile pictures after updating the profile pictures
3. Profile picture is not the latest

## Scoping Questions

- All users or some users?
- All machines or some machines?
- All applications not showing or only some applications? What happens if they open the accounts?
  - If they go to: [Graph Explorer Endpoint](https://developer.microsoft.com/en-us/graph/graph-explorer#)
  - Sign in as a user
  - Run query: (Do they see the picture?)
    ```
    https://graph.microsoft.com/v1.0/users/raviks@contoso.com/photo/$value
    ```
- Was there a change in the picture or the user?
- How have they uploaded the picture?
- If they go to the folder: `C:\Users\<Username>\AppData\Local\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\AC\TokenBroker\Accounts`, do they see the `tbacctpic` files getting downloaded?

## Profile Picture Storage Location

```
C:\Users\<Username>\AppData\Local\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\AC\TokenBroker\Accounts
```

### File Formats

- .tbacctpic64x64
- .tbacctpic208x208
- .tbacctpic424x424
- .tbacctpic1080x1080

## How Profile Picture Download Works

### First Sign-In of a User to a Hybrid or Azure AD Joined Machine without a Picture

1. When a user signs in to a hybrid or an Azure AD joined machine, the PRT is obtained by the client machine.
2. Downloading the PRT also downloads the template image file (default image).

Example files created:
```
002cd8c1c63a4251b70e9a9b93eece86ebf7c3b7.tbacct
002cd8c1c63a4251b70e9a9b93eece86ebf7c3b7.tbacctpic64x64
002cd8c1c63a4251b70e9a9b93eece86ebf7c3b7.tbacctpic208x208
002cd8c1c63a4251b70e9a9b93eece86ebf7c3b7.tbacctpic424x424
002cd8c1c63a4251b70e9a9b93eece86ebf7c3b7.tbacctpic1080x1080
```

### After Uploading a Picture

After uploading a picture using accounts, a new PRT and the pictures are downloaded. To force refresh, delete the contents of:
```
C:\Users\<UserName>\AppData\Local\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\AC\TokenBroker\Accounts
```

The WAM Core API downloads the pictures via the AAD Broker Plug-In in different file formats (64x64, 208x208, 424x424, 1080x1080).

## Log Analysis

WAM ETL tracing shows the TokenBroker stored object events for profile picture download. Key events to look for:

- `TBStoredObjectInitializeEvent` - Object file path initialization
- `TBStoredObjectOpenFileForAccess` - File access for picture storage
- `TBStoredObjectCreateNewFileEvent` - New picture file creation
- `OpenFileWithRetriesInternal_Start` - File open with retry mechanism

These events appear in WebAuth logs under the `Microsoft.Windows.Security.TokenBroker` provider.
