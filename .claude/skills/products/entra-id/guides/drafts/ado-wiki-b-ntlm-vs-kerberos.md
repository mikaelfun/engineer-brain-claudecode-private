---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AskDS Blog Content/20240423 NTLM vs Kerberos"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAskDS%20Blog%20Content%2F20240423%20NTLM%20vs%20Kerberos"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1546089&Instance=1546089&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1546089&Instance=1546089&Feedback=2)

___
<div id='cssfeedback-end'></div>

https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/ntlm-vs-kerberos/ba-p/4120658

Reposting - This article was originally written and posted by Nuno Tavares in 2018 . 

 

In this post, we will go through the basics of NTLM and Kerberos. We will explain using the three Ws, covering what the main differences between them are, how to identify when a protocol is being used over the other, and why one is safer than the other. 

 

So, without further ado. Here is the story

 

Chapter 1: The What

 

What is NTLM?

NTLM is an authentication protocol. It was the default protocol used in old windows versions, but its still used today. If for any reason Kerberos fails, NTLM will be used instead.

NTLM has a challenge/response mechanism.

 

Here is how the NTLM flow works: 

![image.png](/.attachments/image-5d0ab147-6c8e-43c3-b22a-90cf6e62ee5d.png)


A user accesses a client computer and provides a domain name, user name, and a password.
The client computes a cryptographic hash of the password and discards the actual password. The client sends the user name to the server (in plaintext).
The server generates a 16-byte random number, called a challenge, and sends it back to the client.
The client encrypts this challenge with the hash of the user's password and returns the result to the server. This is called the response.
The server sends the following three items to the domain controller:
- User Name
- Challenge sent to the client
- Response received from the client
The domain controller uses the user name to retrieve the hash of the user's password. It compares the encrypted challenge with the response by the client (in step 4). If they are identical, authentication is successful, and the domain controller notifies the server.
The server then sends the appropriated response back to the client.
 

What is Kerberos?

Kerberos is an authentication protocol. Its the default authentication protocol on Windows versions above W2k, replacing the NTLM authentication protocol.

 

Here is how the Kerberos flow works: 

![image.png](/.attachments/image-bce466ed-2091-4e96-8bbb-d00f28e365e9.png)

A user login to the client machine. The client does a plaintext request (TGT). The message contains: (ID of the user; ID of the requested service (TGT); The Client Net address (IP); validation lifetime)
The Authentication Server will check if the user exists in the KDC database. 
a. If the user is found, it will randomly generate a key (session key) for use between the user and the Ticket Granting Server (TGS).
b. The Authentication Server will then send two messages back to the client:
     - One is encrypted with the TGS secret key.
     - One is encrypted with the Client secret key.
Note: The TGS Session Key is the shared key between the client and the TGS. The Client secret key is the hash of the user credentials (username+password).
The client decrypts the key and can logon, caching it locally. It also stores the encrypted TGT in his cache. When accessing a network resource, the client sends a request to the TGS with the resource name he wants to access, the user ID/timestamp and the cached TGT.
The TGS decrypts the user information and provides a service ticket and a service session key for accessing the service and sends it back to the Client once encrypted.
The client sends the request to the server (encrypted with the service ticket and the session-key)
The server decrypts the request and if its genuine, it provides service access.
 

Chapter 2: The When

 

How can we identify when we are using NTLM or Kerberos?

 

We can confirm the authentication being used by collecting a fiddler trace.

In the fiddler trace, we can see the requests being made in the Inspectors/Headers:

 

Kerberos:

![image.png](/.attachments/image-682875bd-403c-4b77-870b-c65234b29536.png)
 

NTLM:

![image.png](/.attachments/image-2474ff5d-ad5f-4a59-93a3-42876f3cd9dd.png)

 

If the request starts with Kerberos and fails, NTLM will be used instead. We can see the reply in the Headers as well:

![image.png](/.attachments/image-1b18a013-65d5-4d09-9c95-bcb25b7e2c42.png)
	
	
	

 

Kerberos Dependencies:  

Both the client and the server need to be running W2k or latter versions and be on the same, or trusted domain.
A SPN needs to exist in the AD for the domain account in use to run the service in which the client is authenticating.
 

Chapter 3: The Why

 

Why is Kerberos preferred?


NTLMv1 hashes could be cracked in seconds with todays computing since they are always the same length and are not salted. NTLMv2 is an improvement, since its length varies and the hash is salted, however it's still not very secure. Even though the hash is salted before it's sent, it's saved unsalted in a machine's memory.

Furthermore, when we talk about NTLM, we talk about a challenge/response mechanism, which exposes its password to offline cracking when responding to the challenge.

 

Kerberos provides several advantages over NTLM:

More secure: No password stored locally or sent over the net.
Best performance: Improved performance over NTLM authentication.
Delegation support: Servers can impersonate clients and use the client's security context to access a resource.
Simpler trust management: Avoids the need to have p2p trust relationships on multiple domains environment.
Supports MFA (Multi Factor Authentication)
 

The End