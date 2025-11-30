import ProgramDetail, {
    ProgramDetailConfig,
  } from "@/components/partner/ProgramDetail";
  
  const CONFIG: ProgramDetailConfig = {
    key: "dentistry",
    name: "Dentistry",
    rewardRate: "5%",
    cookieLifetime: "90 days",
    platforms: "Desktop Mobile web",
    programDetails:
      "Medtravel.me connects patients from Europe, the CIS, and North America with leading dental clinics in Turkey. From veneers and implants to full-mouth restorations, we deliver high-quality leads for certified clinics offering world-class care at competitive prices. Our platform empowers clinic partners with real-time lead tracking, dedicated account support, and optimized campaign tools to maximize conversion. All partner clinics meet strict international standards for quality, safety, and patient satisfaction. Join medtravel.me and attract patients actively seeking dental treatments in one of the world's top medical tourism destinations.",
    payoutProcess:
      'Patients often take time to research and make informed decisions about dental care abroad. This means the time between first inquiry and actual treatment can vary — sometimes taking several weeks or even months. All leads and conversions will initially appear as "Pending." Once the clinic confirms that the treatment has been completed and payment received, the status will update to "Confirmed." Payouts are processed monthly, and confirmed treatments are included in the following payout cycle.',
    languages:
      "English German Polish Russian Danish Dutch; Flemish Finnish Norwegian Swedish",
    targetCountries:
      "United Kingdom Ireland United States Canada Germany Austria Switzerland Liechtenstein Luxembourg Belgium Poland Russia Belarus Kazakhstan Ukraine Estonia Latvia Lithuania Moldova Denmark Netherlands Belgium Finland Norway Sweden",
    allowedChannels:
      "Website, Social media, Video platform, Newsletter, Messaging platform",
    programTerms:
      "Please note that failure to comply with these terms and conditions could result in your relationship within this Affiliate Program being terminated and any Partner's fee earned being reversed. By joining the present Affiliate Program of the Advertiser, you agree to comply with the terms specified below and confirm that you understand that: The advertiser is Medtravel.me, which offers online booking services for clinics for medical tourism purposes and operates its affiliate program through the Medtravel.me affiliate network. 1.1. You are not allowed to engage (willingly or accidentally) in Prohibited Activities (\"Forbidden traffic types\") while Traffic Acquisition, including, but not limited to, those mentioned on the description page of the Advertiser's Affiliate Program; 1.2. Ad hijacking of the Advertiser's ads or direct linking to the Advertiser is strictly prohibited. You will be immediately blacklisted for this Advertiser, and all of your fees for Traffic Acquisition will be reversed for failure to comply with the specified condition. You must provide content that is of value and beneficial to the end-user and should not use PPC as a redirect. You should refrain from creating PPC ads that either contain the Advertiser's URL or contain Advertiser's trademarks or any other Advertiser's intellectual property or redirect to the Advertiser's website and should not click through to the Advertiser's ad; 1.3. You are not allowed to add URLs that link to the Advertiser's website and post other promo materials on third-party websites without the explicit consent of their owners; 1.4. You are not allowed to use any other advertising materials, except for those that are presented on the Affiliate Network website: Partner's fee: 2.1. Your Partner's fee for Traffic Acquisition is paid for Desired Actions, which mean actual purchases or other actions in relation to Travel services on the Advertiser's website that are made by referrals from your website; 2.2. Your Partner's fee is based on all referrals, who used the URLs that contain your affiliate ID, provided that all the transactions made by a user within the cookie lifetime period starting from their first visit to the Advertiser's website are taken into account; 2.3. Your Partner's fee is calculated as mentioned on the description page of the Advertiser on the Medtravel.me website; 2.4. You will be provided with information about statistics on completed Desired Actions and your income on the dashboard at Medtravel.me. The Partner's fee calculated for the previous month is paid as it's described on Travelpayouts.com by transferring funds to your account according to the payment details specified in your Personal Dashboard.",
  };
  
  export default function DentistryProgramPage() {
    return <ProgramDetail config={CONFIG} />;
  }
  