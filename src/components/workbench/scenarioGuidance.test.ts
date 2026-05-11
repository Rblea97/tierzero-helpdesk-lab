import { describe, expect, it } from "vitest";
import { getScenarioGuidance } from "./scenarioGuidance";

describe("getScenarioGuidance", () => {
  it("returns VPN-specific KB options and response safety text", () => {
    const guidance = getScenarioGuidance("cat-vpn");

    expect(guidance.knowledgeOptions[0]).toEqual({
      id: "kb-vpn-remote-access",
      title: "VPN remote access Tier 1 checklist",
      score: 93
    });
    expect(guidance.responseSafetyText).toContain("VPN client error");
    expect(guidance.responseSafetyText).toContain("cannot bypass MFA");
  });

  it("returns phishing-specific safety guidance", () => {
    const guidance = getScenarioGuidance("cat-security-phishing");

    expect(guidance.knowledgeOptions[0].id).toBe("kb-phishing-report");
    expect(guidance.responseSafetyText).toContain("do not click links");
  });

  it("falls back to M365 guidance for unknown categories", () => {
    const guidance = getScenarioGuidance("unknown-category");

    expect(guidance.knowledgeOptions[0].id).toBe("kb-m365-mfa-signin");
    expect(guidance.responseSafetyText).toContain("password reset");
  });
});
