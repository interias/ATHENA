export const PUBLISHED_LESSON_IDS = ["ch01-l01", "ch01-l02", "ch01-l05"] as const;

export type PublishedLessonId = (typeof PUBLISHED_LESSON_IDS)[number];

export function isPublishedLessonId(value: string): value is PublishedLessonId {
  return PUBLISHED_LESSON_IDS.some((lessonId) => lessonId === value);
}

export type LessonIllustration = {
  src: string;
  caption: string;
  alt?: string;
  concepts?: readonly { title: string; description: string }[];
  slot: string;
  placement:
    | { kind: "after-first-paragraph" }
    | { kind: "before-block"; blockKind: "interaction" | "exercise"; blockId: string };
};

export const LESSON_ILLUSTRATIONS: Record<PublishedLessonId, readonly LessonIllustration[]> = {
  "ch01-l01": [
    {
      src: "/images/lessons/l1-oracle-v1.webp",
      caption: "Fiktive Illustration · Das Trainingstagebuch spielt Orakel.",
      slot: "oracle",
      placement: { kind: "after-first-paragraph" },
    },
    {
      src: "/images/lessons/l1-training-studio-v1.webp",
      caption: "Fiktive Illustration · Trainingsalltag im römischen Lernstudio.",
      slot: "training-studio",
      placement: { kind: "before-block", blockKind: "interaction", blockId: "int-ch01-load" },
    },
    {
      src: "/images/lessons/l1-no-certificate-v2.webp",
      caption: "Fiktive Illustration · Erschöpfung verteilt keine Fortschrittszeugnisse.",
      slot: "no-certificate",
      placement: { kind: "before-block", blockKind: "exercise", blockId: "q-ch01-01" },
    },
  ],
  "ch01-l02": [
    {
      src: "/images/lessons/l2-target-metric-v2.webp",
      alt: "Zwei getrennte Szenen: Links absolviert eine Person unter Beobachtung einen Krafttest an einer Knieextensionsstation. Rechts liegt dieselbe Person in einem MRT-Gerät. Ihr Körperbau bleibt gleich.",
      concepts: [
        { title: "Kraftleistung", description: "Was leistet die Person in einer festgelegten Testaufgabe?" },
        { title: "Muskelgröße", description: "Was zeigt eine passende bildgebende Untersuchung über die Muskelgröße?" },
      ],
      caption: "Fiktive Lehrszene, keine Studienrekonstruktion. Kraftleistung und Muskelgröße können zusammenhängen; der Krafttest misst Muskelwachstum nicht direkt. Quellen: S32, S35.",
      slot: "target-metric",
      placement: { kind: "after-first-paragraph" },
    },
  ],
  "ch01-l05": [
    {
      src: "/images/lessons/l3-progression-v2.webp",
      alt: "Blick auf drei Arbeitsbereiche: Links verschiebt eine Hand eine Aufgabenkarte im Plan. In der Mitte liegt ein einzelnes Protokoll. Rechts zeigt eine zweite Hand auf mehrere gleichartige Protokolle zum Vergleich.",
      concepts: [
        { title: "Plan", description: "Eine Anforderung über Zeit weiterentwickeln." },
        { title: "Testtag", description: "Eine einzelne Leistung beobachten." },
        { title: "Verlauf", description: "Vergleichbare Beobachtungen über Zeit beurteilen; Unsicherheit bleibt." },
      ],
      caption: "Fiktive Lehrszene ohne Messdaten. Eine geplante Änderung, ein Tageswert und ein beobachteter Verlauf sind unterschiedliche Aussagen. Ein einzelner Tag entscheidet nicht über den gesamten Verlauf. Quellen: S04, S33, S36, S37.",
      slot: "progression",
      placement: { kind: "after-first-paragraph" },
    },
  ],
};
