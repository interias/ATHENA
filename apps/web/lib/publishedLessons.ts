export const PUBLISHED_LESSON_IDS = ["ch01-l01", "ch01-l02", "ch01-l05"] as const;

export type PublishedLessonId = (typeof PUBLISHED_LESSON_IDS)[number];

export function isPublishedLessonId(value: string): value is PublishedLessonId {
  return PUBLISHED_LESSON_IDS.some((lessonId) => lessonId === value);
}

export type LessonIllustration = {
  src: string;
  caption: string;
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
      src: "/images/lessons/l2-target-metric-v1.webp",
      caption: "Fiktive Illustration: Die skeptische Eule prüft erst die Frage, dann das Werkzeug.",
      slot: "target-metric",
      placement: { kind: "after-first-paragraph" },
    },
  ],
  "ch01-l05": [
    {
      src: "/images/lessons/l3-progression-v1.webp",
      caption: "Fiktive Illustration: Der Rekordapparat wartet. Die Eule bleibt unbeeindruckt.",
      slot: "progression",
      placement: { kind: "after-first-paragraph" },
    },
  ],
};
