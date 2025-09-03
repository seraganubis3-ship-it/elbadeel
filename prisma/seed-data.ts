export const categories = [
  { name: "الخدمات الشخصية والهوية", slug: "identity", description: "بطاقة رقم قومي، شهادة ميلاد، قسائم" },
  { name: "الخدمات العائلية", slug: "family", description: "قيد عائلي وفردي" },
  { name: "الخدمات السفرية", slug: "travel", description: "جواز سفر وتصريح عمل" },
] as const;

export const services = [
  {
    category: "identity",
    name: "استخراج بطاقة رقم قومي",
    slug: "national-id",
    icon: "id-card",
    description: "استخراج بطاقة رقم قومي (عادية، سريعة، عاجلة)",
    variants: [
      { name: "عادي", priceCents: 1500, etaDays: 10 },
      { name: "سريع", priceCents: 2500, etaDays: 5 },
      { name: "عاجل", priceCents: 4000, etaDays: 2 },
    ],
    documents: [
      { title: "صورة شخصية حديثة" },
      { title: "شهادة ميلاد" },
      { title: "مستند يثبت العنوان" },
    ],
  },
  {
    category: "identity",
    name: "استخراج شهادة ميلاد",
    slug: "birth-certificate",
    icon: "certificate",
    description: "شهادة ميلاد (أول مرة، عادية)",
    variants: [
      { name: "أول مرة", priceCents: 2000, etaDays: 7 },
      { name: "عادي", priceCents: 1200, etaDays: 3 },
    ],
    documents: [
      { title: "صورة بطاقة ولي الأمر" },
      { title: "شهادة تبليغ" },
    ],
  },
  {
    category: "identity",
    name: "استخراج قسيمة زواج",
    slug: "marriage-certificate",
    icon: "ring",
    description: "قسيمة زواج (أول مرة، عادية)",
    variants: [
      { name: "أول مرة", priceCents: 2200, etaDays: 5 },
      { name: "عادي", priceCents: 1500, etaDays: 3 },
    ],
    documents: [
      { title: "صورة بطاقة الزوجين" },
    ],
  },
  {
    category: "identity",
    name: "استخراج قسيمة طلاق",
    slug: "divorce-certificate",
    icon: "document",
    description: "قسيمة طلاق (أول مرة، عادية)",
    variants: [
      { name: "أول مرة", priceCents: 2200, etaDays: 5 },
      { name: "عادي", priceCents: 1500, etaDays: 3 },
    ],
    documents: [
      { title: "صورة بطاقة" },
    ],
  },
  {
    category: "identity",
    name: "استخراج شهادة وفاة",
    slug: "death-certificate",
    icon: "document",
    description: "شهادة وفاة (أول مرة، عادية)",
    variants: [
      { name: "أول مرة", priceCents: 2000, etaDays: 5 },
      { name: "عادي", priceCents: 1200, etaDays: 3 },
    ],
    documents: [
      { title: "صورة بطاقة المُبلّغ" },
    ],
  },
  {
    category: "family",
    name: "استخراج قيد عائلي",
    slug: "family-record",
    icon: "family",
    description: "قيد عائلي",
    variants: [
      { name: "عادي", priceCents: 1800, etaDays: 5 },
      { name: "سريع", priceCents: 2800, etaDays: 2 },
    ],
    documents: [
      { title: "صور بطاقات الأسرة" },
    ],
  },
  {
    category: "family",
    name: "استخراج قيد فردي",
    slug: "individual-record",
    icon: "person",
    description: "قيد فردي",
    variants: [
      { name: "عادي", priceCents: 1200, etaDays: 3 },
    ],
    documents: [
      { title: "صورة بطاقة" },
    ],
  },
  {
    category: "travel",
    name: "استخراج جواز سفر",
    slug: "passport",
    icon: "passport",
    description: "جواز سفر (عادي، عاجل)",
    variants: [
      { name: "عادي", priceCents: 5000, etaDays: 10 },
      { name: "عاجل", priceCents: 8000, etaDays: 3 },
    ],
    documents: [
      { title: "صور شخصية" },
      { title: "شهادة ميلاد" },
    ],
  },
  {
    category: "travel",
    name: "استخراج تصريح عمل",
    slug: "work-permit",
    icon: "briefcase",
    description: "تصريح عمل",
    variants: [
      { name: "عادي", priceCents: 3000, etaDays: 7 },
      { name: "عاجل", priceCents: 6000, etaDays: 2 },
    ],
    documents: [
      { title: "صورة بطاقة" },
    ],
  },
] as const;

export const faqs = [
  { question: "ما هي المستندات المطلوبة؟", answer: "تختلف حسب الخدمة، وستظهر في صفحة الخدمة." },
  { question: "كم يستغرق وقت تنفيذ الخدمة؟", answer: "يعتمد على نوع الخدمة (عادي/سريع/عاجل)." },
] as const;


