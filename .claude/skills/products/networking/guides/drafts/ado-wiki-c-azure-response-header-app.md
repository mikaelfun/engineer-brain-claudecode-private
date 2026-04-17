---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Azure Response Header App"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FAzure%20Response%20Header%20App"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Response Header App

[[_TOC_]]

## Description

In labs we frequently need to look at the request headers that is sent to an application. While not overly difficult, there is a potential significant amount of work to set up logging to capture this. As this overhead exists, we have built out a nodejs application that can be deployed that mirrors the request headers in the response body. This eliminates the need to configure logging and lowers time and effort in configuring lab environments.

## Deploying via IaaS

### Deploying the application on a standalone server.

The headersapp repo can be found [here](https://github.com/Adal8819/headersapp)

This application can be deployed in a variety of ways. The application its self is written in Node.JS and can be run from any node.js environment. Node JS is support on both Windows and Linux. 

Instructions for installing Node.js can be found [here](https://nodejs.org/en/download/).

Once node.js is installed you can clone the github repo locally.

```bash
git clone https://github.com/yourusername/headerapp.git
cd headerapp
```

Next we would install the dependencies.
```bash
npm install
```

Finally, we can start the application
```bash
npm start
```

This will start the application locally running on port 3000.

### Deploying the application using Docker.

Start by making sure that you have Docker [installed](https://docs.docker.com/engine/install/).

Once docker is installed clone the repo locally.

```bash
git clone https://github.com/yourusername/headerapp.git
cd headerapp
```

Next you can build the docker image. 

```bash
docker build -t headerapp .
```

Finally you would run the Docker container.

```bash
docker run -p 3000:3000 headerapp
```

Again, the application will be running locally on port 3000.

This can also be run using docker compose and the docker-compose.yml files that are prebuilt and included in the headersapp root directory. This will allow you to predefine any configurations in a file to simplify running the application. You would start the application by using docker compose.

```bash
docker compose up
```

## Deploying the prebuilt container

There is a prebuilt container for this that is housed in github package manager. This can be deployed directly to an AKS cluster, a microsoft.web webapplication or a container app.

### Deploying via AKS

Below is an example AKS yaml configuration for this application.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: headerappdeployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: headerapp
  template:
    metadata:
      labels:
        app: headerapp
    spec:
      nodeSelector:
        "kubernetes.io/os": linux
      containers:
      - name: headerapp
        image: ghcr.io/adal8819/headers-app:latest
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 250m
            memory: 256Mi
        ports:
        - containerPort: 3000
          name: http
---
apiVersion: v1
kind: Service
metadata:
  name: headerapp
spec:
  type: NodePort
  ports:
  - port: 3000
    targetPort: 3000
  selector:
    app: headerapp
```

This sample will run the container app on a nodeport at port 3000.

### Deploying as an Azure Container App

1. Navigate to the azure portal and search for Container Apps.
2. Click on Create and Select Container App from the drop down.
3. Fill in your relevant container app information. Make sure you select container image as the deployment source. Click on "Next: Container".
4. Select **DockerHub or other registries** on image source and **Public** on Image type. For the registry login server enter `ghcr.io` and for the Image and tag enter `adal8819/headers-app:latest`.
5. Click the "Next: Ingress" button.
6. On the Ingress page, Check the box for Ingress. Select "Accepting traffic from anywhere", ingress type of http, and enter Target port `3000`. Click "Review + Create".

### Deploying via Web App

1. Navigate in the Azure portal to App services. Click Create and select Web Application.
2. For Publish select **Container** and Operating System select **Linux**.
3. Click Other container registries and Public for Docker hub options. Fill in:
   - Registry server URL: `https://ghcr.io/adal8819`
   - Image and tag: `headers-app:latest`
   - Port: `3000`
4. Click "Review + create" then "Create".

## Final thoughts and comments

This Node.js application can be placed behind any layer 7 proxy that we support. It is an excellent method for testing rewrite rules, WAF configurations and general web responses.

## Contributors

- @B43B586E-AE6B-61CC-B706-14FA68F4A732
- @4D14617B-E2B5-6C38-A141-3D5F398DD9EB
