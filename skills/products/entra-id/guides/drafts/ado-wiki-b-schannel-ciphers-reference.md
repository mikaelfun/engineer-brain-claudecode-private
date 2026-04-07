---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AskDS Blog Content/20240403 Speaking in Ciphers and other Enigmatic tongues fresh content update!"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAskDS%20Blog%20Content%2F20240403%20Speaking%20in%20Ciphers%20and%20other%20Enigmatic%20tongues%20fresh%20content%20update%21"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2190685&Instance=2190685&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2190685&Instance=2190685&Feedback=2)

___
<div id='cssfeedback-end'></div>

Originally posted on AskDS blog at [Speaking in Ciphers and other Enigmatic tongues fresh content update! | Microsoft Community Hub](https://techcommunity.microsoft.com/blog/askds/speaking-in-ciphers-and-other-enigmatic-tongues-fresh-content-update/4103506).  This blog post covers the changes to SChannel and Ciphers from Servers 2008 - 2022.

Hi![Jim Tierney](http://blogs.technet.com/b/askds/archive/tags/jim+tierney/)here again to talk to you about Cryptographic Algorithms, SCHANNEL and other bits of wonderment. My original[post](http://blogs.technet.com/b/askds/archive/2011/05/04/speaking-in-ciphers-and-other-enigmatic-tongues.aspx)on the topic has gone through yet another rewrite to bring you up to date on recent changes in this crypto space.

So, your company purchases this new super awesome vulnerability and compliance management software suite, and they just ran a scan on your Windows Server 2008 domain controllers and lo! The software reports back that you have weak ciphers enabled, highlighted in**RED,**flashing, with that "you have failed" font, and including a link to the following Microsoft documentation   
KB245030 How to Restrict the Use of Certain Cryptographic Algorithms and Protocols in Schannel.dll:  
[http://support.microsoft.com/kb/245030/en-us](http://support.microsoft.com/kb/245030/en-us)

The report may look similar to this:

>   
> SSL Server Has SSLv2 Enabled Vulnerability port 3269/tcp over SSL
>   
> THREAT:  
> The Secure Socket Layer (SSL) protocol allows for secure communication between a client and a server.
>   
> There are known flaws in the SSLv2 protocol. A man-in-the-middle attacker can force the communication to a less secure level and then attempt to break the weak encryption. The attacker can also truncate encrypted messages.
>   
> SOLUTION:
>   
> Disable SSLv2.

Upon hearing this information, you fire up your browser and read the aforementioned KB 245030 top to bottom and RDP into your DCs and begin checking the locations specified by the article. Much to your dismay you notice the locations specified in the article are not correct concerning your Windows 2008 R2 DCs. On your 2008 R2 DCs you see the following at this registry location

HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL:

![](https://techcommunity.microsoft.com/t5/s/gxcuf89792/images/bS00MTAzNTA2LTEwNTcwOGk2NEU3RDZFMDQ3NTFFMDFE?image-dimensions=433x258&revision=3)

"Darn you Microsoft documentation!!!!!!" you scream aloud as you shake your fist in the general direction of Redmond, WA.

This is how it looks on a Windows 2003 Server:

![](https://techcommunity.microsoft.com/t5/s/gxcuf89792/images/bS00MTAzNTA2LTEwNTcwOWlCNjgxMzNBQzgxMDAwRDc3?image-dimensions=317x620&revision=3)

Easy now

The registry keys and their content in Windows Server 2008, Windows 7, Windows Server 2008 R2, Windows 2012 and 2012 R2 look different from Windows Server 2003 and prior.

Here is the registry location on Windows 7  2012 R2 and its default contents:

Windows Registry Editor Version 5.00  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel]"  
EventLogging"=dword:00000001  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Ciphers]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\CipherSuites]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Hashes]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\KeyExchangeAlgorithms]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\SSL 2.0]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\SSL 2.0\Client]  
"DisabledByDefault"=dword:00000001

Allow me to explain the above content that is displayed in standard REGEDIT export format:
  
  

    *   **The Ciphers**key should contain no values or subkeys
    *   **The CipherSuites**key should contain no values or subkeys
    *   **The Hashes**key should contain no values or subkeys
    *   **The KeyExchangeAlgorithms**key should contain no values or subkeys

  
  

**The Protocols**key should contain the following sub-keys and value:  
Protocols  
SSL 2.0  
Client  
DisabledByDefault REG_DWORD 0x00000001 (value)
  
  

The following table lists the Windows SCHANNEL protocols and whether or not they are enabled or disabled by default in each operating system listed below. Unsupported and soon to be unsupported operating systems added for historical reference:

![JIMT05_0-1712088235173.png](https://techcommunity.microsoft.com/t5/s/gxcuf89792/images/bS00MTAzNTA2LTU2NzM4MGlFNkU0MDE0NjM5NEU2QUVG?image-dimensions=999x999&revision=3)

Here is the link to the MSDN article that displays the information above in a less colorful way -[https://msdn.microsoft.com/en-us/library/windows/desktop/mt808159(v=vs.85).aspx](https://msdn.microsoft.com/en-us/library/windows/desktop/mt808159(v=vs.85).aspx)

***UPDATE  TLS 1.1 and TLS 1.2 support have been added to Windows 2008 Standard (not R2). See the following for information on release dates regarding this important update in functionality -**[https://blogs.microsoft.com/microsoftsecure/2017/07/20/tls-1-2-support-added-to-windows-server-2008/](https://blogs.microsoft.com/microsoftsecure/2017/07/20/tls-1-2-support-added-to-windows-server-2008/)

*Remember to install the following update if you plan on or are currently using SHA512 certificates:  
SHA512 is disabled in Windows when you use TLS 1.2  
[http://support.microsoft.com/kb/2973337/EN-US](http://support.microsoft.com/kb/2973337/EN-US)

Similar to Windows Server 2003, these protocols can be disabled for the server or client architecture. Meaning that either the protocol can be omitted from the list of supported protocols included in the Client Hello when initiating an SSL connection, or it can be disabled on the server so that even if a client requests SSL 2.0 in a client hello, the server will not respond with that protocol.

The client and server subkeys designate each protocol. You can disable a protocol for either the client or the server, but disabling Ciphers, Hashes, or CipherSuites affects BOTH client and server sides. You would have to create the necessary subkeys beneath the Protocols key to achieve this.

For example:

Windows Registry Editor Version 5.00  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\SSL 2.0]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\SSL 2.0\Client]
"DisabledByDefault"=dword:00000001

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\SSL 2.0\Server]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\SSL 3.0]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\SSL 3.0\Client]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\SSL 3.0\Server]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\TLS 1.0]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\TLS 1.0\Client]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\TLS 1.0\Server]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\TLS 1.1]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\TLS 1.1\Client]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\TLS 1.1\Server]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\TLS 1.2]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\TLS 1.2\Client]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\TLS 1.2\Server]

This is how it looks in the registry after they have been created:

![](https://techcommunity.microsoft.com/t5/s/gxcuf89792/images/bS00MTAzNTA2LTEwNTcxMWkxMzcwRDEyNEQ3OEQ0MjVD?image-dimensions=250x509&revision=3)

Client SSL 2.0 is disabled by default on Windows Server 2008, 2008 R2, 2012 and 2012 R2. This means the computer will not use SSL 2.0 to initiate a Client Hello.

So it looks like this in the registry:

![](https://techcommunity.microsoft.com/t5/s/gxcuf89792/images/bS00MTAzNTA2LTEwNTcxMmk4RDVBQ0VCNDdGREUxRjZE?image-dimensions=536x55&revision=3)

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\SSL 2.0\Client]  
DisabledByDefault =dword:00000001

Just like Ciphers and KeyExchangeAlgorithms, Protocols can be enabled or disabled.

To disable other protocols, select which side of the conversation on which you want to disable the protocol, and add the "Enabled"=dword:00000000 value. The example below disables the SSL 2.0 for the server in addition to the SSL 2.0 for the client.

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\SSL 2.0\Client]  
DisabledByDefault =dword:00000001**<Default client disabled as I said earlier>**

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\SSL 2.0\Server]  
Enabled =dword:00000000**<disables SSL 2.0 server side>**

![](https://techcommunity.microsoft.com/t5/s/gxcuf89792/images/bS00MTAzNTA2LTEwNTcxM2k1RUQ5NERDMTUyMEMyQTZG?image-dimensions=664x161&revision=3)

After this, you will need to reboot the server. You probably do not want to disable TLS settings. I just added them here for a visual reference.

*****For Windows server 2008 R2, if you want to enable Server side TLS 1.1 and 1.2, you MUST create the registry entries as follows:**

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\TLS 1.1\Server]  
DisabledByDefault =dword:00000000  
Enabled =dword:00000001

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\TLS 1.2\Server]  
DisabledByDefault =dword:00000000  
Enabled =dword:00000001

So why would you go through all this trouble to disable protocols and such, anyway? Well, there may be a regulatory requirement that your company's web servers should only support[Federal Information Processing Standards (FIPS) 140-1/2 certified](http://www.itl.nist.gov/fipspubs/by-num.htm)cryptographic algorithms and protocols. Currently, TLS is the only protocol that satisfies such a requirement. Luckily, enforcing this compliant behavior does not require you to manually modify registry settings as described above. You can enforce FIPS compliance via group policy as explained by the following:

**The effects of enabling the "System cryptography: Use FIPS compliant algorithms for encryption, hashing, and signing" security setting in Windows XP and in later versions of Windows**-[http://support.microsoft.com/kb/811833](http://support.microsoft.com/kb/811833)

The 811833 article talks specifically about the group policy setting below which by default is NOT defined   
Computer Configuration\ Windows Settings \Security Settings \Local Policies\ Security Options

![](https://techcommunity.microsoft.com/t5/s/gxcuf89792/images/bS00MTAzNTA2LTEwNTcxNGlEM0EzMTBCOThENzgzNTIz?image-dimensions=580x33&revision=3)

The policy above when applied will modify the following registry locations and their value content.

Be advised that this FipsAlgorithmPolicy information is stored in different ways as well 

**Windows 7/2008**  
Windows Registry Editor Version 5.00  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa\FipsAlgorithmPolicy]  
"Enabled"=dword:00000000 <Default is disabled>

**Windows 2003/XP**  
Windows Registry Editor Version 5.00  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa]  
Fipsalgorithmpolicy =dword:00000000 <Default is disabled>

Enabling this group policy setting effectively disables everything except TLS.****ATTENTION****If you are applying the FIPS compliant algorithm group policy, the application of this policy will overrule whatever you have manually defined in the SCHANNEL\Protocols key. For example, if you disable TLS 1.0 here - HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\Protocols\TLS 1.0, the application of the FIPS group policy will overrule this and TLS 1.0 will again be available.
To remediate this default FIPS group policy behavior,**the following NEW Operating System Specific updates MUST BE INSTALLED**. Once these updates are installed, the SCHANNEL protocol disabled settings already configured and to be configured will be honored.
![](https://techcommunity.microsoft.com/t5/s/gxcuf89792/images/bS00MTAzNTA2LTEwNTcxNWk5MjcxMUE1NThBRTcyREYx?image-dimensions=879x226&revision=3)

**More Examples**

Lets continue with more examples. A vulnerability report may also indicate the presence of other Ciphers it deems to be weak.  
Below I have built a .reg file that when imported will disable the following Ciphers:

56-bit DES
40-bit RC4

**Behold!**

Windows Registry Editor Version 5.00  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\AES 128]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\AES 256]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\DES 56]  
"Enabled"=dword:00000000
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\NULL]  
"Enabled"=dword:00000000
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\RC4 128/128]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\RC4 40/128]  
  
"Enabled"=dword:00000000
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\RC4 56/128]  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\Triple DES 168]
After importing these registry settings, you must reboot the server.

The vulnerability report might also mention that 40-bit DES is enabled, but that would be a false positive because Windows Server 2008 doesn't support 40-bit DES at all. For example, you might see this in a vulnerability report:

>   
> Here is the list of weak SSL ciphers supported by the remote server:
> 
> Low Strength Ciphers (< 56-bit key)
>   
> SSLv3
> 
> EXP-ADH-DES-CBC-SHA Kx=DH(512) Au=None Enc=DES(40) Mac=SHA1 export
>   
> TLSv1  
>   
> EXP-ADH-DES-CBC-SHA Kx=DH(512) Au=None Enc=DES(40) Mac=SHA1 export

If this is reported and it is necessary to get rid of these entries you can also disable the Diffie-Hellman Key Exchange algorithm (another components of the two cipher suites described above -- designated with Kx=DH(512)).

To do this, make the following registry changes:
  
Windows Registry Editor Version 5.00  
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\Schannel\KeyExchangeAlgorithms\Diffie-Hellman]  
"Enabled"=dword:00000000
You have to create the sub-key Diffie-Hellman yourself. Make this change and reboot the server. This step is NOT advised or required.I am offering it as an option to you to make the vulnerability scanning tool pass the test.

Keep in mind, also, that this will disable any cipher suite that relies upon Diffie-Hellman for key exchange.

You will probably not want to disable ANY cipher suites that rely on Diffie-Hellman. Secure communications such as IPSec and SSL both use Diffie-Hellman for key exchange. If you are running OpenVPN on a Linux/Unix server you are probably using Diffie-Hellman for key exchange. The point I am trying to make here is you should not have to disable the Diffie-Hellman Key Exchange algorithm to satisfy a vulnerability scan.

**Advanced Ciphers have arrived!!!**  
Advanced ciphers were added to Windows 8.1 / Windows Server 2012 R2 computers by KB 2929781, released in April 2014 and again by monthly rollup KB 2919355, released in May 2014

Updated cipher suites were released as part of two fixes:  
KB 2919355 for Windows 8.1 and Windows Server 2012 R2 computers  
MS14-066 for Windows 7 and Windows 8 clients and Windows Server 2008 R2 and Windows Server 2012 Servers.

While these updates shipped new ciphers, the cipher suite priority ordering could not correctly be updated.  
KB 3042058, released Tuesday, March 2015 is a follow up package to correct that issue. This is NOT applicable to 2008 (non R2)

You can set a preference list for which cipher suites the server will negotiate first with a client that supports them.

You can review this MSDN article on how to set the cipher suite prioritization list via GPO:[http://msdn.microsoft.com/en-us/library/windows/desktop/bb870930(v=vs.85).aspx#adding__removing__and_prioritizing_cipher_suites](http://msdn.microsoft.com/en-us/library/windows/desktop/bb870930(v=vs.85).aspx#adding__removing__and_prioritizing_cipher_suites)

Default location and ordering of Cipher Suites:  
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Cryptography\Configuration\Local\SSL\0010002

![](https://techcommunity.microsoft.com/t5/s/gxcuf89792/images/bS00MTAzNTA2LTEwNTcxNmlDQTZGRTQwMjNEMDc2NDBE?image-dimensions=636x358&revision=3)

Location of Cipher Suite ordering that is modified by setting this group policy   
Computer Configuration\Administrative Templates\Network\SSL Configuration Settings\SSL Cipher Suite Order

![](https://techcommunity.microsoft.com/t5/s/gxcuf89792/images/bS00MTAzNTA2LTEwNTcxN2k1MDVCN0U4MDU3NEQ3N0FE?image-dimensions=634x425&revision=3)

When the SSL Cipher Suite Order group policy is modified and applied successfully it modifies the following location in the registry:  
HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Cryptography\Configuration\SSL\0010002

The Group Policy would dictate the effective cipher suites. Once this policy is applied, the settings here take precedence over what is in the default location. The GPO should override anything else configured on the computer. The Microsoft SCHANNEL team does not support directly manipulating the Group Policy and Default**Cipher suite**locations in the registry.

Group Policy settings are domain settings configured by a domain administrator and should always have precedence over local settings configured by local administrators.

Below are two cipher suites that were introduced through the June 2016 rollup -[https://support.microsoft.com/en-us/kb/3161639](https://support.microsoft.com/en-us/kb/3161639)  
  
These were added to try and help with interoperability for older applications since RC4 is soon to be deprecated.  
**TLS_DHE_RSA_WITH_AES_128_CBC_SHA  
TLS_DHE_RSA_WITH_AES_256_CBC_SHA**  
  
Since these additional cipher suites are now available on clients initiating an SSL connection, any server that has a weak DHE key length under 1024 bits will be rejected by Windows clients.  
  
Below is an explanation of this behavior from the KB that updated Windows 7 clients (Windows 10 has always acted in this manner).[https://support.microsoft.com/en-us/kb/3061518](https://support.microsoft.com/en-us/kb/3061518)

>   
> This security update resolves a vulnerability in Windows. The vulnerability could allow information disclosure when Secure Channel (Schannel) allows the use of a weak Diffie-Hellman ephemeral (DHE) key length of 512 bits in an encrypted Transport Layer Security (TLS) session. Allowing 512-bit DHE keys makes DHE key exchanges weak and vulnerable to various attacks. For an attack to be successful, a server has to support 512-bit DHE key lengths. Windows TLS servers send a default DHE key length of 1,024 bits.

Being secure is a good thing and depending on your environment, it may be necessary to restrict certain cryptographic algorithms from use. Just make sure you do your diligence about testing these settings. It is also well worth your time to really understand how the security vulnerability software your company just purchased does its testing. A double sided network trace will reveal both sides of the client - server hello and what cryptographic algorithms are being offered from each side over the wire.

Jim Insert cryptic witticism here Tierney

Updates:

8/29/16: Added information about June 2016 rollup.

6/7/17: Updated schannel graphic to include Server 2016 defaults. Also updated information about FIPS policy overwriting manually configured values.

7/24/17: Updated information about Server 2008 support.
10/25/18: Added list of updates that need to be installed if using FIPS policy and you need to have manually configured SCHANNEL\Protocols registry entries honored.

04/03/2024: Updated screenshots and corrected some grammar.