import { describe, expect, it } from "vitest";
import { sampleTickets } from "../data/mockData";
import { triageTicket } from "./triage";

describe("triageTicket", () => {
  it("classifies the Outlook MFA scenario as Microsoft 365 authentication", () => {
    const recommendation = triageTicket(sampleTickets[0]);

    expect(recommendation.categoryName).toBe("Microsoft 365 / Authentication");
    expect(recommendation.priority).toBe("medium");
    expect(recommendation.confidence).toBe(87);
    expect(recommendation.recommendedKbArticleIds).toEqual([
      "kb-m365-mfa-signin"
    ]);
    expect(recommendation.requiresHumanApproval).toBe(true);
  });

  it("classifies printer offline reports as printing issues", () => {
    const recommendation = triageTicket(sampleTickets[1]);

    expect(recommendation.categoryName).toBe("Printing");
    expect(recommendation.recommendedKbArticleIds).toEqual([
      "kb-printer-offline"
    ]);
    expect(recommendation.tierOneChecklist).toContain(
      "Confirm whether one user or multiple users are affected."
    );
  });

  it("flags phishing reports as high priority security work", () => {
    const recommendation = triageTicket(sampleTickets[2]);

    expect(recommendation.categoryName).toBe("Security / Phishing Report");
    expect(recommendation.priority).toBe("high");
    expect(recommendation.safetyFlags).toContain(
      "Do not paste suspicious links into public tools."
    );
  });

  it("matches VPN reports to the remote access knowledge base", () => {
    const recommendation = triageTicket({
      ...sampleTickets[0],
      id: "TZ-INC-2026-0098",
      title: "VPN cannot connect from home",
      description:
        "The VPN client says the tunnel could not be established from home Wi-Fi."
    });

    expect(recommendation.categoryName).toBe("VPN / Remote Access");
    expect(recommendation.recommendedKbArticleIds).toEqual([
      "kb-vpn-remote-access"
    ]);
    expect(recommendation.tierOneChecklist).toContain(
      "Confirm whether the user has working internet access outside the VPN."
    );
  });

  it("prefers VPN remote access when the report also mentions sign-in", () => {
    const recommendation = triageTicket({
      ...sampleTickets[0],
      id: "TZ-INC-2026-0100",
      title: "VPN will not connect before shift handoff",
      description:
        "The VPN client fails with an authentication error. The user can sign in to Microsoft 365, but cannot reach the shared drive needed for a 2 PM finance deadline."
    });

    expect(recommendation.categoryName).toBe("VPN / Remote Access");
    expect(recommendation.recommendedKbArticleIds).toEqual([
      "kb-vpn-remote-access"
    ]);
    expect(recommendation.userResponseDraft).toContain("VPN connection issue");
    expect(recommendation.safetyFlags).toContain(
      "Do not bypass MFA or conditional access controls."
    );
  });

  it("prefers phishing when a suspicious link asks the user to sign in", () => {
    const recommendation = triageTicket({
      ...sampleTickets[2],
      id: "TZ-INC-2026-0101",
      title: "Suspicious payroll link asks me to sign in",
      description:
        "I received a suspicious payroll email with a link asking me to login and confirm my password."
    });

    expect(recommendation.categoryName).toBe("Security / Phishing Report");
    expect(recommendation.priority).toBe("high");
    expect(recommendation.recommendedKbArticleIds).toEqual([
      "kb-phishing-report"
    ]);
  });

  it("prefers printing when printer-specific terms overlap with login wording", () => {
    const recommendation = triageTicket({
      ...sampleTickets[1],
      id: "TZ-INC-2026-0102",
      title: "Printer offline and showing login prompt",
      description:
        "The shared finance printer says offline after showing a login prompt on the display."
    });

    expect(recommendation.categoryName).toBe("Printing");
    expect(recommendation.recommendedKbArticleIds).toEqual([
      "kb-printer-offline"
    ]);
  });

  it("classifies new hire access requests as onboarding service requests", () => {
    const recommendation = triageTicket({
      ...sampleTickets[0],
      id: "TZ-SR-2026-0103",
      title: "New hire laptop and access needed",
      description:
        "A new hire starts tomorrow and needs a laptop, VPN, payroll software access, and Microsoft 365 groups."
    });

    expect(recommendation.categoryName).toBe("New User Onboarding");
    expect(recommendation.recommendedKbArticleIds).toEqual([
      "kb-new-user-onboarding"
    ]);
    expect(recommendation.userResponseDraft).toContain("new hire");
  });

  it("personalizes the user response when the requester is known", () => {
    const recommendation = triageTicket(sampleTickets[0]);

    expect(recommendation.userResponseDraft).toContain("Hi Jordan");
    expect(recommendation.userResponseDraft).toContain("office.com");
  });

  it("falls back to a safe default category for unmatched request text", () => {
    const recommendation = triageTicket({
      ...sampleTickets[0],
      id: "TZ-INC-2026-0099",
      title: "General help request",
      description: "I need help with something on my computer."
    });

    expect(recommendation.categoryName).toBe("Microsoft 365 / Authentication");
    expect(recommendation.confidence).toBe(63);
    expect(recommendation.requiresHumanApproval).toBe(true);
  });
});
