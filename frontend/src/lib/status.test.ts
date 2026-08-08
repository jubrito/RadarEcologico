import { describe, it, expect } from "vitest";
import { getStatusInfo } from "./status";

describe("getStatusInfo", () => {
  it("matches exact status", () => {
    const info = getStatusInfo("Aguardando Parecer");
    expect(info).not.toBeNull();
    expect(info!.phase).toBe("comissao");
  });

  it("matches partial status", () => {
    const info = getStatusInfo("Aguardando Designação de Relator(a)");
    expect(info).not.toBeNull();
    expect(info!.phase).toBe("comissao");
  });

  it("returns Pronta para Pauta as plenario phase", () => {
    const info = getStatusInfo("Pronta para Pauta");
    expect(info).not.toBeNull();
    expect(info!.phase).toBe("plenario");
  });

  it("returns null for unknown status", () => {
    const info = getStatusInfo("Status que não existe no mapa");
    expect(info).toBeNull();
  });

  it("returns null for null status", () => {
    expect(getStatusInfo(null)).toBeNull();
  });

  it("returns null for undefined status", () => {
    expect(getStatusInfo(undefined)).toBeNull();
  });

  it("handles empty string", () => {
    expect(getStatusInfo("")).toBeNull();
  });

  it("explains Em tramitacao (Senado)", () => {
    const info = getStatusInfo("Em tramitação");
    expect(info).not.toBeNull();
    expect(info!.phase).toBe("comissao");
    expect(info!.explanation).toContain("Senado");
  });
});
