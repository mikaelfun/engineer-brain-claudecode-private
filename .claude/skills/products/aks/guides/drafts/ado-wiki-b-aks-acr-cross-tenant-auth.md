---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/Set up AKS to pull from ACR in a different AD tenant"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FSet%20up%20AKS%20to%20pull%20from%20ACR%20in%20a%20different%20AD%20tenant"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Attaching an ACR to an AKS cluster in a separate tenant

[[_TOC_]]

I have recently worked on an issue where customer is trying to pull image from ACR that is in a different tenant and there is no official documentation on how to set this up.

Bin Du from ACR PG helped me and he also update the document in Github.

Below are the steps to integrate ACR from a different tenant to authenticate with AKS SP.

<https://github.com/Azure/acr/blob/main/docs/aks-acr-across-tenants.md>

## Introduction

There are several ways to set up the auth credential in Kubernetes to pull image from ACR. For example, you can use admin user or repository scoped access token to configure pod imagePullSecrets.

While imagePullSecrets is commonly used, it brings the challenge and overhead to manage the corresponding secret. On Azure, you can set up AKS cluster with a service principal credential which allows you securely pull the image from ACR without additional imagePullSecrets setting on each pod.

Sometimes, you may have your AKS and ACR in different Azure Active Directories (Tenants). This document will walk your through the steps to enable cross tenant authentication using service principal credential.

## Instructions

In this example, the AKS cluster is in Tenant A and the ACR is in Tenant B.

Tenant A is also the service principal home tenant.

You will need the contributor role of AKS subscription and the owner role of ACR subscription.

1. Enable multi-tenant AAD Application

    Login Azure portal in Tenant A and go to Azure Active Directory App registrations blade to find the service principal application object.

    Remember the Application (client) ID (it will be used in step 2 and step 4)

    Create a client secret if not exist (It is IMPORTANT to make sure you use this client secret to update AKS in step 4).

2. Provision the service principal in ACR Tenant

    Open the following link with the Tenant B admin account and accept the permission request.

    `https://login.microsoftonline.com/<ACR Tenant ID (Tenant B)>/oauth2/authorize?client_id=<Application (client) ID>&response_type=code&redirect_uri=<redirect url>`

3. Grant service principal ACR image pull permission

    Assign AcrPull role to the service principal in Tenant B's ACR subscription.

4. Update AKS with the AAD Application secret

    Use the Application (client) ID and client secret collected in step 1 to update AKS service principal credential.

    <https://docs.microsoft.com/en-us/azure/aks/update-credentials#update-aks-cluster-with-new-service-principal-credentials>

## Owner and Contributors

**Owner:** Naomi Priola <Naomi.Priola@microsoft.com>
**Contributors:**

- Harsha Jetty <hajetty@microsoft.com>
