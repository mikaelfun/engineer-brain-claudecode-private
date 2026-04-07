---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Third Party Connectors/Azure Monitoring Agent/Syslog log examples to use for testing"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FData%20Ingestion%20-%20Connectors%2FThird%20Party%20Connectors%2FAzure%20Monitoring%20Agent%2FSyslog%20log%20examples%20to%20use%20for%20testing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]



#**Commands for sending test logs**



##**Logger examples**



###Sample CEF log to port 514



```

logger -p local4.warn -t CEF: "0|First Test|MOCK|common=event-format-test|end|TRAFFIC|1|rt=$common=event-formatted-receive_time deviceExternalId=0002D01655 src=1.1.1.1 dst=2.2.2.2 sourceTranslatedAddress=1.1.1.1 destinationTranslatedAddress=3.3.3.3 cs1Label=Rule cs1=CEF_TEST_InternetDNS |data0=example" -P 514 -n 127.0.0.1

```



###Sample CEF Palo Alto log through logger

```

logger -p local4.warn -t CEF "0|Palo Alto Networks|PAN-OS|cef-test|end|TRAFFIC|1|rt=$cefformatted-receive_time deviceExternalId=0002D01655 src=1.1.1.1 dst=2.2.2.2 sourceTranslatedAddress=1.1.1.1 destinationTranslatedAddress=3.3.3.3 cs1Label=Rule cs1=InternetDNS CommunicationDirection" -P 514 -n 127.0.0.1

```



Syslog message output

```

Nov  4 00:15:46 10.6.0.4 CEF: 0|Palo Alto Networks|PAN-OS|8.0.0|general|SYSTEM|3|rt=Nov 04 2018 07:15:46 GMT deviceExternalId=unknown cs3Label=Virtual System cs3= fname= flexString2Label=Module flexString2=general msg= Failed password for root from 116.31.116.38 port 63605 ssh2 externalId=5705651 cat=general PanOSDGl1=0 PanOSDGl2=0 PanOSDGl3=0 PanOSDGl4=0 PanOSVsysName= dvchost=palovmfw PanOSActionFlags=0x0



```





###Sample Syslog log to port 514



```

sudo logger -p ftp.alert -P 514 -n 127.0.0.1 --rfc5424 --udp Test log sent to 514

```





##**echo examples**



###Sample CEF log to 514



```

echo -n "<164>CEF:0|Mock-test|MOCK|common=event-format-test|end|TRAFFIC|1|rt=$common=event-formatted-receive_time" | nc -u -w0 localhost 514

```

___

#Commands to collect logs for review



##**Collect on port 514**



```

sudo tcpdump -s 0 -Ani any port 514 -vv -w /var/log/on514.pcap

```



##**Collect on port 25224**



```

sudo tcpdump -s 0 -Ani any port 25224 -vv -w /var/log/on25224.pcap

```



##**Collect on port 25226**



```

sudo tcpdump -s 0 -Ani any port 25226 -vv -w /var/log/on25226.pcap

```



#**Sample logs per source**



###ArcSight

CEF:0|ArcSight|ArcSight|6.0.3.6664.0|agent:030|Agent [test] type [testalertng] started|Low|eventId=1 mrt=1396328238973 categorySignificance=/Normal categoryBehavior=/Execute/Start categoryDeviceGroup=/Application catdt=Security Mangement categoryOutcome=/Success categoryObject=/Host/Application/Service art=1396328241038 cat=/Agent/Started deviceSeverity=Warning rt=1396328238937 fileType=Agent cs2=<Resource ID\="3DxKlG0UBABCAA0cXXAZIwA\=\="/> c6a4=fe80:0:0:0:495d:cc3c:db1a:de71 

cs2Label=Configuration Resource c6a4Label=Agent 

IPv6 Address ahost=SKEELES10 agt=888.99.100.1 agentZoneURI=/All Zones/ArcSight 

System/Private Address Space 

Zones/RFC1918: 888.99.0.0-888.200.255.255 av=6.0.3.6664.0 atz=Australia/Sydney 

aid=3DxKlG0UBABCAA0cXXAZIwA\=\= at=testalertng dvchost=SKEELES10 dvc=888.99.100.1 

deviceZoneURI=/All Zones/ArcSight System/Private Address Space Zones/RFC1918: 

888.99.0.0-888.200.255.255 dtz=Australia/Sydney _cefVer=0.1



CEF:0|ArcSight|ArcSight|6.0.3.6664.0|agent:030|Agent [test] type [testalertng] started|Low|eventId=1 mrt=1396328238973 categorySignificance=/Normal categoryBehavior=/Execute/Start categoryDeviceGroup=/Application catdt=Security Mangement categoryOutcome=/Success categoryObject=/Host/Application/Service art=1396328241038 cat=/Agent/Started deviceSeverity=Warning rt=1396328238937 fileType=Agent cs2=<Resource ID\="3DxKlG0UBABCAA0cXXAZIwA\=\="/> c6a4=fe80:0:0:0:495d:cc3c:db1a:de71 cs2Label=Configuration Resource c6a4Label=Agent IPv6 Address ahost=SKEELES10 agt=888.99.100.1 



###IBM QAUDJRN Logs

CEF: 0|PATownsend|IBM-QAUDJRN|1.28|1007|CO-Create object|4|msg=CO-Create object act=N-Create of new object actual_type=CO-N jrn_seq=102361 timestamp=20120229154725823000 dproc=ICC suser=MVAGANEK job_number=638012 eff_user=MVAGANEK object=X_BIGNUM object_library=ICAPITST object_type=*MODULE object_attrCLE



###Palo Alto Network CEF Logs

CEF:0|Palo Alto Networks|PAN-OS|hostname|end|TRAFFIC|1|rt=$cefformatted-receive_time deviceExternalId=0002D01655 src=1.1.1.1 dst=2.2.2.2 sourceTranslatedAddress=1.1.1.1 destinationTranslatedAddress=3.3.3.3 cs1Label=Rule cs1=InternetDNS CommunicationDirection=Outbound 



###Check Point Firewall CEF Logs

Mar 20 10:12:18 192.168.1.5 CEF: 0|Check Point|VPN-1 & FireWall-1|Check Point|geo_protection|Log|Unknown|act=Drop cs3Label=Protection Type cs3=geo_protection deviceDirection=0 rt=1584698718000 spt=58429 dpt=27016 ifname=eth0 logid=65536 loguid={0x5e74955f,0x0,0x501a8c0,0x19633097} origin=192.168.1.5 originsicname=cn\=cp_mgmt,o\=FlemingGW..y76ath sequencenum=2 version=5 dst=192.168.1.5 dst_country=Internal inspection_information=Geo-location inbound enforcement inspection_profile=Default Geo Policy product=VPN-1 & FireWall-1 proto=17 src=123.113.101.36 src_country=Other



Mar 20 10:12:19 192.168.1.5 CEF: 0|Check Point|VPN-1 & FireWall-1|Check Point|geo_protection|Log|Unknown|act=Drop cs3Label=Protection Type cs3=geo_protection deviceDirection=0 rt=1584698718000 spt=58429 dpt=27019 ifname=eth0 logid=65536 loguid={0x5e749560,0x0,0x501a8c0,0x19633097} origin=192.168.1.5 originsicname=cn\=cp_mgmt,o\=FlemingGW..y76ath sequencenum=3 version=5 dst=192.168.1.5 dst_country=Internal inspection_information=Geo-location inbound enforcement inspection_pro^C



###Cisco ASA

Feb 25 2020 06:08:41: %ASA-6-302013: Built inbound TCP connection 2248811021 for outside:172.16.56.126/60723 (172.16.56.126/60723) to dot30:144.13.30.43/443 (144.13.30.43/443)

Feb 25 2020 06:08:41: %ASA-6-302014: Teardown TCP connection 2248811020 for outside:144.13.145.205/12489 to dot47:144.13.47.32/47182 duration 0:00:00 bytes 34 TCP FINs from outside

Feb 25 2020 06:08:41: %ASA-4-106023: Deny tcp src outside:61.219.11.153/64181 dst dot14:144.13.14.72/53 by access-group "outside_access_in" [0x0, 0x0]

Feb 25 2020 06:08:41: %ASA-4-106023: Deny tcp src outside:185.176.27.122/44733 dst dot30:144.13.30.231/33892 by access-group "outside_access_in" [0x0, 0x0]

Feb 25 2020 06:08:41: %ASA-4-106023: Deny tcp src outside:185.176.27.18/54027 dst dot14:144.13.14.234/33941 by access-group "outside_access_in" [0x0, 0x0]



###Fortinet Fortigate CEF Logs



Mar 20 07:43:36 FortiGate-VM64 CEF: 0|Fortinet|Fortigate|v5.6.3|26001|event:system|2|deviceExternalId=FGVMEV9XTHSMYCCF FTNTFGTlogid=0100026001 cat=event:system FTNTFGTsubtype=system FTNTFGTlevel=information FTNTFGTvd=root FTNTFGTeventtime=1584708216 FTNTFGTlogdesc=DHCP Ack log deviceInboundInterface=port2 FTNTFGTdhcp_msg=Ack FTNTFGTmac=08:66:98:47:84:9D FTNTFGTip=172.168.100.213 FTNTFGTlease=604800 dhost=RogersApleWatch msg=DHCP server sends a DHCPACK



Mar 20 07:41:16 FortiGate-VM64 CEF: 0|Fortinet|Fortigate|v5.6.3|40704|event:system perf-stats|3|deviceExternalId=FGVMEV9XTHSMYCCF FTNTFGTlogid=0100040704 cat=event:system FTNTFGTsubtype=system FTNTFGTlevel=notice FTNTFGTvd=root FTNTFGTeventtime=1584708076 FTNTFGTlogdesc=System performance statistics act=perf-stats FTNTFGTcpu=0 FTNTFGTmem=68 FTNTFGTtotalsession=368 FTNTFGTdisk=1 FTNTFGTbandwidth=13/34 FTNTFGTsetuprate=0 FTNTFGTdisklograte=0 FTNTFGTfazlograte=0 msg=Performance statistics: average CPU: 0, memory:  68, concurrent sessions:  368, setup-rate: 0

___



##LogGenerator Script Engine



`

touch /var/log/LogGenerate.sh

`



`

chmod 755 /var/log/LogGenerate.sh

`



`

./var/log/LogGenerate.sh

`



```

#!/bin/bash

# Declare variable choice and assign value 4

choice=6

# Print to stdout

 echo "1. Fortinet"

 echo "2. Check Point"

 echo "3. Palo Alto"

 echo "4. Cisco Meraki"

 echo "5. All Vendors"

 echo -n "Please choose the vendor [1,2,3,4 or 5]? "

# Loop while the variable choice is equal 4

# bash while loop

while [ $choice -eq 6 ]; do

# read user input

read choice

# bash nested if/else

if [ $choice -eq 1 ] ; then

        while :

        do

        echo "You have chosen Vendor: Fortinet"

        echo "Sending Fortinet Logs"

        echo "infinite loops [ hit CTRL+C to stop]"

        echo "<164>$(date +"%b %d %T") FortinetTest CEF: 0|Fortinet|Fortigate|v5.6.3|26001|event:system|2|deviceExternalId=FGVMEV9XTHSMYCCF FTNTFGTlogid=0100026001 cat=event:system FTNTFGTsubtype=system FTNTFGTlevel=information FTNTFGTvd=root FTNTFGTeventtime=1584708216 FTNTFGTlogdesc=DHCP Ack log deviceInboundInterface=port2 FTNTFGTdhcp_msg=Ack FTNTFGTmac=08:66:98:47:84:9D FTNTFGTip=172.168.100.213 FTNTFGTlease=604800 dhost=RogersApleWatch msg=DHCP server sends a DHCPACK" | nc -v -u -w 0 localhost 514

        echo "<164>$(date +"%b %d %T") FortinetTest CEF: 0|Fortinet|Fortigate|v5.6.3|40704|event:system perf-stats|3|deviceExternalId=FGVMEV9XTHSMYCCF FTNTFGTlogid=0100040704 cat=event:system FTNTFGTsubtype=system FTNTFGTlevel=notice FTNTFGTvd=root FTNTFGTeventtime=1584708076 FTNTFGTlogdesc=System performance statistics act=perf-stats FTNTFGTcpu=0 FTNTFGTmem=68 FTNTFGTtotalsession=368 FTNTFGTdisk=1 FTNTFGTbandwidth=13/34 FTNTFGTsetuprate=0 FTNTFGTdisklograte=0 FTNTFGTfazlograte=0 msg=Performance statistics: average CPU: 0, memory: 68, concurrent sessions: 368, setup-rate: 0" | nc -v -u -w 0 localhost 514

                done

else



        if [ $choice -eq 2 ] ; then

                while :

                do

                echo "You have chosen Vendor: Check Point"

                echo "Sending Check Point Logs"

                echo "infinite loops [ hit CTRL+C to stop]"

                echo "<164>$(date +"%b %d %T") CheckPointTest CEF: 0|Check Point|VPN-1 & FireWall-1|Check Point|geo_protection|Log|Unknown|act=Drop cs3Label=Protection Type cs3=geo_protection deviceDirection=0 rt=1584698718000 spt=58429 dpt=27016 ifname=eth0 logid=65536 loguid={0x5e74955f,0x0,0x501a8c0,0x19633097} origin=192.168.1.5 originsicname=cn=cp_mgmt,o=FlemingGW..y76ath sequencenum=2 version=5 dst=192.168.1.5 dst_country=Internal inspection_information=Geo-location inbound enforcement inspection_profile=Default Geo Policy product=VPN-1 & FireWall-1 proto=17 src=123.113.101.36 src_country=Other" | nc -v -u -w 0 localhost 514

                echo "<164>$(date +"%b %d %T") CheckPointTest CEF:0|Check Point|smart_event|Check Point|Log|Log|Unknown|act=Accept deviceDirection=1 rt=1647942981000 src=127.0.0.1 loguid={0x62399d47,0x0,0x501a8c0,0x157ea95c} origin=192.168.1.5 originsicname=cn\=cp_mgmt,o\=FlemingGw..h6duny sequencenum=1 version=5 additional_info=Administrator failed to log in: No license administrator=localhost audit_status=Failure machine=localhost operation=Log In operation_number=11 product=smart_event subject=Administrator Login" | nc -v -u -w 0 localhost 514

                done

        else



                if [ $choice -eq 3 ] ; then

                        while :

                        do

                        echo "You have chosen Vendor: Palo Alto"

                        echo "Sending Palo Alto Logs"

                        echo "infinite loops [ hit CTRL+C to stop]"

                        echo "<164>$(date +"%b %d %T") PaloAltoTest CEF:0|Palo Alto Networks|PAN-OS|hostname|end|TRAFFIC|1|rt=$cefformatted-receive_time deviceExternalId=0002D01655 src=1.1.1.1 dst=2.2.2.2 sourceTranslatedAddress=1.1.1.1 destinationTranslatedAddress=3.3.3.3 cs1Label=Rule cs1=InternetDNS CommunicationDirection=Outbound" | nc -v -u -w 0 localhost 514

                        done

                else

                    if [ $choice -eq 4 ] ; then

                        while :

                        do

                        echo "You have chosen Vendor: Cisco Meraki"

                        echo "Sending Cisco Meraki Logs"

                        echo "infinite loops [ hit CTRL+C to stop]"

                        echo "<164>$(date +"%b %d %T") MerakiTest 1374543213.342705328 MX84 urls src=192.168.1.186:63735 dst=69.58.188.40:80 mac=58:1F:AA:CE:61:F2 request: GET https://..." | nc -v -u -w 0 localhost 514

                        echo "<164>$(date +"%b %d %T") MerakiTest 1374543986.038687615 MX84 flows src=192.168.1.186 dst=8.8.8.8 mac=58:1F:AA:CE:61:F2 protocol=udp sport=55719 dport=53 pattern: allow all" | nc -v -u -w 0 localhost 514

                        echo "<164>$(date +"%b %d %T") MerakiTest 1377449842.514782056 MX84 ids-alerts signature=129:4:1 priority=3 timestamp=1377449842.512569 direction=ingress protocol=tcp/ip src=74.125.140.132:80" | nc -v -u -w 0 localhost 514

                        echo "<164>$(date +"%b %d %T") MerakiTest 1380664994.337961231 MX84 events type=vpn_connectivity_change vpn_type='site-to-site' peer_contact='98.68.191.209:51856' peer_ident='2814ee002c075181bb1b7478ee073860' connectivity='true'" | nc -v -u -w 0 localhost 514

                        echo "<164>$(date +"%b %d %T") MerakiTest 1377448470.246576346 MX84 ids-alerts signature=119:15:1 priority=2 timestamp=1377448470.238064 direction=egress protocol=tcp/ip src=192.168.111.254:56240 signature=1:28423:1 priority=1 timestamp=1468531589.810079 dhost=98:5A:EB:E1:81:2F direction=ingress protocol=tcp/ip src=151.101.52.238:80 dst=192.168.128.2:53023 message: EXPLOIT-KIT Multiple exploit kit single digit exe detection url=http://www.eicar.org/download/eicar.com.txt src=192.168.128.2:53150 dst=188.40.238.250:80 mac=98:5A:EB:E1:81:2F name='EICAR:EICAR_Test_file_not_a_virus-tpd'// 1563249630.774247467 remote_DC1_appliance security_event ids_alerted signature=1:41944:2 priority=1 timestamp=TIMESTAMPEPOCH.647461 dhost=74:86:7A:D9:D7:AA direction=ingress protocol=tcp/ip src=23.6.199.123:80 dst=10.1.10.51:56938 message: BROWSER-IE Microsoft Edge scripting engine security bypass css attempt" | nc -v -u -w 0 localhost 514

                        echo "<164>$(date +"%b %d %T") MerakiTest 1380653443.857790533 MR18 events type=device_packet_flood radio='0' state='end' alarm_id='4' reason='left_channel' airmarshal_events type= rogue_ssid_detected ssid='' bssid='02:18:5A:AE:56:00' src='02:18:5A:AE:56:00' dst='02:18:6A:13:09:D0' wired_mac='00:18:0A:AE:56:00' vlan_id='0' channel='157' rssi='21' fc_type='0' fc_subtype='5'" | nc -v -u -w 0 localhost 514

                        echo "<164>$(date +"%b %d %T") MerakiTest 1380653443.857790533 MS220_8P events type=8021x_eap_success port='' identity='employee@ikarem.com'"

                        done

                    else

                        if [ $choice -eq 5 ] ; then

                            while :

                            do

                            echo "You have chosen Vendor: All Vendors"

                            echo "Sending All Vendor Type Logs"

                            echo "infinite loops [ hit CTRL+C to stop]"

                            echo "<164>$(date +"%b %d %T") FortinetTest CEF: 0|Fortinet|Fortigate|v5.6.3|26001|event:system|2|deviceExternalId=FGVMEV9XTHSMYCCF FTNTFGTlogid=0100026001 cat=event:system FTNTFGTsubtype=system FTNTFGTlevel=information FTNTFGTvd=root FTNTFGTeventtime=1584708216 FTNTFGTlogdesc=DHCP Ack log deviceInboundInterface=port2 FTNTFGTdhcp_msg=Ack FTNTFGTmac=08:66:98:47:84:9D FTNTFGTip=172.168.100.213 FTNTFGTlease=604800 dhost=RogersApleWatch msg=DHCP server sends a DHCPACK" | nc -v -u -w 0 localhost 514

                            echo "<164>$(date +"%b %d %T") FortinetTest CEF: 0|Fortinet|Fortigate|v5.6.3|40704|event:system perf-stats|3|deviceExternalId=FGVMEV9XTHSMYCCF FTNTFGTlogid=0100040704 cat=event:system FTNTFGTsubtype=system FTNTFGTlevel=notice FTNTFGTvd=root FTNTFGTeventtime=1584708076 FTNTFGTlogdesc=System performance statistics act=perf-stats FTNTFGTcpu=0 FTNTFGTmem=68 FTNTFGTtotalsession=368 FTNTFGTdisk=1 FTNTFGTbandwidth=13/34 FTNTFGTsetuprate=0 FTNTFGTdisklograte=0 FTNTFGTfazlograte=0 msg=Performance statistics: average CPU: 0, memory: 68, concurrent sessions: 368, setup-rate: 0" | nc -v -u -w 0 localhost 514

                            echo "<164>$(date +"%b %d %T") CheckPointTest CEF: 0|Check Point|VPN-1 & FireWall-1|Check Point|geo_protection|Log|Unknown|act=Drop cs3Label=Protection Type cs3=geo_protection deviceDirection=0 rt=1584698718000 spt=58429 dpt=27016 ifname=eth0 logid=65536 loguid={0x5e74955f,0x0,0x501a8c0,0x19633097} origin=192.168.1.5 originsicname=cn=cp_mgmt,o=FlemingGW..y76ath sequencenum=2 version=5 dst=192.168.1.5 dst_country=Internal inspection_information=Geo-location inbound enforcement inspection_profile=Default Geo Policy product=VPN-1 & FireWall-1 proto=17 src=123.113.101.36 src_country=Other" | nc -v -u -w 0 localhost 514

                            echo "<164>$(date +"%b %d %T") CheckPointTest CEF:0|Check Point|smart_event|Check Point|Log|Log|Unknown|act=Accept deviceDirection=1 rt=1647942981000 src=127.0.0.1 loguid={0x62399d47,0x0,0x501a8c0,0x157ea95c} origin=192.168.1.5 originsicname=cn\=cp_mgmt,o\=FlemingGw..h6duny sequencenum=1 version=5 additional_info=Administrator failed to log in: No license administrator=localhost audit_status=Failure machine=localhost operation=Log In operation_number=11 product=smart_event subject=Administrator Login" | nc -v -u -w 0 localhost 514

                            echo "<164>$(date +"%b %d %T") PaloAltoTest CEF:0|Palo Alto Networks|PAN-OS|hostname|end|TRAFFIC|1|rt=$cefformatted-receive_time deviceExternalId=0002D01655 src=1.1.1.1 dst=2.2.2.2 sourceTranslatedAddress=1.1.1.1 destinationTranslatedAddress=3.3.3.3 cs1Label=Rule cs1=InternetDNS CommunicationDirection=Outbound" | nc -v -u -w 0 localhost 514

                            echo "<164>$(date +"%b %d %T") MerakiTest 1374543213.342705328 MX84 urls src=192.168.1.186:63735 dst=69.58.188.40:80 mac=58:1F:AA:CE:61:F2 request: GET https://..." | nc -v -u -w 0 localhost 514

                            echo "<164>$(date +"%b %d %T") MerakiTest 1374543986.038687615 MX84 flows src=192.168.1.186 dst=8.8.8.8 mac=58:1F:AA:CE:61:F2 protocol=udp sport=55719 dport=53 pattern: allow all" | nc -v -u -w 0 localhost 514

                            echo "<164>$(date +"%b %d %T") MerakiTest 1377449842.514782056 MX84 ids-alerts signature=129:4:1 priority=3 timestamp=1377449842.512569 direction=ingress protocol=tcp/ip src=74.125.140.132:80" | nc -v -u -w 0 localhost 514

                            echo "<164>$(date +"%b %d %T") MerakiTest 1380664994.337961231 MX84 events type=vpn_connectivity_change vpn_type='site-to-site' peer_contact='98.68.191.209:51856' peer_ident='2814ee002c075181bb1b7478ee073860' connectivity='true'" | nc -v -u -w 0 localhost 514

                            echo "<164>$(date +"%b %d %T") MerakiTest 1377448470.246576346 MX84 ids-alerts signature=119:15:1 priority=2 timestamp=1377448470.238064 direction=egress protocol=tcp/ip src=192.168.111.254:56240 signature=1:28423:1 priority=1 timestamp=1468531589.810079 dhost=98:5A:EB:E1:81:2F direction=ingress protocol=tcp/ip src=151.101.52.238:80 dst=192.168.128.2:53023 message: EXPLOIT-KIT Multiple exploit kit single digit exe detection url=http://www.eicar.org/download/eicar.com.txt src=192.168.128.2:53150 dst=188.40.238.250:80 mac=98:5A:EB:E1:81:2F name='EICAR:EICAR_Test_file_not_a_virus-tpd'// 1563249630.774247467 remote_DC1_appliance security_event ids_alerted signature=1:41944:2 priority=1 timestamp=TIMESTAMPEPOCH.647461 dhost=74:86:7A:D9:D7:AA direction=ingress protocol=tcp/ip src=23.6.199.123:80 dst=10.1.10.51:56938 message: BROWSER-IE Microsoft Edge scripting engine security bypass css attempt" | nc -v -u -w 0 localhost 514

                            echo "<164>$(date +"%b %d %T") MerakiTest 1380653443.857790533 MR18 events type=device_packet_flood radio='0' state='end' alarm_id='4' reason='left_channel' airmarshal_events type= rogue_ssid_detected ssid='' bssid='02:18:5A:AE:56:00' src='02:18:5A:AE:56:00' dst='02:18:6A:13:09:D0' wired_mac='00:18:0A:AE:56:00' vlan_id='0' channel='157' rssi='21' fc_type='0' fc_subtype='5'" | nc -v -u -w 0 localhost 514

                            echo "<164>$(date +"%b %d %T") MerakiTest 1380653443.857790533 MS220_8P events type=8021x_eap_success port='' identity='employee@ikarem.com'" | nc -v -u -w 0 localhost 514

                            done

                        else

                            echo "Please make a choice between 1-3 !"

                            echo "1. Fortinet"

                            echo "2. Check Point"

                            echo "3. Palo Alto"

                            echo "4. Cisco Meraki"

                            echo "5. All Vendors"

                            echo -n "Please choose the vendor [1,2,3,4 or 5]? "

                            choice=6

                        fi

                    fi    

                fi

        fi

fi

done

```



---



:::template /.templates/Wiki-Feedback.md 

:::



---



:::template /.templates/Ava-GetHelp.md 

:::
