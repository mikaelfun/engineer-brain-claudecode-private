---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/Java/Getting started Springboot"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Developer/Developer%20Scenarios/Java/Getting%20started%20Springboot"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Getting started with Java SpringBoot

## Get Azure AD Spring Boot sample

Azure AD sample: https://github.com/Azure/azure-sdk-for-java/tree/master/sdk/spring/azure-spring-boot-samples/azure-spring-boot-sample-active-directory-webapp

1. Clone: `git clone https://github.com/Azure/azure-sdk-for-java.git`
2. Navigate to: `sdk/spring/azure-spring-boot-samples/azure-spring-boot-sample-active-directory-webapp`

MSAL4J Spring sample: https://github.com/AzureAD/microsoft-authentication-library-for-java/tree/dev/src/samples/spring-security-web-app

## VS Code extensions

- Spring Boot Tools: https://marketplace.visualstudio.com/items?itemName=vmware.vscode-spring-boot
- Spring Boot Dashboard: https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-spring-boot-dashboard

## Configure Azure AD

Follow: https://github.com/Azure/azure-sdk-for-java/tree/master/sdk/spring/azure-spring-boot-samples/azure-spring-boot-sample-active-directory-webapp

## Run your App

1. In VS Code: Run -> Start Debugging -> Select Java
2. App runs on Tomcat port 8080 -> http://localhost:8080

## Troubleshooting

- Watch Java Debug Console for error details
- Run Maven Install (right-click Maven project -> Install)
- Update version numbers in pom.xml for problematic dependencies

## More resources

- More samples: https://github.com/Azure/azure-sdk-for-java/tree/master/sdk/spring/azure-spring-boot-samples/
- Spring + Azure: https://docs.microsoft.com/en-us/azure/developer/java/spring-framework/spring-boot-starters-for-azure
