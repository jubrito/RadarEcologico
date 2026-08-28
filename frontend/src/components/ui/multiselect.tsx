"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { mergeStyles } from "@/lib/utils/utils";
import type { SelectOption } from "@/lib/types";

interface MultiSelectProps {
  options: SelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecionar...",
  className,
  id,
  "aria-label": ariaLabel,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listboxId = useId();

  const items = options.filter((o) => o.value !== "all");

  const close = useCallback(() => {
    setOpen(false);
    setFocusIdx(-1);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [close]);

  const toggle = useCallback(
    (val: string) => {
      if (selected.includes(val)) {
        onChange(selected.filter((v) => v !== val));
      } else {
        onChange([...selected, val]);
      }
    },
    [selected, onChange],
  );

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((prev) => Math.min(prev + 1, items.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (focusIdx >= 0 && focusIdx < items.length) {
          toggle(items[focusIdx].value);
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, focusIdx, items, close, toggle]);

  useEffect(() => {
    if (focusIdx >= 0 && optionRefs.current[focusIdx]) {
      optionRefs.current[focusIdx]?.scrollIntoView?.({ block: "nearest" });
    }
  }, [focusIdx]);

  const displayLabel =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? items.find((o) => o.value === selected[0])?.label || selected[0]
        : `${selected.length} temas selecionados`;

  return (
    <div className={mergeStyles("relative", className)}>
      <div
        className={mergeStyles(
          "flex h-8 items-stretch overflow-hidden rounded-lg border border-input bg-transparent text-sm transition-colors",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          "dark:bg-input/30 dark:hover:bg-input/50",
        )}
      >
        <button
          ref={triggerRef}
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-label={ariaLabel}
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 items-center justify-between gap-1.5 pl-2.5 pr-1.5 text-left select-none outline-none"
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
        </button>
        {selected.length > 0 && (
          <button
            type="button"
            aria-label="Limpar filtro de temas"
            onClick={() => onChange([])}
            className="flex shrink-0 items-center px-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          aria-label="Selecionar temas"
          className={mergeStyles(
            "absolute z-50 mt-1 w-full rounded-lg border bg-popover",
            "text-popover-foreground shadow-md ring-1 ring-foreground/10",
            "max-h-64 overflow-y-auto p-1",
          )}
        >
          {items.map((opt, idx) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                ref={(el) => {
                  optionRefs.current[idx] = el;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={focusIdx === idx ? 0 : -1}
                onClick={() => toggle(opt.value)}
                onMouseEnter={() => setFocusIdx(idx)}
                className={mergeStyles(
                  "flex w-full text-left items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer",
                  "hover:bg-accent hover:text-accent-foreground",
                  focusIdx === idx && "bg-accent text-accent-foreground",
                )}
              >
                <span
                  className={mergeStyles(
                    "size-3.5 rounded border flex items-center justify-center shrink-0",
                    isSelected ? "bg-primary border-primary" : "border-input",
                  )}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <span className="size-2 rounded-sm bg-primary-foreground" />
                  )}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
