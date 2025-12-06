// app/contact-us/page.tsx
import ContactUsForm from './ContactUsForm';

export const metadata = { title: 'Contact Us • MedTravel' };

export default function ContactUsPage() {
  return (
    <div className="pb-16">
      {/* hero */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <h1 className="text-center text-4xl font-bold">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-3xl text-center text-white/90">
            If you have any questions, partnership offers, or feedback about
            MedTravel, send us a message and we&apos;ll respond as soon as
            we can.
          </p>
        </div>
      </section>

      {/* форма в карточке */}
      <section className="-mt-10 md:-mt-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-2xl border bg-white p-6 shadow-lg md:p-8">
            <div className="mb-4 text-center">
              <h2 className="text-lg font-semibold">Get in Touch</h2>
              <p className="mt-1 text-sm text-gray-500">
                Fill in the form below and our support team will reach out to
                you via email or phone.
              </p>
            </div>
            <ContactUsForm />

            <div className="mt-6 border-t pt-4 text-center text-xs text-gray-500">
              Prefer email? You can also reach us at{' '}
              <span className="font-medium text-gray-700">
                support@medtravel.me
              </span>
              .
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
