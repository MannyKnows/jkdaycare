// Tiny bilingual (EN/ES) dictionary for the parent portal. Every parent-facing
// string lives here so the portal renders in each family's chosen language
// (users.language). Keep keys in sync across both maps.

export type Lang = "en" | "es";

export function normLang(lang: string | null | undefined): Lang {
	return lang === "es" ? "es" : "en";
}

type Dict = Record<string, string>;

const EN: Dict = {
	parentLogin: "Parent login",
	email: "Email",
	password: "Password",
	login: "Log in",
	logout: "Log out",
	loginError: "Wrong email or password.",

	setup: "Set up your account",
	setupFor: "Set up your account for",
	yourName: "Your name",
	createPassword: "Create a password (8+ characters)",
	createAccount: "Create account",
	inviteInvalid: "This invite link is invalid or has already been used.",
	accountExists: "You already have an account — please log in.",
	passwordShort: "Please choose a password of at least 8 characters.",

	welcome: "Welcome",
	today: "Today",
	attendance: "Attendance",
	notInYet: "Not checked in yet",
	hereNow: "Here now since",
	doneForDay: "Picked up",
	inAt: "Arrived",
	outAt: "Left",
	dailyReport: "Today's report",
	photos: "Today's photos",
	nothingToday: "Nothing logged yet today. Check back later!",
	announcements: "Announcements",
	noAnnouncements: "No announcements right now.",
	noChildren: "No children are linked to your account yet. Please contact us.",
	language: "Language",

	tuition: "Tuition",
	balanceDue: "Balance due",
	allPaid: "All paid — thank you!",
	statusPaid: "Paid",
	statusDue: "Due",
	statusWaived: "Waived",
	howToPay: "We accept Zelle, check, or cash. Questions about a charge? Just ask us!",
};

const ES: Dict = {
	parentLogin: "Acceso para padres",
	email: "Correo electrónico",
	password: "Contraseña",
	login: "Iniciar sesión",
	logout: "Cerrar sesión",
	loginError: "Correo o contraseña incorrectos.",

	setup: "Configure su cuenta",
	setupFor: "Configure su cuenta para",
	yourName: "Su nombre",
	createPassword: "Cree una contraseña (8+ caracteres)",
	createAccount: "Crear cuenta",
	inviteInvalid: "Este enlace de invitación no es válido o ya fue usado.",
	accountExists: "Ya tiene una cuenta; por favor inicie sesión.",
	passwordShort: "Elija una contraseña de al menos 8 caracteres.",

	welcome: "Bienvenido",
	today: "Hoy",
	attendance: "Asistencia",
	notInYet: "Aún no ha llegado",
	hereNow: "Presente desde",
	doneForDay: "Ya lo recogieron",
	inAt: "Llegó",
	outAt: "Salió",
	dailyReport: "Reporte de hoy",
	photos: "Fotos de hoy",
	nothingToday: "Nada registrado hoy todavía. ¡Vuelva más tarde!",
	announcements: "Anuncios",
	noAnnouncements: "No hay anuncios por ahora.",
	noChildren: "Aún no hay niños vinculados a su cuenta. Por favor contáctenos.",
	language: "Idioma",

	tuition: "Matrícula",
	balanceDue: "Saldo pendiente",
	allPaid: "Todo pagado — ¡gracias!",
	statusPaid: "Pagado",
	statusDue: "Pendiente",
	statusWaived: "Exonerado",
	howToPay: "Aceptamos Zelle, cheque o efectivo. ¿Preguntas sobre un cargo? ¡Pregúntenos!",
};

const DICT: Record<Lang, Dict> = { en: EN, es: ES };

export function t(lang: string, key: string): string {
	const l = normLang(lang);
	return DICT[l][key] ?? EN[key] ?? key;
}

const KINDS: Record<Lang, Dict> = {
	en: { meal: "🍎 Meal", nap: "😴 Nap", mood: "🙂 Mood", activity: "🧩 Activity", note: "📝 Note", diaper: "🚼 Diaper" },
	es: { meal: "🍎 Comida", nap: "😴 Siesta", mood: "🙂 Ánimo", activity: "🧩 Actividad", note: "📝 Nota", diaper: "🚼 Pañal" },
};

export function kindLabel(lang: string, kind: string): string {
	return KINDS[normLang(lang)][kind] ?? kind;
}
