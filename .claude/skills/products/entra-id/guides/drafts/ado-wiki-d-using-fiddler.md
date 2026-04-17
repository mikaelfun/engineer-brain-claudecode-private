---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Training/Tools/Using Fiddler"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FTraining%2FTools%2FUsing%20Fiddler"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Using Fiddler

This article covers how to capture web traffic with Fiddler for troubleshooting Entra ID authentication and application issues.

## Customer Instructions

1. Download "Fiddler 4 Classic" and install it on the machine where you can reproduce the problem: http://www.telerik.com/download/fiddler

1. **Enable HTTPS decryption:** Tools -> Options -> Https -> select "decrypt HTTPS Traffic" 
(you may be prompted to install the Fiddler certificate - make sure to select Yes)

1. Close your app that is experiencing the issue. We want to see the end-2-end flow of the app and how it interacts with Microsoft services.

1. **Disable caching:** (Rules -> Performance -> Disable Caching)
1. Make sure Fiddler is turned on to capture traffic

1. Re-open the app 
    **(For browser-based apps)**
    Either use private browsing mode or clear the client browser cache on the machine you will be testing from.

    **(For non browser-based apps)**
    Launch the desktop or mobile app.

1. Reproduce the problem and you should see https traffic showing up in the Fiddler window.

1. Save the resulting session output as SAZ files (File -> Save -> All Sessions)

1. Find references to your passwords or client secrets:
    1. Select a frame
    2. CTRL+F - search for the password or secret
    3. All highlighted frames must be investigated
    4. Press F2 on a highlighted frame and delete the password

1. Send the SAZ file to Microsoft.

---

## Capture Outgoing Requests

### WinHTTP apps

If you have successfully enabled Fiddler and HTTPS decryption yet you still do not see traffic from the problem app, it may be using WinHTTP instead of WinINET.

Examples of things that use WinHTTP:
* Windows Update
* System services
* Some .NET Framework apps (especially older ones)
* OWIN/Katana apps running under IIS
* Azure AD / Entra authentication libraries in certain hosting modes

These components do not use your browser proxy settings.

Therefore you will need to configure winhttp to point to Fiddler...

Check if winhttp is already pointing to Fiddler:
`Netsh winhttp show proxy`

Then set winhttp to Fiddler:
`netsh winhttp set proxy 127.0.0.1:8888`

After changing the WinHttp proxy setting > Restart the application.

**IMPORTANT**  
After you are done with Fiddler, Close Fiddler and don't forget to change the winhttp back:
`netsh winhttp import proxy source=ie`

If no proxy then reset it:
`netsh winhttp reset proxy`

---

### Some .NET apps

1. Launch Notepad elevated (as an Administrator). 
2. Open machine.config in the folder `C:\Windows\Microsoft.NET\Framework\v4.0.30319\Config`.
Note: If debugging a 64bit service (like ASP.NET) look in Framework64 folder instead.

3. Add the following XML block as a peer to the existing system.net element:
    ```xml
    <system.net>
      <defaultProxy enabled="true" useDefaultCredentials="true">
        <proxy autoDetect="false" bypassonlocal="false" proxyaddress="http://127.0.0.1:8888" usesystemdefault="false" />
      </defaultProxy>
    </system.net>
    ```
4. Save the file.
5. Restart the .NET app service.

---

### UWP and Windows Store apps

From Fiddler: Go to "Tools" > "Win8 Loopback Exemptions", "Exempt All", and "Save Changes".

---

### Python based apps (Azure CLI)

##### PowerShell
```powershell
$Env:REQUESTS_CA_BUNDLE = "http://localhost:8888/FiddlerRoot.cer"
$Env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION = $true
$Env:HTTPS_PROXY = 'localhost:8888'
```

##### CMD
```
Set AZURE_CLI_DISABLE_CONNECTION_VERIFICATION=1
```

---

### Java
[Configure Fiddler for Java apps](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1519533/Configuring-Fiddler-for-Java-Apps)

---

### Node/NPM

Before running "npm start", run the following commands:
```
set https_proxy=http://127.0.0.1:8888 
set http_proxy=http://127.0.0.1:8888
set NODE_TLS_REJECT_UNAUTHORIZED=0
```

---

### From a Mac device

1. Install Fiddler on Windows
2. Enable "Allow Remote Computers to Connect" in Fiddler -> Options -> Connections
3. Enable HTTPS decryption in Fiddler -> Options -> HTTPS
4. Restart Fiddler for changes to take effect
5. On the Mac:
    a. Go to Network -> Proxies -> Enable HTTPS Proxy
    b. Enter the IP of the Windows PC
    c. Enter the Port for the Fiddler proxy (default: 8888)
    d. In Safari browse to: {WindowsPC_IP}:8888
    e. Install the Fiddler Certificate
    f. In KeyChain Access, right click the Fiddler Certificate > Trust > Select Trust Always
    g. Test connectivity by browsing to a web page
6. For iOS Emulator (Xcode):
    a. Browse to {WindowsPC_IP}:8888 in Safari
    b. Install the Fiddler certificate
    c. Settings -> General -> About -> Certificate Trust Settings -> Trust the Fiddler Cert
    d. Test connectivity

---

## Capture Incoming Requests (Reverse Proxy)

To monitor incoming requests, configure Fiddler as a reverse proxy:

1. Run Fiddler as administrator
2. Go to Tools > Fiddler Options > Connections, ensure "Allow remote computers to connect" is checked, port set to 8888
3. Close Fiddler
4. Start REGEDIT
5. Create DWORD named `ReverseProxyForPort` in `HKEY_CURRENT_USER\SOFTWARE\Microsoft\Fiddler2`
6. Set value to the local port to re-route to (usually 80 for HTTP, 443 for HTTPS). Base: Decimal.
7. Ensure port 8888 is open on the firewall
8. Restart Fiddler
9. Test by navigating to http://127.0.0.1:8888

> IMPORTANT: After finished, remove "Allow remote computers to connect" option.

---

## Alternatives to Fiddler
* Charles Proxy: https://www.charlesproxy.com/
* NetLog: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/use-netlog-capture-network-traffic
* mitmproxy: https://mitmproxy.org/
