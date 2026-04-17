---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Conceptual/What is an Application Framework?"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FConceptual%2FWhat%20is%20an%20Application%20Framework%3F"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

:::template /.templates/Sandbox-Header.md
:::


[[_TOC_]]


# Overview
---
What to be learned: 

The foundational concepts of web application frameworks, including their definition as structured software platforms that provide developers with tools and patterns to build web applications efficiently. A framework typically consists of routing systems, database integrations, security features, and templating engines. They are used to standardize development practices, reduce boilerplate code, and ensure consistency across large applications.

Why it should be learned: 

In order to support the Application Insights product, engineers should understand what a framework is, as it directly impacts how applications are structured and where telemetry should be placed. Framework knowledge helps engineers better interpret performance metrics, understand stack traces, and identify the root cause of issues when customers report problems. This understanding is crucial because Application Insights integrates differently with various frameworks, and troubleshooting often requires knowledge of framework-specific behavior patterns and execution flows.


# Workflow
---
<details closed>
<summary><b>What is an application framework?</summary>
<br>
An application framework is a structured foundation of pre-written code that provides a standardized way to build and deploy applications. It reduces the need to "reinvent the wheel" for common development tasks.
<br>
<br>
</details>
<details closed>
<summary><b>Why use an application framework?</summary>
<br>
Frameworks provide proven, tested solutions for common tasks, so developers can focus on building what makes their application unique rather than reinventing standard features.
<br>
<br>
</details>
<details closed>
<summary><b>When to use a framework?</summary>
<br>
Use a framework when your web application needs more than just static pages. If you're handling user data, working with databases, or building APIs, a framework will provide the structure and tools you need while helping prevent common security issues.
<br>
<br>
</details>
<details closed>
<summary><b>Understanding Frameworks: The Carpenter's Workshop</summary>
<br>
Think of a framework like a fully equipped carpenter's workshop: the layout is optimized for workflow, power tools are ready to use, jigs and templates ensure consistent results, and safety equipment is built into the environment.
<br>
<br>
</details>
<summary></summary>
<details closed>
<summary><b>Examples of Common Frameworks</summary>

-  ASP.NET: Microsoft's original web framework, mature and Windows-focused.<br>
-  ASP.NET Core: Cross-platform, open-source evolution of ASP.NET.<br>
-  Express.js: Minimalist Node.js framework.<br>
-  Flask: Simple but powerful Python framework.<br>
-  Spring: Comprehensive Java framework.<br>
-  Quarkus: Modern Java framework designed for microservices. <br> (**NOTE**: Our OTel Java agent does not work with Quarkus native apps: [Enable OpenTelemetry in Application Insights - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-enable?tabs=java-native#install-the-client-library). Instead, customers should use the following community package [Quarkus Opentelemetry Exporter for Microsoft Azure :: Quarkiverse Documentation](https://docs.quarkiverse.io/quarkus-opentelemetry-exporter/dev/quarkus-opentelemetry-exporter-azure.html) again, not a supported library by Microsoft<br>
</details>
<summary></summary>
<details closed>
<summary><b>ASP.NET Core: The Workshop in Practice</summary>
<br>
<b>Core Components of ASP.NET Core:</b><br>
<br>
- NET Runtime: Executes C# code on any platform.<br>
- ASP.NET Core: Handles HTTP pipeline & middleware.<br>
- Entity Framework Core: Manages data models.<br>
- Package Management (NuGet): Manages project dependencies.<br>
- Authentication & Security: Verifies user identity.<br>
- Error Handling & Logging: Built-in logging providers.<br>
<br>
</details>
<summary></summary>
<details closed>
<summary><b>Framework Components in Detail</summary>
<br>
   
<b>Authentication</b>
Controls who can access what in your application. Most frameworks offer flexible authentication options, from simple username/password to OAuth, JWT tokens, and social logins.

<b>Routing</b>
Directs incoming requests to the right code in your application. Frameworks provide flexible routing patterns and handle HTTP methods, parameter binding, and query string parsing automatically.

<b>Database Access</b>
Manages how your application talks to databases. Most frameworks include an ORM (Object Relational Mapper) that converts database operations into your programming language's syntax.

<b>Error Handling</b>  
Manages how your application handles problems through middleware and error handlers. Frameworks automatically show detailed errors during development while switching to user-friendly messages in production environments.

<b>Middleware</b>  
Processes web requests through a series of components that run in sequence. Each piece of middleware handles a specific job, and frameworks let you build custom middleware chains for different routes and scenarios.

</details>
<summary></summary>

<details closed>
<summary><b>Common Framework Patterns</summary>
<br>
   
<b>MVC (Model View Controller)</b>
Organizes code into three distinct parts: Models manage data and business logic, Views handle the user interface, and Controllers coordinate between them.

<b>REST APIs</b>
Provide a standardized way for applications to communicate. They use standard HTTP methods for different operations and are predictable and self-contained.

<b>Middleware Chains</b>
Form a pipeline that processes requests in sequence. This structured approach means you can easily add new features by simply inserting new middleware into your chain.

<b>Service Patterns</b>  
Separate business logic into focused components. This separation makes code more maintainable and testable, while allowing teams to work on different services independently.
<br>

</details>
<summary></summary>

<details closed>
<summary><b>From Blueprint to Building</summary>
<br>


![arch.png](/.attachments/arch-ed6cd867-181b-43cd-9931-d0526ecfcd0a.png)

Looking at the diagram, you can see three distinct sections.

The blue section at the top is your Web App layer, where ASP.NET Core provides ready-made components like Controllers and Views. This is where your application interacts with users. The red section in the middle is your Application Core - it's where your business logic lives, with pieces like Business Services and Domain Events.

The green section and everything below it represents your Infrastructure, handling things like data storage, caching, and connections to external services.

What's clever about this design is how the framework provides pre-built components for each layer - from authentication systems in the Web App layer to database tools in the Infrastructure layer. It's like having a complete construction kit where all the pieces are designed to work together, but you still have the flexibility to arrange them according to your blueprint's specifications.
<br>

</details>
<summary></summary>


# Public Documentation
---

[What is .NET Framework? A software development framework.](https://dotnet.microsoft.com/en-us/learn/dotnet/what-is-dotnet-framework)

[Common web application architectures - .NET | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)




# Internal References
---
[What is an Application Framework - Video Presentation](https://microsoft.sharepoint.com/:v:/t/AzMonPODSwarming/EZMqrRGlp7VKkmHa0aRjrC0Bx_TpMMyCoy35guc1yeUu6w?e=EDkolI)

[What is an Application Framework - PowerPoint Presentation](https://microsoft.sharepoint.com/:p:/t/AzMonPODSwarming/ESbyEdAlNqdHsQL38mHl-XoBl-J9vFIlF4CRXuhcscMisQ?e=sfja14)

---
Last Modified date: 2025-01-22
Last Modified by: tobyclifton

