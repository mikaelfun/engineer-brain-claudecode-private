---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/serilog-protected-web-api-authentication-authorization-errors
importDate: "2026-04-21"
type: guide-draft
---

# Troubleshoot Entra ID Protected Web API Authentication Errors with Serilog

## Overview

When a web API application calls a web API protected with Microsoft Entra ID, authentication or authorization errors may occur due to JwtBearer event validation failures. This guide covers how to set up logging using the Serilog framework to capture detailed JwtBearer events.

## Prerequisites

- Web API registered in Microsoft Entra ID
- .NET 6 Framework
- Microsoft Identity Web NuGet package
- Serilog NuGet package

## Steps

### 1. Configure Application ID URI

- Azure portal > App Registration > Expose an API > Add Application ID URI
- Default: api://<application-client-id>

### 2. Configure appsettings.json

Set AzureAd section with Instance, Domain, TenantId, ClientId.

### 3. Set up JwtBearer Event Logging

Configure JwtBearerEvents in Program.cs to log:
- OnTokenValidated
- OnMessageReceived
- OnAuthenticationFailed
- OnChallenge

### 4. Configure Serilog

Set MinimumLevel to Debug for Microsoft namespace. Output to console and file.

### 5. Analyze Logs

Review Serilog output for:
- Token validation failures (invalid audience, expired tokens)
- Missing or invalid signing keys
- Authorization policy failures

## Notes

- TokenValidationParameters: configure ValidAudiences and ValidIssuers
- Use Debug level for Microsoft namespace to capture middleware internals
