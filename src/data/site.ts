// Structured content for J&K Daycare. Program pages, the cost estimator, the
// homepage, the FAQ, and the chatbot knowledge base all read from here so the
// site stays consistent from one source of truth.

export interface ScheduleItem {
	time: string;
	activity: string;
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
		sampleDay: [
			{ time: "8:00", activity: "Arrival & free play" },
			{ time: "8:45", activity: "Breakfast" },
			{ time: "9:15", activity: "Circle time & songs" },
			{ time: "9:45", activity: "Sensory & center play" },
			{ time: "10:30", activity: "Outdoor play" },
			{ time: "11:30", activity: "Lunch" },
			{ time: "12:15", activity: "Nap & quiet rest" },
			{ time: "2:30", activity: "Snack" },
			{ time: "3:00", activity: "Story & art" },
			{ time: "4:00", activity: "Outdoor / free play" },
			{ time: "5:30", activity: "Pickup" },
		],
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
		ageRange: "3–6 years",
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
		sampleDay: [
			{ time: "8:00", activity: "Arrival & interest zones" },
			{ time: "8:45", activity: "Breakfast" },
			{ time: "9:15", activity: "Morning meeting & calendar" },
			{ time: "9:45", activity: "Early literacy & math" },
			{ time: "10:30", activity: "Outdoor play" },
			{ time: "11:30", activity: "Lunch" },
			{ time: "12:15", activity: "Quiet rest / reading" },
			{ time: "2:00", activity: "Project & STEM time" },
			{ time: "2:45", activity: "Snack" },
			{ time: "3:15", activity: "Art & dramatic play" },
			{ time: "4:00", activity: "Outdoor / free play" },
			{ time: "5:30", activity: "Pickup" },
		],
		faqs: [
			{ q: "What ages are in preschool / Pre-K?", a: "Roughly 3–6 years old." },
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
		desc: "Licensed by the Massachusetts Department of Early Education & Care.",
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
		a: "Yes. We are licensed by the Massachusetts Department of Early Education & Care (EEC).",
	},
	{ q: "What ages do you serve?", a: "Children ages 2 to 6." },
	{ q: "What are your hours?", a: "Monday through Friday, 8:00 AM to 5:30 PM." },
	{
		q: "Where are you located?",
		a: "72 Kipling St, Springfield, MA 01118, in the East Forest Park neighborhood.",
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
