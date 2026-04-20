---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Review/How to upgrade an ExpressRoute circuit from Standard SKU to Premium SKU"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FReview%2FHow%20to%20upgrade%20an%20ExpressRoute%20circuit%20from%20Standard%20SKU%20to%20Premium%20SKU"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

## Description

How to verify an ExpressRoute circuit SKU and upgrade from Standard SKU to Premium SKU

## Verify NRP and Brooklyn show "Standard SKU

**Important Note:** Upgrading an ExpressRoute circuit SKU should be scheduled after hours for the customer due to the requirement that all BGP peerings will be re-established. During the peering re-establishment, the customer could experience a short period of loss of connectivity.

## NRP

1.  Browse ACIS
    1.  Endpoint: NRP
    2.  Operation Group: NRP Subscription Operations
    3.  Operation Name: Get NRP Subscription Details
    4.  Input SubscriptionID and select the region where the circuit is provisioned
    5.  Search the output for your ServiceKey, then scroll to find the current SKU NRP has for the circuit

- The JSON will resemble the following for a Standard SKU circuit:

```
"sku": {
    "name": "Standard_MeteredData",
    "tier": "Standard",
    "family": "MeteredData"
}
```

## Brooklyn

1.  Browse ACIS
    1.  Endpoint: Brooklyn
    2.  Operation Group: Goldengate Operations
    3.  Operation Name: Dump Circuit Information
    4.  Input SubscriptionID and/or ServiceKey

- The SKU portion of the output for a Standard circuit will equal the following:

```
"CIRCUIT SKU: STANDARD"
```

## Verify the Billing Type in Brooklyn Matches the Billing Type from NRP

## NRP

NRP holds the billing type in the "family" property of the "sku" JSON (shown above)
Possible values are:

- UnlimitedData
- MeteredData

## Customer update the circuit SKU using PowerShell

- Ensure the customer is running the latest version of Azure PowerShell.

```powershell
#set variables
$billingType = "eitherMeteredDataOrUnlimitedDataHere"
$subId = "enterSubIDhere"
$circuitName = "circuitNameHere"
$resourceGroupName = "rgNameHere"
#login
Login-AzureRmAccount
#select the subscription where the circuit resides
Select-AzureRmSubscription -SubscriptionId $subId
#get the circuit into a variable
$ckt = Get-AzureRmExpressRouteCircuit -Name $circuitName -ResourceGroupName $resourceGroupName
#change to Premium
$ckt.Sku.Name = "Premium_$($billingType)"
$ckt.Sku.Tier = "Premium"
#write the changes to Azure
Set-AzureRmExpressRouteCircuit -ExpressRouteCircuit $ckt
```

## Verify the SKU change in NRP and Brooklyn

After the upgrade, verify the SKU shows "Premium" in both NRP (sku.tier = "Premium") and Brooklyn (CIRCUIT SKU: PREMIUM).

## Troubleshooting

- If the circuit goes into a failed state, see the troubleshooting scenario "ExR Circuit in Failed State"
