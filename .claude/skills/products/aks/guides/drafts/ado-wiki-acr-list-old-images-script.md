---
source: ado-wiki
sourceRef: Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/TSG/Shell script to list images older than a year from repos in ACR
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FShell%20script%20to%20list%20images%20older%20than%20a%20year%20from%20repos%20in%20ACR"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Shell script for getting all images older than a year from the repos in an ACR

## Summary

To list all repo images/manifests  which are older than a year from an ACR.
But the issue was, CX had an ACR with 20000 repos which had images in it and manually executing the below command for each repo was not possible.

Command gives output of a single repo images/manifests data from the ACR older than a year
az acr manifest list-metadata --name $repository --registry $acr_name --orderby time_asc -o tsv --query "[?lastUpdateTime < '2023-10-04'].[digest, lastUpdateTime]"

CX had 22k repos in single ACR ,hence needed to iterate the repos to fetch all the images older than a year, and cx wanted to select the number of repos to query(ex first 4k ,then next 4k etc)
as querying 22k repos images was taking > 1day ,and hence needed a shell script.

## Solution

### The below script will iterate repos and fetch all repo images older a year ,from the ACR as beow

1)Get the list of repositories in the ACR in acr.txt file

```bash
az acr repository list --name aiindevops --output tsv > acr.txt
```

2)Get the acr.txt, shows list of repo names of ACR

3)Script to fetch the ACR repo names and images/manifest of each repo

```bash
#!/bin/bash

# Set the ACR name and registry
acr_name="aiindevops"

# fetches total no of lines count (ex 22k) from acr.txt (which has all the repo names in acr)
max=$(cat acr.txt | wc -l)
echo $max

# set 1 to 4k lines to fetch repo images out of 22k, next time set loop from 4001 to 8000 each iteration respectively
for (( i=1; i <= 4000; ++i ))
do
  repositories=$(sed -n "${i}p" acr.txt)
  for repository in $repositories
  do
   manifests=$(az acr manifest list-metadata --repository $repository --name $acr_name --orderby time_asc -o tsv --query "[?lastUpdateTime < '2023-10-04'].[digest, lastUpdateTime]")

   # Output the repository name
   echo "$i: Repository: $repository"
  
   # Output the image manifests and their metadata
   echo "Manifests:"
   echo "$manifests"

  done
done
```

4)Run the script to fetch the repo images/manifest from the ACR and redirect/append output to a file

```bash
./AcrRepoFetch.sh >> acrrepoamnifest.txt
```
