import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation - MedTravel",
  description: "Documentation",
};

export default async function DocsPage() {
  return (
    <main className="flex flex-1 justify-center items-center">
      <div className="rounded-large bg-content1 px-8 py-12 w-full max-w-screen-xl mx-4 text-center shadow-small">
        <h1 className="text-3xl font-bold">Documentation</h1>
      </div>
    </main>
  );
}
