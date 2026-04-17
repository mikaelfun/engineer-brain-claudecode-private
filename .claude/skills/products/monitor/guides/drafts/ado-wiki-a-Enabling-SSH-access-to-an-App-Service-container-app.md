---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Pre-reqs/Enabling SSH access to an App Service container app"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FPre-reqs%2FEnabling%20SSH%20access%20to%20an%20App%20Service%20container%20app"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Enabling SSH access to an App Service container app

## Overview

The following article covers the steps needed to enable SSH access on your custom container image running on App Services. SSH access may be necessary for troubleshooting or collecting diagnostics from the worker process running the application.

## Prerequisites

- A container-based .Net Core Web app deployed to App Services
- Docker Desktop installed
- Visual Studio with container support

## Workflow

1. Locally on Visual Studio, add the following files to your project:

### start_container.sh

```bash
#!/bin/sh
set -e

# Get env vars in the Dockerfile to show up in the SSH session
eval $(printenv | sed -n "s/^\([^=]\+\)=\(.*\)$/export \1=\2/p" | sed 's/"/\\\"/g' | sed '/=/s//="/' | sed 's/$/"/' >> /etc/profile)

echo "Starting SSH ..."
service ssh start

echo "Running startup command "
dotnet nzl-cont-lin-net8-auto.dll
```

**Note:** You will need to update the last command in start_container.sh to match the name of the dll file for your project.

### sshd_config

```
Port            2222
ListenAddress   0.0.0.0
LoginGraceTime  180
X11Forwarding   yes
Ciphers aes128-cbc,3des-cbc,aes256-cbc,aes128-ctr,aes192-ctr,aes256-ctr
MACs hmac-sha1,hmac-sha1-96
StrictModes     yes
SyslogFacility  DAEMON
PasswordAuthentication  yes
PermitEmptyPasswords    no
PermitRootLogin         yes
Subsystem sftp internal-sftp
```

**Note:** These two files should be contained in the same folder as the rest of your application files.

2. Update your `Dockerfile`:

```dockerfile
# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
# USER app
WORKDIR /app
EXPOSE 8080 8081 2222

#install OpenSSH
COPY sshd_config /etc/ssh/
COPY start_container.sh /app
# Start and enable SSH
RUN apt-get update \
&& apt-get install -y --no-install-recommends dialog \
&& apt-get install -y --no-install-recommends openssh-server \
&& echo "root:Docker!" | chpasswd \
&& chmod u+x /app/start_container.sh

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["<project>.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet build -c $BUILD_CONFIGURATION -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["/app/start_container.sh"]
```

3. Deploy the updated container to App Services using Visual Studio Publish.

4. Once deployed, SSH access can be used from the Azure Portal under the container's SSH blade for troubleshooting and diagnostics collection.

## Key Points

- SSH port is **2222** (App Service convention for custom containers)
- Default root password is `Docker!` (Azure App Service standard)
- The `start_container.sh` script starts SSH daemon before the application, ensuring SSH is available even if the app crashes
- Environment variables from the Dockerfile are exported to the SSH session via the eval command in the startup script

## Public Documentation

- [Deploy an ASP.NET Core container to Azure App Service using Visual Studio](https://learn.microsoft.com/en-us/visualstudio/containers/deploy-app-service?view=vs-2022)
