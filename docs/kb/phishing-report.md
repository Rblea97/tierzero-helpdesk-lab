# KB-003: Phishing Report Handling

## Use When

A user reports a suspicious email, link, attachment, credential prompt, impersonation attempt, or possible mailbox compromise.

## Safety Notes

- Do not ask the user to forward suspicious attachments outside the approved reporting process.
- Do not click links or open attachments from reported messages.
- Escalate immediately if credentials were entered, money was requested, malware was opened, or multiple users received the same message.

## Tier 1 Checklist

1. Thank the user and ask them not to click links, open attachments, or reply.
2. Confirm whether the user clicked a link, opened an attachment, entered credentials, or approved an MFA prompt.
3. Capture sender, subject, received time, and affected mailbox.
4. Ask whether similar messages were received by coworkers.
5. Follow the approved phishing submission process.
6. Flag credential entry, attachment execution, or financial request as high priority.
7. Escalate to security with a concise impact summary.

## User Response Template

Hi {{user_first_name}}, thanks for reporting this. Please do not click any links, open attachments, or reply to the message. Can you confirm whether you clicked anything or entered your password?

## Escalation Template

User reported suspected phishing. Details captured: sender, subject, received time, affected mailbox, user action status, and possible spread. Please review message headers, mailbox rules, sign-in activity, and tenant-wide message impact.
