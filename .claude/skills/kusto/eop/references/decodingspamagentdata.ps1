


 

 <#
.SYNOPSIS
    This script decodes the information that the Spam Agent logs to a user frinendly message.
.DESCRIPTION
    This script decodes the information that the Spam Agent logs to a user frinendly message
.PARAMETER -messagedata
    The data entry from the exported Message Tracking logs. 

.EXAMPLE
    $>decodingspanagentdata.ps1 -messagedata "<log data>"
#>



[CmdletBinding()] 

Param(
    [Parameter(Mandatory = $true)]
    [String] $messagedata
)

$AgentName = @{
    "TRA" = "Transport rule agent";
    "AMA" = "Anti-malware agent";
    "SFA" = "Spam filter agent";
    "EU" = "Engine update agent";
    "QIA" = "Quarantine insertion agent";
    "CompCost" = "Aggregated component cost";
    "PFA" = "Protocol filter agent";
    "CFA" = "Content filter agent";
    "MDFA" = "Mailbox delivery filter agent";
    "PCFA" = "Post content filter agent";
    "PRECFA" = "Pre content filter agent";
    "DPA" = "Data loss prevention agent";
    "MSFA" = "Mailbox submission filter agent";
    "TTCA" = "Time travel control agent";
    "MLA" = "MIP labels agent";
    "CFPEA" = "Control flow policy evaluation agent";
    "AFA" = "Analyst feature agent";    
}

$agentgroupname = @{
    "DC" = "Data classification";
    "ETR" = "Exchange transport rule";
    "ETRI" = "Exchange transport rule information";
    "EV" = "Engine verdict for anti-malware";
    "SUM" = "Verdict summary for a message";
    "AM"= "Antimalware engine";
    "CI"= "Client information";
    "ETRP"= "Exchange transport rule performance";
    "AS"="AntiSpam Information";
    "ORES"="On Resolved Information - Post Content Filter Agent";
    "OROU"="On Routed Information - Post Content Filter Agent";
    "OCAT"="On Categorized Information - Post Content Filter Agent";
    "OSUB"="On Submitted Information - Pre Content Filter Agent";
    "DPR"="Dlp policy rule - Dlp Agent";
    "MLR"="Mip Labels rule - Mip Labels Agent";
    "IMRL"="IsMemberResolver Logs";
    "SL"="Sensitivity Lable - Dlp Agent";
    "AD"="Attachment Detail - Dlp Agent";
    "DPRE"="Dlp policy rule error - Dlp Agent";
    "C"="COST";
    "LTC"="Latency of the data";
    "SVF"="Spam Verdict Filter";
    "CAT"="Category of the tenant action applied";
    "PTR"="Policy Tip Reason";
}

$SVFENUM = @{
    "RES" = "mail bypassed due to internal/reserved IP";
    "SKS" = "mail bypassed due to SCL value is 6";
    "SKN" = "mail bypassed due to SCL value is -1";
    "SFE" = "mail bypassed due to SafeSenders";
    "BLK" = "mail bypassed due to BlockedSenders";
    "SPM" = "messages marked as spam";
    "NSPM" = "messages marked as not spam";
    "ROU" = "messages that have already been processed and are just being routed";
    "SKI" = "mail bypassed due to being an intra-org mail";
    "SKQ" = "mail bypassed due to release from quarantine";
    "SKA" = "mail bypassed due to sender is on hosted content filter policy allowed senders list";
    "SKB" = "mail bypassed due to sender is on hosted content filter policy blocked senders list";    
}
    

$descriptions = @{
    "tactcat" = "Category of the tenant action applied";
    "tact" = "Tenant action applied";
    "TACTPID" = "Tenant action policy ID";
    "ABWL" = "AddressBook White List";
    "LAT" = "Latency";
    "ALAT" = "Aync Latency";
    "AMA" = "AntiMalware Agent";
    "AMA, SUM" = "AntiMalware Agent";
    "AMA, EV" = "AntiMalware Agent Engine Version";
    "ASF" = "ASF Rule Matched";
    "AUTH" = "Authentication passed";
    "BCL" = "Bulk Confidence Level";
    "BULK" = "Bulk Mail";
    "CLTCTRY" = "Client Country Attribution";
    "CTRY" = "Country Attribution";
    "DEST" = "Destination Folder Code";
    "DI" = "Spam Disposition";
    "DIR" = "Directionality";
    "DKL"  = "Blocked Sender Domain";
    "DWL"  = "Trusted Sender Domain";
    "ENG"  = "MDFA Rules Matched";
    "ETRP" = "Transport Rules Performance Information";
    "ETRI" = "Transport Rules Information";
    "EX"   = "Only Trusted Senders Reach Inbox (Exclusive)";
    "EXP" = "Experiment ID";
    "FPR" = "Fingerprint Rule";
    "FPRX" = "Fingerprints for Custom Targets";
    "GAL" = "Global Allow List";
    "H" = "Hello Domain";
    "HCTFP" = "Hosted Content Filter Policy Id";
    "IJL"  = "Implicitly Junked Sender Address";
    "IPV" = "IP Filter Verdict";
    "IWL"  = "Implicitly Trusted Sender Address";
    "JMR"  = "Junk Mail Rule triggered";
    "KL"   = "Blocked Sender Address";
    "LANG" = "Mail Language";
    "MLAT" = "Message Latency";
    "MLC" = "Machine Learning Classifier";
    "MLV" = "Machine Learning Verdict";
    "NSPM" = "Not Spam";
    "OFR"  = "Folder Reason";
    "PSP"  = "Prior Seen Authentication Pass";
    "RD" = "Reverse DNS";
    "RLAT" = "Rule Latency";
    "RSK" = "Risk Level";
    "RWL"  = "Trusted Recipient List";
    "SCL" = "Spam Confidence Level";
    "SCORE" = "Verdict Score";
    "SFA" = "Spam Filter Agent";
    "SFP" = "Partition";
    "SFS" = "Matching RuleId's";
    "SFV" = "Spam Filter Verdict";    
    "SPM" = "Spam";
    "SRV" = "IP Filter Source";
    "SRVR" = "Server";
    "TS" = "Transport Rules Tenant Settings";
    "UCF"  = "Custom Folder Selected By User Rules";
    "WIMS-AUTH" = "WIMS authentication result";
    "WL"   = "Trusted Sender Address";
    "RPL" = "Run Policy";
    "RPLEPPR" = "Run Policy - EOPProtectionPolicyRulesPerTenant";
    "RPLAPPR" = "Run Policy - ATPProtectionPolicyRulesPerTenant";
    "RPLHCFR" = "Run Policy - RunHostedContentFilterRulesPerTenant";
    "RPLSLR" = "Run Policy - RunSafeLinksRulesPerTenant";
    "RPLAPR" = "Run Policy - RunAntiPhishRulesPerTenant";
    "RPLMR" = "Run Policy - RunMalwareRulesPerTenantSettings";
    "RSP" = "Execution Spam Engine";
    "EXECW" = "Execution WallClock";
    "EXECC" = "CPU Time";
    "LoadW" = "Load WallClock";
    "LoadC" = "Load CPU Time";
    "dcid"="Data Classification Id";
    "st"="sync time";
    "NLI"="Verdict Not Listed In value";
    "CAL"="Skipped SPAM as the calleer is in IP Allow List";
    "RES"="Verdict Reserved value";
    "CIP"="Client IP";
    "SIP"="Server IP";
    "INB"="Inbound";
    "OUT"="Outbound";
    "INT"="Internal Message";
    "PTR"="reverse DNS lookup";
};

$TACTENUM = @{
    "-1" = "None";
    "0" = "Move to Junk Mail Folder";
    "1" = "Add X-Header";
    "2" = "Modify Subject";
    "3" = "Redirect";
    "4" = "Delete";
    "5" = "Quarantine";
    "6" = "No Action";
    "7" = "Bcc Message";
    "8" = "Replace Attachment";
    "9" = "Reject";
}

$CATENUM = @{
    "NONE" = "No tenant action applied";
    "HSPM" = "HighConfidenceSpamAction applied";
    "SPM" = "SpamAction applied";
    "BULK" = "BulkAction applied";
    "PHISH" = "PhishAction applied";
    "DIMP" = "Domains Impersonation Action applied";
    "UIMP" = "User Impersonation Action applied";
    "SPOOF" = "Spoof Action applied";
    "GIMP" = "Graph Impersonation Action applied";
    "AMP" = "Anti Malware Policy Action applied";
    "SAP" = "Safe Attachment Policy Action applied";
    "ETR" = "Enterprise Tenant Rules";
    "ZAPM" = "Malware ZAP (TT)";
    "ZAPP" = "Phish ZAP (TT)";
    "ZAPS" = "Spam ZAP (TT)";
    "HPHISH" = "High confidence Phish action applied";
    "INTOS" = "Intra Org policy setting";
    "OSPM" = "Outbound spam action";
    "FTBP" = "AntiMalware filetype policy setting";
}

$DIENUM = @{

    "None" = "None";
    "SF" = "Message with safe sender hit";
    "SB" = "Message with block sender hit";
    "SQ" = "Inbound message marked as spam";
    "SX" = "Inbound message with X-Header";
    "SS" = "Inbound message marked with subject modification";
    "SR" = "Inbound message redirected to another email address";
    "SO" = "Outbound message marked as spam routed through OBE IPs";
    "SN" = "Outbound message marked as spam routed through HRD IPs";
    "SD" = "Inbound message silently deleted (based on customer settings)";
    "ST" = "Asf settings in Test evaluation mode";
    "SJ" = "Move to Junk Mail Folder";
    "SC" = "Inbound message BCC to another email address";
}

$BCL = @{
    "0" = "The message isn't from a bulk sender";
    "1" = "The message is from a bulk sender that generates few complaints.";
    "2" = "The message is from a bulk sender that generates few complaints.";
    "3" = "The message is from a bulk sender that generates few complaints.";
    "4" = "The message is from a bulk sender that generates a mixed number of complaints.";
    "5" = "The message is from a bulk sender that generates a mixed number of complaints.";
    "6" = "The message is from a bulk sender that generates a mixed number of complaints.";
    "7" = "The message is from a bulk sender that generates a mixed number of complaints.";
    "8" = "The message is from a bulk sender that generates a high number of complaints.";
    "9" = "The message is from a bulk sender that generates a high number of complaints.";
}

$SCL = @{
    "-1" = "skipped spam filtering";
    "0" = "Spam filtering determined the message wasn't spam.";
    "1" = "Spam filtering determined the message wasn't spam.";
    "5" = "Spam filtering marked the message as Spam";
    "6" = "Spam filtering marked the message as Spam";
    "7" = "Spam filtering marked the message as High confidence spam";
    "8" = "Spam filtering marked the message as High confidence spam";
    "9" = "Spam filtering marked the message as High confidence spam";
}

$CTRYCODE = @{
    "AC" = "Ascension Island";
    "AD" = "Andorra";
    "AE" = "United Arab Emirates";
    "AF" = "Afghanistan";
    "AG" = "Antigua and Barbuda";
    "AI" = "Anguilla";
    "AL" = "Albania";
    "AM" = "Armenia";
    "AN" = "Netherlands Antilles";
    "AO" = "Angola";
    "AQ" = "Antarctica";
    "AR" = "Argentina";
    "AS" = "American Samoa";
    "AT" = "Austria";
    "AU" = "Australia";
    "AW" = "Aruba";
    "AX" = "Åland Islands";
    "AZ" = "Azerbaijan";
    "BA" = "Bosnia and Herzegovina";
    "BB" = "Barbados";
    "BD" = "Bangladesh";
    "BE" = "Belgium";
    "BF" = "Burkina Faso";
    "BG" = "Bulgaria";
    "BH" = "Bahrain";
    "BI" = "Burundi";
    "BJ" = "Benin";
    "BL" = "Saint Barthélemy";
    "BM" = "Bermuda";
    "BN" = "Brunei Darussalam";
    "BO" = "Bolivia, Plurinational State of";
    "BQ" = "Bonaire, Sint Eustatius and Saba";
    BR = "Brazil";
    BS = "Bahamas";
    BT = "Bhutan";
    BV = "Bouvet Island";
    BW = "Botswana";
    BY = "Belarus";
    BZ = "Belize";
    CA = "Canada";
    CC = "Cocos (Keeling) Islands";
    CD = "Congo, The Democratic Republic of the";
    CF = "Central African Republic";
    CG = "Congo";
    CH = "Switzerland";
    CI = "Côte d'Ivoire";
    CK = "Cook Islands";
    CL = "Chile";
    CM = "Cameroon";
    CN = "China";
    CO = "Colombia";
    CR = "Costa Rica";
    CU = "Cuba";
    CV = "Cape Verde";
    CW = "Curaçao";
    CX = "Christmas Island";
    CY = "Cyprus";
    CZ = "Czech Republic";
    DE = "Germany";
    DJ = "Djibouti";
    DK = "Denmark";
    DM = "Dominica";
    DO = "Dominican Republic";
    DZ = "Algeria";
    EC = "Ecuador";
    EE = "Estonia";
    EG = "Egypt";
    EH = "Western Sahara";
    ER = "Eritrea";
    ES = "Spain";
    ET = "Ethiopia";
    EU = "European Union";
    FI = "Finland";
    FJ = "Fiji";
    FK = "Falkland Islands (Malvinas)";
    FM = "Micronesia, Federated States of";
    FO = "Faroe Islands";
    FR = "France";
    GA = "Gabon";
    GB = "United Kingdom";
    GD = "Grenada";
    GE = "Georgia";
    GF = "French Guiana";
    GG = "Guernsey";
    GH = "Ghana";
    GI = "Gibraltar";
    GL = "Greenland";
    GM = "Gambia";
    GN = "Guinea";
    GP = "Guadeloupe";
    GQ = "Equatorial Guinea";
    GR = "Greece";
    GS = "South Georgia and the South Sandwich Islands";
    GT = "Guatemala";
    GU = "Guam";
    GW = "Guinea-Bissau";
    GY = "Guyana";
    HK = "Hong Kong";
    HM = "Heard Island and McDonald Islands";
    HN = "Honduras";
    HR = "Croatia";
    HT = "Haiti";
    HU = "Hungary";
    ID = "Indonesia";
    IE = "Ireland";
    IL = "Israel";
    IM = "Isle of Man";
    IN = "India";
    IO = "British Indian Ocean Territory";
    IQ = "Iraq";
    IR = "Iran, Islamic Republic of";
    IS = "Iceland";
    IT = "Italy";
    JE = "Jersey";
    JM = "Jamaica";
    JO = "Jordan";
    JP = "Japan";
    KE = "Kenya";
    KG = "Kyrgyzstan";
    KH = "Cambodia";
    KI = "Kiribati";
    KM = "Comoros";
    KN = "Saint Kitts and Nevis";
    KP = "Korea, Democratic People's Republic of";
    KR = "Korea, Republic of";
    KW = "Kuwait";
    KY = "Cayman Islands";
    KZ = "Kazakhstan";
    LA = "Lao People's Democratic Republic";
    LB = "Lebanon";
    LC = "Saint Lucia";
    LI = "Liechtenstein";
    LK = "Sri Lanka";
    LR = "Liberia";
    LS = "Lesotho";
    LT = "Lithuania";
    LU = "Luxembourg";
    LV = "Latvia";
    LY = "Libya";
    MA = "Morocco";
    MC = "Monaco";
    MD = "Moldova, Republic of";
    ME = "Montenegro";
    MF = "Saint Martin (French part)";
    MG = "Madagascar";
    MH = "Marshall Islands";
    MK = "Macedonia, The Former Yugoslav Republic of";
    ML = "Mali";
    MM = "Myanmar";
    MN = "Mongolia";
    MO = "Macao";
    MP = "Northern Mariana Islands";
    MQ = "Martinique";
    MR = "Mauritania";
    MS = "Montserrat";
    MT = "Malta";
    MU = "Mauritius";
    MV = "Maldives";
    MW = "Malawi";
    MX = "Mexico";
    MY = "Malaysia";
    MZ = "Mozambique";
    NA = "Namibia";
    NC = "New Caledonia";
    NE = "Niger";
   NF = "Norfolk Island";
    NG = "Nigeria";
   NI = "Nicaragua";
    NL = "Netherlands";
    NO = "Norway";
    NP = "Nepal";
    NR = "Nauru";
    NU = "Niue";
    NZ = "New Zealand";
    OM = "Oman";
   PA = "Panama";
    PE = "Peru";
    PF = "French Polynesia";
    PG = "Papua New Guinea";
    PH = "Philippines";
    PK = "Pakistan";
    PL = "Poland";
    PM = "Saint Pierre and Miquelon";
    PN = "Pitcairn";
    PR = "Puerto Rico";
    PS = "Palestinian Territory, Occupied";
    PT = "Portugal";
    PW = "Palau";
    PY = "Paraguay";
    QA = "Qatar";
    RE = "RÉUNION";
    RO = "Romania";
    RS = "Serbia";
    RU = "Russian Federation";
    RW = "Rwanda";
    SA = "Saudi Arabia";
    SB = "Solomon Islands";
    SC = "Seychelles";
    SD = "Sudan";
    SE = "Sweden";
    SG = "Singapore";
    SH = "Saint Helena, Ascension and Tristan da Cunha";
    SI = "Slovenia";
    SJ = "Svalbard and Jan Mayen";
    SK = "Slovakia";
    SL = "Sierra Leone";
    SM = "San Marino";
    SN = "Senegal";
    SO = "Somalia";
    SR = "Suriname";
    SS = "South Sudan";
    ST = "Sao Tome and Principe";
    SU = "Soviet Union";
    SV = "El Salvador";
    SX = "Sint Maarten (Dutch part)";
    SY = "Syrian Arab Republic";
    SZ = "Swaziland";
    TC = "Turks and Caicos Islands";
    TD = "Chad";
    TF = "French Southern Territories";
    TG = "Togo";
    TH = "Thailand";
    TJ = "Tajikistan";
    TK = "Tokelau";
    TL = "Timor-Leste";
    TM = "Turkmenistan";
    TN = "Tunisia";
    TO = "Tonga";
    TP = "Portuguese Timor";
    TR = "Turkey";
    TT = "Trinidad and Tobago";
    TV = "Tuvalu";
    TW = "Taiwan, Province of China";
    TZ = "Tanzania, United Republic of";
    UA = "Ukraine";
  UG = "Uganda";
    UM = "United States Minor Outlying Islands";
    US = "United States";
    UY = "Uruguay";
    UZ = "Uzbekistan";
    VA = "Holy See (Vatican City State)";
    VC = "Saint Vincent and the Grenadines";
    VE = "Venezuela, Bolivarian Republic of";
    VG = "Virgin Islands, British";
    VI = "Virgin Islands, U.S.";
    VN = "Viet Nam";
    VU = "Vanuatu";
    WF = "Wallis and Futuna";
    WS = "Samoa";
    YE = "Yemen";
    YT = "Mayotte";
    ZA = "South Africa";
    ZM = "Zambia";
    ZW = "Zimbabwe";
}



Function getdecodingvalue
{

    [cmdletbinding()]
    Param(
        [Parameter(Mandatory=$true)]
        [String]$logentry,
        [Parameter(Mandatory=$true)]
        [String]$pattern          
    )
    Process
    {

        $keyset = $logentry.split($pattern)
        $key = $keyset[0]
        $value = $keyset[1]

        $decodedkey = $NULL
        $decodedvalue = $NULL


        if ($key) {
            # try to decode key value   
            if ($AgentName.$key) {
                $decodedkey = $AgentName.$key
            } elseif ($agentgroupname.$key) {
                $decodedkey = $agentgroupname.$key
            } elseif ($descriptions.$key) {
                $decodedkey = $descriptions.$key
            } 
        }


        # try to decode value 

        if ($value) {
            if ($key -eq 'TACT') {
                $decodedvalue = $TACTENUM.$value
            } elseif ($key -eq 'tactcat' -or $key -eq 'CAT') {
                $decodedvalue = $CATENUM.$value
            } elseif ($key -eq 'CTRY') {
                $decodedvalue = $CTRYCODE.$value
            } elseif ($key -eq 'DI') {
                $decodedvalue = $DIENUM.$value 
            } elseif ($key -eq 'SVF') {
                $decodedvalue = $SVFENUM.$value
            } elseif ($key -eq 'BCL') {
                $decodedvalue = $BCL.$value
            } elseif ($key -eq 'SCL') {
                $decodedvalue = $SCL.$value
            } elseif ($agentgroupname.$value) {
                $decodedvalue = $agentgroupname.$value
            } elseif ($descriptions.$value) {
                $decodedvalue = $descriptions.$value
            } 
        }
        
        if ($decodedkey) {
            $key = "$key($decodedkey)"
        }
        
        if ($decodedvalue) {
            $value = "$value($decodedvalue)"
        }
      
        return "$key=$value"
              
   }

}


$linenum = 0;
# some rules contains ' in the value, we need to remove it
$data = $messagedata.replace("'S:","S:")

if ($data.Contains(';S:')) {
   $pattern1 = ';S:';
   $pattern2 = '=';   
} else {
   $pattern1 = ';';
   $pattern2 = ':';   
}

$loglines = $data -split ($pattern1)

foreach ($logline in $loglines)
{
    write-host "$linenum ========================================================================================"
    $loglines=$loglines.TrimEnd("'")
    $logentries =  $logline.split('|')  
    
    foreach ($logentry in $logentries) 
    {
        if ($logentry) { 
            $extractedvalue = getdecodingvalue -logentry $logentry -pattern $pattern2
            write-host "$extractedvalue"
        }
    }

    $linenum++

}