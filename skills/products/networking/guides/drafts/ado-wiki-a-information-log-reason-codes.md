---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Expert Troubleshooting/Information Log Reason Codes"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Expert%20Troubleshooting/Information%20Log%20Reason%20Codes"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Information Log Reason Codes

## Overview
The information log (for probes only) provides a reason code but not the description. The following list provides the corresponding Error Description.

### Current Code
Based on current source code. For updates check [HealthProbeError.cs](https://msazure.visualstudio.com/One/_git/Networking-nfv?path=%2Fsrc%2Fgateway%2FCommon%2FGatewaySdk%2FApplicationGatewayObjectModel%2FHealthProbeError.cs&version=GBdevelop2).

| Error Code | Error Description |
|------------|:-------------------|
| 0 | "Success." |
| 1 | "Unknown error. Please try again." |
| 2 | "Probe timeout. Increase timeout value and try again." |
| 3 | "Backend server FQDN cannot be resolved. Check FQDN for correctness. If custom DNS server is used within VNET check if DNS is able to resolve FQDN." |
| 4 | "Server address cannot be reached. Check whether any NSG/UDR/Firewall is blocking access to server address." |
| 5 | "Server port cannot be reached. Check whether any NSG/UDR/Firewall is blocking access to server port." |
| 6 | "Cannot connect to server. Check whether any NSG/UDR/Firewall is blocking access to server. Check if application is running on correct port." |
| 7 | "Probe status code mismatch. Received status code is different from expected." |
| 8 | "Probe status code mismatch. Expected vs Received." |
| 9 | "Probe response body mismatch. Received response body does not contain expected value." |
| 10 | "Backend server certificate is not whitelisted with Application Gateway." |
| 11 | "Invalid certificate - Invalid CA." |
| 12 | "Invalid certificate - Invalid CN." |
| 13 | "HTTPS probe connection error. Check if backend server certificate is whitelisted. Check for backend certificate validity." |
| 14 | "Application Gateway not reachable. Check whether any NSG/UDR/Firewall blocking access to ports 65503-65534 on Application Gateway." |
| 15 | "Probe response body mismatch. Expected vs Received." |
| 16 | "Success. Received status code." |
| 17 | "The validity of the backend certificate could not be verified. Check Open SSL diagnostics for associated error code." |
| 18 | "The root certificate of the server certificate used by the backend does not match the trusted root certificate added to the application gateway. Ensure correct root certificate is added." |
| 19 | "Application gateway could not find any certificate-related information in the trusted root certificate. Ensure the certificate file is not corrupt and re-add." |
| 20 | "Backend server certificate expired. Please upload a valid certificate." |
