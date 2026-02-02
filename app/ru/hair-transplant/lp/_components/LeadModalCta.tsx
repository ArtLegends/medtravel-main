'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type Props = {
  buttonText: string;
  title?: string;
  subtitle?: string;
  className?: string;
  buttonVariant?: 'default' | 'secondary' | 'outline';
};

export default function LeadModalCta({
  buttonText,
  title = 'Запишитесь на бесплатную консультацию и расчёт стоимости',
  subtitle = 'Оставьте контакты — мы свяжемся с вами и подскажем лучший вариант.',
  className,
  buttonVariant = 'default',
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size="lg" className={className}>
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-base sm:text-lg">{title}</DialogTitle>
          <p className="mt-1 text-center text-sm text-slate-600">{subtitle}</p>
        </DialogHeader>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            // логика пока не нужна
          }}
        >
          <Input placeholder="ФИО*" />
          <Input placeholder="Телефон*" />
          <Input placeholder="Email" type="email" />
          <Input placeholder="Возраст" inputMode="numeric" />

          <Button type="submit" className="w-full" size="lg">
            Отправить
          </Button>

          <p className="text-center text-xs text-slate-500">
            Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
