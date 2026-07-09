// Structured content for J&K Daycare. The program pages, homepage, FAQ, and the
// chatbot knowledge base all read from here so the site stays consistent from a
// single source of truth.
import { LICENSE_NUMBER } from "../consts";

export interface ScheduleItem {
	time: string;
	activity: string;
	note?: string;
}

export interface Faq {
	q: string;
	a: string;
}

export interface Program {
	slug: string;
	name: string;
	ageRange: string;
	tagline: string;
	focus: string;
	blurb: string;
	highlights: string[];
	sampleDay: ScheduleItem[];
	faqs: Faq[];
}

// The actual daily rhythm at J&K — one mixed-age group — transcribed from the
// provider's posted schedule. Shared by both programs so the whole site shows
// one real, consistent day.
export const DAILY_SCHEDULE: ScheduleItem[] = [
	{ time: "8:00", activity: "Welcome and Arrival", note: "Arrival, personal greeting, and quiet table activities." },
	{ time: "8:30", activity: "Breakfast / Snack", note: "Feeding and independence (preparing/cleaning their spot)." },
	{ time: "9:00", activity: "Group Circle Time", note: "Stories, songs, calendar, and lessons on grace and courtesy." },
	{ time: "9:30", activity: "Montessori Work Cycle", note: "Free exploration with sensorial materials, practical life, and language." },
	{ time: "10:45", activity: "Outdoor Play", note: "Movement, nature exploration, and fresh air." },
	{ time: "11:45", activity: "Hygiene and Transition", note: "Hand washing and preparation for lunch." },
	{ time: "12:00", activity: "Community Lunch", note: "Nutrition and development of social skills at the table." },
	{ time: "12:45", activity: "Nap / Rest Time", note: "Deep rest or quiet activities on a mat." },
	{ time: "2:30", activity: "Afternoon Snack", note: "Light snack and rehydration." },
	{ time: "3:00", activity: "Creative Workshop", note: "Art, experiments, music, or gardening (varies daily)." },
	{ time: "4:00", activity: "Free Play and Dismissal", note: "Backpack preparation and delivery of reports to parents." },
];

export const PROGRAMS: Program[] = [
	{
		slug: "toddlers",
		name: "Toddlers",
		ageRange: "2–3 years",
		tagline: "Curious explorers finding their footing",
		focus: "Language development, socialization, and active, hands-on exploration.",
		blurb:
			"Toddlers are natural explorers. Our days feature sensory bins, music and movement, and guided group play that builds confidence, early vocabulary, and fine-motor skills — all in a calm room that feels like home.",
		highlights: [
			"Small groups with low, nurturing ratios",
			"Daily sensory play and music & movement",
			"Gentle, partnered potty-training support",
			"Consistent nap and meal routines",
		],
		sampleDay: DAILY_SCHEDULE,
		faqs: [
			{ q: "What ages are in the toddler room?", a: "Children roughly 2–3 years old." },
			{
				q: "Do you help with potty training?",
				a: "Yes — we partner with families on a gentle, consistent approach.",
			},
			{
				q: "Are meals included?",
				a: "Yes. Balanced breakfast, lunch, and healthy snacks are included every day.",
			},
		],
	},
	{
		slug: "preschool-pre-k",
		name: "Preschool & Pre-K",
		ageRange: "3–5 years",
		tagline: "Building the skills for kindergarten",
		focus: "Kindergarten readiness, structured problem-solving, and early literacy.",
		blurb:
			"Preparing for the transition to Springfield Public Schools, our Pre-K framework blends intentional, child-led interest zones with early math, reading fundamentals, and emotional-regulation skills.",
		highlights: [
			"Early literacy and math foundations",
			"Child-led interest zones",
			"Social-emotional and self-regulation skills",
			"Kindergarten-readiness focus",
		],
		sampleDay: DAILY_SCHEDULE,
		faqs: [
			{ q: "What ages are in preschool / Pre-K?", a: "Roughly 3–5 years old." },
			{
				q: "Will my child be ready for kindergarten?",
				a: "Yes — our framework focuses on early literacy, math, and the social skills for a smooth transition to Springfield Public Schools.",
			},
			{
				q: "Are meals included?",
				a: "Yes. Balanced breakfast, lunch, and healthy snacks are included every day.",
			},
		],
	},
];

export function getProgram(slug: string): Program | undefined {
	return PROGRAMS.find((p) => p.slug === slug);
}

export interface TrustBadge {
	icon: "shield" | "heart" | "apple";
	title: string;
	desc: string;
}

export const TRUST_BADGES: TrustBadge[] = [
	{
		icon: "shield",
		title: "EEC Licensed & Compliant",
		desc: `Licensed by the Massachusetts Dept. of Early Education & Care · License #${LICENSE_NUMBER}.`,
	},
	{
		icon: "heart",
		title: "CPR & First-Aid Certified Staff",
		desc: "Trained early-childhood educators dedicated to safety.",
	},
	{
		icon: "apple",
		title: "Nutritious Meals Included",
		desc: "Balanced breakfast, lunch, and healthy snacks every day.",
	},
];

// General FAQs (site-wide). Also feed the chatbot knowledge base.
export const FAQS: Faq[] = [
	{
		q: "Is J&K Daycare licensed?",
		a: `Yes. We are licensed by the Massachusetts Department of Early Education & Care (EEC), license #${LICENSE_NUMBER}.`,
	},
	{ q: "What ages do you serve?", a: "Children ages 2 to 5." },
	{
		q: "Is the daycare bilingual?",
		a: "Yes — J&K Daycare is a bilingual English/Spanish home, so children hear and use both languages every day.",
	},
	{
		q: "What is your teaching approach?",
		a: "Montessori-inspired and eclectic — we blend Montessori materials with play-based, hands-on learning.",
	},
	{
		q: "How many children do you care for?",
		a: "We're a small, licensed family child care — never more than six children at a time, so every child gets real attention.",
	},
	{ q: "What are your hours?", a: "Monday through Friday, 8:00 AM to 5:00 PM." },
	{
		q: "Where are you located?",
		a: "In the East Forest Park neighborhood of Springfield (01118). We share the exact address when you schedule a tour.",
	},
	{
		q: "Are meals included?",
		a: "Yes — a balanced breakfast, lunch, and healthy snacks are included every day.",
	},
	{
		q: "Do you accept vouchers or financial assistance?",
		a: "Yes. We accept local childcare financial assistance, including New England Farm Workers' Council (NEFWC) vouchers.",
	},
	{
		q: "How do I enroll or schedule a tour?",
		a: "Call (413) 486-5978 or use the tour request form on our website, and we'll follow up to arrange a visit.",
	},
];
