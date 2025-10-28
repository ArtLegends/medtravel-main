// app/about/page.tsx
import type { Metadata } from "next";
import { Icon } from "@iconify/react";
// если путь другой — поменяй импорт на фактический путь вашей секции формы
import ContactFormSection from "@/components/ContactFormSection";

export const metadata: Metadata = {
  title: "About Us – MedTravel",
  description:
    "MedTravel specializes in medical tourism and connects patients with verified clinics. Learn who we are, why choose us, and how we work.",
};

function Section({
  title,
  icon,
  text,
  imageUrl,
  imageLeft = false,
}: {
  title: string;
  icon: string;
  text: string;
  imageUrl: string;
  imageLeft?: boolean;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div
        className={`grid items-center gap-10 sm:gap-12 lg:grid-cols-2 ${
          imageLeft ? "lg:[&>div:first-child]:order-1" : ""
        }`}
      >
        {/* Text */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-primary">
            <Icon icon={icon} className="h-6 w-6 shrink-0" />
            <span className="text-sm font-medium tracking-wide">
              {/* декоративная подпись, можно скрыть, если не нужна */}
            </span>
          </div>
          <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-default-600">
            {text}
          </p>
        </div>

        {/* Image */}
        <div className="rounded-2xl border border-default-200 bg-content1 shadow-lg overflow-hidden">
          {/* Используем <img>, чтобы не настраивать внешние домены в next.config */}
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="pb-16">
      <Section
        title="Who are we?"
        icon="solar:user-rounded-outline"
        text="Medtravel.me is a company specializing in medical tourism in the field of aesthetic beauty. Our goal is to provide you with safe access to the best treatments at leading clinics. We help you choose the optimal medical services abroad, taking care of every step of your journey."
        imageUrl="https://img.freepik.com/free-photo/flat-lay-health-still-life-arrangement-with-copy-space_23-2148854064.jpg"
      />

      <Section
        title="Why choose us?"
        icon="solar:shield-check-outline"
        text="We provide a full range of services: from selecting the clinic to organizing your trip and providing all the necessary information. We work with internationally recognized medical centers and guarantee a personalized approach to each patient. To achieve this, we select the best partners based on the most stringent criteria for evaluating clinics and doctors."
        imageUrl="https://png.pngtree.com/thumb_back/fh260/background/20240912/pngtree-doctor-holding-clipboard-in-hospital-corridor-medical-stock-photo-image_16150320.jpg"
        imageLeft
      />

      <Section
        title="Experience and professionalism"
        icon="solar:medal-star-outline"
        text="Our team members have many years of experience in the medical tourism industry and actively collaborate with the largest medical institutions worldwide. High-quality service and a smooth treatment process with maximum comfort are our main concern and priority."
        imageUrl="https://media.istockphoto.com/id/2003531598/photo/image-of-medicine-and-research.jpg?s=612x612&w=0&k=20&c=ux90ANdCr8tw_sL6TjVbfkhnL4PVIIs7ApAzHMw5qLc="
      />

      <Section
        title="Our clients come first"
        icon="solar:heart-outline"
        text="We take pride in helping people improve the quality of their lives. Every patient for us is not just a client, but a person for whom we strive to provide the best solution for their health."
        imageUrl="https://img.freepik.com/free-photo/medical-banner-with-doctor-working-laptop_23-2149611211.jpg?semt=ais_hybrid&w=740&q=80"
        imageLeft
      />

      <Section
        title="The future of medical tourism"
        icon="streamline:graph-arrow-increase-remix"
        text="According to the MTA (Medical Tourism Association), the medical tourism market is expected to reach $137.71 billion by 2032, demonstrating an annual growth rate (CAGR) of 21.4% during the forecast period (2024–2032). This means that the number of medical tourists will grow exponentially. This could affect the quality of services. Therefore, we are always on the lookout for new opportunities and technologies to enhance our services. We strive to make medical tourism accessible and safe for every patient."
        imageUrl="https://t4.ftcdn.net/jpg/00/85/95/05/360_F_85950582_pJunB4hWtYp828youe7C58PIiXDZUtE9.jpg"
      />

      <Section
        title="Contact information and invitation for cooperation"
        icon="solar:letter-opened-outline"
        text="If you would like to learn more about our services or receive a consultation, feel free to contact us. We are always happy to help you on your journey to better health. Or, if you represent a clinic and would like to start a partnership with us, we are always open to collaboration."
        imageUrl="https://cdn.prod.website-files.com/6466101d017ab9d60c8d0137/65df25f0a339915ec6c00de7_Out%20of%20Hospital%20Costs_Savings%20for%20Medical%20Schemes.jpg"
        imageLeft
      />

      {/* CTA с формой бронирования — та же секция, что на главной */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <ContactFormSection />
      </section>
    </main>
  );
}
