'use client';

interface PlaceData {
  name: string;
  neighborhood: string;
  category: string;
  rating: string;
  reviews: string;
  walkTime: string;
  knownFor: string;
  mapLink: string;
  onMasterList: boolean;
}

export function PlaceCard({ place }: { place: PlaceData }) {
  const photoUrl = `https://www.google.com/maps/search/${encodeURIComponent(place.name + ' ' + place.neighborhood + ' Tokyo')}`;
  const thumbnailUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(place.name + ' ' + place.neighborhood + ' Tokyo')}&zoom=17&size=80x80&maptype=roadmap`;

  return (
    <a
      href={place.mapLink || photoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors no-underline text-inherit"
    >
      <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
        <img
          src={`https://www.google.com/s2/favicons?domain=google.com&sz=64`}
          alt={place.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm text-gray-900 truncate">{place.name}</h4>
          {place.onMasterList && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded flex-shrink-0">
              ⭐ Master List
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-sm font-medium text-gray-900">{place.rating}</span>
          <span className="text-yellow-500 text-sm">★</span>
          <span className="text-xs text-gray-500">({place.reviews})</span>
          <span className="text-xs text-gray-400 mx-1">·</span>
          <span className="text-xs text-gray-500">{place.category}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{place.knownFor}</p>
        <p className="text-xs text-gray-400 mt-0.5">🚶 {place.walkTime}</p>
      </div>
    </a>
  );
}

export function parsePlaceCards(text: string): Array<{ type: 'text'; content: string } | { type: 'place'; data: PlaceData }> {
  const parts: Array<{ type: 'text'; content: string } | { type: 'place'; data: PlaceData }> = [];
  const regex = /---PLACE---\n([\s\S]*?)---END---/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before this card
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index).trim();
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore });
      }
    }

    // Parse the card fields
    const cardText = match[1];
    const fields: Record<string, string> = {};
    for (const line of cardText.split('\n')) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim();
        const value = line.slice(colonIdx + 1).trim();
        fields[key] = value;
      }
    }

    if (fields.name) {
      parts.push({
        type: 'place',
        data: {
          name: fields.name || '',
          neighborhood: fields.neighborhood || '',
          category: fields.category || '',
          rating: fields.rating || '4.0',
          reviews: fields.reviews || '',
          walkTime: fields.walkTime || '',
          knownFor: fields.knownFor || '',
          mapLink: fields.mapLink || '',
          onMasterList: fields.onMasterList === 'true',
        },
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim();
    if (remaining) {
      parts.push({ type: 'text', content: remaining });
    }
  }

  return parts;
}
