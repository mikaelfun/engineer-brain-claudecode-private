---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Process Documentation/EMEA Processes/[EMEA] FP FN Communication Template"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FProcess%20Documentation%2FEMEA%20Processes%2F%5BEMEA%5D%20FP%20FN%20Communication%20Template"
importDate: "2026-04-06"
type: troubleshooting-guide
---

#FP FN Communication Templates

[[_TOC_]]

**Published by**: Enay Ayyad, Luciano Maffeis, Paul Voicu, Sardhar Khan, Majdy Rihani, Marcio Clara, Andy Day, Madalina Florea


##False Positives

Dear Cx:

I understand that you are requesting a root cause analysis on why this happened. Please find my response to your concerns below. If anything else is needed, let me know, and I will be happy to assist further.

False-positives and emails being blocked when they shouldn't have been — False-positives and false-negatives sometimes occur in our messaging protection stack (as with any other antispam/antimalware service). These issues are usually solvable via submissions, as this forces a re-verdict of the message. However, in rare cases where the issue is not resolved via submissions, you are welcome to open a case with us, and we will get this resolved through our PG team (Backend team).

As all received messages are verified by ML filter (a mathematical or computational representation of a real-world system trained on a dataset to learn patterns, make predictions, or perform specific tasks without being explicitly programmed), and because we could not find enough evidence that the message is clean, from a secure-by-default perspective we always block unless completely certain it is non-malicious.

Microsoft's anti-spam team utilizes machine learning techniques to improve the effectiveness of spam detection and filtering systems. Machine learning allows us to automate the process of identifying and classifying spam emails, helping to reduce false negatives and improve the overall accuracy of spam detection.

However, sometimes there will be false detection due to many reasons — a good message blocked (false positive) or bad message not blocked (false negative). For this kind of issue, the best path forward is for customers to report them so that we can analyze them for new tactics.

As I mentioned previously, our filtering decisions may sometimes be inaccurate. Your feedback is invaluable in helping us improve our system. By continuing to submit such samples to Microsoft, we can enhance our detection capabilities and machine learning algorithms, enabling us to proactively identify and mitigate these types of attacks in the future.

For more details, please visit: [How submissions help improve Defender for Office 365](https://techcommunity.microsoft.com/t5/microsoft-defender-for-office/how-your-submissions-to-defender-for-office-365-are-processed/ba-p/4231551)

Since the issue lies within our detection systems, there is little you can do to prevent such occurrences. Nevertheless, these False-positives are rare, and our support team is available around the clock for assistance.

I trust this clarifies any concerns following my previous email and offers reassurance that we're here to help.


## False Negatives

Dear Cx,

I understand you are requesting a root cause analysis on why this happened. Please find my response to your concerns below. If anything else is needed, let me know, and I will be happy to assist further.

False-negatives and emails not being blocked when they should have been — False-positives and false-negatives sometimes occur in our messaging protection stack (as with any other antispam/antimalware service). These issues are usually solvable via submissions, as this forces a re-verdict of the message. However, in rare cases where the issue is not resolved via submissions, you are welcome to open a case with us, and we will get this resolved through our PG team.

As all received messages are verified by ML filter (a mathematical or computational representation of a real-world system created through machine learning, where algorithms are trained on a dataset to learn patterns, make predictions, or perform specific tasks without being explicitly programmed).

Microsoft's anti-spam team utilizes machine learning techniques to improve the effectiveness of spam detection and filtering systems. Machine learning allows us to automate the process of identifying and classifying spam emails, helping to reduce false negatives and improve the overall accuracy of spam detection.

However, sometimes there will be false detection due to many reasons. For this kind of issue, in cases where we have missed, the best path forward is for customers to report them so that we can analyze them for new tactics.

Your feedback is invaluable in helping us improve our system. By continuing to submit such samples to Microsoft, we can enhance our detection capabilities and machine learning algorithms.
