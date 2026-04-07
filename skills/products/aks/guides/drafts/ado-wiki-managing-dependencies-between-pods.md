---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/Managing dependencies between pods"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FManaging%20dependencies%20between%20pods"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Configuring dependencies between 2 pods in AKS

[[_TOC_]]

## Summary and Goals

This article shows you how to configure dependencies between two pods in Azure Kubernetes Service (AKS) by using Liveness and Readiness probes.

## Overview: What is Liveness and Readiness probes?

### 1. Liveness Probe

- A Liveness Probe is a diagnostic mechanism that Kubernetes uses to determine if a container within a pod is alive and functioning properly.
- It periodically checks the health of the application running inside the container.
- If the Liveness Probe fails, Kubernetes will take action based on your configuration. It can restart the container, which may help recover from transient failures or application crashes.
- Common use cases for Liveness Probes include checking if an application process is responding to requests, verifying that a database connection is still active, or ensuring that critical services within the container are operational.

### 2. Readiness Probe

- Readiness Probe is another diagnostic mechanism used to determine if a container is ready to accept incoming traffic.
- Unlike the Liveness Probe, which checks if the container is alive, the Readiness Probe checks if the container is ready to serve requests. This is particularly useful when you have services with dependencies that need time to initialize or warm up.
- When a container is not ready, Kubernetes will temporarily remove it from the pool of endpoints behind a service, preventing incoming traffic from being directed to it. This helps avoid sending traffic to containers that are not fully operational.

## Scenario

- In this Lab scenario, you'll create 2 pods: pod-11 which is the parent pod and pod-111 which is the one that should not start unless pod-11 is in running healthy state.
- You need to exposed pod-11 to create its service on port 80.
- Then apply the Liveness and Readiness probes configuration in the pods Yaml file. So, pod-111 will monitor the pod-11 service IP address (10.0.27.204).
- I used "nginx images" to create the 2 pods.

## Prerequisites

- An Azure subscription.
- Azure CLI
- An AKS cluster with nodes available.

## Configuration

Note: before you start, please make sure to change the parameters attached in the config below like (names, location..ect) based on your setup.

1. Create the resource group: 'az group create --name AKS-TEST --location WestEurope'

1. Create the AKS cluster with 2 nodes: 'az aks create --resource-group AKS-TEST --name AKS-CLUSTER -c <2>'

1. Connect to the cluster 'az aks get-credentials --resource-group AKS-TEST --name AKS-CLUSTER'

1. Once confirmed the cluster and are in running healthy state, you can start applying the needed info:

     a. Create pod-11 by applying the YAML file as below

    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
    labels:
        test: liveness-Rediness
    name: pod-11
    spec:
    containers:
    - name: liveness
        image: nginx
        ports:
        - containerPort: 80
        livenessProbe:
        httpGet:
            path: /
            port: 80
        initialDelaySeconds: 15
        periodSeconds: 10
        failureThreshold: 3
    ```

     b. Create the pod-11: 'kubectl apply -f pod-11.yaml'

     c. Expose pod-11 to create a service on port 80 using the command: 'kubectl expose pod pod-11 --port 80'

     d. Take the service IP address by applying command: 'kubectl get svc'

     e. Add the readiness and liveness probes to pod-111 to monitor the pod-11 service IP address:

    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
    name: pod-111
    spec:
    containers:
    - name: monitoring-container
        image: nginx
        readinessProbe:
        exec:
            command:
            - /bin/sh
            - -c
            - curl -f http://10.0.27.204:80/
        initialDelaySeconds: 15
        periodSeconds: 10
        failureThreshold: 3
        livenessProbe:
        exec:
            command:
            - /bin/sh
            - -c
            - curl -f http://10.0.27.204:80/
        initialDelaySeconds: 20
        periodSeconds: 15
    ```

     f. Create the pod-111: 'kubectl apply -f pod-111.yaml'

## References

- [Configure liveness readiness startup probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Container Instances Readiness Probes](https://learn.microsoft.com/en-us/azure/container-instances/container-instances-readiness-probe)
