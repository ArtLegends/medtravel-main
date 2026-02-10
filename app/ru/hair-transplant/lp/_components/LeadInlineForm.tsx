'use client';

import LeadForm from './LeadForm';
import LeadImageUpload from './LeadImageUpload';

type Props = {
  title: string;
  primaryCta?: string;
};

export default function LeadInlineForm({
  title,
  primaryCta = 'Получить консультацию',
}: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="p-6 sm:p-7">
        <h3 className="text-center text-sm font-semibold text-slate-900 sm:text-base">
          {title}
        </h3>

        <LeadForm className="mt-5 space-y-3" submitText={primaryCta} />

      </div>
    </div>
  );
}
