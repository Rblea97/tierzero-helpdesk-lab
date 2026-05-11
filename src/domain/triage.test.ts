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
