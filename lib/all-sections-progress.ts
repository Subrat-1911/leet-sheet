import { getSectionData } from "@/lib/section-data";

export async function getAllSectionsProgress(
  userId: number
) {
  const {
    sections,
    getProgress,
  } = await getSectionData(userId);

  const topLevelSections =
    sections.filter(
      (section) =>
        section.parentId === null
    );

  return topLevelSections.map((section) => ({
    section,
    progress: getProgress(section.id),
  }));
}