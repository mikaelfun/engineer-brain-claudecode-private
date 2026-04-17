---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Training/Microsoft Graph SDK Dotnet/LAB Microsoft Graph Dotnet Webhooks"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FTraining%2FMicrosoft%20Graph%20SDK%20Dotnet%2FLAB%20Microsoft%20Graph%20Dotnet%20Webhooks"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
  - cw.AAD
  - cw.AAD-Dev
  - cw.AAD-Workflow
  - cw.comm-devex
---

:::template /.templates/Shared/findAuthorContributor.md
:::

:::template /.templates/Shared/MBIInfo.md
:::

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Dev](/Tags/AAD%2DDev) [AAD-Workflow](/Tags/AAD%2DWorkflow)

# Azure Function for Microsoft Graph Webhook Notifications

[[_TOC_]]

## Overview

This article demonstrates how to create an **Azure Function** in **C# (.NET 10)** to handle Microsoft Graph change notifications via an HTTP trigger.

## Prerequisites

- [Azure Functions extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions).
- Azure Subscription.
- [Ngrok](https://dashboard.ngrok.com/get-started/setup/windows) for local testing.

The Azure Functions extension document will also be used as a basis for setting up the Function App.

## Initial Steps to Set Up

1. Select the button to create a new project in the Azure Resources explorer:

![Create Azure Function](.attachments\AAD-Developer\2386123\activityLog.png)

1. Select a new, empty folder to contain your project.

2. Select C# as your programming language and .NET 10 as your framework.

3. Select "HTTP trigger" for your project's first function.
4. Give your function a name. On this example, I will use "MSGraphWebhookHandler".

5. Select the name for your namespace. For this example, I selected Webhookhandler.Function.

6. Select "Anonymous" for the authorization level, which enables anyone to call your function endpoint without a key.

7. If the selected folder is not already open, select "Open in current window" to open it

## Update Code

1. In the file where your Function App is defined (for this example, it is the file MSGraphWebhookHandler.cs), update the code to the following:

```csharp

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Webhookhandler.Function;

public class MSGraphWebhookHandler
{
    private readonly ILogger<MSGraphWebhookHandler> _logger;

    public MSGraphWebhookHandler(ILogger<MSGraphWebhookHandler> logger)
    {
        _logger = logger;
    }

    [Function("MSGraphWebhookHandler")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequest req)
    {
        // Check for validationToken in query parameters
        string? validationToken = req.Query["validationToken"];

        // Handle validation token for initial subscription creation
        if (!string.IsNullOrEmpty(validationToken))
        {
            _logger.LogInformation("ValidationToken found! Returning it in the response.");
            return new ContentResult
            {
                Content = validationToken,
                ContentType = "text/plain",
                StatusCode = 200
            };
        }

        // Handle actual notifications
        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();

        // Parse the json and compare the clientState
        dynamic? parsedJson = JsonConvert.DeserializeObject(requestBody);

        // Check if parsing was successful
        if (parsedJson == null)
        {
            _logger.LogWarning("Failed to parse request body as JSON.");
            return new BadRequestObjectResult("Invalid JSON in request body");
        }

        // Iterate through each notification in the value array
        foreach (var notification in parsedJson.value)
        {
            // Validate clientState
            string clientState = notification.clientState;
            if (clientState != Environment.GetEnvironmentVariable("CLIENT_STATE"))
            {
                _logger.LogWarning($"Invalid clientState detected: {clientState}");
                return new BadRequestObjectResult("Invalid clientState");
            }

            // Log the notification details
            string formattedJson = JsonConvert.SerializeObject(notification, Formatting.Indented);
            _logger.LogInformation($"Notification received: {formattedJson}");

            // Do business logic here for each notification object
        }

        // Do business logic here for the entire notification payload if needed

        return new OkResult();

    }
}

```

2. Install the Newtonsoft.Json nugget package, using `dotnet add package Newtonsoft.Json`.

3. Update the local.settings.json to have the CLIENT_STATE environmental variable:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "CLIENT_STATE": "your_chosen_client_state"
  }
}
```

## Test Locally

This extension integrates with the Azure Functions Core Tools to let you run your project locally before publishing to Azure.

1. To start your project, press F5 or the "play" button.

![Start Azure Function](.attachments\AAD-Developer\2386123\debug.png)

2. If you do not have the Azure Functions Core Tools installed, you will be automatically prompted to install. Follow the specified instructions.

3. The "Terminal" panel should pop up automatically. If everything goes well, you should see the output showing the localhost in which you can test the Function App:

![Create Azure Function](.attachments\AAD-Developer\2386123\workingFunction.png)

4. To make sure MS Graph is capable of communicating with your localhost, you need to set up Ngrok. After following the instructions in the pre-requisites section, open a terminal window an run the cmdlet `ngrok http 7071`. The value 7071 is the value of the port where your localhost is running (check the screenshot from Step 3).
   ![Ngrok Redirection](.attachments\AAD-Developer\2386123\ngrokRedirection.png)

5. Create a [subscription](https://learn.microsoft.com/en-us/graph/api/subscription-post-subscriptions?view=graph-rest-1.0&tabs=http) using MS Graph. This can be done using Graph Explorer. Note that you should add your own clientState and notificationUrl. To track changes on a user resource

```http
POST https://graph.microsoft.com/v1.0/subscriptions
Content-type: application/json

{
   "changeType": "created,updated,deleted",
   "notificationUrl": "https://<your_ngrok_domain>/api/MSGraphWebhookHandler",
   "resource": "users",
   "expirationDateTime":"2025-12-15T18:23:45.9356913Z",
   "clientState": "your_chosen_client_state"
}
```

6. If everything is set up properly, you should see the following your terminal, which means that MS Graph was able to contact your localhost endpoint, and the endpoint processed the information correctly:

![Local Token Validation](.attachments\AAD-Developer\2386123\localTokenValidation.png)

7. Now, if you do any changes on your users, you will start seeing the log stream in your local terminal:

![Local Notification](.attachments\AAD-Developer\2386123\localNotification.png)

## Deployment

The end goal is to have this deployed in a proper Function App, that you can use to test your webhooks without the burden of setting up the local environment.

1. Sign in to your Azure Account by clicking "Sign in to Azure..." in the Azure Resources explorer.

2. Select the 'plus' button to open the "Create Resource" menu.

![Create Resource](.attachments\AAD-Developer\2386123\createResource.png)

3. Choose "Create Function App in Azure..."

![Create Function App](.attachments\AAD-Developer\2386123\createFunctionApp.png)

4. Enter a globally unique name for your Function App

5. If multiple versions of your language's runtime are supported, select your desired version (the latest is recommended - .NET 10 )

6. Select a location

7. Wait for your Function App to be created. Progress will be shown in the Activity Log panel.

![Activity Log](.attachments\AAD-Developer\2386123\activityLog.png)

8. Once your Function App has been created, reveal the resource in the Resources view.

![Complete](.attachments\AAD-Developer\2386123\createComplete.png)

9. Right click your Function App and select "Deploy to Function App".

![Deploy](.attachments\AAD-Developer\2386123\deploy.png)

10. Once deployment is complete, expand your subscription in the Azure Resources explorer to copy your deployed function's url. It should be something like `https://webhookhandler2.azurewebsites.net/api/msgraphwebhookhandler`. This will be used to create the new subscription object.

![Function URL](.attachments\AAD-Developer\2386123\copyFunctionUrl.png)

11. In the Azure Portal, you should navigate to your own Function App. Type "Function App" in the search bar, click it and select the function app you just created.

![Portal Function App](.attachments\AAD-Developer\2386123\portalFunctionApp.png)

12. Navigate to "Settings" -> "Environmental Variables" and add your CLIENT_STATE variable.

![Env Variables](.attachments\AAD-Developer\2386123\envVariables.png)

13. Create a new subscription, using your deployed function app's url as the notificationUrl, and the CLIENT_STATE you set up in the portal as the clientState property:

```http
POST https://graph.microsoft.com/v1.0/subscriptions
Content-type: application/json

{
   "changeType": "created,updated,deleted",
   "notificationUrl": "https://webhookhandler2.azurewebsites.net/api/msgraphwebhookhandler",
   "resource": "users",
   "expirationDateTime":"2025-12-15T18:23:45.9356913Z",
   "clientState": "your_chosen_client_state"
}
```

14. To investigate the Function App logs, navigate to "Monitoring" -> "Log Stream". This will allow you to see all the notifications logged to the console.

![Portal Logs](.attachments\AAD-Developer\2386123\logsPortall.png)

## Source Code

You can access the source code in the following GitHub repo: https://github.com/sncorreia/Function-App-MS-Graph-Webhooks
