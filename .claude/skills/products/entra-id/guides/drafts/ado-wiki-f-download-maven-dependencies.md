---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/Java/Download all Maven projects dependencies"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Developer/Developer%20Scenarios/Java/Download%20all%20Maven%20projects%20dependencies"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Download all Maven projects dependencies

Add the **maven-dependency-plugin** to your pom.xml:

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-dependency-plugin</artifactId>
      <executions>
        <execution>
          <id>copy-dependencies</id>
          <phase>package</phase>
          <goals>
            <goal>copy-dependencies</goal>
          </goals>
          <configuration>
            <outputDirectory>${project.build.directory}/target_dependencies</outputDirectory>
            <overWriteReleases>false</overWriteReleases>
            <overWriteSnapshots>false</overWriteSnapshots>
            <overWriteIfNewer>true</overWriteIfNewer>
          </configuration>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

Quick alternative command:
```
mvn dependency:copy-dependencies -DoutputDirectory=JARS
```
