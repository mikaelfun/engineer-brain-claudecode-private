---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Expert Troubleshooting/Live check backend headers"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FLive%20check%20backend%20headers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Live Check Backend Headers — HTTP Header Inspection Tool

## Description
A Python web application that prints HTTP headers received at the backend. Useful for understanding what headers reach the backend server when behind a reverse proxy (Application Gateway, AFD).

## Repository
[ist-joaof/webapp2/tree/backend_server_http_headers](https://github.com/ist-joaof/webapp2/tree/backend_server_http_headers)

## How to Deploy
1. Fork the repository to your GitHub page
2. Start a WebApp deployment from Azure Portal
3. Select "Python 3.8" Runtime stack
4. On Deployment blade: Continuous deployment - Enable, login to GitHub
5. Select the cloned repository
6. Application takes a couple of minutes to compile after WebApp is running

## Features

### Backend HTTP Header Print
Access any URL/path/query on the application — it responds with received headers.

### Check Last Health Probe Headers
Access the path `/healthprobe` to see the headers from the last Application Gateway/AFD health probe.

### Force Specific HTTP Response Code
Access the path with the desired response code number. Example: `https://<website_fqdn>/401` forces a 401 response.

## Use Cases
- Verify which host headers are forwarded through the reverse proxy
- Debug header rewrite rules
- Confirm health probe header configuration
- Test backend response behavior for different HTTP status codes
