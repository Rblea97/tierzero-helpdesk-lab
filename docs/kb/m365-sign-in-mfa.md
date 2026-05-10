# KB-001: Microsoft 365 Sign-in and MFA Troubleshooting

## Use When

A user reports repeated Outlook, Teams, or Office.com sign-in prompts, MFA failures, password errors, or account lockout symptoms.

## Safety Notes

- Do not reset a password until identity verification is complete.
- Do not ask users to send passwords, MFA codes, recovery codes, or screenshots containing secrets.
- Escalate privileged accounts, repeated lockouts, suspicious sign-in activity, or conditional access failures.

## Tier 1 Checklist

1. Verify the caller using the approved identity checklist.
2. Confirm whether the user can sign in at `https://office.com`.
3. Ask whether the issue affects Outlook desktop, web Outlook, mobile Outlook, or all services.
4. Check whether the account is disabled, locked, or pending password expiration.
5. Confirm the user's registered MFA method and whether the device time is correct.
6. Ask the user to try a private browser window or a different trusted device.
7. Clear cached Office credentials only after simpler browser sign-in checks are complete.
8. Escalate if sign-in logs, conditional access policy, or MFA registration status require administrator review.

## User Response Template

Hi {{user_first_name}}, I can help with the Microsoft 365 sign-in issue. First, please try signing in at `https://office.com` and let me know whether the same MFA or password message appears there. Please do not send your password or MFA code.

## Escalation Template

User reports repeated Microsoft 365 MFA/password failure. Tier 1 checks completed: identity verified, web sign-in tested, service scope identified, account status reviewed. Please review Entra sign-in logs, conditional access policy, MFA registration state, and account lockout status.
