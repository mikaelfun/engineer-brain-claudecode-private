---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/Java/Springboot/Springboot API Integration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Developer/Developer%20Scenarios/Java/Springboot/Springboot%20API%20Integration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to configure a Spring Boot API protected by Entra ID

## Pre-requisites

- Web API Application registered in Azure AD
- Expose API permissions (Delegated and/or Application)
- Set App ID URI in "Expose an API" blade
- Create custom scope (e.g., "hello") for delegated permission
- Create App Role (e.g., "app_hello") for application permission
- Client app with API permissions configured and admin consent granted

## application.properties

```
azure.activedirectory.client-id=<Web API Application ID>
azure.activedirectory.app-id-uri=<Web API App ID URI>
azure.activedirectory.tenant-id=<tenant ID>
```

## Controller with PreAuthorize annotations

```java
@RestController
public class HomeController {

    @GetMapping("/webapiA")
    @ResponseBody
    @PreAuthorize("hasAuthority('SCOPE_hello')")
    public String fileA() {
        return "Response from WebApiA.";
    }

    @GetMapping("/webapiB")
    @ResponseBody
    @PreAuthorize("hasAuthority('APPROLE_app_hello')")
    public String fileB() {
        return "Response from WebApiB.";
    }

    @GetMapping("/webapiC")
    @ResponseBody
    @PreAuthorize("hasAnyAuthority('APPROLE_app_hello','SCOPE_hello')")
    public String fileC() {
        return "Response from WebApiC.";
    }
}
```

**Key patterns:**
- Delegated permission: `SCOPE_<scope_name>`
- Application permission: `APPROLE_<role_name>`
- Either type: `hasAnyAuthority('APPROLE_...','SCOPE_...')`

## Build and Run

```
mvn clean package -DskipTests
mvn spring-boot:run
```

## Testing

- **Delegated permission token**: Use Postman Authorization Code Grant flow. Permission appears in `scp` claim.
- **Application permission token**: Use Postman Client Credentials Grant flow. Permission appears in `roles` claim.

Reference sample: https://github.com/Azure/azure-sdk-for-java/tree/master/sdk/spring/azure-spring-boot-samples/azure-spring-boot-sample-active-directory-resource-server
