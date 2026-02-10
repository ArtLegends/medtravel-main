'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LeadImageUpload from "./LeadImageUpload";

type Props = {
  submitText?: string;
  onSubmitted?: () => void; // если в будущем надо закрывать модалку
  className?: string;

  // можно переопределять тексты
  disclaimerText?: string;

  // если вдруг нужен другой стиль кнопки
  buttonClassName?: string;
};

export default function LeadForm({
  submitText = 'Отправить',
  onSubmitted,
  className,
  disclaimerText = 'Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности',
  buttonClassName,
}: Props) {
  return (
    <form
      className={className ?? 'space-y-3'}
      onSubmit={(e) => {
        e.preventDefault();
        // логика пока не нужна
        onSubmitted?.();
      }}
    >
      <Input placeholder="ФИО*" />
      <Input placeholder="Телефон*" />
      <Input placeholder="Email" type="email" />
      <Input placeholder="Возраст" inputMode="numeric" />
      <div className="mt-4">
        <LeadImageUpload />
      </div>

      <Button type="submit" className={buttonClassName ?? 'w-full'} size="lg">
        {submitText}
      </Button>

      <p className="text-center text-xs text-slate-500">
        {disclaimerText}
      </p>
    </form>
  );
}
