---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/How to use a custom domain for azure container registry"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FHow%20to%20use%20a%20custom%20domain%20for%20azure%20container%20registry"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Using custom domains for ACR

## Disclaimer

Currently not fully supported by Azure-- this solution will be available with Azure services by July: <https://github.com/Azure/acr/tree/master/docs/custom-domain>

## How to use a custom domain for azure container registry

Azure Container registries has a typical login url of the format *.azurecr.io. A customer might like to have a custom domain that associate with its own organization. The following is the guide on how to achieve that.
Prerequisites For this example, we suppose that you want to associate registry.contoso.com with a Azure Container Registry. You would need the following:

- Setup your organization's DNS zone .contoso.com. To create one on Azure, you can follow this guide
- SSL certificate for registry.contoso.com, we would call it contoso.pfx. Put the password of the certificate to a file named pwd.txt. You would optionally also need your signing CA certificate's URL, such as <http://www.contoso.com/pki/ca.cert>
- An instance of Azure Container Registry service as the backend. In this example we would assume it's docker-registry-contoso.azurecr.io

## Steps

1. Upload your cert into Azure Key Vault
2. Under custom-domain/key-vault-setup/, run the following:
   1. (Optional) Create an Azure Key Vault, if you don't already have one:
      `.\ensure-vault.ps1 -subscriptionName <subscription> -resourceGroupName <resourceGroup> -vaultName <new VaultName>`
   2. Upload contoso.pfx to Azure Key Vault:
      `.\upload-cert.ps1 -pfxFilePath <pfxFile> -pfxPwFile <pwdFile> -secretName <new SecretName> -vaultName <vaultName>`
3. Deploy and configure an Nginx Docker image on a new Azure VM
4. Deploy via Azure Portal

Alternatively, to deploy using powershell script, custom-domain/docker-vm-deploy/, do the following:

1. Edit azuredeploy.parameters.json and populate all necessary parameters
2. Run the following script to create the new VM:
   `.\deploy.ps1 -resourceGroupName <resourceGroup>`
3. Configure DNS zone
4. Configure the DNS zone so registry.contoso.com points to the Azure VM you have just created. If you are using an Azure DNS Zone. You can use the following command:
`New-AzureRmDnsRecordSet -Name <registry> -RecordType CNAME -ZoneName <contoso.com> -ResourceGroupName <resourceGroup> -Ttl <Ttl> -DnsRecords (New-AzureRmDnsRecordConfig -Cname <AddrToAboveVM>)`
5. Quick verification -
   A simple way to test the setup is to call docker login to quickly confirm that the requests are properly forwarded:

   `docker login -u <username> -p <password> registry.contoso.com`
