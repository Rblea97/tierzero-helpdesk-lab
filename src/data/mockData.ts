import type {
  Asset,
  AuditEvent,
  Category,
  KnowledgeBaseArticle,
  Ticket,
  User
} from "../domain/types";

export const users: User[] = [
  {
    id: "usr-jordan-lee",
    name: "Jordan Lee",
    email: "jordan.lee@example.test",
    department: "Finance",
    role: "Accounting Analyst",
    manager: "Priya Shah",
    accountStatus: "active",
    mfaStatus: "registered",
    groups: ["M365-Finance", "VPN-Standard", "Printer-Finance-2F"],
    escalationContact: "Priya Shah"
  },
  {
    id: "usr-morgan-chen",
    name: "Morgan Chen",
    email: "morgan.chen@example.test",
    department: "Operations",
    role: "Warehouse Coordinator",
    manager: "Sam Rivera",
    accountStatus: "active",
    mfaStatus: "needs_review",
    groups: ["VPN-Standard", "Inventory-App"],
    escalationContact: "Sam Rivera"
  },
  {
    id: "usr-casey-patel",
    name: "Casey Patel",
    email: "casey.patel@example.test",
    department: "Human Resources",
    role: "HR Specialist",
    manager: "Renee Brooks",
    accountStatus: "locked",
    mfaStatus: "registered",
    groups: ["M365-HR", "HRIS-Users"],
    escalationContact: "Renee Brooks"
  }
];

export const assets: Asset[] = [
  {
    id: "asset-lap-1042",
    assetTag: "LAP-1042",
    type: "laptop",
    manufacturer: "Dell",
    model: "Latitude 5440",
    operatingSystem: "Windows 11",
    status: "assigned",
    warrantyEnd: "2028-04-30",
    assignedUserId: "usr-jordan-lee",
    assignedTechnicianId: "tech-avery-stone"
  },
  {
    id: "asset-prn-2207",
    assetTag: "PRN-2207",
    type: "printer",
    manufacturer: "HP",
    model: "LaserJet Enterprise M406",
    operatingSystem: "Firmware 5.6",
    status: "assigned",
    warrantyEnd: "2027-09-15",
    assignedTechnicianId: "tech-avery-stone"
  },
  {
    id: "asset-lap-1188",
    assetTag: "LAP-1188",
    type: "laptop",
    manufacturer: "Lenovo",
    model: "ThinkPad T14",
    operatingSystem: "Windows 11",
    status: "assigned",
    warrantyEnd: "2027-12-01",
    assignedUserId: "usr-morgan-chen",
    assignedTechnicianId: "tech-riley-park"
  }
];

export const categories: Category[] = [
  {
    id: "cat-m365-auth",
    name: "Microsoft 365 / Authentication",
    parentCategory: "Identity and Access",
    defaultPriority: "medium",
    keywords: ["outlook", "mfa", "password", "office", "sign in", "login"],
    escalationRules: [
      "Escalate if privileged account is affected.",
      "Escalate if repeated lockout or suspicious sign-in activity is present."
    ]
  },
  {
    id: "cat-printing",
    name: "Printing",
    parentCategory: "End User Hardware",
    defaultPriority: "low",
    keywords: ["printer", "print", "offline", "toner", "paper"],
    escalationRules: [
      "Escalate if multiple users or departments are affected.",
      "Escalate if device is under vendor warranty and hardware fault is suspected."
    ]
  },
  {
    id: "cat-vpn",
    name: "VPN / Remote Access",
    parentCategory: "Network Access",
    defaultPriority: "medium",
    keywords: ["vpn", "remote", "connection", "tunnel", "wifi"],
    escalationRules: [
      "Escalate if user is blocked from urgent business-critical access.",
      "Escalate if multiple users report the same gateway failure."
    ]
  },
  {
    id: "cat-security-phishing",
    name: "Security / Phishing Report",
    parentCategory: "Security",
    defaultPriority: "high",
    keywords: ["phishing", "suspicious", "email", "link", "attachment"],
    escalationRules: [
      "Escalate all suspected credential harvesting.",
      "Escalate if user clicked a suspicious link or opened an attachment."
    ]
  },
  {
    id: "cat-onboarding",
    name: "New User Onboarding",
    parentCategory: "Service Request",
    defaultPriority: "medium",
    keywords: ["new hire", "onboarding", "laptop", "access", "software"],
    escalationRules: [
      "Escalate if start date is within one business day and required approvals are missing."
    ]
  }
];

export const knowledgeBaseArticles: KnowledgeBaseArticle[] = [
  {
    id: "kb-m365-mfa-signin",
    title: "M365 sign-in and MFA troubleshooting",
    categoryId: "cat-m365-auth",
    symptoms: [
      "Outlook repeatedly asks for MFA.",
      "User reports incorrect password after MFA prompt.",
      "User may be able to access office.com but not desktop Outlook."
    ],
    tierOneSteps: [
      "Verify the requester's identity using the approved checklist.",
      "Confirm the account is active and not disabled.",
      "Check whether the user reports password expiration or recent password changes.",
      "Confirm the user's registered MFA method is available.",
      "Ask the user to test sign-in at office.com.",
      "Escalate if the account is privileged, repeatedly locked, or suspicious sign-in activity is suspected."
    ],
    userResponseTemplate:
      "Hi Jordan, I can help with the Outlook sign-in issue. First, please confirm whether you can sign in at office.com and whether your usual MFA method is available.",
    internalNotesTemplate:
      "User reports Outlook MFA loop and password error. Identity verification required before any password reset. Check account status, MFA registration state, and recent sign-in behavior.",
    escalationCriteria: [
      "Privileged account",
      "Repeated lockout",
      "Suspicious sign-in activity",
      "Conditional Access or MFA registration review required"
    ],
    safetyNotes: [
      "Password reset requires identity verification and technician approval.",
      "Do not request or record the user's password."
    ]
  },
  {
    id: "kb-printer-offline",
    title: "Printer offline Tier 1 checklist",
    categoryId: "cat-printing",
    symptoms: [
      "Printer shows offline.",
      "User can select printer but jobs remain queued.",
      "Multiple queued jobs may be visible."
    ],
    tierOneSteps: [
      "Confirm whether one user or multiple users are affected.",
      "Verify printer power, network connection, and display errors.",
      "Ask user to restart the print job after clearing stale queue entries.",
      "Confirm the correct printer is selected.",
      "Escalate if the device has a hardware error or multiple users are affected."
    ],
    userResponseTemplate:
      "Hi, I can help with the printer issue. Please confirm whether the printer display shows any error and whether other users nearby can print.",
    internalNotesTemplate:
      "Printer offline report. Determine single-user versus shared-device impact before escalation.",
    escalationCriteria: [
      "Multiple users affected",
      "Hardware error on printer display",
      "Network path unavailable"
    ],
    safetyNotes: ["Do not remove shared printer configuration without approval."]
  },
  {
    id: "kb-vpn-remote-access",
    title: "VPN remote access Tier 1 checklist",
    categoryId: "cat-vpn",
    symptoms: [
      "VPN client cannot establish a tunnel.",
      "User reports remote access failing from home or public Wi-Fi.",
      "Connection may fail before MFA or after credential submission."
    ],
    tierOneSteps: [
      "Confirm whether the user has working internet access outside the VPN.",
      "Ask the user to capture the exact VPN error message.",
      "Confirm the user's account is active and assigned to the VPN group.",
      "Ask the user to retry from a known trusted network if available.",
      "Escalate if multiple users report the same gateway or tunnel failure."
    ],
    userResponseTemplate:
      "Hi Jordan, I can help with the VPN connection issue. Please confirm whether your internet works before connecting to VPN and share the exact error shown by the VPN client.",
    internalNotesTemplate:
      "Remote access report. Confirm internet access, VPN group membership, MFA state, client error, and whether other users are affected before escalating.",
    escalationCriteria: [
      "Multiple users affected",
      "VPN gateway unavailable",
      "User blocked from urgent business access",
      "Account or group membership requires admin review"
    ],
    safetyNotes: [
      "Do not ask the user to share their password.",
      "Do not bypass MFA or conditional access controls."
    ]
  },
  {
    id: "kb-phishing-report",
    title: "Phishing report handling",
    categoryId: "cat-security-phishing",
    symptoms: [
      "User received suspicious email.",
      "Message includes unusual link, attachment, sender, or urgent request.",
      "User may have clicked the link."
    ],
    tierOneSteps: [
      "Thank the user and ask them not to click links or open attachments.",
      "Collect sender, subject, timestamp, and whether the user interacted with the message.",
      "Advise the user not to forward the message broadly.",
      "Escalate to security if credentials were entered or attachment was opened."
    ],
    userResponseTemplate:
      "Thanks for reporting this. Please do not click any links or open attachments in the message. I am documenting the report and will escalate if needed.",
    internalNotesTemplate:
      "Potential phishing report. Capture sender, subject, timestamp, user interaction, and mailbox impact.",
    escalationCriteria: [
      "User clicked link",
      "Credentials entered",
      "Attachment opened",
      "Multiple recipients affected"
    ],
    safetyNotes: ["Do not paste suspicious links into public tools."]
  },
  {
    id: "kb-new-user-onboarding",
    title: "New user onboarding access checklist",
    categoryId: "cat-onboarding",
    symptoms: [
      "New hire needs equipment, software, or group access.",
      "Manager or HR requests onboarding before the employee start date.",
      "Access may include Microsoft 365 groups, VPN, printer, or line-of-business apps."
    ],
    tierOneSteps: [
      "Confirm the new hire name, department, manager, and start date.",
      "Verify manager or HR approval is attached to the request.",
      "Confirm required hardware, software, distribution groups, and access roles.",
      "Check whether the asset is assigned or needs imaging before handoff.",
      "Escalate if approvals are missing or the start date is within one business day."
    ],
    userResponseTemplate:
      "Hi Jordan, I can help with the new hire onboarding request. Please confirm the start date, manager approval, required software, and access groups before provisioning begins.",
    internalNotesTemplate:
      "New user onboarding request. Confirm manager or HR approval, start date, hardware assignment, required software, distribution groups, and access roles before fulfillment.",
    escalationCriteria: [
      "Missing manager or HR approval",
      "Start date within one business day",
      "Privileged access requested",
      "Hardware imaging or inventory exception required"
    ],
    safetyNotes: [
      "Do not provision access without documented manager or HR approval.",
      "Do not grant privileged access from a general onboarding ticket."
    ]
  }
];

export const sampleTickets: Ticket[] = [
  {
    id: "TZ-INC-2026-0042",
    title: "Outlook keeps asking for MFA",
    description:
      "My Outlook keeps asking for MFA and then says my password is incorrect.",
    requesterId: "usr-jordan-lee",
    assetId: "asset-lap-1042",
    priority: "medium",
    status: "new",
    source: "portal",
    createdAt: "2026-05-10T14:00:00.000Z",
    updatedAt: "2026-05-10T14:00:00.000Z"
  },
  {
    id: "TZ-INC-2026-0043",
    title: "Finance printer is offline",
    description: "The second-floor finance printer says offline again.",
    requesterId: "usr-jordan-lee",
    assetId: "asset-prn-2207",
    priority: "low",
    status: "new",
    source: "email",
    createdAt: "2026-05-10T15:20:00.000Z",
    updatedAt: "2026-05-10T15:20:00.000Z"
  },
  {
    id: "TZ-INC-2026-0044",
    title: "Suspicious email with payroll link",
    description:
      "I got a suspicious email asking me to open a payroll link and sign in.",
    requesterId: "usr-casey-patel",
    priority: "high",
    status: "new",
    source: "email",
    createdAt: "2026-05-10T16:05:00.000Z",
    updatedAt: "2026-05-10T16:05:00.000Z"
  }
];

export const auditEvents: AuditEvent[] = [
  {
    id: "audit-001",
    ticketId: "TZ-INC-2026-0042",
    actorType: "system",
    actorName: "TierZero Demo",
    eventType: "ticket_received",
    message: "Ticket received from the support portal.",
    timestamp: "2026-05-10T14:00:01.000Z"
  },
  {
    id: "audit-002",
    ticketId: "TZ-INC-2026-0042",
    actorType: "system",
    actorName: "TierZero Demo",
    eventType: "classification_generated",
    message: "Ticket classified as Microsoft 365 / Authentication.",
    timestamp: "2026-05-10T14:00:03.000Z"
  }
];
