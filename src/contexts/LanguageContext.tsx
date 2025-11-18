import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "rw";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navbar
    "nav.dashboard": "Dashboard",
    "nav.projects": "Projects",
    "nav.donate": "Donate",
    "nav.reportIssue": "Report Issue",
    "nav.profile": "Profile",
    "nav.signOut": "Sign Out",
    "nav.signIn": "Sign In",
    "nav.getStarted": "Get Started",
    "nav.reports": "Reports",
    "nav.admin": "Admin",
    "nav.ledger": "Donation Ledger",
    
    // Donations
    "donations.title": "Support Community Projects",
    "donations.description": "Your donation helps fund materials, tools, and resources for Umuganda projects across Rwanda.",
    "donations.supporter": "Supporter",
    "donations.contributor": "Contributor",
    "donations.champion": "Champion",
    "donations.hero": "Hero",
    "donations.customAmount": "Custom Amount",
    "donations.donateNow": "Donate Now",
    "donations.currency": "Currency",
    "donations.paymentMethod": "Payment Method",
    "donations.creditCard": "Credit Card (Stripe)",
    "donations.mtnMoney": "MTN Mobile Money",
    "donations.airtelMoney": "Airtel Money",
    "donations.yourImpact": "Your Impact",
    "donations.materials": "Materials",
    "donations.community": "Community",
    "donations.transparency": "Transparency",
    
    // Projects
    "projects.title": "Community Projects",
    "projects.description": "Active Umuganda projects making a difference in our communities",
    "projects.volunteers": "Volunteers",
    "projects.checkIn": "Check In",
    "projects.checkOut": "Check Out",
    "projects.viewQR": "View QR Code",
    "projects.scanToCheckIn": "Scan to Check In",
    
    // Admin
    "admin.title": "Admin Dashboard",
    "admin.pendingReports": "Pending Reports",
    "admin.approve": "Approve",
    "admin.reject": "Reject",
    "admin.volunteers": "Volunteers",
    "admin.analytics": "Analytics",
    "admin.exportCSV": "Export CSV",
    "admin.exportPDF": "Export PDF",
    
    // Ledger
    "ledger.title": "Donation Ledger",
    "ledger.description": "Public record of all donations with full transparency",
    "ledger.donor": "Donor",
    "ledger.amount": "Amount",
    "ledger.date": "Date",
    "ledger.method": "Method",
  },
  rw: {
    // Navbar
    "nav.dashboard": "Ikibaho",
    "nav.projects": "Imishinga",
    "nav.donate": "Tanga",
    "nav.reportIssue": "Tanga Ikibazo",
    "nav.profile": "Umwirondoro",
    "nav.signOut": "Gusohoka",
    "nav.signIn": "Kwinjira",
    "nav.getStarted": "Tangira",
    "nav.reports": "Raporo",
    "nav.admin": "Ubuyobozi",
    "nav.ledger": "Ibitabo by'Impano",
    
    // Donations
    "donations.title": "Fasha Imishinga y'Abaturage",
    "donations.description": "Impano yawe ifasha kugura ibikoresho n'ibindi bikenewe mu mishinga ya Umuganda mu Rwanda.",
    "donations.supporter": "Umufasha",
    "donations.contributor": "Umuterankunga",
    "donations.champion": "Intsinzi",
    "donations.hero": "Intwari",
    "donations.customAmount": "Amafaranga Yahisemo",
    "donations.donateNow": "Tanga Ubu",
    "donations.currency": "Ifaranga",
    "donations.paymentMethod": "Uburyo bwo Kwishyura",
    "donations.creditCard": "Ikarita y'Inguzanyo (Stripe)",
    "donations.mtnMoney": "MTN Mobile Money",
    "donations.airtelMoney": "Airtel Money",
    "donations.yourImpact": "Uruhare Rwawe",
    "donations.materials": "Ibikoresho",
    "donations.community": "Abaturage",
    "donations.transparency": "Gukorera mu Mucyo",
    
    // Projects
    "projects.title": "Imishinga y'Abaturage",
    "projects.description": "Imishinga ya Umuganda ikora impinduka mu miryango yacu",
    "projects.volunteers": "Abakorerabushake",
    "projects.checkIn": "Emeza ko Uhari",
    "projects.checkOut": "Emeza ko Ugiye",
    "projects.viewQR": "Reba QR Code",
    "projects.scanToCheckIn": "Sika kugira ngo wemeze ko uhari",
    
    // Admin
    "admin.title": "Ikibaho cy'Ubuyobozi",
    "admin.pendingReports": "Raporo Zitegereje",
    "admin.approve": "Emeza",
    "admin.reject": "Anga",
    "admin.volunteers": "Abakorerabushake",
    "admin.analytics": "Imibare",
    "admin.exportCSV": "Kuramo CSV",
    "admin.exportPDF": "Kuramo PDF",
    
    // Ledger
    "ledger.title": "Ibitabo by'Impano",
    "ledger.description": "Inyandiko rusange y'impano zose mu mucyo",
    "ledger.donor": "Uwatanze",
    "ledger.amount": "Amafaranga",
    "ledger.date": "Itariki",
    "ledger.method": "Uburyo",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "rw" ? "rw" : "en") as Language;
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
