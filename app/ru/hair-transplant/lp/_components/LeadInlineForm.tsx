'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            // логика пока не нужна
          }}
        >
          <Input placeholder="ФИО*" />
          <Input placeholder="Телефон*" />
          <Input placeholder="Email" type="email" />
          <Input placeholder="Возраст" inputMode="numeric" />

          <Button className="w-full" size="lg" type="submit">
            {primaryCta}
          </Button>

          <p className="mt-2 text-center text-xs text-slate-500">
            Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
          </p>
        </form>
      </div>
    </div>
  );
}
