import { createContext, useContext, useEffect, useState } from "react";

const translations = {
  en: {
    All: "All",
    Food: "Food",
    Kitchen: "Kitchen",
    "Vegetables & Fruits": "Vegetables & Fruits",
    Kirana: "Kirana",
    "Non Food": "Non Food",
    Dairy: "Dairy",
    "Baby Care": "Baby Care",
    "Personal Care": "Personal Care",
    "Home Care": "Home Care",
    Home: "Home",
    Search: "Search",
    Categories: "Categories",
    Orders: "Orders",
    Profile: "Profile",
    "See All →": "See All →",
    "All Categories": "All Categories",
    "Top Picks for You": "Top Picks for You",
    "Search Results": "Search Results",
    Products: "Products",
    "Loading products...": "Loading products...",
    "Unable to load products": "Unable to load products",
    Retry: "Retry",
    "No products found": "No products found",
    "Try another product or category.": "Try another product or category.",
    Store: "Store",
    "Back to Stores": "Back to Stores",
    "This time not available": "This time not available",
    ADD: "ADD",
    "View All →": "View All →",
    "Shop Now →": "Shop Now →",
    "MAXIGO SPECIAL": "MAXIGO SPECIAL",
    "Fresh Essentials": "Fresh Essentials",
    "Delivered in": "Delivered in",
    "Minutes!": "Minutes!",
    "Delivery to": "Delivery to",
    Cart: "Cart",
    "Your Cart": "Your Cart",
    "Proceed to Checkout": "Proceed to Checkout",
    "Continue to Payment →": "Continue to Payment →",
    "Place Order": "Place Order",
    Payment: "Payment",
    "My Addresses": "My Addresses",
    "Payment Methods": "Payment Methods",
    "My Wishlist": "My Wishlist",
    "Refer & Earn": "Refer & Earn",
    "MaxiGo Wallet": "MaxiGo Wallet",
    Settings: "Settings",
    Language: "Language",
    "Choose Language": "Choose Language",
    English: "English",
    "हिन्दी": "हिन्दी",
    "मराठी": "मराठी",
    "Edit Profile": "Edit Profile",
    Logout: "Logout",
    "WELCOME TO MAXIGO": "WELCOME TO MAXIGO",
    "Login or register to manage your account.": "Login or register to manage your account.",
    Login: "Login",
    Register: "Register",
  },

  hi: {
    All: "सभी",
    Food: "खाना",
    Kitchen: "किचन",
    "Vegetables & Fruits": "फल और सब्ज़ियाँ",
    Kirana: "किराना",
    "Non Food": "नॉन फूड",
    Dairy: "डेयरी",
    "Baby Care": "बेबी केयर",
    "Personal Care": "पर्सनल केयर",
    "Home Care": "घरेलू सामान",
    Home: "होम",
    Search: "सर्च",
    Categories: "कैटेगरी",
    Orders: "ऑर्डर्स",
    Profile: "प्रोफ़ाइल",
    "See All →": "सभी देखें →",
    "All Categories": "सभी कैटेगरी",
    "Top Picks for You": "आपके लिए खास पसंद",
    "Search Results": "सर्च रिज़ल्ट",
    Products: "प्रोडक्ट्स",
    "Loading products...": "प्रोडक्ट लोड हो रहे हैं...",
    "Unable to load products": "प्रोडक्ट लोड नहीं हो पाए",
    Retry: "फिर से कोशिश करें",
    "No products found": "कोई प्रोडक्ट नहीं मिला",
    "Try another product or category.": "कोई दूसरा प्रोडक्ट या कैटेगरी चुनें।",
    Store: "स्टोर",
    "Back to Stores": "स्टोर्स पर वापस जाएँ",
    "This time not available": "इस समय उपलब्ध नहीं है",
    ADD: "जोड़ें",
    "View All →": "सभी देखें →",
    "Shop Now →": "अभी खरीदें →",
    "MAXIGO SPECIAL": "मैक्सिगो स्पेशल",
    "Fresh Essentials": "ताज़ा ज़रूरी सामान",
    "Delivered in": "डिलीवरी",
    "Minutes!": "कुछ ही मिनटों में!",
    "Delivery to": "डिलीवरी यहाँ",
    Cart: "कार्ट",
    "Your Cart": "आपकी कार्ट",
    "Proceed to Checkout": "चेकआउट के लिए आगे बढ़ें",
    "Continue to Payment →": "पेमेंट के लिए आगे बढ़ें →",
    "Place Order": "ऑर्डर करें",
    Payment: "पेमेंट",
    "My Addresses": "मेरे पते",
    "Payment Methods": "पेमेंट मेथड्स",
    "My Wishlist": "मेरी विशलिस्ट",
    "Refer & Earn": "रेफर करें और कमाएँ",
    "MaxiGo Wallet": "MaxiGo वॉलेट",
    Settings: "सेटिंग्स",
    Language: "भाषा",
    "Choose Language": "भाषा चुनें",
    English: "English",
    "हिन्दी": "हिन्दी",
    "मराठी": "मराठी",
    "Edit Profile": "प्रोफ़ाइल एडिट करें",
    Logout: "लॉगआउट",
    "WELCOME TO MAXIGO": "MAXIGO में आपका स्वागत है",
    "Login or register to manage your account.": "अपना अकाउंट मैनेज करने के लिए लॉगिन या रजिस्टर करें।",
    Login: "लॉगिन",
    Register: "रजिस्टर",
  },

  mr: {
    All: "सर्व",
    Food: "खाद्यपदार्थ",
    Kitchen: "किचन",
    "Vegetables & Fruits": "फळे आणि भाज्या",
    Kirana: "किराणा",
    "Non Food": "नॉन फूड",
    Dairy: "डेअरी",
    "Baby Care": "बेबी केअर",
    "Personal Care": "पर्सनल केअर",
    "Home Care": "घरगुती वस्तू",
    Home: "होम",
    Search: "शोध",
    Categories: "कॅटेगरीज",
    Orders: "ऑर्डर्स",
    Profile: "प्रोफाइल",
    "See All →": "सर्व पहा →",
    "All Categories": "सर्व कॅटेगरीज",
    "Top Picks for You": "तुमच्यासाठी खास निवड",
    "Search Results": "शोध परिणाम",
    Products: "प्रॉडक्ट्स",
    "Loading products...": "प्रॉडक्ट्स लोड होत आहेत...",
    "Unable to load products": "प्रॉडक्ट्स लोड होऊ शकले नाहीत",
    Retry: "पुन्हा प्रयत्न करा",
    "No products found": "कोणताही प्रॉडक्ट सापडला नाही",
    "Try another product or category.": "दुसरा प्रॉडक्ट किंवा कॅटेगरी निवडा.",
    Store: "स्टोअर",
    "Back to Stores": "स्टोअर्सकडे परत जा",
    "This time not available": "या वेळी उपलब्ध नाही",
    ADD: "जोडा",
    "View All →": "सर्व पहा →",
    "Shop Now →": "आत्ता खरेदी करा →",
    "MAXIGO SPECIAL": "MAXIGO स्पेशल",
    "Fresh Essentials": "ताज्या आवश्यक वस्तू",
    "Delivered in": "डिलिव्हरी",
    "Minutes!": "काही मिनिटांत!",
    "Delivery to": "डिलिव्हरी येथे",
    Cart: "कार्ट",
    "Your Cart": "तुमची कार्ट",
    "Proceed to Checkout": "चेकआउटकडे पुढे जा",
    "Continue to Payment →": "पेमेंटकडे पुढे जा →",
    "Place Order": "ऑर्डर करा",
    Payment: "पेमेंट",
    "My Addresses": "माझे पत्ते",
    "Payment Methods": "पेमेंट मेथड्स",
    "My Wishlist": "माझी विशलिस्ट",
    "Refer & Earn": "रेफर करा आणि कमवा",
    "MaxiGo Wallet": "MaxiGo वॉलेट",
    Settings: "सेटिंग्स",
    Language: "भाषा",
    "Choose Language": "भाषा निवडा",
    English: "English",
    "हिन्दी": "हिन्दी",
    "मराठी": "मराठी",
    "Edit Profile": "प्रोफाइल एडिट करा",
    Logout: "लॉगआउट",
    "WELCOME TO MAXIGO": "MAXIGO मध्ये आपले स्वागत आहे",
    "Login or register to manage your account.": "अकाउंट व्यवस्थापित करण्यासाठी लॉगिन किंवा नोंदणी करा.",
    Login: "लॉगिन",
    Register: "नोंदणी",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem("maxigoLanguage");
      return ["en", "hi", "mr"].includes(saved) ? saved : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("maxigoLanguage", language);
    } catch {
      // Ignore localStorage errors.
    }
  }, [language]);

  const changeLanguage = (value) => {
    if (!["en", "hi", "mr"].includes(value)) return;
    setLanguage(value);
  };

  const t = (key) =>
    translations[language]?.[key] ??
    translations.en?.[key] ??
    key;

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
