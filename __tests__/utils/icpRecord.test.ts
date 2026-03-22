import { describe, expect, it } from "vitest";
import { getIcpRecord } from "@/utils/icpRecord";

describe("getIcpRecord", () => {
  it("returns record info when both IPC and ICPLINK are configured", () => {
    const result = getIcpRecord({
      IPC: "沪ICP备2026000001号",
      ICPLINK: "https://beian.miit.gov.cn/",
    });

    expect(result).toEqual({
      text: "沪ICP备2026000001号",
      link: "https://beian.miit.gov.cn/",
    });
  });

  it("returns null when IPC is missing", () => {
    const result = getIcpRecord({
      ICPLINK: "https://beian.miit.gov.cn/",
    });

    expect(result).toBeNull();
  });

  it("returns null when ICPLINK is missing", () => {
    const result = getIcpRecord({
      IPC: "沪ICP备2026000001号",
    });

    expect(result).toBeNull();
  });

  it("treats blank values as missing", () => {
    const result = getIcpRecord({
      IPC: "   ",
      ICPLINK: "",
    });

    expect(result).toBeNull();
  });
});
