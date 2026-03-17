"use client"

// Internationalization support for multilingual interface
export type SupportedLanguage = "en" | "es" | "fr" | "de" | "it" | "pt" | "zh" | "ja" | "ar" | "hi"

export interface TranslationKeys {
  // Navigation
  "nav.home": string
  "nav.register": string
  "nav.mobile_app": string
  "nav.dashboard": string
  "nav.officer_portal": string

  // Registration
  "register.title": string
  "register.personal_info": string
  "register.emergency_contacts": string
  "register.generate_id": string
  "register.first_name": string
  "register.last_name": string
  "register.email": string
  "register.phone": string
  "register.nationality": string
  "register.passport": string

  // Mobile App
  "mobile.safety_score": string
  "mobile.current_location": string
  "mobile.emergency_button": string
  "mobile.safe_zones": string
  "mobile.alerts": string

  // Dashboard
  "dashboard.active_tourists": string
  "dashboard.incidents_today": string
  "dashboard.safety_alerts": string
  "dashboard.response_time": string

  // Common
  "common.loading": string
  "common.error": string
  "common.success": string
  "common.cancel": string
  "common.save": string
  "common.emergency": string
}

const translations: Record<SupportedLanguage, TranslationKeys> = {
  en: {
    "nav.home": "Home",
    "nav.register": "Register",
    "nav.mobile_app": "Mobile App",
    "nav.dashboard": "Dashboard",
    "nav.officer_portal": "Officer Portal",
    "register.title": "Tourist Registration",
    "register.personal_info": "Personal Information",
    "register.emergency_contacts": "Emergency Contacts",
    "register.generate_id": "Generate Digital ID",
    "register.first_name": "First Name",
    "register.last_name": "Last Name",
    "register.email": "Email",
    "register.phone": "Phone",
    "register.nationality": "Nationality",
    "register.passport": "Passport Number",
    "mobile.safety_score": "Safety Score",
    "mobile.current_location": "Current Location",
    "mobile.emergency_button": "Emergency",
    "mobile.safe_zones": "Safe Zones",
    "mobile.alerts": "Alerts",
    "dashboard.active_tourists": "Active Tourists",
    "dashboard.incidents_today": "Incidents Today",
    "dashboard.safety_alerts": "Safety Alerts",
    "dashboard.response_time": "Avg Response Time",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.emergency": "Emergency",
  },
  es: {
    "nav.home": "Inicio",
    "nav.register": "Registrarse",
    "nav.mobile_app": "App Móvil",
    "nav.dashboard": "Panel",
    "nav.officer_portal": "Portal de Oficiales",
    "register.title": "Registro de Turista",
    "register.personal_info": "Información Personal",
    "register.emergency_contacts": "Contactos de Emergencia",
    "register.generate_id": "Generar ID Digital",
    "register.first_name": "Nombre",
    "register.last_name": "Apellido",
    "register.email": "Correo",
    "register.phone": "Teléfono",
    "register.nationality": "Nacionalidad",
    "register.passport": "Número de Pasaporte",
    "mobile.safety_score": "Puntuación de Seguridad",
    "mobile.current_location": "Ubicación Actual",
    "mobile.emergency_button": "Emergencia",
    "mobile.safe_zones": "Zonas Seguras",
    "mobile.alerts": "Alertas",
    "dashboard.active_tourists": "Turistas Activos",
    "dashboard.incidents_today": "Incidentes Hoy",
    "dashboard.safety_alerts": "Alertas de Seguridad",
    "dashboard.response_time": "Tiempo de Respuesta Promedio",
    "common.loading": "Cargando...",
    "common.error": "Error",
    "common.success": "Éxito",
    "common.cancel": "Cancelar",
    "common.save": "Guardar",
    "common.emergency": "Emergencia",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.register": "S'inscrire",
    "nav.mobile_app": "App Mobile",
    "nav.dashboard": "Tableau de Bord",
    "nav.officer_portal": "Portail des Officiers",
    "register.title": "Inscription Touriste",
    "register.personal_info": "Informations Personnelles",
    "register.emergency_contacts": "Contacts d'Urgence",
    "register.generate_id": "Générer ID Numérique",
    "register.first_name": "Prénom",
    "register.last_name": "Nom",
    "register.email": "Email",
    "register.phone": "Téléphone",
    "register.nationality": "Nationalité",
    "register.passport": "Numéro de Passeport",
    "mobile.safety_score": "Score de Sécurité",
    "mobile.current_location": "Localisation Actuelle",
    "mobile.emergency_button": "Urgence",
    "mobile.safe_zones": "Zones Sûres",
    "mobile.alerts": "Alertes",
    "dashboard.active_tourists": "Touristes Actifs",
    "dashboard.incidents_today": "Incidents Aujourd'hui",
    "dashboard.safety_alerts": "Alertes de Sécurité",
    "dashboard.response_time": "Temps de Réponse Moyen",
    "common.loading": "Chargement...",
    "common.error": "Erreur",
    "common.success": "Succès",
    "common.cancel": "Annuler",
    "common.save": "Sauvegarder",
    "common.emergency": "Urgence",
  },
  de: {
    "nav.home": "Startseite",
    "nav.register": "Registrieren",
    "nav.mobile_app": "Mobile App",
    "nav.dashboard": "Dashboard",
    "nav.officer_portal": "Beamten-Portal",
    "register.title": "Touristen-Registrierung",
    "register.personal_info": "Persönliche Informationen",
    "register.emergency_contacts": "Notfallkontakte",
    "register.generate_id": "Digitale ID Generieren",
    "register.first_name": "Vorname",
    "register.last_name": "Nachname",
    "register.email": "E-Mail",
    "register.phone": "Telefon",
    "register.nationality": "Nationalität",
    "register.passport": "Passnummer",
    "mobile.safety_score": "Sicherheitsbewertung",
    "mobile.current_location": "Aktueller Standort",
    "mobile.emergency_button": "Notfall",
    "mobile.safe_zones": "Sichere Zonen",
    "mobile.alerts": "Warnungen",
    "dashboard.active_tourists": "Aktive Touristen",
    "dashboard.incidents_today": "Vorfälle Heute",
    "dashboard.safety_alerts": "Sicherheitswarnungen",
    "dashboard.response_time": "Durchschnittliche Reaktionszeit",
    "common.loading": "Laden...",
    "common.error": "Fehler",
    "common.success": "Erfolg",
    "common.cancel": "Abbrechen",
    "common.save": "Speichern",
    "common.emergency": "Notfall",
  },
  it: {
    "nav.home": "Home",
    "nav.register": "Registrati",
    "nav.mobile_app": "App Mobile",
    "nav.dashboard": "Dashboard",
    "nav.officer_portal": "Portale Ufficiali",
    "register.title": "Registrazione Turista",
    "register.personal_info": "Informazioni Personali",
    "register.emergency_contacts": "Contatti di Emergenza",
    "register.generate_id": "Genera ID Digitale",
    "register.first_name": "Nome",
    "register.last_name": "Cognome",
    "register.email": "Email",
    "register.phone": "Telefono",
    "register.nationality": "Nazionalità",
    "register.passport": "Numero Passaporto",
    "mobile.safety_score": "Punteggio Sicurezza",
    "mobile.current_location": "Posizione Attuale",
    "mobile.emergency_button": "Emergenza",
    "mobile.safe_zones": "Zone Sicure",
    "mobile.alerts": "Avvisi",
    "dashboard.active_tourists": "Turisti Attivi",
    "dashboard.incidents_today": "Incidenti Oggi",
    "dashboard.safety_alerts": "Avvisi di Sicurezza",
    "dashboard.response_time": "Tempo di Risposta Medio",
    "common.loading": "Caricamento...",
    "common.error": "Errore",
    "common.success": "Successo",
    "common.cancel": "Annulla",
    "common.save": "Salva",
    "common.emergency": "Emergenza",
  },
  pt: {
    "nav.home": "Início",
    "nav.register": "Registrar",
    "nav.mobile_app": "App Móvel",
    "nav.dashboard": "Painel",
    "nav.officer_portal": "Portal de Oficiais",
    "register.title": "Registro de Turista",
    "register.personal_info": "Informações Pessoais",
    "register.emergency_contacts": "Contatos de Emergência",
    "register.generate_id": "Gerar ID Digital",
    "register.first_name": "Nome",
    "register.last_name": "Sobrenome",
    "register.email": "Email",
    "register.phone": "Telefone",
    "register.nationality": "Nacionalidade",
    "register.passport": "Número do Passaporte",
    "mobile.safety_score": "Pontuação de Segurança",
    "mobile.current_location": "Localização Atual",
    "mobile.emergency_button": "Emergência",
    "mobile.safe_zones": "Zonas Seguras",
    "mobile.alerts": "Alertas",
    "dashboard.active_tourists": "Turistas Ativos",
    "dashboard.incidents_today": "Incidentes Hoje",
    "dashboard.safety_alerts": "Alertas de Segurança",
    "dashboard.response_time": "Tempo de Resposta Médio",
    "common.loading": "Carregando...",
    "common.error": "Erro",
    "common.success": "Sucesso",
    "common.cancel": "Cancelar",
    "common.save": "Salvar",
    "common.emergency": "Emergência",
  },
  zh: {
    "nav.home": "首页",
    "nav.register": "注册",
    "nav.mobile_app": "手机应用",
    "nav.dashboard": "仪表板",
    "nav.officer_portal": "警官门户",
    "register.title": "游客注册",
    "register.personal_info": "个人信息",
    "register.emergency_contacts": "紧急联系人",
    "register.generate_id": "生成数字身份",
    "register.first_name": "名",
    "register.last_name": "姓",
    "register.email": "邮箱",
    "register.phone": "电话",
    "register.nationality": "国籍",
    "register.passport": "护照号码",
    "mobile.safety_score": "安全评分",
    "mobile.current_location": "当前位置",
    "mobile.emergency_button": "紧急情况",
    "mobile.safe_zones": "安全区域",
    "mobile.alerts": "警报",
    "dashboard.active_tourists": "活跃游客",
    "dashboard.incidents_today": "今日事件",
    "dashboard.safety_alerts": "安全警报",
    "dashboard.response_time": "平均响应时间",
    "common.loading": "加载中...",
    "common.error": "错误",
    "common.success": "成功",
    "common.cancel": "取消",
    "common.save": "保存",
    "common.emergency": "紧急情况",
  },
  ja: {
    "nav.home": "ホーム",
    "nav.register": "登録",
    "nav.mobile_app": "モバイルアプリ",
    "nav.dashboard": "ダッシュボード",
    "nav.officer_portal": "警官ポータル",
    "register.title": "観光客登録",
    "register.personal_info": "個人情報",
    "register.emergency_contacts": "緊急連絡先",
    "register.generate_id": "デジタルID生成",
    "register.first_name": "名",
    "register.last_name": "姓",
    "register.email": "メール",
    "register.phone": "電話",
    "register.nationality": "国籍",
    "register.passport": "パスポート番号",
    "mobile.safety_score": "安全スコア",
    "mobile.current_location": "現在地",
    "mobile.emergency_button": "緊急",
    "mobile.safe_zones": "安全ゾーン",
    "mobile.alerts": "アラート",
    "dashboard.active_tourists": "アクティブな観光客",
    "dashboard.incidents_today": "今日の事件",
    "dashboard.safety_alerts": "安全アラート",
    "dashboard.response_time": "平均応答時間",
    "common.loading": "読み込み中...",
    "common.error": "エラー",
    "common.success": "成功",
    "common.cancel": "キャンセル",
    "common.save": "保存",
    "common.emergency": "緊急",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.register": "التسجيل",
    "nav.mobile_app": "التطبيق المحمول",
    "nav.dashboard": "لوحة التحكم",
    "nav.officer_portal": "بوابة الضباط",
    "register.title": "تسجيل السائح",
    "register.personal_info": "المعلومات الشخصية",
    "register.emergency_contacts": "جهات الاتصال الطارئة",
    "register.generate_id": "إنشاء هوية رقمية",
    "register.first_name": "الاسم الأول",
    "register.last_name": "اسم العائلة",
    "register.email": "البريد الإلكتروني",
    "register.phone": "الهاتف",
    "register.nationality": "الجنسية",
    "register.passport": "رقم جواز السفر",
    "mobile.safety_score": "نقاط الأمان",
    "mobile.current_location": "الموقع الحالي",
    "mobile.emergency_button": "طوارئ",
    "mobile.safe_zones": "المناطق الآمنة",
    "mobile.alerts": "التنبيهات",
    "dashboard.active_tourists": "السياح النشطون",
    "dashboard.incidents_today": "الحوادث اليوم",
    "dashboard.safety_alerts": "تنبيهات الأمان",
    "dashboard.response_time": "متوسط وقت الاستجابة",
    "common.loading": "جاري التحميل...",
    "common.error": "خطأ",
    "common.success": "نجح",
    "common.cancel": "إلغاء",
    "common.save": "حفظ",
    "common.emergency": "طوارئ",
  },
  hi: {
    "nav.home": "होम",
    "nav.register": "पंजीकरण",
    "nav.mobile_app": "मोबाइल ऐप",
    "nav.dashboard": "डैशबोर्ड",
    "nav.officer_portal": "अधिकारी पोर्टल",
    "register.title": "पर्यटक पंजीकरण",
    "register.personal_info": "व्यक्तिगत जानकारी",
    "register.emergency_contacts": "आपातकालीन संपर्क",
    "register.generate_id": "डिजिटल आईडी बनाएं",
    "register.first_name": "पहला नाम",
    "register.last_name": "अंतिम नाम",
    "register.email": "ईमेल",
    "register.phone": "फोन",
    "register.nationality": "राष्ट्रीयता",
    "register.passport": "पासपोर्ट नंबर",
    "mobile.safety_score": "सुरक्षा स्कोर",
    "mobile.current_location": "वर्तमान स्थान",
    "mobile.emergency_button": "आपातकाल",
    "mobile.safe_zones": "सुरक्षित क्षेत्र",
    "mobile.alerts": "अलर्ट",
    "dashboard.active_tourists": "सक्रिय पर्यटक",
    "dashboard.incidents_today": "आज की घटनाएं",
    "dashboard.safety_alerts": "सुरक्षा अलर्ट",
    "dashboard.response_time": "औसत प्रतिक्रिया समय",
    "common.loading": "लोड हो रहा है...",
    "common.error": "त्रुटि",
    "common.success": "सफलता",
    "common.cancel": "रद्द करें",
    "common.save": "सेव करें",
    "common.emergency": "आपातकाल",
  },
}

export class I18nManager {
  private currentLanguage: SupportedLanguage = "en"
  private fallbackLanguage: SupportedLanguage = "en"

  setLanguage(language: SupportedLanguage) {
    this.currentLanguage = language
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage
  }

  translate(key: keyof TranslationKeys): string {
    const translation = translations[this.currentLanguage]?.[key]
    if (translation) {
      return translation
    }

    // Fallback to English if translation not found
    return translations[this.fallbackLanguage][key] || key
  }

  getSupportedLanguages(): { code: SupportedLanguage; name: string }[] {
    return [
      { code: "en", name: "English" },
      { code: "es", name: "Español" },
      { code: "fr", name: "Français" },
      { code: "de", name: "Deutsch" },
      { code: "it", name: "Italiano" },
      { code: "pt", name: "Português" },
      { code: "zh", name: "中文" },
      { code: "ja", name: "日本語" },
      { code: "ar", name: "العربية" },
      { code: "hi", name: "हिन्दी" },
    ]
  }
}

export const i18n = new I18nManager()

// React hook for using translations
import { useState } from "react"

export function useTranslation() {
  const [language, setLanguage] = useState<SupportedLanguage>(i18n.getCurrentLanguage())

  const changeLanguage = (newLanguage: SupportedLanguage) => {
    i18n.setLanguage(newLanguage)
    setLanguage(newLanguage)
  }

  const t = (key: keyof TranslationKeys): string => {
    return i18n.translate(key)
  }

  return {
    t,
    language,
    changeLanguage,
    supportedLanguages: i18n.getSupportedLanguages(),
  }
}
