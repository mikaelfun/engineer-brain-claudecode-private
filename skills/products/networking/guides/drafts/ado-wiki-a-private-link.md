---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Feature: Private Link for Application Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Private%20Link%20for%20Application%20Gateway"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Deploy Application Gateway Private Link

## Description

Application Gateway Private Link feature enables customers to extend their workloads to be connected over private link spanning across VNETs and Subscriptions. Connectivity to Application Gateway can be accomplished by using Azure Resource called Private Endpoint.

## Lab Template

Example deployment template available at internal SharePoint (AppGWPrivatePreview.zip).

## Key Concepts

- Private Link allows cross-VNET and cross-subscription connectivity to Application Gateway
- Uses Azure Private Endpoint for connectivity
- Enables private consumption of Application Gateway services
