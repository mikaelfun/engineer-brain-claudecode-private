---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/Entra External ID for Customers (CIAM) - Custom email provider for one time code send events"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20%28CIAM%29%2FEntra%20External%20ID%20for%20Customers%20%28CIAM%29%20-%20Custom%20email%20provider%20for%20one%20time%20code%20send%20events"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Custom Email Provider for One Time Code Send Events

## Feature Overview

Configuring a custom email provider for the OTP Send event type. When OTP email is triggered, it calls a REST API to use a custom email provider (e.g., SendGrid).

## Prerequisites

1. Active Azure Subscription
2. Entra External ID tenant (CIAM)
3. SendGrid account with:
   - Verified sender authentication
   - Email template (get template ID)
   - API Key generated

## Setup Steps

### 1. Create Function App

- Azure Portal > Create Resource > Compute > Function App
- Plan: Consumption
- Runtime: Windows .NET 8 LTS in-process model

### 2. Create HTTP Trigger

- Add HTTP trigger function
- Add sample code (C# script) that:
  - Reads correlation ID from authentication context
  - Extracts OTP code and email from `otpContext`
  - Sends email via SendGrid API using template
  - Returns `OtpSend.continueWithDefaultBehavior` response
- Get function URL (default function key)

### 3. Environment Variables

- `SENDGRIDKEY`: SendGrid API key
- `FROMEMAIL`: Sender email address
- `FROMNAME`: Sender display name
- `TEMPLATEID`: SendGrid template ID

### 4. Configure Custom Authentication Extension

- Register custom authentication extension in Entra External ID
- Set event type to OTP Send
- Point to Azure Function URL

## Key Code Pattern

The Azure Function receives OTP context from Entra, sends via SendGrid, and returns continuation response:

```csharp
// Extract OTP and email
string email = ciamRequest?.data?.otpContext?.identifier;
string otp = ciamRequest?.data?.otpContext?.oneTimeCode;
// Send via SendGrid
await sendEmailAsync(email, otp);
// Return continue response
return new CreatedResult(..., ResponseData.GenerateResponse("microsoft.graph.OtpSend.continueWithDefaultBehavior"));
```
