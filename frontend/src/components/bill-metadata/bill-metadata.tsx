import { type ComponentType } from "react";
import { formatDate, formatSource } from "@/lib/utils/utils";
import { parseAuthor } from "@/lib/bill-helpers";
import { stateLabel } from "@/lib/state-label";
import type { Bill } from "@/lib/api";
import { User, Building2, Landmark, Calendar } from "lucide-react";

interface MetadataItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
  content: string;
}

function MetadataRow({
  icon: Icon,
  label,
  children,
  highlight = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex gap-3 p-4 rounded-lg ${
        highlight ? "border border-foreground" : "bg-card"
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-foreground/10 text-foreground">
        <Icon
          className="w-5 h-5 flex-shrink-0 mt-0.5 text-muted-foreground"
          aria-hidden="true"
        />
      </span>

      <div>
        <h2 className="font-bold uppercase text-sm">{label}</h2>
        <div className="text-sm mt-0.5 text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

function MetadataGrid({ items }: { items: MetadataItem[] }) {
  if (items.length === 0) return null;
  if (items.length === 1) {
    const [item] = items;
    return (
      <MetadataRow icon={item.icon} label={item.label}>
        {item.content}
      </MetadataRow>
    );
  }

  const odd = items.length % 2 !== 0;
  const pairs = [];
  for (let i = 0; i < items.length - (odd ? 1 : 0); i += 2) {
    pairs.push(items.slice(i, i + 2));
  }

  return (
    <>
      {pairs.map(([a, b], i) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <MetadataRow icon={a.icon} label={a.label}>
            {a.content}
          </MetadataRow>
          <MetadataRow icon={b.icon} label={b.label}>
            {b.content}
          </MetadataRow>
        </div>
      ))}
      {odd && (
        <MetadataRow
          icon={items[items.length - 1].icon}
          label={items[items.length - 1].label}
        >
          {items[items.length - 1].content}
        </MetadataRow>
      )}
    </>
  );
}

interface BillMetadataProps {
  bill: Bill;
  statusRow?: React.ReactNode;
}

export function BillMetadata({ bill, statusRow }: BillMetadataProps) {
  const items = buildItems(bill);

  return (
    <section className="space-y-6">
      {statusRow}
      <MetadataGrid items={items} />
    </section>
  );
}

function buildItems(bill: Bill): MetadataItem[] {
  const author = parseAuthor(bill);

  return [
    ...(author.name
      ? [
          {
            icon: User as ComponentType<{ className?: string }>,
            label: "Autor",
            content: author.name,
          },
        ]
      : []),
    ...(author.party || author.state
      ? [
          {
            icon: Building2 as ComponentType<{ className?: string }>,
            label: "Partido",
            content: author.state
              ? `${author.party} (${stateLabel(author.state)})`
              : (author.party ?? ""),
          },
        ]
      : []),
    ...(bill.presentation_date
      ? [
          {
            icon: Calendar as ComponentType<{ className?: string }>,
            label: "Data de apresentação",
            content: formatDate(bill.presentation_date),
          },
        ]
      : []),
    {
      icon: Landmark as ComponentType<{ className?: string }>,
      label: "Fonte do projeto",
      content: formatSource(bill.source),
    },
  ];
}
