---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Processes/Chat Support"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Engineer%20Reference/Processes/Chat%20Support"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Chat Support

Chat support is important for Intune because it provides real-time assistance to users, ensuring that any issues or questions they have are addressed promptly. This immediate support helps in minimizing downtime and enhances user satisfaction by providing quick resolutions. Additionally, chat support allows for a more personalized interaction, where support agents can guide users through complex processes step-by-step, ensuring they fully understand and can effectively use Intune's features. This level of support is essential for maintaining productivity and ensuring that users can leverage Intune to its fullest potential.

[[_TOC_]]

## Persistent Chat

Persistent Chat is a chat support type that allows a business to maintain consistent/sustained conversation between the agent and the customer until the issue is resolved. In essence, the customer can keep coming back to the same chat until the chat is officially closed.

Main characteristics:

- **Sustained Conversation:** Persistent chat in Omnichannel prioritizes developing and sustaining a relationship with the customer versus resolving the customer's issue as quickly as possible. This means that when the customer returns, they will be routed to the same agent and will stay with the same agent until the issue is resolved. This process will only change if the agent closes the chat session from their end. When this happens, the customer Will not be able to return to the same conversation. Persistent chat allows a conversation to stay open until the issue is resolved, or for up to **28 days**.

- **Conversation History:** With this design, customers can come back to the same conversation multiple times over several weeks. The conversation history stays in the chat widget if the chat is still open. This means that when the customer returns to the conversation, s/he will still see the conversation history from previous sessions.
- **Off Hours Conversation** The customer can send the agent a message outside of the agent's working hours. The conversation will remain open until the agent logs back in and is able to respond.

**Customer Experience:**

- Customers will not receive information about waiting time or place in line.
- Customers will always come to the same conversation until it is ended.

## Getting Ready

1. Log into DfM Commercial
2. Once the Chat environment is ready the Engineer will be presented with a view like the below.
Note: Ensure the Presence indicator has updated and shows your default presence (Away, Available). If the Indicator is still spinning your presence has not initiated.

## Checking Chat Presence and Changing My Chat Availability Status

1. Upon logging into the chat environment, the Presence will be set to the default state defined per Line of Business (LOB), typically this will be set to Away

2. Change presence to **Available** to start accepting chats.

> The only statuses that will allow Engineers to accept chat is "Available" and "Busy" the status "Do not Disturb", "Appear Away" and "Offline" are not allowing chats to be offered to the engineer.

3. When a chat is accepted, the status will automatically update to **Busy** or **Do Not Disturb** depending on the concurrency of incoming chats set for the Engineer.

4. If the Engineer is set to accept three concurrent chats and is set to Available, then:
    - Accepting the first chat will set the Engineer to Busy and more chats can be accepted.
    - Accepting the second chat (before ending the first) the status will stay as Busy and more chats can be accepted.
    - Accepting the third chat (before ending the previous two) the status will be changed to Do Not Disturb and no more chats will be offered.
    - Ending one of the three chats the status will go to Busy, and Engineer will be offered another chat.

> [!NOTE]  
> - Statuses can be configured per LOB so confirm with your supervisor on which statuses are blocking capacity.
> - Reaching the maximum chat sessions will automatically set the status to Do not Disturb regardless of capacity.
> - If the Engineer is supporting Case (via VDM Assignment) and Chat modality the presence will automatically be managed across modalities via the VDM MultiModality feature.

## Accepting Chats

1. Once the customer requests a Chat on an entry point (Website, Virtual agent etc.) a Chat conversation is initiated and sent to DFM to be offered to available agents.
2. The engineer who is available has capacity and matches any assignment rules will get a chat toast notification.

3. The chat notification will show items:

- **From:** For Authenticated Chat the customer's name will be shown, for Unauthenticated Visitor x will be shown
- **Comment:** The comment section will have "Incoming Conversation" by default
- **Case Title:** This is whatever information the customer enters on the entry point or a predefined text
- **Queue:** This typically represents the queue name.
- **Countdown:** The agent will have a set number of seconds to accept or reject the chat notification.
- **Accept:** This is the button the agent must select if s/he WANTS TO pick up the chat.
- **Reject:** This is the button the agent must select if s/he DOES NOT WANT TO pick up the chat

### Persistent Chat - Accepting a Chat

1. Persistent chat with Inbox feature
- After accepting the toast notification, a note "Adding to Inbox" will be shown
- The engineer will have to navigate to Inbox and the new accepted Chat will be in the "Chat: My Open Persistent chats" folder showing as unread
- The engineer is now ready to click on the Active chat and start talking to the customer in the Communications panel.
- The Case is already created and will be assigned to the engineer who accepts the Chat

## Communications Panel

The Communications panel is the area of the UI where the engineer talks to the customer and has all his/her tools available ie: timers, quick replies etc.

### Timer
- a. **Work Timer** (in Black) is counting the time between the chat was accepted until the End button is pressed
- b. **Wrap timer** (in red) is counting the time from when the Chat was ended to the time the DFM session is closed.

### Real Time Sentiment (RTS)
Real time unbiased system that monitors and analyses the customer sentiment in real time throughout the conversation
- Analyses each customer's message (not agent messages)
- Sentiment indicator varies from Very Positive to Very Negative

### Wait Button
The engineer has the option to temporarily put the conversation on hold:
- Stops the work timer
- Puts the conversation in a "Waiting" state
- Releases the capacity
- Resets availability to available

### End Button
Used by the engineer to end the conversation. After ending:
- Stops the work timer and starts the wrap timer
- Adds the transcript to the timeline
- For Persistent chat: clicking "End" activates the "Close" Button

### Close Button
For Persistent Chat after clicking "End" the engineer will need to Resolve the case and then click "Close" to completely and correctly close the DFM session.

## FAQ

### Which customers are offered chat support?
Currently enabled for Broad Commercial customers from 7:00 am to 5:00 pm EST.

### Is there a specific Chat Queue for each support partner?
No, at the moment all chat cases are sent to the same queue.

### Are all delivery partners in Intune in scope of Chat?
During the pilot, only selected partners are helping support chat cases.

### Are DfMEU cases in scope?
The Chat Tool has a blocker with DFMEU related to EU DFM Performance/Reliability, being followed by SxG.

### Which support topics are available for chat?
During pilot only:
- Enrollment
- Policy
- App Deployment
- Conditional Access
- Troubleshooting Devices
- Device Actions
- App Protection (MAM)
- Admin Console

### The case was created to the wrong team, what should be done?
Work with the customer, collect as much information as possible, document the case correctly, end and close the chat, then transfer the case to the correct team.

### Is there a CSAT for Chat only?
There is a separate survey for chat cases sent to customers once the chat is closed and ended.
