---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C Labs/Azure AD B2C - Custom Policy Starter Pack Lab"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAzure%20AD%20B2C%20Labs%2FAzure%20AD%20B2C%20-%20Custom%20Policy%20Starter%20Pack%20Lab"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD B2C - Custom Policy Starter Pack Lab

In this lab you will create a new Azure AD B2C tenant, deploy the Azure AD B2C Custom Policy Starter Pack, and learn how to manage custom policies using Visual Studio Code.

## Prerequisites

1. An MCAPS Managed Environment account to fdpo.onmicrosoft.com
2. A MCAPS Support Subscription
3. Be signed into https://portal.azure.com/fdpo.onmicrosoft.com with your MCAPS guest account

## Step 1. Azure AD B2C Tenant Creation

> **Note**: As of 2025-05, Azure AD B2C has reached [end of sale](https://learn.microsoft.com/en-us/azure/active-directory-b2c/faq?tabs=app-reg-ga#azure-ad-b2c-end-of-sale) for customers and internal subscriptions. For new lab environments, work with a colleague or TA that already has their own B2C tenant.

1. Follow [Create an Azure Active Directory B2C tenant](https://learn.microsoft.com/azure/active-directory-b2c/tutorial-create-tenant)
2. Switch directories in the Azure Portal into your B2C tenant to verify access
3. Open the "Azure AD B2C" blade
4. [Register a web application](https://learn.microsoft.com/azure/active-directory-b2c/tutorial-register-applications?tabs=app-reg-gaa) for inspecting tokens with https://jwt.ms
5. [Create a sign-up and sign-in user flow](https://learn.microsoft.com/azure/active-directory-b2c/tutorial-create-user-flows?pivots=b2c-user-flow#create-a-sign-up-and-sign-in-user-flow) and test it

## Step 2. Deploy the Azure AD B2C Custom Policy Starter Pack

Uses the [Custom Policy Starter Pack](https://github.com/Azure-Samples/active-directory-b2c-custom-policy-starterpack) and the https://b2ciefsetupapp.azurewebsites.net/ quick setup tool.

1. Login to B2C tenant from Azure Portal
2. Visit https://b2ciefsetupapp.azurewebsites.net/
3. Fill out B2C domain name and deploy
4. Sign in with Global Admin to consent to the IEF Setup Portal application
5. Complete the two setup links in the "To complete the setup" section
6. Accept permissions on both prompts (normal to see 404/blank page after)

   > **NOTE**: `AADSTS900144: The request body must contain the following parameter 'client_id'` error on the second link is normal and can be ignored. Means IEF Test App already exists.

7. Verify deployed custom policies in Azure AD B2C > Policies > Identity Experience Framework
8. Test `B2C_1A_SIGNUP_SIGNIN` policy via [Test the custom policy](https://learn.microsoft.com/azure/active-directory-b2c/tutorial-create-user-flows?pivots=b2c-custom-policy#test-the-custom-policy)
9. Download all 6 policy XML files to local folder (e.g., C:\B2CPolicies)

## Step 3. Setup Visual Studio Code for Custom Policy Management

1. Download and install [Visual Studio Code](https://code.visualstudio.com/) with "Open with Code" context menu options
2. Install "Azure AD B2C" extension from VS Code Extensions Marketplace
3. Configure the extension for [direct policy upload](https://github.com/azure-ad-b2c/vscode-extension/blob/master/src/help/policy-upload.md)
4. Open your B2C policies folder in VS Code via right-click > "Open with Code"
5. Verify Azure AD B2C Policy Explorer populates in the bottom-left panel
6. Test upload: Edit a policy > `Ctrl+Shift+P` > "B2C Upload Current Policy"
7. Sign in with device code to your B2C tenant to complete upload
