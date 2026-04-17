# Scripts: Enumerate All RBAC Role Assignments for a User

> Source: Scripts to get all roles/permission a user was granted to each sub and RG
> Status: draft (pending SYNTHESIZE review)

## Method 1: Az PowerShell (`-ExpandPrincipalGroups`)

```powershell
Connect-AzAccount -Environment AzureChinaCloud
$upn = "user@domain.com"
$user = Get-AzADUser -UserPrincipalName $upn
$objectId = $user.Id
$subs = Get-AzSubscription
$result = @()

foreach ($s in $subs) {
    Set-AzContext -SubscriptionId $s.Id | Out-Null
    $assignments = Get-AzRoleAssignment -ObjectId $objectId `
        -IncludeClassicAdministrators -ExpandPrincipalGroups
    foreach ($a in $assignments) {
        $result += [pscustomobject]@{
            SubscriptionId     = $s.Id
            SubscriptionName   = $s.Name
            Scope              = $a.Scope
            RoleDefinitionName = $a.RoleDefinitionName
            RoleDefinitionId   = $a.RoleDefinitionId
            PrincipalId        = $a.ObjectId
            PrincipalType      = $a.ObjectType
            Condition          = $a.Condition
            ConditionVersion   = $a.ConditionVersion
            CanDelegate        = $a.CanDelegate
        }
    }
}

$csv = "rbac_assignments_effective_$($user.UserPrincipalName).csv"
$result | Export-Csv -Path $csv -NoTypeInformation -Encoding UTF8
```

Key flag: **`-ExpandPrincipalGroups`** includes roles inherited via group membership.

## Method 2: Azure CLI (`--include-groups`)

```powershell
az cloud set --name AzureChinaCloud
az login
$TargetUpn = 'user@domain.com'
$Out = "rbac_assignments_$($TargetUpn).csv"

$subs = az account list --query "[].{id:id,name:name}" -o json | ConvertFrom-Json

"subscriptionId,subscriptionName,principalName,principalType,roleDefinitionName,scope" |
    Out-File -FilePath $Out -Encoding UTF8

foreach ($s in $subs) {
    $rows = az role assignment list `
        --all `
        --subscription $s.id `
        --assignee $TargetUpn `
        --include-inherited `
        --include-groups `
        --output json `
        --query "[].{principalName:principalName, principalType:principalType, roleDefinitionName:roleDefinitionName, scope:scope}" |
        ConvertFrom-Json
    foreach ($r in $rows) {
        $pn = if ($r.principalName) { $r.principalName } else { "" }
        $pt = if ($r.principalType) { $r.principalType } else { "" }
        $line = '{0},{1},{2},{3},{4},{5}' -f $s.id, $s.name, $pn, $pt, $r.roleDefinitionName, $r.scope
        Add-Content -Path $Out -Value $line
    }
}
```

Key flag: **`--include-groups`** includes roles inherited via group membership.

## Notes
- Both methods iterate all subscriptions the caller has access to
- Output is CSV for easy review/sharing with customers
- For Global Azure: use `-Environment AzureCloud` or `az cloud set --name AzureCloud`
- `-ExpandPrincipalGroups` / `--include-groups` are critical to capture indirect (group-based) assignments
