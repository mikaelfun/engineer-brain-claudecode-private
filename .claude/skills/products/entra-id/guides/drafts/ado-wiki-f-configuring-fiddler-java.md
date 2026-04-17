---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/Java/Configuring Fiddler for Java Apps"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Developer/Developer%20Scenarios/Java/Configuring%20Fiddler%20for%20Java%20Apps"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Configure Java environment to point to Fiddler

## Run the app with proxy settings

```
java -DproxySet=true -Djavax.net.ssl.trustStoreType=Windows-ROOT -Dhttps.proxyPort=8888 -Dhttps.proxyHost=127.0.0.1 -jar test.jar
```

## If unable to install Fiddler certificate on system Root

1. Export Fiddler's root certificate: Tools -> Fiddler Options -> HTTPS -> Export Root Certificate to Desktop
2. Create a keystore with this certificate:
   ```
   %JAVA_HOME%\bin\keytool.exe -import -file C:\Users\<Username>\Desktop\FiddlerRoot.cer -keystore FiddlerKeystore -alias Fiddler
   ```
3. Start JVM with Fiddler proxy and custom truststore:
   ```
   java -DproxySet=true -DproxyHost=127.0.0.1 -DproxyPort=8888 -Dhttps.proxyPort=8888 -Dhttps.proxyHost=127.0.0.1 -Djavax.net.ssl.trustStore=FiddlerKeystore -Djavax.net.ssl.trustStorePassword=<password> -jar test.jar
   ```

## Via code

### Using Environment variables (Windows with Fiddler installed)
```java
System.setProperty("javax.net.ssl.trustStoreType", "Windows-ROOT");
System.setProperty("https.proxyHost", "127.0.0.1");
System.setProperty("https.proxyPort", "8888");
```

### Using HttpsURLConnection
```java
proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 8888));
URL url = new URL("https://graph.microsoft.com/v1.0/...");
HttpURLConnection conn = (HttpURLConnection) url.openConnection(proxy);
```

### Using OkHttpClient

Create a ProxyOkHttpClient class that configures proxy and SSL trust for OkHttpClient, then add to:

- **GraphServiceClient**: `new GraphServiceClient(new BaseBearerTokenAuthenticationProvider(tokenProvider), proxiedHttpClient.getClient())`
- **MSAL4J**: Create MsalOkHttpClientAdapter implementing IHttpClient, then `.httpClient(new MsalOkHttpClientAdapter(proxiedHttpClient.getClient()))`

## Additional resources

- MSAL4J Fiddler guide: https://learn.microsoft.com/en-us/entra/msal/java/build/fiddler
