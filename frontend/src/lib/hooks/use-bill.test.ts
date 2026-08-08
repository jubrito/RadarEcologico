import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useBill } from "./use-bill";
import { createBill } from "@/test-fixtures/bills";

const { mockGetBill } = vi.hoisted(() => ({
  mockGetBill: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  getBill: mockGetBill,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useBill", () => {
  it("returns loading state initially", () => {
    mockGetBill.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useBill("abc"));
    expect(result.current.loading).toBe(true);
    expect(result.current.bill).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("returns bill data after load", async () => {
    const fakeBill = createBill();
    mockGetBill.mockResolvedValue(fakeBill);

    const { result } = renderHook(() => useBill("abc"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.bill).toEqual(fakeBill);
    expect(result.current.error).toBeNull();
  });

  it("returns error on failure", async () => {
    mockGetBill.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useBill("abc"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.bill).toBeNull();
    expect(result.current.error).toBe("Network error");
  });

  it("refetches when id changes", async () => {
    mockGetBill.mockResolvedValue(createBill());

    const { result, rerender } = renderHook(
      ({ id }) => useBill(id),
      { initialProps: { id: "abc" } },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockGetBill.mockResolvedValue(createBill({ id: "xyz" }));
    rerender({ id: "xyz" });

    await waitFor(() => {
      expect(mockGetBill).toHaveBeenCalledWith("xyz");
    });
  });
});
