// app/new-clinic/page.tsx
import NewClinicForm from './NewClinicForm';

export const metadata = {
  title: 'Add your clinic • MedTravel',
};

export default function NewClinicPage() {
  return (
    <div className="pb-16">
      {/* лёгкий hero */}
      <section className="border-b bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-12">
          <h1 className="text-center text-3xl font-semibold md:text-4xl">
            Add your clinic
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-gray-600 md:text-base">
            Share a few details about your clinic and how we can contact you.
            Our team will review your application and get back to you as soon as
            possible.
          </p>
        </div>
      </section>

      {/* форма */}
      <section className="-mt-6">
        <div className="mx-auto max-w-4xl px-4">
          <NewClinicForm />
        </div>
      </section>
    </div>
  );
}
