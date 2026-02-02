// components/layout/AppChrome.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type Props = { children: React.ReactNode };

export default function AppChrome({ children }: Props) {
  const pathname = usePathname() || '/';

  // лендинг без Navbar/Footer
  const isLanding =
    pathname === '/ru/hair-transplant/lp' ||
    pathname.startsWith('/ru/hair-transplant/lp/');

  // где скрываем публичные Navbar/Footer
  const hideChrome =
    isLanding ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/login');

  if (hideChrome) {
    // админка, auth и лендинг — без шапки/подвала
    return <>{children}</>;
  }

  // публичный сайт — со шапкой и подвалом
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
