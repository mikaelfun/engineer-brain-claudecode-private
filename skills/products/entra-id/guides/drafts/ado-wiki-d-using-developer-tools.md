---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Training/Tools/Using Developer Tools"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FTraining%2FTools%2FUsing%20Developer%20Tools"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Using Developer Tools

[[_TOC_]]

# Overview

Most browsers (Chrome, Edge, Firefox, Safari) ship with DevTools.
They give you live visibility into how a web page loads, renders, and communicates.

**Network Panel**  
The heart of web debugging. This is also where HAR captures originate.

Shows the following...
* Request/response headers
* Status codes
* Redirect chains
* TLS handshake details
* Timing breakdowns (DNS, TCP, SSL, TTFB, content download)
* Caching behavior
* Failed requests
* CORS issues

>While getting HAR captures, make sure the capture starts before even accessing the app.
>While reviewing the HAR captures the  [HTTP/1.1 Status Codes](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) is an excellent resource for identifying what those HTTP status codes mean.


**Console Panel**  
Shows the following...
* JavaScript errors
* Warnings
* Logs
* Stack traces
* Security messages
* Great for debugging clientside logic or API call failures.

**Application / Storage Panel**  
Useful for auth flows, token storage, and offline behavior.

Shows the following...
* Cookies
* LocalStorage
* SessionStorage
* IndexedDB
* Service workers
* Cache storage

**Security Panel**  
Perfect for debugging HTTPS issues or certificate chain mismatches.

Shows the following...
* TLS version
* Certificate chain
* Mixed content warnings
* HSTS
* Certificate errors

**Performance Panel**  
Used for diagnosing slow UI, jank, or long page loads.

Shows the following...
* CPU usage
* Rendering pipeline
* Layout thrashing
* Long tasks
* JavaScript execution time

**Sources Panel**  
Great for deep clientside debugging.

Full JavaScript debugger...
* Breakpoints
* Step-through execution
* Watch variables
* Networkinitiated breakpoints

---

# Browsers

## Edge

Microsoft Edge has an inbuilt [Developer tools](https://docs.microsoft.com/en-us/microsoft-edge/f12-devtools-guide).

**JavaScript or page loading issues**  
Look into the [console tab](https://docs.microsoft.com/en-us/microsoft-edge/f12-devtools-guide#the-console-tool-ctrl2) for any JavaScript errors.

**Network Issues**  
To diagnose support problems, the network tab can be used:
1. Open up the built-in [Developer tools](https://docs.microsoft.com/en-us/microsoft-edge/f12-devtools-guide).
1. Select the network tab.
1. Load the page with the problem.
1. Wait until it has finished loading.

Providing Information to Support
1. Go to Developer tools using the F12 keyboard shortcut
1. Refresh the page to start capturing the traffic between the browser to the server. 
    Note: Please capture a full page load so we can see the requests made prior to the problem we're analyzing.
1. Complete the steps that trigger or demonstrate your issue.
1. Click on Export as HAR (Floppy button next to the stop button on the Developer Tools) followed by Save As... to save the HAR file.

---

## Chrome

Chrome is bundled with a set of [Developer Tools](https://developer.chrome.com/devtools) as covered in that link.

**JavaScript Errors**  
Look in the [Chrome Console](https://developers.google.com/chrome-developer-tools/docs/console) for any JavaScript errors. 

**Network Issues**  
To diagnose support problems, the network tab can be used:
1. Open up Chrome and enable the [Developer Tools](https://developer.chrome.com/devtools).
1. Select the network tab.
1. Enable preserve log
1. Load the page with the problem.
1. Wait until it has finished loading.

Support may also request a browser debug log. If this information has not been requested, you can skip to "Providing Information to Support"
To enable the extra browser log:
1. Start up the browser with the parameters `--enable-logging --v=1` [More info](https://www.chromium.org/developers/how-tos/run-chromium-with-flags)
1. There will be a file call "chrome_debug.log" generated in the [Chrome user default Location](http://dev.chromium.org/user-experience/user-data-directory).

Providing Information to Support
1. Bring up the developer tools using one of these methods:
    **Using Keyboard Shortcut**  
        (I on OS X, Ctrl + Shift + i on Linux, F12 on Windows)
    **From Chrome Menu**  
    at the top-right of your browser window, then select Tools > Developer Tools.
1. Navigate to the Network tab on the Development Tool
1. Check [Disable Cache](https://developer.chrome.com/devtools/docs/settings#disable-cache) option to prevent caching of resources for this specific page.
1. Refresh the page to start capturing the traffic between the browser to the server.
1. Complete the steps that trigger or demonstrate your issue.
1. Right Click in the area where the network records are shown and select Save as HAR with content
1. Before sending the HAR file to support, ensure to remove/censor any sensitive information using a text editor (i.e. remove passwords, secrets, etc).

---

## Safari

Safari comes with its own [Safari Web Development Tools](https://support.apple.com/guide/safari-developer/safari-developer-tools-overview-dev073038698/11.0/mac/10.13) as described in that link.

**JavaScript or page loading Issues**  
Apple have put together a Using the [Error Console guide](https://support.apple.com/guide/safari-developer/log-messages-with-the-console-dev4e7dedc90/11.0/mac/10.13) that will detail how to find JavaScript errors.

**Network Issues**  
Take a look through the [Safari Web Inspector Guide documentation](https://developer.apple.com/library/IOS/documentation/AppleApplications/Conceptual/Safari_Developer_Guide/Instruments/Instruments.html#//apple_ref/doc/uid/TP40007874-CH4-SW1) and follow the details there to look for any network errors. 
Providing Information to Support
1. Go to Developer tools and choose [Start Recording Timeline](https://support.apple.com/guide/safari-developer/record-a-timeline-dev59adba03f/mac)
1. [Select timeline all instruments to record](https://support.apple.com/guide/safari-developer/select-timeline-instruments-to-record-dev07cf788d3/mac)
1. Refresh the page to start capturing the traffic between the browser to the server. 
    Note: Please capture a full page load so we can see the requests made prior to the problem we're analyzing.
1. Complete the steps that trigger or demonstrate your issue.
1. Click on Save. The circle with the down arrow.


---

# Sanitized HAR files in Edge or Chrome

**First and foremost, our own and our customer's security is our top priority. We should always request only the data we need, and when sensitive data is required, it must be clearly explained to the customer so they can decide whether to share it with us.**

You may have observed or not that under network in the **Developer Tools** of Edge and Google Chrome, the balloon tip suggests that the exported HAR file is sanitized.

This means sensitive data, such as cookies (i.e. AppProxyAccessCookie) or authorization headers, will be removed. While this practice enhances security, it can complicate troubleshooting (lead to false conclusions) or even make it impossible.

This behavior has been introduced in **Chrome 130** and was a response to some security incidents.
That resulted in HAR traces are being sanitized by default now.

**Here are some tips on how to handle these situations: (depends on the situation)**

1. Live troubleshooting.

2. Use backend logs in ASC (i.e. Sign-in logs, Kusto).

3. Enable the option "Export HAR(with sensitive data)..." in the browser
   - Open DevTools and then the Settings
   - Look for the "Network" settings under preferences and there you can enable the option to save HAR with sensitive data.
   - When you now try to export a HAR you will have 2 options to save HAR traces with "sensitive" data vs "sanitized".

4. Utilize NET EXPORT (edge://net-export/; chrome://net-export/) with the "include cookies and credentials" option, or use Fiddler for data collection.
