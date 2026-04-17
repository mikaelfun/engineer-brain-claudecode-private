---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Lab Setup Guide for Kerberos Double Hop with App Proxy"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Lab%20Setup%20Guide%20for%20Kerberos%20Double%20Hop%20with%20App%20Proxy"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Lab Setup Guide for Kerberos Double Hop with App Proxy

## Overview

Step-by-step guide to configure a lab environment for testing Kerberos double hop authentication with Microsoft Entra Application Proxy. Kerberos double hop is a scenario where a user authenticates to a web application using Kerberos, and the web application needs to access a back-end resource (such as a database) on behalf of the user using Kerberos Constrained Delegation (KCD).

## Prerequisites

- On-prem domain configured with Cloud Sync or Entra ID Connect
- Domain joined member server (IIS server)
- Domain joined member server (connector)
- SQL Server (can be Azure VM with preset SQL or on-prem)

## Lab Steps

### 1. Install IIS Server

- Open Server Manager > Add roles and features
- Select Web Server (IIS) role
- Enable required role services including Windows Authentication

### 2. Install SQL Server

- Create database named "website"
- Create table "Users" with column "Usernames"
- Add domain user logins via Security > Logins (Windows Authentication)

### 3. Install ODBC Driver

- Download and install ODBC SQL Driver 17 on IIS server
- May need vc_redist.exe (Visual C++ Redistributable)

### 4. Install PHP

- Download PHP (tested with 8.1.27) and extract to `C:\PHP`
- Download Microsoft Drivers for PHP for SQL Server
- Copy SQL driver DLLs to `C:\PHP\ext`
- Configure php.ini: set `extension_dir = "C:\PHP\ext"` and enable SQL extensions
- Add `C:\PHP` to system PATH

### 5. Configure IIS with PHP

- Add module mapping in Handler Mappings for `.php` files
- Create `Default.php` in `C:\inetpub\wwwroot` with PHP code connecting to SQL via `sqlsrv_connect()`
- Set Default.php as default document (top of list)

### 6. Set Kerberos Authentication on IIS

- Enable Windows Authentication, disable others
- Ensure Negotiate provider is at top of the provider list

### 7. Install Private Connector

- Follow: https://learn.microsoft.com/entra/identity/app-proxy/application-proxy-add-on-premises-application#install-and-register-a-connector

### 8. Set Kerberos Delegation

- Register SPN on IIS server: `setspn -s http/iisServer.domain.com iisServer`
- On connector computer object in AD: add IIS server's HTTP service for delegation
- On IIS server computer object: delegate MSSQLSvc service to SQL server (for double hop)

### 9. Application Proxy Configuration

- Create enterprise application with Application Proxy
- Set internal URL (IIS server FQDN) and external URL
- Configure SSO with Integrated Windows Authentication (IWA)
- Set Internal Application SPN to the HTTP SPN of the IIS server

## Key Configuration Points

| Component | Setting | Value |
|-----------|---------|-------|
| IIS Auth | Provider | Negotiate (top) |
| SPN | IIS Server | `http/iisServer.domain.com` |
| Connector | Delegation | IIS HTTP service |
| IIS Server | Delegation | SQL MSSQLSvc service |
| App Proxy SSO | Type | Integrated Windows Authentication |
