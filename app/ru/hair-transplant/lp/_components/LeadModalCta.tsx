'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import LeadForm from './LeadForm';

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
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        <LeadForm
          className="mt-4 space-y-3"
          submitText="Отправить"
          onSubmitted={() => setOpen(false)} // сейчас просто закрываем, логики нет
        />
      </DialogContent>
    </Dialog>
  );
}
