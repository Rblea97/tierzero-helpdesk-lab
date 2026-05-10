import { describe, expect, it } from "vitest";
import { sampleTickets } from "../data/mockData";
import { triageTicket } from "./triage";

describe("triageTicket", () => {
  it("classifies the Outlook MFA scenario as Microsoft 365 authentication", () => {
    const recommendation = triageTicket(sampleTickets[0]);

    expect(recommendation.categoryName).toBe("Microsoft 365 / Authentication");
    expect(recommendation.priority).toBe("medium");
    expect(recommendation.confidence).toBe(86);
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
});
