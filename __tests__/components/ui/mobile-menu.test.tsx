// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import MobileMenu from "@/components/ui/mobile-menu";

describe("MobileMenu", () => {
  it("renders toggle button", () => {
    render(<MobileMenu />);
    expect(screen.getByRole("button", { name: /toggle menu/i })).toBeInTheDocument();
  });

  it("shows menu when opened", async () => {
    const user = userEvent.setup();
    render(<MobileMenu />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
