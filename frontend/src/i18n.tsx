import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Lang =
  | 'en'
  | 'hi'
  | 'mr'
  | 'bn' // Bengali
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'gu' // Gujarati
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'pa' // Punjabi
  | 'or' // Odia
  | 'as' // Assamese

type Dict = Record<string, string>

type Bundle = Record<Lang, Dict>

const dict: Bundle = {
  en: {
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.bookings': 'My Bookings',
    'nav.provider': 'Provider',
    'nav.admin': 'Admin',
    'nav.login': 'Login/Signup',
    'nav.bookNow': 'Book Now',

    'home.title': 'Book trusted local services',
    'home.subtitle': 'From plumbers to deep cleaning — verified pros with transparent pricing.',
    'home.searchPlaceholder': 'Search e.g. leak in kitchen',
    'home.aiPlaceholder': 'Describe your problem for AI',
    'home.searchBtn': 'Search',
    'home.aiBtn': 'AI Recommend',
    'home.aiSuggestions': 'AI Suggestions',
    'home.topProviders': 'Top providers:',

    'pay.title': 'Payment',
    'pay.tab.upi': 'UPI',
    'pay.tab.card': 'Card',
    'pay.tab.cod': 'Cash on Delivery',
    'pay.amountLabel': 'Amount',
    'pay.createOrder': 'Create Order',
    'pay.upiId': 'UPI ID',
    'pay.upiLinkTitle': 'UPI Payment Link',
    'pay.upiTxId': 'Transaction ID',
    'pay.upiOpen': 'Open in UPI app',
    'pay.codTitle': 'Cash will be collected at service time.',
    'pay.codSub': 'Please keep the exact amount ready.',
    'pay.payNow': 'Pay Now',
    'pay.payLater': 'Pay Later',

    'track.title': 'Live Tracking',
    'track.providerLocation': 'Provider location',
    'track.status.onTheWay': 'On the way',
    'track.openMaps': 'Open in Google Maps',
    'track.loading': 'Loading location…',
    'track.chatTitle': 'Chat about this service',
    'track.chatSub': 'Share details or ask questions with your service provider.',
    'track.chatEmpty': 'No messages yet. Start the conversation by describing your problem.',
    'track.chatPlaceholder': 'Describe your issue or send a message…',

    'admin.title': 'Admin Panel',
    'admin.loading': 'Loading analytics…',
    'admin.payOverview': 'Payments Overview',
    'admin.byMethod': 'By Method',
    'admin.export': 'Export CSV',

    'lang.label': 'Language',

    // Static pages
    'about.title': 'About Smart ServiceHub',
    'about.sub': 'India\'s smart home-services partner – fast, safe, and reliable.',
    'about.p1': 'Smart ServiceHub is a modern marketplace to book trusted professionals in your city with just a few taps.',
    'about.li1': 'Verified professionals: KYC, rating and review based screening so you get only trusted experts.',
    'about.li2': 'Smart matching: We suggest the best providers based on your location, timing, and service requirements.',
    'about.li3': 'Clear pricing: See estimated price and duration upfront – no hidden surprises.',
    'about.li4': 'Flexible payments: Pay via UPI, card, or cash on delivery – whatever is convenient for you.',
    'about.li5': 'Live tracking: Track provider status and movement once your booking is confirmed.',
    'about.li6': 'Support in your language: Enjoy a comfortable experience in English and multiple Indian languages.',
    'about.p2': 'Our goal is simple – remove the stress of finding a trusted person for home or office work. You search, compare, and book; Smart ServiceHub handles smart coordination, reminders, and tracking.',
    'about.installTitle': 'Install this app on your phone',
    'about.installP1': 'On Android (Chrome): open Smart ServiceHub, tap the menu and choose "Add to Home screen" to install it like an app. On iOS (Safari): tap the share button and select "Add to Home Screen".',
    'about.shareTitle': 'Share with friends & family',
    'about.shareP1': 'Share the Smart ServiceHub link with your friends and family so they can also book trusted home services quickly from their phone.',

    'contact.title': 'Contact & Support',
    'contact.sub': 'Any doubt or issue? We are here to help you.',
    'contact.supportEmail': 'Email (support)',
    'contact.partnerEmail': 'Partner / Provider queries',
    'contact.phone': 'Phone / WhatsApp',
    'contact.hours': 'Support hours',
    'contact.hoursValue': '9:00 AM – 9:00 PM (IST), all year round (excluding major holidays).',
    'contact.tip': 'For a faster response, please share your booking ID, registered mobile number, and a short problem description.',
    'contact.safety': 'If you ever notice any safety or fraud-related concern, please inform us immediately via email/WhatsApp. Our team reviews such cases on priority.',

    'privacy.title': 'Privacy Policy',
    'privacy.sub': 'Your personal data – handled with care, security and transparency.',
    'privacy.li1': 'Limited data collection: we only collect what is needed for bookings, payments, and support.',
    'privacy.li2': 'No data selling: we do not sell your personal data to third parties.',
    'privacy.li3': 'Secure payments: payment details are processed via secure channels; card/UPI details are not stored in plain text.',
    'privacy.li4': 'Access control: internal access is strictly need-based and important actions are logged.',
    'privacy.li5': 'AI-based safety checks: we may use automated (including AI-based) systems to detect fraud, abuse, or suspicious activity.',
    'privacy.li6': 'Data usage for improvement: aggregated and anonymised data may be used to improve the product, quality monitoring, and analytics.',
    'privacy.p1': 'By using the platform, you agree to our latest Privacy Policy. For any questions about your data, consent, or deletion, you can write to support@smarthub.local.',

    'terms.title': 'Terms & Conditions',
    'terms.li1': 'Platform role: Smart ServiceHub is an aggregator/marketplace that connects you with independent service providers. Actual service delivery is the responsibility of the provider.',
    'terms.li2': 'Bookings: you are responsible for providing accurate address, contact details, and preferred time. Slots may be confirmed or rescheduled based on provider availability.',
    'terms.li3': 'Cancellations & refunds: cancellation charges or refund rules can be service/provider specific. The policy visible in the app will be treated as final.',
    'terms.li4': 'Payments: payments are processed via secure channels. Cash on Delivery (COD) may be available only in select cities/conditions.',
    'terms.li5': 'Safety & behaviour: respectful behaviour is expected from both customers and providers. Abuse, harassment, or unsafe conduct is strictly prohibited.',
    'terms.li6': 'AI & fraud detection: automated systems (including AI models) may be used to detect fraudulent activity, fake bookings, payment misuse, or abnormal patterns. Accounts may be temporarily or permanently restricted in such cases.',
    'terms.li7': 'Liability limitation: despite reasonable care, the platform is not liable for indirect, incidental, or consequential loss unless required by applicable law.',
    'terms.li8': 'Policy updates: terms may be updated from time to time. Continued use of the app will be treated as acceptance of the latest Terms.',
    'terms.p1': 'By using the platform, you agree to follow these Terms & Conditions, our Privacy Policy, and applicable local laws.',
  },
  hi: {
    'nav.home': 'होम',
    'nav.search': 'सर्च',
    'nav.bookings': 'मेरी बुकिंग्स',
    'nav.provider': 'प्रोफेशनल',
    'nav.admin': 'एडमिन',
    'nav.login': 'लॉगिन/साइनअप',
    'nav.bookNow': 'बुक करो',

    'home.title': 'ट्रस्टेड लोकल सर्विस बुक करें',
    'home.subtitle': 'प्लम्बर से डीप क्लीनिंग तक — वेरिफाइड प्रोज़, क्लियर प्राइस के साथ।',
    'home.searchPlaceholder': 'सर्च करें, जैसे किचन में लीकेज',
    'home.aiPlaceholder': 'अपनी प्रॉब्लम AI को लिखें',
    'home.searchBtn': 'सर्च',
    'home.aiBtn': 'AI से सुझाव',
    'home.aiSuggestions': 'AI सुझाव',
    'home.topProviders': 'टॉप प्रोवाइडर्स:',

    'pay.title': 'पेमेंट',
    'pay.tab.upi': 'यूपीआई',
    'pay.tab.card': 'कार्ड',
    'pay.tab.cod': 'कैश ऑन डिलीवरी',
    'pay.amountLabel': 'राशि',
    'pay.createOrder': 'ऑर्डर बनाएं',
    'pay.upiId': 'यूपीआई आईडी',
    'pay.upiLinkTitle': 'यूपीआई पेमेंट लिंक',
    'pay.upiTxId': 'ट्रांज़ैक्शन आईडी',
    'pay.upiOpen': 'यूपीआई ऐप में खोलें',
    'pay.codTitle': 'कैश सर्विस के समय लिया जाएगा।',
    'pay.codSub': 'कृपया पूरा पैसा तैयार रखें।',
    'pay.payNow': 'अभी पेमेंट करें',
    'pay.payLater': 'बाद में पेमेंट',

    'track.title': 'लाइव ट्रैकिंग',
    'track.providerLocation': 'प्रोवाइडर लोकेशन',
    'track.status.onTheWay': 'रास्ते में',
    'track.openMaps': 'गूगल मैप्स में खोलें',
    'track.loading': 'लोकेशन लोड हो रही है…',
    'track.chatTitle': 'इस सर्विस के बारे में चैट करें',
    'track.chatSub': 'अपनी प्रॉब्लम डिटेल में लिखें या सर्विस प्रोवाइडर से सवाल पूछें।',
    'track.chatEmpty': 'अभी तक कोई मैसेज नहीं है। शुरू करने के लिए अपनी प्रॉब्लम लिखें।',
    'track.chatPlaceholder': 'अपनी समस्या लिखें या मैसेज भेजें…',

    'admin.title': 'एडमिन पैनल',
    'admin.loading': 'एनालिटिक्स लोड हो रहे हैं…',
    'admin.payOverview': 'पेमेंट ओवरव्यू',
    'admin.byMethod': 'मोड के हिसाब से',
    'admin.export': 'CSV एक्सपोर्ट',

    'lang.label': 'भाषा',

    // Static pages
    'about.title': 'About Smart ServiceHub',
    'about.sub': 'India ka smart home-services partner – fast, safe, aur reliable.',
    'about.p1': 'Smart ServiceHub ek modern marketplace hai jahan aap apne sheher ke trusted professionals ko few taps me book kar sakte ho.',
    'about.li1': 'Verified professionals: KYC, rating & review based screening, taaki aapko milen sirf trusted experts.',
    'about.li2': 'Smart matching: Aapke location, timing aur service requirement ke hisaab se best providers suggest kiye jate hain.',
    'about.li3': 'Clear pricing: Pehle se hi estimated price & duration dikhta hai, hidden surprises nahi.',
    'about.li4': 'Flexible payments: UPI, card, ya COD – jo aapko convenient lage.',
    'about.li5': 'Live tracking: Booking confirm hone ke baad aap provider ka status & movement track kar sakte ho.',
    'about.li6': 'Support in your language: English + multiple Indian languages ke saath comfortable experience.',
    'about.p2': 'Hamara goal simple hai – ghar ya office ke kaam ke liye trusted banda dhoondhne ka tension khatam karna. Aap search, compare, book karo – baaki smart coordination, reminders aur tracking Smart ServiceHub sambhalta hai.',
    'about.installTitle': 'Is app ko install kaise karein',
    'about.installP1': 'Android (Chrome) par Smart ServiceHub kholkar menu me "Add to Home screen" choose karein. iOS (Safari) par share button tap karke "Add to Home Screen" select karein, app jaise icon ban jayega.',
    'about.shareTitle': 'Doston aur family ke saath share karein',
    'about.shareP1': 'Smart ServiceHub ka link apne doston, family aur neighbours ke saath share karein taaki woh bhi trusted home services easily book kar saken.',

    'contact.title': 'Contact & Support',
    'contact.sub': 'Koi doubt ya issue? Hum yahi hain to help you.',
    'contact.supportEmail': 'Email (support)',
    'contact.partnerEmail': 'Partner / Provider queries',
    'contact.phone': 'Phone / WhatsApp',
    'contact.hours': 'Support hours',
    'contact.hoursValue': '9:00 AM – 9:00 PM (IST), saal bhar (major holidays chhod kar).',
    'contact.tip': 'Fast response ke liye apni booking ID, registered mobile number aur short problem description saath me bhejein.',
    'contact.safety': 'Agar aapko kabhi safety ya fraud related koi concern lage, turant hume mail/WhatsApp par batayein. Hamari team priority basis par us case ko review karti hai.',

    'privacy.title': 'Privacy Policy',
    'privacy.sub': 'Your personal data – handled with care, security & transparency.',
    'privacy.li1': 'Limited data collection: Hum sirf utna data lete hain jitna booking, payments aur support ke liye zaroori hai.',
    'privacy.li2': 'No data selling: Hum aapka personal data kisi third-party ko bechte nahi hain.',
    'privacy.li3': 'Secure payments: Payment details secure channels se process hote hain; card/UPI details platform par plain text me store nahi kiye jate.',
    'privacy.li4': 'Access control: Internal access strictly need-based hota hai, aur important actions ke logs maintain kiye jate hain.',
    'privacy.li5': 'AI-based safety checks: Fraud, abuse ya suspicious activity detect karne ke liye hum automated (including AI-based) systems use kar sakte hain.',
    'privacy.li6': 'Data usage for improvement: Aggregated & anonymized data ko hum product ko better banane, quality monitoring aur analytics ke liye use kar sakte hain.',
    'privacy.p1': 'Platform use karte waqt aap hamari latest Privacy Policy se agree karte hain. Agar aapko kabhi apne data, consent ya deletion ke baare me koi question ho, to support@smarthub.local par hume likh sakte hain.',

    'terms.title': 'Terms & Conditions',
    'terms.li1': 'Platform role: Smart ServiceHub ek aggregator/marketplace hai jo aapko independent service providers se connect karta hai. Actual service delivery provider ke responsibility me aata hai.',
    'terms.li2': 'Bookings: Aap accurate address, contact details aur preferred timing provide karne ke zimmedar hain. Provider availability ke hisaab se slots confirm ya reschedule ho sakte hain.',
    'terms.li3': 'Cancellations & refunds: Cancellation charges ya refund rules service/provider specific ho sakte hain. App me visible policy hi final maani jayegi.',
    'terms.li4': 'Payments: Payments secure channels se process hote hain. COD (Cash on Delivery) limited cities/conditions me hi available ho sakta hai.',
    'terms.li5': 'Safety & behavior: Dono taraf (customer & provider) se respectful behavior expected hai. Abuse, harassment ya unsafe conduct strictly prohibited hai.',
    'terms.li6': 'AI & fraud detection: Fraudulent activity, fake bookings, payment misuse ya abnormal patterns detect karne ke liye automated systems (including AI models) use kiye ja sakte hain. Such cases me account ko temporarily ya permanently restrict kiya ja sakta hai.',
    'terms.li7': 'Liability limitation: Reasonable care ke bawajood, platform kisi indirect, incidental ya consequential loss ke liye liable nahi hoga, jab tak law specifically require na kare.',
    'terms.li8': 'Policy updates: Terms time‑to‑time update ho sakte hain. App ka continued use latest Terms ki acceptance maana jayega.',
    'terms.p1': 'Platform use karke aap in Terms & Conditions, Privacy Policy aur applicable local laws ko follow karne se agree karte hain.',
  },
  mr: {
    'nav.home': 'होम',
    'nav.search': 'शोध',
    'nav.bookings': 'माझी बुकिंग्स',
    'nav.provider': 'व्यावसायिक',
    'nav.admin': 'अॅडमिन',
    'nav.login': 'लॉगिन/साइनअप',
    'nav.bookNow': 'बुक करा',

    'home.title': 'विश्वसनीय स्थानिक सेवा बुक करा',
    'home.subtitle': 'प्लंबर पासून डीप क्लीनिंगपर्यंत — प्रमाणित प्रोफेशनल्स, पारदर्शक किमतींसह.',
    'home.searchPlaceholder': 'शोधा, उदा. किचन मध्ये लीक',
    'home.aiPlaceholder': 'तुमची समस्या AI ला लिहा',
    'home.searchBtn': 'शोधा',
    'home.aiBtn': 'AI शिफारस',
    'home.aiSuggestions': 'AI सूचना',
    'home.topProviders': 'शीर्ष प्रोव्हायडर्स:',

    'pay.title': 'पेमेंट',
    'pay.tab.upi': 'UPI',
    'pay.tab.card': 'कार्ड',
    'pay.tab.cod': 'कॅश ऑन डिलिव्हरी',
    'pay.amountLabel': 'रक्कम',
    'pay.createOrder': 'ऑर्डर तयार करा',
    'pay.upiId': 'UPI आयडी',
    'pay.upiLinkTitle': 'UPI पेमेंट लिंक',
    'pay.upiTxId': 'ट्रान्झॅक्शन आयडी',
    'pay.upiOpen': 'UPI अॅप मध्ये उघडा',
    'pay.codTitle': 'कॅश सेवा वेळेस घेतली जाईल.',
    'pay.codSub': 'कृपया अचूक रक्कम तयार ठेवा.',
    'pay.payNow': 'आत्ताच पेमेंट करा',
    'pay.payLater': 'नंतर पेमेंट',

    'track.title': 'लाइव्ह ट्रॅकिंग',
    'track.providerLocation': 'प्रोव्हायडर लोकेशन',
    'track.status.onTheWay': 'येता आहे',
    'track.openMaps': 'Google Maps मध्ये उघडा',
    'track.loading': 'लोकेशन लोड होत आहे…',

    'admin.title': 'अॅडमिन पॅनल',
    'admin.loading': 'अनॅलिटिक्स लोड होत आहेत…',
    'admin.payOverview': 'पेमेंट ओव्हरव्ह्यू',
    'admin.byMethod': 'मेथड नुसार',
    'admin.export': 'CSV एक्सपोर्ट',

    'lang.label': 'भाषा',
  },
  // Additional Indian languages: partial copies, fall back to English for missing keys.
  bn: {
    'about.title': 'Smart ServiceHub সম্বন্ধে',
    'about.sub': 'ভারতের স্মার্ট হোম-সার্ভিস পার্টনার – ফাস্ট, সেফ, আর রিলায়েবল।',
    'about.p1': 'Smart ServiceHub একটি আধুনিক মার্কেটপ্লেস যেখানে আপনি শহরের বিশ্বাসযোগ্য পেশাদারদের কিছু ট্যাপে বুক করতে পারেন।',
    'about.p2': 'আমাদের লক্ষ্য সহজ – বাড়ি বা অফিসের কাজের জন্য ট্রাস্টেড লোক খুঁজে পাওয়ার ঝামেলা কমানো।',
    'about.installTitle': 'এই অ্যাপ ফোনে কীভাবে ইনস্টল করবেন',
    'about.installP1': 'Android (Chrome)-এ Smart ServiceHub খুলে মেনু থেকে "Add to Home screen" বেছে নিন। iOS (Safari)-এ share বাটন ট্যাপ করে "Add to Home Screen" সিলেক্ট করুন।',
    'about.shareTitle': 'বন্ধু ও পরিবারের সাথে শেয়ার করুন',
    'about.shareP1': 'Smart ServiceHub-এর লিংক বন্ধু, family এবং neighbours-দের পাঠান যাতে তারাও ইজি ভাবে সার্ভিস বুক করতে পারে।',
  },
  ta: {
    'about.title': 'Smart ServiceHub பற்றி',
    'about.sub': 'இந்தியாவின் smart home-services partner – வேகமாகவும் பாதுகாப்பாகவும்.',
    'about.p1': 'Smart ServiceHub மூலம் உங்கள் நகரத்தில் உள்ள நம்பகமான சேவை நிபுணர்களை சில taps-ல் book செய்யலாம்.',
    'about.p2': 'வீடு / ஆபீஸ் வேலைகளுக்காக நம்பத்தகுந்த பேரை தேடுவதில் வரும் stress-ஐ குறைப்பதே எங்கள் நோக்கம்.',
    'about.installTitle': 'இந்த app-ஐ உங்கள் போனில் install செய்வது எப்படி',
    'about.installP1': 'Android (Chrome)ல் Smart ServiceHub open செய்து menu-ல் "Add to Home screen" தெரிவுசெய்யவும். iOS (Safari)ல் share button-ஐ தட்டி "Add to Home Screen" தேர்வு செய்யவும்.',
    'about.shareTitle': 'நண்பர்கள் மற்றும் குடும்பத்துடன் share செய்யவும்',
    'about.shareP1': 'Smart ServiceHub link-ஐ உங்கள் நண்பர்கள், குடும்பம் மற்றும் அயலார்களுடன் பகிர்ந்து கொள்ளுங்கள், அவர்களும் எளிதாக சேவைகளை book செய்யலாம்.',
  },
  te: {
    'about.title': 'Smart ServiceHub గురించి',
    'about.sub': 'ఇండియా smart home-services భాగస్వామి – ఫాస్ట్, సేఫ్, రిల్లయబుల్.',
    'about.p1': 'Smart ServiceHub ద్వారా మీ నగరంలో ఉన్న విశ్వసనీయ ప్రొఫెషనల్స్‌ను కొన్ని taps‌తోనే book చేయొచ్చు.',
    'about.p2': 'ఇంటి లేదా ఆఫీస్ పనుల కోసం trusted వ్యక్తిని వెతకడం లో వచ్చే టెన్షన్ తగ్గించడం మా లక్ష్యం.',
    'about.installTitle': 'ఈ app‌ని ఫోన్‌లో ఎలా install చేయాలి',
    'about.installP1': 'Android (Chrome) లో Smart ServiceHub open చేసి menu నుండి "Add to Home screen" ఎంచుకోండి. iOS (Safari) లో share బటన్‌పై నొక్కి "Add to Home Screen" సెలెక్ట్ చేయండి.',
    'about.shareTitle': 'స్నేహితులు మరియు కుటుంబంతో share చేయండి',
    'about.shareP1': 'Smart ServiceHub link ను మీ friends, family మరియు neighbours తో share చేయండి, వాళ్లు కూడా easyగా సేవలు book చేసుకోవచ్చు.',
  },
  gu: {},
  kn: {},
  ml: {},
  pa: {},
  or: {},
  as: {},
}

interface I18nCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nCtx | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const t = (key: string) => dict[lang][key] || dict.en[key] || key
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
