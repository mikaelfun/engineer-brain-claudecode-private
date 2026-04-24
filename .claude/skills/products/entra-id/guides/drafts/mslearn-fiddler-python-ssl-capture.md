---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/capture-https-traffic-fiddler-python-app
importDate: "2026-04-24"
type: guide-draft
---

# Capture HTTPS Traffic with Fiddler from Python Apps

How to configure Fiddler HTTPS capture for Python applications using ADAL/MSAL.

## ADAL for Python
- Set env var: os.environ["ADAL_PYTHON_SSL_NO_VERIFY"] = "1"
- Or pass verify_ssl=False to AuthenticationContext

## MSAL for Python
- Pass verify=False to PublicClientApplication constructor

## Python Requests module
- Force proxy: proxies={"http": "http://127.0.0.1:8888", "https": "http://127.0.0.1:8888"}, verify=False

## Azure AD SDK (GraphRbacManagementClient)
- Set verify=False on credentials and graphrbac_client.config.connection.verify=False
