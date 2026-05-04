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
  const searchQuery = encodeURIComponent(place.name + ' ' + place.neighborhood + ' Tokyo');
  const mapLink = place.mapLink || `https://www.google.com/maps/search/${searchQuery}`;
  const photosLink = `https://www.google.com/images?q=${searchQuery}`;

  // Small embedded Google Map (free, no API key needed)
  const embedMapUrl = `https://www.google.com/maps?q=${searchQuery}&output=embed`;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow bg-white">
      {/* Map thumbnail */}
      <a href={mapLink} target="_blank" rel="noopener noreferrer" className="block">
        <iframe
          src={embedMapUrl}
          className="w-full h-32 pointer-events-none"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${place.name}`}
        />
      </a>

      {/* Card content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <a href={mapLink} target="_blank" rel="noopener noreferrer" className="no-underline">
            <h4 className="font-semibold text-sm text-gray-900 hover:text-blue-600 transition-colors">
              {place.name}
            </h4>
          </a>
          {place.onMasterList && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded flex-shrink-0 whitespace-nowrap">
              ⭐ Giang&apos;s List
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-1">
          <span className="text-sm font-medium text-gray-900">{place.rating}</span>
          <span className="text-yellow-500 text-sm">★</span>
          <span className="text-xs text-gray-500">({place.reviews})</span>
          <span className="text-xs text-gray-400 mx-1">·</span>
          <span className="text-xs text-gray-600">{place.category}</span>
        </div>

        <p className="text-xs text-gray-600 mt-1">{place.knownFor}</p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">🚶 {place.walkTime}</span>
          <div className="flex gap-2">
            <a
              href={`https://www.google.com/maps/search/${searchQuery}+photos`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              📸 Photos
            </a>
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              🗺️ Directions
            </a>
          </div>
        </div>
      </div>
    </div>
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
