---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Simple web page to display request headers received by the web application"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Simple%20web%20page%20to%20display%20request%20headers%20received%20by%20the%20web%20application"
importDate: "2026-04-07"
type: troubleshooting-guide
---

In some cases, customer or support engineer might need a simple way to check or test what headers and header values were sent to the web application. Typical scenario is the Native Header-based SSO.

## Setup Steps

**Prerequisite:** IIS server with ASP feature enabled.

1. Open **Server Manager** -> **Manage** -> **Add Roles and Features** -> navigate to **Server Roles**. Locate Web Server (IIS) and go into **Web Server** -> **Application Development** and ensure that **ASP** is installed. (reboot might be required)

2. Start the **Internet Information Services (IIS) Manager**

3. Highlight the **Default Web Site**, right click and click on **Explore**. Create a file called `test.asp` and add the following content:

```asp
<%@ Language= "VBScript" %>
<HTML>
  <BODY>
<%
Dim var

Response.Write("<h1>Received Headers in the Request</h1>")
Response.Write("<table style=""border: 1px solid black; border-collapse: collapse;"">")
Response.Write("<tr><th style=""border: 1px solid black;"">Header Name</th><th style=""border: 1px solid black;"">Header Value</th></tr>")

For Each var in Request.ServerVariables
 If InStr(var, "HTTP_") = 1 Then
   headerName = Replace(var, "HTTP_", "", 1, 1, 0)
   headerValue = Request.ServerVariables(var)
   Response.Write("<tr><td style=""border: 1px solid black;"">" & headerName & "</td><td style=""border: 1px solid black;"">" & headerValue & "</td></tr>")
 End If
Next

Response.Write("</table>")
%>
  </BODY>
</HTML>
```

4. Test locally: browse `http://localhost/test.asp` or `https://serverFQDN/test.asp`. You should see a table listing all HTTP headers received.

5. If tests are successful, publish it over Microsoft Entra Application Proxy.
