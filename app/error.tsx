'use client';
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  console.error('GLOBAL ERROR', error);
  return (
    <html><body>
      <p>Something went wrong!</p>
      <button onClick={() => reset()}>Try again</button>
    </body></html>
  );
}


// "use client";

// import { useEffect } from "react";

// export default function Error({
//   error,
//   reset,
// }: {
//   error: Error;
//   reset: () => void;
// }) {
//   useEffect(() => {
//     // Log the error to an error reporting service
//     /* eslint-disable no-console */
//     console.error(error);
//   }, [error]);

//   return (
//     <div>
//       <h2>Something went wrong!</h2>
//       <button
//         onClick={
//           // Attempt to recover by trying to re-render the segment
//           () => reset()
//         }
//       >
//         Try again
//       </button>
//     </div>
//   );
// }
