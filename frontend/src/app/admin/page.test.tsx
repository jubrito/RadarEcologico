import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AdminPage from "./page";

const mocks = vi.hoisted(() => ({
  getSupabase: vi.fn(),
  getBills: vi.fn(),
  fetchReviews: vi.fn(),
  upsertReview: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabase: mocks.getSupabase,
}));

vi.mock("@/lib/api", () => ({
  getBills: mocks.getBills,
}));

vi.mock("@/lib/reviews", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/reviews")>();
  return {
    ...actual,
    fetchReviews: mocks.fetchReviews,
    upsertReview: mocks.upsertReview,
  };
});

function mockClient(session = null) {
  const auth = {
    getSession: vi.fn().mockResolvedValue({ data: { session } }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
  };
  mocks.getSupabase.mockReturnValue({ auth });
  return auth;
}

const pendingBill = {
  id: "camara:123",
  external_id: "123",
  source: "camara",
  bill_type: "PL",
  number: 123,
  year: 2026,
  ementa: "Institui uma política de proteção ambiental.",
  link: "https://example.com/bill/123",
  classification: "needs_review" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockClient();
  mocks.getBills.mockResolvedValue({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  });
  mocks.fetchReviews.mockResolvedValue([]);
});

async function fillCredentials(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: password },
  });
}

describe("AdminPage", () => {
  it("shows the login form when there is no session", async () => {
    render(<AdminPage />);
    expect(
      await screen.findByRole("button", { name: "Entrar" }),
    ).toBeInTheDocument();
  });

  it("shows the registration form when 'Criar conta' is selected", async () => {
    render(<AdminPage />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Criar conta" }),
    );
    expect(
      screen.getByRole("button", { name: "Criar conta" }),
    ).toBeInTheDocument();
  });

  it("logs in with email and password", async () => {
    const auth = mockClient();
    render(<AdminPage />);
    await screen.findByRole("button", { name: "Entrar" });

    await fillCredentials("revisor@example.com", "secret123");
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(auth.signInWithPassword).toHaveBeenCalledWith({
        email: "revisor@example.com",
        password: "secret123",
      });
    });
  });

  it("shows the error message when login fails", async () => {
    const auth = mockClient();
    auth.signInWithPassword.mockResolvedValue({
      error: { message: "Senha incorreta" },
    });
    render(<AdminPage />);
    await screen.findByRole("button", { name: "Entrar" });

    await fillCredentials("revisor@example.com", "wrong");
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Senha incorreta",
    );
  });

  it("asks the user to confirm their email after a successful sign-up", async () => {
    const auth = mockClient();
    auth.signUp.mockResolvedValue({ error: null });
    render(<AdminPage />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Criar conta" }),
    );

    await fillCredentials("novo@example.com", "secret123");
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(
      await screen.findByRole("status"),
    ).toHaveTextContent(/link de confirmação/);
    expect(auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "novo@example.com",
        password: "secret123",
        options: {
          emailRedirectTo: expect.stringMatching(/\/admin$/),
        },
      }),
    );
  });

  it("does not show the confirmation message when sign-up fails", async () => {
    const auth = mockClient();
    auth.signUp.mockResolvedValue({
      error: { message: "Email já cadastrado" },
    });
    render(<AdminPage />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Criar conta" }),
    );

    await fillCredentials("novo@example.com", "secret123");
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email já cadastrado",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders the review dashboard when the email confirmation auto-logs in", async () => {
    const auth = mockClient({ user: { email: "revisor@example.com" } });
    render(<AdminPage />);

    expect(await screen.findByRole("button", { name: "Sair" })).toBeEnabled();
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/Nenhum projeto aguardando revisão/),
    ).toBeInTheDocument();
  });

  it("filters the dashboard to bills awaiting review", async () => {
    mockClient({ user: { email: "revisor@example.com" } });
    mocks.getBills.mockResolvedValue({
      items: [
        pendingBill,
        { ...pendingBill, id: "camara:456", classification: "favorable", ementa: "Já revisado." },
      ],
      total: 2,
      page: 1,
      limit: 20,
    });
    mocks.fetchReviews.mockResolvedValue([]);

    render(<AdminPage />);

    expect(
      await screen.findByText("Institui uma política de proteção ambiental."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Já revisado.")).not.toBeInTheDocument();
  });

  it("submits a neutral review with the current form values", async () => {
    const auth = mockClient({ user: { email: "revisor@example.com" } });
    auth.getUser.mockResolvedValue({
      data: { user: { email: "revisor@example.com" } },
    });
    mocks.getBills.mockResolvedValue({
      items: [pendingBill],
      total: 1,
      page: 1,
      limit: 20,
    });
    mocks.upsertReview.mockResolvedValue(undefined);

    render(<AdminPage />);
    fireEvent.change(
      await screen.findByRole("slider", {
        name: "Potencial risco de agravar a crise climática",
      }),
      { target: { value: "20" } },
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Notas" }), {
      target: { value: "Sem relação climática." },
    });
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Não se relaciona com questões climáticas (neutral)",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Salvar revisão" }));

    await waitFor(() => {
      expect(mocks.upsertReview).toHaveBeenCalledWith(
        expect.objectContaining({
          source: "camara",
          external_id: "123",
          reviewed_by: "revisor@example.com",
          reviewer_score: 20,
          reviewer_classification: "neutral",
          reviewer_notes: "Sem relação climática.",
          not_related: true,
        }),
      );
    });
  });

  it("shows only bills that need review and the review count", async () => {
    mockClient({ user: { email: "revisor@example.com" } });
    mocks.getBills.mockResolvedValue({
      items: [
        pendingBill,
        {
          ...pendingBill,
          id: "senado:456",
          external_id: "456",
          classification: "favorable",
          ementa: "Projeto já classificado.",
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
    });
    mocks.fetchReviews.mockResolvedValue([
      {
        source: "senado",
        external_id: "456",
        reviewed_by: "other@example.com",
        reviewer_score: 10,
        reviewer_classification: "favorable",
        reviewer_notes: null,
        not_related: false,
        reviewed_at: "2026-01-01T00:00:00Z",
      },
    ]);

    render(<AdminPage />);

    expect(
      await screen.findByText("Institui uma política de proteção ambiental."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Projeto já classificado.")).not.toBeInTheDocument();
    expect(screen.getByText(/1 projetos aguardando revisão · 1 já revisados/))
      .toBeInTheDocument();
  });

  it("submits the current score, classification, notes, and relationship flag", async () => {
    const auth = mockClient({ user: { email: "revisor@example.com" } });
    auth.getUser.mockResolvedValue({
      data: { user: { email: "revisor@example.com" } },
    });
    mocks.getBills.mockResolvedValue({
      items: [pendingBill],
      total: 1,
      page: 1,
      limit: 20,
    });
    mocks.upsertReview.mockResolvedValue(undefined);

    render(<AdminPage />);

    const slider = await screen.findByRole("slider", {
      name: "Potencial risco de agravar a crise climática",
    });
    fireEvent.change(slider, { target: { value: "20" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Notas" }), {
      target: { value: "Revisão concluída." },
    });
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Não se relaciona com questões climáticas (neutral)",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Salvar revisão" }));

    await waitFor(() => {
      expect(mocks.upsertReview).toHaveBeenCalledWith({
        source: "camara",
        external_id: "123",
        reviewed_by: "revisor@example.com",
        reviewer_score: 20,
        reviewer_classification: "neutral",
        reviewer_notes: "Revisão concluída.",
        not_related: true,
      });
    });
  });

  it("shows a setup error when Supabase is not configured", async () => {
    mocks.getSupabase.mockImplementation(() => {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL not configured");
    });
    render(<AdminPage />);

    expect(
      await screen.findByText(/NEXT_PUBLIC_SUPABASE_URL/),
    ).toBeInTheDocument();
  });
});