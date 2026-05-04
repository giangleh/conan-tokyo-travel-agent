import masterListData from '@/data/master-list.json';

export interface LocationEntry {
  neighborhood: string;
  name: string;
  category: string;
  hours: string;
  rating: number;
  whatToTry: string;
  mapLink: string;
}

export function getMasterList(): LocationEntry[] {
  return masterListData as LocationEntry[];
}

export function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
  }
  return result;
}

export function formatMasterListForPrompt(locations: LocationEntry[]): string {
  const byNeighborhood = groupBy(locations, 'neighborhood');
  return Object.entries(byNeighborhood)
    .map(
      ([hood, locs]) =>
        `### ${hood} (${locs.length} items)\n` +
        locs
          .map(
            (l) =>
              `- **${l.name}** (${l.category}) | ${l.hours} | ★${l.rating} | Try: ${l.whatToTry} | [Map](${l.mapLink})`
          )
          .join('\n')
    )
    .join('\n\n');
}
