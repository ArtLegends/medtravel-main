// app/new-clinic/page.tsx
import NewClinicForm from './NewClinicForm';

export const metadata = {
  title: 'Add your clinic • MedTravel',
};

export default function NewClinicPage() {
  return (
    <div className="pb-16">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-6 pt-6 text-center text-3xl font-semibold">Add your clinic</h1>

        <NewClinicForm />
      </div>
    </div>
  );
}
