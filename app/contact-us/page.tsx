// app/contact-us/page.tsx
import ContactUsForm from "./ContactUsForm";

export const metadata = { title: "Contact Us • MedTravel" };

export default function ContactUsPage() {
  return (
    <div className="pb-16">
      {/* hero с градиентом и заголовком */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <h1 className="text-center text-4xl font-bold">Contact Us</h1>
          <p className="mt-4 text-center text-white/90 max-w-3xl mx-auto">
            If you have any questions or suggestions, please contact us by filling
            out the form or emailing us.
          </p>
        </div>
      </section>

      {/* белая карточка с формой */}
      <section className="-mt-10">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-xl border bg-white p-6 shadow-md md:p-8">
            <h2 className="mb-6 text-center text-xl font-semibold">Get in Touch</h2>
            <ContactUsForm />
          </div>
        </div>
      </section>
    </div>
  );
}
