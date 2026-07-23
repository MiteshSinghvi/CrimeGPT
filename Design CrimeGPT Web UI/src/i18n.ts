import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  English: {
    translation: {
      "Dashboard": "Dashboard",
      "Cases": "Cases",
      "Evidence": "Evidence",
      "Settings": "Settings",
      "System Settings": "System Settings",
      "AI Investigation": "AI Investigation",
      "Documents": "Documents",
      "User Management": "User Management",
      "Agency Details": "Agency Details",
      "Personnel Management": "Personnel Management",
      "Logbook": "Logbook"
    }
  },
  Hindi: {
    translation: {
      "Dashboard": "डैशबोर्ड",
      "Cases": "मामले",
      "Evidence": "सबूत",
      "Settings": "सेटिंग्स",
      "System Settings": "सिस्टम सेटिंग्स",
      "AI Investigation": "एआई अन्वेषण",
      "Documents": "दस्तावेज़",
      "User Management": "उपयोगकर्ता प्रबंधन",
      "Agency Details": "एजेंसी विवरण",
      "Personnel Management": "कार्मिक प्रबंधन",
      "Logbook": "लॉगबुक"
    }
  },
  Gujarati: {
    translation: {
      "Dashboard": "ડેશબોર્ડ",
      "Cases": "કેસો",
      "Evidence": "પુરાવા",
      "Settings": "સેટિંગ્સ",
      "System Settings": "સિસ્ટમ સેટિંગ્સ",
      "AI Investigation": "એઆઈ તપાસ",
      "Documents": "દસ્તાવેજો",
      "User Management": "વપરાશકર્તા સંચાલન",
      "Agency Details": "એજન્સી વિગતો",
      "Personnel Management": "કર્મચારી સંચાલન",
      "Logbook": "લોગબુક"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "English", // fallback language
    fallbackLng: "English",
    interpolation: { escapeValue: false }
  });

export default i18n;
