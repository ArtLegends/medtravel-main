import ProgramDetail, {
    ProgramDetailConfig,
  } from "@/components/partner/ProgramDetail";
  
  const CONFIG: ProgramDetailConfig = {
    key: "plastic-surgery",
    name: "Plastic Surgery",
    rewardRate: "5%",
    cookieLifetime: "90 days",
    platforms: "Desktop Mobile web",
    programDetails:
      "Medtravel.me helps Turkish aesthetic clinics attract international patients from Europe, the CIS, and North America. We generate high-quality leads for plastic surgery procedures including rhinoplasty, breast augmentation, liposuction, and tummy tucks. Our service is clinic-first: performance-based, transparent, and fully supported. We carefully vet each clinic to ensure quality, safety, and patient trust — making it easier for clinics to convert leads into long-term clients. With global demand for plastic surgery on the rise, medtravel.me is your strategic partner in cross-border patient acquisition.",
    payoutProcess:
      'Due to the personal and often complex nature of plastic surgery, patients may need several weeks or months to decide on a clinic and procedure. Leads will remain "Pending" until the treatment is completed and confirmed by the clinic. After confirmation, the reward will be marked as "Confirmed" and added to the following month’s payout. This allows for a realistic reflection of the patient journey and accurate commission reporting.',
    languages:
      "English German Polish Russian Danish Dutch; Flemish Finnish Norwegian Swedish",
    targetCountries:
      "United Kingdom Ireland United States Canada Germany Austria Switzerland Liechtenstein Luxembourg Belgium Poland Russia Belarus Kazakhstan Ukraine Estonia Latvia Lithuania Moldova Denmark Netherlands Belgium Finland Norway Sweden",
    allowedChannels:
      "Website, Social media, Video platform, Newsletter, Messaging platform",
    programTerms:
      "Please note that failure to comply with these terms and conditions could result in your relationship within this Affiliate Program being terminated and any Partner's fee earned being reversed. By joining the present Affiliate Program of the Advertiser, you agree to comply with the terms specified below and confirm that you understand that: The advertiser is Medtravel.me, which offers online booking services for clinics for medical tourism purposes and operates its affiliate program through the Medtravel.me affiliate network. 1.1. You are not allowed to engage (willingly or accidentally) in Prohibited Activities (\"Forbidden traffic types\") while Traffic Acquisition, including, but not limited to, those mentioned on the description page of the Advertiser's Affiliate Program; 1.2. Ad hijacking of the Advertiser's ads or direct linking to the Advertiser is strictly prohibited. You will be immediately blacklisted for this Advertiser, and all of your fees for Traffic Acquisition will be reversed for failure to comply with the specified condition. You must provide content that is of value and beneficial to the end-user and should not use PPC as a redirect. You should refrain from creating PPC ads that either contain the Advertiser's URL or contain Advertiser's trademarks or any other Advertiser's intellectual property or redirect to the Advertiser's website and should not click through to the Advertiser's ad; 1.3. You are not allowed to add URLs that link to the Advertiser's website and post other promo materials on third-party websites without the explicit consent of their owners; 1.4. You are not allowed to use any other advertising materials, except for those that are presented on the Affiliate Network website: Partner's fee: 2.1. Your Partner's fee for Traffic Acquisition is paid for Desired Actions, which mean actual purchases or other actions in relation to Travel services on the Advertiser's website that are made by referrals from your website; 2.2. Your Partner's fee is based on all referrals, who used the URLs that contain your affiliate ID, provided that all the transactions made by a user within the cookie lifetime period starting from their first visit to the Advertiser's website are taken into account; 2.3. Your Partner's fee is calculated as mentioned on the description page of the Advertiser on the Medtravel.me website; 2.4. You will be provided with information about statistics on completed Desired Actions and your income on the dashboard at Medtravel.me. The Partner's fee calculated for the previous month is paid as it's described on Travelpayouts.com by transferring funds to your account according to the payment details specified in your Personal Dashboard.",
  };
  
  export default function PlasticSurgeryProgramPage() {
    return <ProgramDetail config={CONFIG} />;
  }
  