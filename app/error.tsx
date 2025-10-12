// app/error.tsx
'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // полезно видеть оригинальную ошибку в консоли
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-lg font-semibold">Something went wrong!</h2>
      <p className="mt-2 text-muted-foreground text-sm">
        {process.env.NODE_ENV === 'development' ? error.message : 'Please try again.'}
      </p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-white"
      >
        Try again
      </button>
    </div>
  );
}
