import { describe, it, expect } from "vitest";
import {
  deriveStance,
  STANCE_MAP,
  STANCE_GROUP_LABELS,
  STANCE_ORDER,
} from "./classifications";
import { STANCE } from "../types";

describe("deriveStance", () => {
  it("maps each 20-point band to the expected stance", () => {
    expect(deriveStance(0).stance).toBe(STANCE.combate);
    expect(deriveStance(19).stance).toBe(STANCE.combate);
    expect(deriveStance(20).stance).toBe(STANCE.ajuda);
    expect(deriveStance(39).stance).toBe(STANCE.ajuda);
    expect(deriveStance(40).stance).toBe(STANCE.ambivalente);
    expect(deriveStance(59).stance).toBe(STANCE.ambivalente);
    expect(deriveStance(60).stance).toBe(STANCE.atrapalha);
    expect(deriveStance(79).stance).toBe(STANCE.atrapalha);
    expect(deriveStance(80).stance).toBe(STANCE.intensifica);
    expect(deriveStance(100).stance).toBe(STANCE.intensifica);
  });

  it("maps the ambivalent band to the neutral coarse roll-up", () => {
    expect(deriveStance(40).group).toBe("ambivalentes");
    expect(deriveStance(50).group).toBe("ambivalentes");
  });

  it("assigns the correct groups", () => {
    expect(deriveStance(10).group).toBe("favoraveis");
    expect(deriveStance(30).group).toBe("favoraveis");
    expect(deriveStance(45).group).toBe("ambivalentes");
    expect(deriveStance(70).group).toBe("desfavoraveis");
    expect(deriveStance(90).group).toBe("desfavoraveis");
  });

  it("returns the sem_relacao stance when not related", () => {
    const info = deriveStance(0, true);
    expect(info.stance).toBe(STANCE.sem_relacao);
    expect(info.group).toBe("ambivalentes");
    expect(info.label).toBe("Sem relação climática");
  });

  it("provides a phrase for every stance", () => {
    for (const stance of STANCE_ORDER) {
      const phrase = deriveStance(
        stance === STANCE.sem_relacao ? 0 : 50,
        stance === STANCE.sem_relacao,
      ).phrase;
      expect(phrase).not.toBeNull();
      expect(phrase!.trim()).not.toBe("");
    }
  });
});

describe("STANCE_MAP", () => {
  it("has an entry with a label for every stance", () => {
    for (const stance of STANCE_ORDER) {
      expect(STANCE_MAP[stance].label.trim()).not.toBe("");
      expect(STANCE_MAP[stance].bgSolid).toBeTruthy();
    }
  });

  it("varies color by gravity (combate vs ajuda differ)", () => {
    expect(STANCE_MAP[STANCE.combate].textAccent).not.toBe(
      STANCE_MAP[STANCE.ajuda].textAccent,
    );
    expect(STANCE_MAP[STANCE.atrapalha].textAccent).not.toBe(
      STANCE_MAP[STANCE.intensifica].textAccent,
    );
  });
});

describe("STANCE_GROUP_LABELS", () => {
  it("labels every group", () => {
    expect(STANCE_GROUP_LABELS.favoraveis).toBe("Favoráveis à luta climática");
    expect(STANCE_GROUP_LABELS.ambivalentes).toBe("Ambivalentes");
    expect(STANCE_GROUP_LABELS.desfavoraveis).toBe(
      "Desfavoráveis à luta climática",
    );
  });
});
