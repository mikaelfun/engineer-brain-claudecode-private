---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/AGC Ingress Annotations"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/AGC%20Ingress%20Annotations"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AGC Ingress Annotations

## Description

Below is a list of the ingress annotations that AGC utilizes and when they are used. **These annotations are not applicable to Application Gateway Ingress Controller.**

## Annotations

| Annotation | Value Type  | Scenario | Use |
|-----------|:-----------|:-----------|:-----------|
| alb.networking.azure.io/alb-name | string | Managed AGC| Defines the applicationloadbalancer name for the ingress |
| alb.networking.azure.io/alb-namespace | string | Managed AGC| Defined the applicationloadbalancer namespace for the ingress |
| alb.networking.azure.io/alb-ingress-extension | string | All | Associates an ingressextenstion with the ingress |
| alb.networking.azure.io/alb-id | resource URI | BYO AGC | Defines the AGC for use with the ingress |
| alb.networking.azure.io/alb-frontend | string | BYO AGC |  Defines the AGC frontend for use with the ingress |
