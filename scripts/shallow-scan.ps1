$token = az account get-access-token --resource https://onesupport.crm.dynamics.com --query accessToken -o tsv
$headers = @{
    Authorization    = "Bearer $token"
    'OData-MaxVersion' = '4.0'
    'OData-Version'    = '4.0'
    Accept             = 'application/json'
}
$filter = "statecode eq 0 and _msdfm_assignedto_value eq 3841aa66-e0af-f011-bbd2-0022482589a6"
$select = "ticketnumber,title,modifiedon,statuscode,severitycode"
$url = "https://onesupport.crm.dynamics.com/api/data/v9.0/incidents?`$filter=$filter&`$select=$select&`$orderby=modifiedon desc"
$r = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
foreach ($c in $r.value) {
    "$($c.ticketnumber) | $($c.modifiedon) | sev$($c.severitycode) | status$($c.statuscode) | $($c.title)"
}
