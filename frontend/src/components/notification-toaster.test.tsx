import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { NotificationToaster, useNotification } from "./notification-toaster";

function Trigger() {
  const { notify } = useNotification();
  return (
    <button onClick={() => notify({ message: "Não foi possível concluir.", kind: "error" })}>
      Mostrar
    </button>
  );
}

describe("NotificationToaster", () => {
  it("shows an accessible error notification and allows dismissing it", () => {
    render(
      <NotificationToaster>
        <Trigger />
      </NotificationToaster>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mostrar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível concluir.");

    fireEvent.click(screen.getByRole("button", { name: "Fechar notificação" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("announces non-error notifications as status", () => {
    function InfoTrigger() {
      const { notify } = useNotification();
      return (
        <button
          onClick={() => notify({ message: "Informação disponível.", kind: "info" })}
        >
          Mostrar informação
        </button>
      );
    }

    render(
      <NotificationToaster>
        <InfoTrigger />
      </NotificationToaster>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mostrar informação" }));

    expect(screen.getByRole("status")).toHaveTextContent("Informação disponível.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("automatically dismisses notifications", () => {
    vi.useFakeTimers();
    render(
      <NotificationToaster>
        <Trigger />
      </NotificationToaster>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mostrar" }));

    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("keeps permanent notifications until the user closes them", () => {
    vi.useFakeTimers();
    function PermanentTrigger() {
      const { notify } = useNotification();
      return (
        <button
          onClick={() =>
            notify({
              message: "Ação necessária.",
              kind: "error",
              persistence: "permanent",
            })
          }
        >
          Mostrar permanente
        </button>
      );
    }
    render(
      <NotificationToaster>
        <PermanentTrigger />
      </NotificationToaster>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mostrar permanente" }));
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Ação necessária.");
    fireEvent.click(screen.getByRole("button", { name: "Fechar notificação" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("keeps multiple notifications in one visible stack", () => {
    function MultipleTrigger() {
      const { notify } = useNotification();
      return (
        <button
          onClick={() => {
            notify({ message: "Primeira mensagem.", kind: "error" });
            notify({ message: "Segunda mensagem.", kind: "info" });
            notify({ message: "Terceira mensagem.", kind: "success" });
          }}
        >
          Mostrar várias
        </button>
      );
    }

    render(
      <NotificationToaster>
        <MultipleTrigger />
      </NotificationToaster>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mostrar várias" }));

    expect(screen.getByText("Primeira mensagem.")).toBeInTheDocument();
    expect(screen.getByText("Segunda mensagem.")).toBeInTheDocument();
    expect(screen.getByText("Terceira mensagem.")).toBeInTheDocument();
    expect(screen.getByLabelText("Notificações")).not.toHaveClass(
      "-translate-y-1/2",
    );
    expect(screen.getByLabelText("Notificações")).toHaveClass("overflow-y-auto");
  });
});
