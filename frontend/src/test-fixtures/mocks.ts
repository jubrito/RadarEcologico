import { vi } from "vitest";

export function mockNavigation() {
  vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "/",
  }));
}

export function mockApi(overrides: {
  getBills?: ReturnType<typeof vi.fn>;
  getBill?: ReturnType<typeof vi.fn>;
  getStats?: ReturnType<typeof vi.fn>;
} = {}) {
  vi.mock("@/lib/api", () => ({
    getBills: overrides.getBills ?? vi.fn(),
    getBill: overrides.getBill ?? vi.fn(),
    getStats: overrides.getStats ?? vi.fn(),
  }));
}
