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
    "nav.map": "Map",
    
    // Landing Page
    "landing.hero.title": "Umuganda Made Smart",
    "landing.hero.subtitle": "Report community problems, vote on priorities, track projects, and build a better Rwanda together.",
    "landing.hero.getStarted": "Get Started",
    "landing.hero.viewReports": "View Reports",
    "landing.features.title": "How It Works",
    "landing.features.subtitle": "Empowering communities to identify, prioritize, and solve problems together.",
    "landing.features.report.title": "Report Issues",
    "landing.features.report.desc": "Snap a photo of community problems - roads, trash, water leaks - and submit instantly with location data.",
    "landing.features.vote.title": "Vote & Prioritize",
    "landing.features.vote.desc": "Community votes determine which issues get tackled first. Most voted problems become official projects.",
    "landing.features.join.title": "Join Projects",
    "landing.features.join.desc": "Volunteer for Umuganda projects, track attendance with QR codes, and see real progress with before/after photos.",
    "landing.features.track.title": "Track Location",
    "landing.features.track.desc": "Every report includes precise GPS coordinates, making it easy for authorities to locate and address issues.",
    "landing.features.collaborate.title": "Collaborate",
    "landing.features.collaborate.desc": "Comment on reports, suggest solutions, and stay updated on project progress in your community.",
    "landing.features.rewards.title": "Earn Rewards",
    "landing.features.rewards.desc": "Gain points and badges for reporting issues, volunteering, and helping build a better community.",
    "landing.cta.title": "Ready to Make a Difference?",
    "landing.cta.subtitle": "Join thousands of Rwandans working together to improve their communities through smart, coordinated action.",
    "landing.cta.button": "Join Umuganda+ Today",
    "landing.footer": "© 2025 Umuganda+. Building better communities together.",
    
    // Auth
    "auth.welcome": "Welcome to Umuganda+",
    "auth.subtitle": "Join the community making Rwanda better",
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.fullName": "Full Name",
    "auth.signInButton": "Sign In",
    "auth.signingIn": "Signing in...",
    "auth.createAccount": "Create Account",
    "auth.creatingAccount": "Creating account...",
    "auth.signInFailed": "Sign in failed",
    "auth.signUpFailed": "Sign up failed",
    "auth.accountCreated": "Account created!",
    "auth.canSignIn": "You can now sign in with your credentials.",
    
    // Dashboard
    "dashboard.title": "Community Reports",
    "dashboard.subtitle": "Vote on issues to help prioritize community action",
    "dashboard.reportedBy": "Reported by",
    "dashboard.anonymous": "Anonymous",
    "dashboard.location": "Location not specified",
    "dashboard.noReports": "No reports yet",
    "dashboard.noReportsDesc": "Be the first to report a community issue!",
    "dashboard.submitFirst": "Submit Your First Report",
    "dashboard.errorLoading": "Error loading reports",
    "dashboard.errorVoting": "Error voting",
    "dashboard.errorRemoving": "Error removing vote",
    
    // Submit Report
    "report.title": "Report a Problem",
    "report.subtitle": "Help us identify and fix issues in our community",
    "report.issueTitle": "Issue Title*",
    "report.issueTitlePlaceholder": "E.g., Pothole on Main Street",
    "report.description": "Description*",
    "report.descriptionPlaceholder": "Describe the problem in detail...",
    "report.analyzeAI": "🤖 Analyze with AI",
    "report.analyzing": "Analyzing with AI...",
    "report.aiSuggestions": "AI Suggestions:",
    "report.problemType": "Problem Type*",
    "report.selectType": "Select type",
    "report.roads": "Roads",
    "report.trash": "Trash/Waste",
    "report.water": "Water",
    "report.electricity": "Electricity",
    "report.school": "School",
    "report.health": "Health",
    "report.other": "Other",
    "report.severity": "Severity*",
    "report.low": "Low",
    "report.medium": "Medium",
    "report.high": "High",
    "report.critical": "Critical",
    "report.location": "Location",
    "report.locationPlaceholder": "E.g., Kigali, Gasabo District, Remera Sector",
    "report.photos": "Photos (up to 5)",
    "report.uploadPhotos": "Click to upload photos",
    "report.photosSelected": "photo(s) selected",
    "report.submit": "Submit Report",
    "report.submitting": "Submitting...",
    "report.authRequired": "Authentication required",
    "report.signInPrompt": "Please sign in to submit a report",
    "report.submitted": "Report submitted!",
    "report.thankYou": "Thank you for helping improve our community.",
    "report.errorSubmitting": "Error submitting report",
    "report.aiAnalysisComplete": "AI Analysis Complete",
    "report.aiAnalysisDesc": "Problem details have been auto-filled based on AI analysis",
    "report.aiAnalysisFailed": "AI Analysis Failed",
    "report.aiAnalysisError": "Could not analyze the problem",
    
    // Profile
    "profile.user": "User",
    "profile.locationNotSet": "Location not set",
    "profile.citizen": "citizen",
    "profile.points": "Points",
    "profile.reportsSubmitted": "Reports Submitted",
    "profile.votesCast": "Votes Cast",
    "profile.badgesEarned": "Badges Earned",
    "profile.achievements": "Achievements",
    "profile.noBadges": "No badges earned yet. Keep participating to earn achievements!",
    "profile.errorLoading": "Error loading profile",
    
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
    
    // Map
    "map.title": "Community Map",
    "map.subtitle": "View all reported issues and active projects on the map",
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
    "nav.map": "Ikarita",
    
    // Landing Page
    "landing.hero.title": "Umuganda Yateye Imbere",
    "landing.hero.subtitle": "Tanga ibibazo by'abaturage, tora ibikomeye, gukurikirana imishinga, kandi twubake u Rwanda rwiza hamwe.",
    "landing.hero.getStarted": "Tangira",
    "landing.hero.viewReports": "Reba Raporo",
    "landing.features.title": "Uburyo Bikora",
    "landing.features.subtitle": "Guha abaturage ububasha bwo kumenya, gushyira imbere, no gukemura ibibazo hamwe.",
    "landing.features.report.title": "Tanga Ibibazo",
    "landing.features.report.desc": "Fata ifoto y'ibibazo by'abaturage - imihanda, imyanda, amazi yataye - kandi utange ako kanya hamwe n'amakuru y'aho ari.",
    "landing.features.vote.title": "Tora & Shyira Imbere",
    "landing.features.vote.desc": "Amatora y'abaturage agena ibibazo bigomba gukemurwa mbere. Ibibazo byatoweho cyane biba imishinga yemewe.",
    "landing.features.join.title": "Jya ku Mishinga",
    "landing.features.join.desc": "Koramu imishinga ya Umuganda, gukurikirana kwitabira ukoresheje QR code, kandi urebe iterambere nyirizina hamwe n'amafoto mbere na nyuma.",
    "landing.features.track.title": "Gukurikirana Ahantu",
    "landing.features.track.desc": "Buri raporo irimo GPS coordinates zikosora, bikoroshya abayobozi kubona no gukemura ibibazo.",
    "landing.features.collaborate.title": "Gukorana",
    "landing.features.collaborate.desc": "Tanga igitekerezo kuri raporo, usabe ibisubizo, kandi ukurikire iterambere ry'umushinga mu muryango wawe.",
    "landing.features.rewards.title": "Injira Ibihembo",
    "landing.features.rewards.desc": "Injiza amanota n'ibihembo byo gutanga raporo, kwiyemeza, no gufasha kubaka umuryango mwiza.",
    "landing.cta.title": "Witeguye Guhindura Ibintu?",
    "landing.cta.subtitle": "Jya ku bihumbi by'abanyarwanda bakorana kugira ngo batezimbere imiryango yabo binyuze mu bikorwa byubwenge kandi bihuriweho.",
    "landing.cta.button": "Jya muri Umuganda+ Uyu Munsi",
    "landing.footer": "© 2025 Umuganda+. Twubaka imiryango myiza hamwe.",
    
    // Auth
    "auth.welcome": "Murakaza neza kuri Umuganda+",
    "auth.subtitle": "Jya ku muryango ubaka u Rwanda rwiza",
    "auth.signIn": "Kwinjira",
    "auth.signUp": "Iyandikishe",
    "auth.email": "Imeri",
    "auth.password": "Ijambo Ryibanga",
    "auth.fullName": "Amazina Yuzuye",
    "auth.signInButton": "Kwinjira",
    "auth.signingIn": "Kwinjira...",
    "auth.createAccount": "Kora Konti",
    "auth.creatingAccount": "Kurema konti...",
    "auth.signInFailed": "Kwinjira byanze",
    "auth.signUpFailed": "Kwiyandikisha byanze",
    "auth.accountCreated": "Konti yaremye!",
    "auth.canSignIn": "Ubu ushobora kwinjira ukoresheje ibyangombwa byawe.",
    
    // Dashboard
    "dashboard.title": "Raporo z'Abaturage",
    "dashboard.subtitle": "Tora ku bibazo kugira ngo ufashe gushyira imbere ibikorwa by'abaturage",
    "dashboard.reportedBy": "Yatanzwe na",
    "dashboard.anonymous": "Utamenyekana",
    "dashboard.location": "Ahantu ntihasobanuwe",
    "dashboard.noReports": "Nta raporo zihari",
    "dashboard.noReportsDesc": "Banza utange ikibazo cy'abaturage!",
    "dashboard.submitFirst": "Tanga Raporo Yawe ya Mbere",
    "dashboard.errorLoading": "Ikosa mu gufungura raporo",
    "dashboard.errorVoting": "Ikosa mu gutora",
    "dashboard.errorRemoving": "Ikosa mu gukuraho amajwi",
    
    // Submit Report
    "report.title": "Tanga Ikibazo",
    "report.subtitle": "Dufashe kumenya no gukosora ibibazo mu muryango wacu",
    "report.issueTitle": "Umutwe w'Ikibazo*",
    "report.issueTitlePlaceholder": "Urugero: Umwobo mu Muhanda Mukuru",
    "report.description": "Ibisobanuro*",
    "report.descriptionPlaceholder": "Sobanura ikibazo mu buryo burambuye...",
    "report.analyzeAI": "🤖 Sekuruza hamwe na AI",
    "report.analyzing": "Gusesengura hamwe na AI...",
    "report.aiSuggestions": "Ibyifuzo bya AI:",
    "report.problemType": "Ubwoko bw'Ikibazo*",
    "report.selectType": "Hitamo ubwoko",
    "report.roads": "Imihanda",
    "report.trash": "Imyanda",
    "report.water": "Amazi",
    "report.electricity": "Amashanyarazi",
    "report.school": "Ishuri",
    "report.health": "Ubuzima",
    "report.other": "Ibindi",
    "report.severity": "Ukuze*",
    "report.low": "Bike",
    "report.medium": "Hagati",
    "report.high": "Byinshi",
    "report.critical": "Bikomeye",
    "report.location": "Ahantu",
    "report.locationPlaceholder": "Urugero: Kigali, Akarere ka Gasabo, Umurenge wa Remera",
    "report.photos": "Amafoto (kugeza 5)",
    "report.uploadPhotos": "Kanda kugira ngo uhuze amafoto",
    "report.photosSelected": "amafoto yahisemo",
    "report.submit": "Tanga Raporo",
    "report.submitting": "Gutanga...",
    "report.authRequired": "Kwemeza birasabwa",
    "report.signInPrompt": "Nyamuneka injira kugira ngo utange raporo",
    "report.submitted": "Raporo yatanzwe!",
    "report.thankYou": "Murakoze kuba mufasha gutezimbere umuryango wacu.",
    "report.errorSubmitting": "Ikosa mu gutanga raporo",
    "report.aiAnalysisComplete": "Isesengura rya AI ryarangiye",
    "report.aiAnalysisDesc": "Ibisobanuro by'ikibazo byuzujwe binyuze mu isesengura rya AI",
    "report.aiAnalysisFailed": "Isesengura rya AI Ryanze",
    "report.aiAnalysisError": "Ntibishoboye gusesengura ikibazo",
    
    // Profile
    "profile.user": "Umukoresha",
    "profile.locationNotSet": "Ahantu ntihashyizweho",
    "profile.citizen": "umuturage",
    "profile.points": "Amanota",
    "profile.reportsSubmitted": "Raporo Zatanzwe",
    "profile.votesCast": "Amatora Yatanzwe",
    "profile.badgesEarned": "Ibihembo Byinjijwe",
    "profile.achievements": "Ibyagezweho",
    "profile.noBadges": "Nta bihembo byinjijwe. Komeza kwitabira kugira ngo ubone ibyagezweho!",
    "profile.errorLoading": "Ikosa mu gufungura umwirondoro",
    
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
    
    // Map
    "map.title": "Ikarita y'Abaturage",
    "map.subtitle": "Reba ibibazo byose byatanzwe n'imishinga ikoranirwa kuri ikarita",
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
