---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Learning Resources/Windows 365 Training/Connection Flows: Websocket and UDP"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FLearning%20Resources%2FWindows%20365%20Training%2FConnection%20Flows%3A%20Websocket%20and%20UDP"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[Session Connectivity - Overview](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1386415/Session-Connectivity)
  
# WebSocket connection flow:

1.  User opens RD Client or web client and makes a feed request to RD Web.
    
2.  RD Web redirects the client Azure AD to receive a valid token for the service.
    
3.  If AAD is the authentication engine:
    *   User is asked to enter their creds and that is passed to AAD.
    *   If auth passes, then AAD issues a token to the RD Client.
4.  If AAD is not the final authentication engine (uses third party SSO/Identity Management Provider, for example Ping/Octa):
    *   AAD responds with a redirect to SSO/Identity Management Provider .
    *   RD Client communicates with Ping and user enters their creds.
5.  User opens a remote app or desktop on the client.
    
6.  The request goes to AFD (azure front door) which redirects the connection to nearest gateway based on source ip address
    *   Connection will use the gateway assigned to the client
    *   Note: Client may not always go to close gateway based on geo location. Its based upon latency from Front Door to all instances of the gateway and existing user load. So for a user geographically located in India its possible that Singapore has lower latency at times and hence user traffic will be sent via there.

7.The gateway validates the user connection and contacts a broker

8.The broker has a continuous connection to the RDAgent running on the Cloud PC.

9.The broker provides the details needed to create the session to the RD Agent

10.The RDAgent instructs the SxS Stack to reach out to the specific gateway

11.RDP Stack then sends the session to the user via the gateway

# UDP Connection flow:
All connections begin by establishing a TCP-based reverse connect transport over the Azure Virtual Desktop Gateway. Then, the client and session host establish the initial RDP transport, and start exchanging their capabilities. If RDP Shortpath is enabled on the session host, the session host then initiates a process called candidate gathering:
1.  The session host enumerates all network interfaces assigned to a session host, including virtual interfaces like VPN and Teredo.
    
2.  The Windows service Remote Desktop Services (TermService) allocates UDP sockets on each interface and stores the IP:Port pair in the candidate table as a local candidate.
    
3.  The Remote Desktop Services service uses each UDP socket allocated in the previous step to try reaching the Azure Virtual Desktop STUN Server on the public internet. Communication is done by sending a small UDP packet to port 3478.
    
4.  If the packet reaches the STUN server, the STUN server responds with the public IP (specified by you or provided by Azure) and port. This information is stored in the candidate table as a reflexive candidate.
    
5.  After the session host gathers all the candidates, the session host uses the established reverse connect transport to pass the candidate list to the client.
    
6.  When the client receives the list of candidates from the session host, the client also performs candidate gathering on its side. Then the client sends its candidate list to the session host.
    
7.  After the session host and client exchange their candidate lists, both parties attempt to connect with each other using all the gathered candidates. This connection attempt is simultaneous on both sides. Many NAT gateways are configured to allow the incoming traffic to the socket as soon as the outbound data transfer initializes it. This behavior of NAT gateways is the reason the simultaneous connection is essential.
    
8.  After the initial packet exchange, the client and session host may establish one or many data flows. From these data flows, RDP chooses the fastest network path. The client then establishes a secure TLS connection with the session host and initiates RDP Shortpath transport.
    
9.  After RDP establishes the RDP Shortpath transport, all Dynamic Virtual Channels (DVCs), including remote graphics, input, and device redirection move to the new transport.
