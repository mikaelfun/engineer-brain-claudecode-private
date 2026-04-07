# Enable MSAL4J Logging in Spring Boot Web Application

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/enable-msal4j-logging-spring-boot-webapp)

## Purpose

Enable Microsoft Authentication Library for Java (MSAL4J) logging using Logback framework in Spring Boot web apps for debugging authentication issues.

## Steps

### 1. Add Logback Dependency (pom.xml)

```xml
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.2.3</version>
</dependency>
```

### 2. Create Logback.xml (src/main/resources/)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    <root level="debug">
        <appender-ref ref="STDOUT" />
    </root>
</configuration>
```

### 3. Set logging.config Property

```java
@SpringBootApplication
public class MsalB2CWebSampleApplication {
    static {
        System.setProperty("logging.config", "path/to/logback.xml");
    }
    public static void main(String[] args) {
        SpringApplication.run(MsalB2CWebSampleApplication.class, args);
    }
}
```

## Code Sample

Full sample: [GitHub - MSAL4J_SpringBoot_Logging](https://github.com/bachoang/MSAL4J_SpringBoot_Logging/tree/main/msal-b2c-web-sample)
