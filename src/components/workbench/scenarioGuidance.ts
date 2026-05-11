export interface KnowledgeOption {
  id: string;
  title: string;
  score: number;
}

export interface ScenarioGuidance {
  knowledgeOptions: KnowledgeOption[];
  responseSafetyText: string;
}

const guidanceByCategory: Record<string, ScenarioGuidance> = {
  "cat-m365-auth": {
    knowledgeOptions: [
      {
        id: "kb-m365-mfa-signin",
        title: "M365 sign-in and MFA troubleshooting",
        score: 92
      },
      {
        id: "kb-m365-cached-creds",
        title: "Clear WAM credentials in Windows 11",
        score: 87
      },
      {
        id: "kb-outlook-password-loop",
        title: "Outlook keeps prompting for password",
        score: 74
      }
    ],
    responseSafetyText:
      "Please do not share your password in this ticket. If a password reset is needed, I will verify your identity first and submit it for technician approval."
  },
  "cat-vpn": {
    knowledgeOptions: [
      {
        id: "kb-vpn-remote-access",
        title: "VPN remote access Tier 1 checklist",
        score: 93
      },
      {
        id: "kb-vpn-client-error",
        title: "Capture VPN client error and gateway details",
        score: 84
      },
      {
        id: "kb-vpn-group-membership",
        title: "Verify VPN group membership and MFA status",
        score: 78
      }
    ],
    responseSafetyText:
      "Please share the exact VPN client error, but do not share your password. I cannot bypass MFA or conditional access controls."
  },
  "cat-printing": {
    knowledgeOptions: [
      {
        id: "kb-printer-offline",
        title: "Printer offline Tier 1 checklist",
        score: 91
      },
      {
        id: "kb-print-queue-stuck",
        title: "Clear stale local print queue entries",
        score: 82
      },
      {
        id: "kb-shared-printer-impact",
        title: "Confirm shared printer scope before escalation",
        score: 76
      }
    ],
    responseSafetyText:
      "Please do not remove shared printer settings or power-cycle shared equipment unless instructed. I will first confirm scope and device status."
  },
  "cat-security-phishing": {
    knowledgeOptions: [
      {
        id: "kb-phishing-report",
        title: "Phishing report handling",
        score: 95
      },
      {
        id: "kb-credential-harvest",
        title: "Credential harvesting escalation checklist",
        score: 88
      },
      {
        id: "kb-email-header-capture",
        title: "Capture suspicious message metadata safely",
        score: 79
      }
    ],
    responseSafetyText:
      "Please do not click links, open attachments, or forward the message broadly. I will document the report and escalate if interaction occurred."
  },
  "cat-onboarding": {
    knowledgeOptions: [
      {
        id: "kb-new-user-onboarding",
        title: "New user onboarding access checklist",
        score: 92
      },
      {
        id: "kb-manager-approval",
        title: "Verify manager approval for access requests",
        score: 85
      },
      {
        id: "kb-device-assignment",
        title: "Confirm laptop assignment and imaging status",
        score: 80
      }
    ],
    responseSafetyText:
      "Please attach manager or HR approval and list only the access needed for the role. Privileged access requires a separate approval path."
  }
};

export function getScenarioGuidance(categoryId: string): ScenarioGuidance {
  return guidanceByCategory[categoryId] ?? guidanceByCategory["cat-m365-auth"];
}
