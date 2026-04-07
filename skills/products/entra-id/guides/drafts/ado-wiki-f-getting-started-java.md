---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/Java/Getting started Java"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Developer/Developer%20Scenarios/Java/Getting%20started%20Java"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Getting started with Java

## Install Java
https://www.oracle.com/technetwork/java/javase/downloads/

## IDE options
- Visual Studio Code: https://code.visualstudio.com/Download
- Eclipse: https://www.eclipse.org/downloads/
- IntelliJ: https://www.jetbrains.com/idea/

## Package management (Maven)

Download: https://maven.apache.org/download.cgi
Install: https://maven.apache.org/install.html

```
mvn package
java -jar app.jar
```

Extract dependencies only:
```
mvn dependency:copy-dependencies -DoutputDirectory=JARS
```

## Set up Java environment variables

1. Locate Java bin folder (e.g., `c:/Program Files/Java/jre-10.0.2/bin`)
2. Control Panel -> System and Security -> System -> Advanced System Settings
3. Click Environment Variables -> System variables -> Path
4. Add Java bin and JDK folder paths

## Common Errors

### "the import cannot be resolved"
After importing JAR packages, clean the project:
- VS Code: Java: Clean Java Language Server Workspace
- Eclipse: Maven mvn clean install -> Update Project -> Project Clean
