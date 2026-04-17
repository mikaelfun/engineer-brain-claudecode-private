---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/Java/java networking troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FJava%2Fjava%20networking%20troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting Networking connectivity in Java

## Overview

Start with reviewing logs. Here is a great article on Logs related to Java:
https://stackify.com/java-logs-types/

You can also test network connections in code:
https://www.tutorialspoint.com/Checking-internet-connectivity-in-Java

```java
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;

try {
    URL url = new URL("http://www.google.com");
    URLConnection connection = url.openConnection();
    connection.connect();
    System.out.println("Internet is connected");
} catch (MalformedURLException e) {
    System.out.println("Internet is not connected");
} catch (IOException e) {
    System.out.println("Internet is not connected");
}

try {
    URL url = new URL("https://login.microsoftonline.com/common/discovery/instance?api-version=1.1&authorization_endpoint=https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
    URLConnection connection = url.openConnection();
    connection.connect();
    System.out.println("Connected to AAD");
} catch (MalformedURLException e) {
    System.out.println("Failed to connect to AAD");
} catch (IOException e) {
    System.out.println("Failed to connect to AAD");
}
```

If issue is coming from another first-party or third-party library, you can try to directly implement MSAL and use Client Creds as a test:

```java
ConfidentialClientApplication app = ConfidentialClientApplication.builder(
        clientId,
        ClientCredentialFactory.createFromSecret(secret))
        .authority(authority)
        .build();

ClientCredentialParameters clientCredentialParam = ClientCredentialParameters.builder(
        Collections.singleton(scope))
        .build();

CompletableFuture<IAuthenticationResult> future = app.acquireToken(clientCredentialParam);
return future.get();
```

## Enable Java network logs

### Enable SSL debugging

```bash
java -Djavax.net.debug=ssl:handshake:verbose <YourProgramName>
```

### Enable via code

```java
System.setProperty("javax.net.debug", "ssl:handshake:verbose");
```

## Android

Android does not expose javax.net.debug logging. Instead capture inner exceptions:

```kotlin
try {
    PublicClientApplication.create(context, R.raw.msal_config)
        .acquireToken(activity, scopes, callback)
} catch (ex: MsalException) {
    Log.e("MSAL", "MSAL error: ${ex.errorCode}", ex)
    val cause = ex.cause
    Log.e("MSAL", "Cause: ${cause?.javaClass?.name} - ${cause?.message}", cause)
    var c = cause
    while (c != null) {
        Log.e("MSAL", "Inner cause: ${c.javaClass.name} - ${c.message}")
        c = c.cause
    }
}
```

Also collect logcat logs for MSAL Android diagnostics.
