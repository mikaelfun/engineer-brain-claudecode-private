---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Utilities.ps1/Invoke-AzsSupportWebRequest"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Utilities.ps1/Invoke-AzsSupportWebRequest"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Invoke-AzsSupportWebRequest

# Synopsis

Orchestrates http requests so that they are executed on the Support Ring VM using Invoke-WebRequest. Only supports anonymous http(s) endpoints.

# Parameters

## URI

Specifies the Uniform Resource Identifier (URI) of the internet resource to which the web request is sent. Enter a URI. This parameter supports HTTP or HTTPS only.

## METHOD

Specifies the method used for the web request. Defaults to GET.

## HEADERS

Specifies the headers of the web request. Enter a hash table or dictionary. Content related headers, such as Content-Type is overridden when a MultipartFormDataContent object is supplied for Body.

## CONTENTTYPE

Specifies the content type of the web request. If this parameter is omitted and the request method is POST, Invoke-WebRequest sets the content type to application/x-www-form-urlencoded. Otherwise, the content type is not specified in the call.

## BODY

Specifies the body of the request. The body is the content of the request that follows the headers. For GET requests with IDictionary body, the body is added to the URI as query parameters.

## OUTFILE

Specifies the output file for which this cmdlet saves the response body. Enter only a file name, and the file will be saved to the (Get-AzsSupportWorkingDirectory) on the PEP.

## TIMEOUTSEC

Specifies how long the request can be pending before it times out. Enter a value in seconds. The default value, 0, specifies an indefinite time-out.

## MAXIMUMREDIRECTION

Specifies how many times PowerShell redirects a connection before the connection fails. The default value is 5. A value of 0 prevents all redirection.

# Examples

## Example 1

```powershell
Invoke-AzsSupportWebRequest -Uri "https://aka.ms/azssupportmoduleinstall"
```

## Example 2

```powershell
Invoke-AzsSupportWebRequest -Uri "https://aka.ms/azssupportmoduleinstall" -OutFile "InstallAzsSupport.ps1"
```
