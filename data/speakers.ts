export type Speaker = {
  name: string;
  role: {
    en: string;
    ar: string;
  };
  company?: string;
  topic?: {
    en: string;
    ar: string;
  };
  category: "conference" | "workshop" | "keynote" | "panel";
  edition: 2024 | 2025 | 2026;
  image?: string;
  imageStatus: "confirmed" | "placeholder";
};

export const speakersData: Speaker[] = [
  // Speakers — Edition 2026 (keynote / panel / workshops)
  {
    name: "Youcef Baslimane",
    role: {
      en: "General Director at MINIROS",
      ar: "المدير العام لشركة مينيروس",
    },
    category: "keynote",
    edition: 2026,
    image: "/speakers/2026/youcef-baslimane.jpg",
    imageStatus: "confirmed"
  },
  {
    name: "Mohamed Zebouchi",
    role: {
      en: "HR Director at Optilla - Kaoua Food",
      ar: "مدير الموارد البشرية بشركة أوبتيلا - كاوا فود",
    },
    topic: {
      en: "Beyond the Degree: The Skills That Make the Difference",
      ar: "ما بعد الشهادة: المهارات التي تصنع الفرق",
    },
    category: "panel",
    edition: 2026,
    image: "/speakers/2026/mohamed-zebouchi.jpg",
    imageStatus: "confirmed"
  },
  {
    name: "Toufik Boukhari",
    role: {
      en: "HR Manager at SATIM",
      ar: "مدير الموارد البشرية بشركة ساتيم",
    },
    topic: {
      en: "Beyond the Degree: The Skills That Make the Difference",
      ar: "ما بعد الشهادة: المهارات التي تصنع الفرق",
    },
    category: "panel",
    edition: 2026,
    image: "/speakers/2026/toufik-boukhari.jpg",
    imageStatus: "confirmed"
  },
  {
    name: "Fares Tinakiche",
    role: {
      en: "Product Manager at Maystro Delivery",
      ar: "مدير المنتج بشركة مايسترو ديليفري",
    },
    topic: {
      en: "Technical Job Hunt: Careers in the Digital Age",
      ar: "البحث عن وظيفة تقنية: المسارات المهنية في العصر الرقمي",
    },
    category: "workshop",
    edition: 2026,
    image: "/speakers/2026/fares-tinakiche.jpg",
    imageStatus: "confirmed"
  },
  {
    name: "Yanis Doudou",
    role: {
      en: "Recruitment Service Manager at Prophex Solutions Group",
      ar: "مدير مصلحة التوظيف بمجموعة بروفكس سوليوشنز",
    },
    topic: {
      en: "The Actual Skills You Need to Be Job Ready",
      ar: "المهارات الفعلية التي تحتاجها لتكون جاهزاً لسوق العمل",
    },
    category: "workshop",
    edition: 2026,
    image: "/speakers/2026/yanis-doudou.jpg",
    imageStatus: "confirmed"
  },
  {
    name: "Racha Yasmine Bendris",
    role: {
      en: "HR & Talent Acquisition Specialist at HydraPharm Group",
      ar: "أخصائية الموارد البشرية واستقطاب المواهب بمجموعة هيدرافارم",
    },
    topic: {
      en: "Interview Readiness: How to Be Ready for Your Opportunity",
      ar: "الاستعداد للمقابلة: كيف تكون جاهزاً لفرصتك",
    },
    category: "workshop",
    edition: 2026,
    imageStatus: "placeholder"
  },
  {
    name: "Said Khebbeb",
    role: {
      en: "HR Officer at WeeWee Delivery",
      ar: "مكلف بالموارد البشرية بشركة ويوي ديليفري",
    },
    topic: {
      en: "Career Preparation from Zero to Opportunity",
      ar: "التحضير المهني من الصفر إلى الفرصة",
    },
    category: "workshop",
    edition: 2026,
    image: "/speakers/2026/said-khebbeb.jpg",
    imageStatus: "confirmed"
  },

  // Conference Speakers — Edition 2025
  {
    name: "Abdelmalek Cheta",
    role: {
      en: "Founder of Etihad Group",
      ar: "مؤسس مجموعة الإتحاد",
    },
    category: "conference",
    edition: 2025,
    image: "/speakers/abdelmalek-cheta.jpg",
    imageStatus: "confirmed"
  },
  {
    name: "Yacine Mahdid",
    role: {
      en: "Human Resources Expert",
      ar: "خبير في الموارد البشرية",
    },
    category: "conference",
    edition: 2025,
    image: "/speakers/yacine-mahdid.png",
    imageStatus: "confirmed"
  },

  // Conference Speakers — Edition 2024
  {
    name: "Bouzid Moumen",
    role: {
      en: "HR Director at El Kendi",
      ar: "مدير الموارد البشرية بشركة الكندي",
    },
    category: "conference",
    edition: 2024,
    image: "/speakers/bouzid-moumen.png",
    imageStatus: "confirmed"
  },
  {
    name: "Nabil Djenadi",
    role: {
      en: "HR Director at El Hayat",
      ar: "مدير الموارد البشرية بشركة الحياة",
    },
    category: "conference",
    edition: 2024,
    image: "/speakers/nabil-djenadi.png",
    imageStatus: "confirmed"
  },
  {
    name: "Samir Gherbi",
    role: {
      en: "Director at Lafarge",
      ar: "مدير في لافارج",
    },
    category: "conference",
    edition: 2024,
    imageStatus: "placeholder"
  },

  // Workshop Speakers — Edition 2025
  {
    name: "Anis Hadadi",
    role: {
      en: "Head of Marketing",
      ar: "مدير التسويق",
    },
    company: "Oussama Promotion Immobilière",
    category: "workshop",
    edition: 2025,
    image: "/speakers/anis-hadadi.png",
    imageStatus: "confirmed"
  },
  {
    name: "Sami Hamari",
    role: {
      en: "Founder",
      ar: "مؤسس",
    },
    company: "Data Intuition",
    category: "workshop",
    edition: 2025,
    imageStatus: "placeholder"
  },
  {
    name: "Bouthaina Mobarki",
    role: {
      en: "Project Manager",
      ar: "مديرة مشاريع",
    },
    company: "Sylabs",
    category: "workshop",
    edition: 2025,
    image: "/speakers/bouthaina-mobarki.png",
    imageStatus: "confirmed"
  }
];
