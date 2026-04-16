import { brand } from "@/config/brand";

type Props = {
  cancelMinHours: number;
};

/**
 * Hinweise zu Storno und Zahlung für das öffentliche Portal (Barrierearm: echte Überschriften & Liste).
 */
export function PublicPortalPolicies({ cancelMinHours }: Props) {
  const deadline = brand.labels.publicPortalPoliciesCancellationDeadlineTemplate.replace(
    "{hours}",
    String(cancelMinHours)
  );

  return (
    <section
      className="mx-auto max-w-4xl px-4 pb-2 md:px-6"
      aria-labelledby="public-portal-policies-heading"
    >
      <div className="rounded-2xl border border-sk-outline/20 bg-white/90 p-5 shadow-sm md:p-6">
        <h2
          id="public-portal-policies-heading"
          className="text-base font-semibold tracking-tight text-sk-ink md:text-lg"
        >
          {brand.labels.publicPortalPoliciesHeading}
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-sk-ink/85">
          <li>{brand.labels.publicPortalPoliciesCancellationLead}</li>
          <li>{deadline}</li>
          <li>{brand.labels.publicPortalPoliciesPayment}</li>
        </ul>
      </div>
    </section>
  );
}
