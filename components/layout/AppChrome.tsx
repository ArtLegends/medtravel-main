'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type Props = { children: React.ReactNode };

export default function AppChrome({ children }: Props) {
  const pathname = usePathname() || '/';

  // где скрываем публичные Navbar/Footer
  const hideChrome =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/login');

  if (hideChrome) {
    // админка и auth — без шапки/подвала
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
