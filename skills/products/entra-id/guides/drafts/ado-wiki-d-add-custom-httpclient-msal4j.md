---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/MSAL/MSAL For Java/Add Custom HttpClient"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMSAL%2FMSAL%20For%20Java%2FAdd%20Custom%20HttpClient"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to add custom HttpClient to MSAL4J

## Overview

Custom HttpClient can be useful when needing to customize behaviors of the HTTP calls. For example, you can:
- Configure a Proxy
- Intercept HTTP requests to perform additional logging

## Create the MSAL HttpClient Adapter

First, create your custom MSAL HttpClient Adapter:

```java
import com.microsoft.aad.msal4j.HttpMethod;
import com.microsoft.aad.msal4j.HttpRequest;
import com.microsoft.aad.msal4j.HttpResponse;
import com.microsoft.aad.msal4j.IHttpClient;
import com.microsoft.aad.msal4j.IHttpResponse;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import okhttp3.Headers;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;


class MsalOkHttpClientAdapter implements IHttpClient {

    private OkHttpClient client;

    MsalOkHttpClientAdapter(OkHttpClient httpClient) throws Exception {
        // You can configure OkHttpClient
        this.client = httpClient;
    }

    @Override
    public IHttpResponse send(HttpRequest httpRequest) throws IOException {
        // Map URL, headers, and body from MSAL's HttpRequest to OkHttpClient request object
        Request request = buildOkRequestFromMsalRequest(httpRequest);

        // Execute Http request with OkHttpClient
        Response okHttpResponse = client.newCall(request).execute();

        // Map status code, headers, and response body from OkHttpClient's Response object to MSAL's IHttpResponse
        return buildMsalResponseFromOkResponse(okHttpResponse);
    }

    private static Request buildOkRequestFromMsalRequest(HttpRequest httpRequest) {
        Request.Builder builder = new Request.Builder()
            .url(httpRequest.url());

        if (httpRequest.httpMethod() == HttpMethod.POST) {
            builder.method("POST", RequestBody.create(httpRequest.body().getBytes(StandardCharsets.UTF_8)));
        }

        // defaults to GET, with no body
        if (httpRequest.headers() != null) {
            builder.headers(Headers.of(httpRequest.headers()));
        }

        return builder.build();
    }

    private static IHttpResponse buildMsalResponseFromOkResponse(Response okHttpResponse) throws IOException {
        HttpResponse msal4j = new HttpResponse();
        msal4j.statusCode(okHttpResponse.code());

        for (String headerKey : okHttpResponse.headers().names()) {
            List<String> val = okHttpResponse.headers(headerKey);
            msal4j.headers().put(headerKey, val);
        }
        msal4j.body(okHttpResponse.body().string());

        return msal4j;
    }
}
```

## Add the adapter to MSAL4J instantiation

```java
OkHttpClient.Builder httpClientBuilder = new OkHttpClient.Builder();

// ...
// You can then add optional HttpClient options like proxy or HttpInterceptor...
// ...

OkHttpClient httpClient = httpClientBuilder.build();

pca = PublicClientApplication.builder(CLIENT_ID)
        .authority(AUTHORITY)
        .httpClient(new MsalOkHttpClientAdapter(httpClient))
        .build();
```
