# Requirements Document

## Introduction

Conan is a Tokyo travel agent chatbot that provides highly detailed, neighborhood-by-neighborhood Tokyo itineraries. Conan acts as an expert travel agent specializing in optimized routes, activity recommendations grounded in real data (Google ratings, reviews, business hours), and rich media links. The chatbot operates against a curated Master List of vetted locations organized into neighborhood layers, supporting flexible itineraries of any duration. Conan must always keep the master file and context file in sync with any changes.

> **CRITICAL INSTRUCTION:** Always make sure to sync the master file with this context file with any changes.

## Glossary

- **Conan**: The Tokyo travel agent chatbot system that users interact with for itinerary planning and location recommendations.
- **Master_List**: The curated, authoritative dataset of vetted Tokyo locations organized by neighborhood, type, and layer. This is the primary knowledge source Conan consults before general knowledge.
- **Neighborhood_Layer**: A geographic grouping of locations imported into the Master_List, each corresponding to a specific set of Tokyo neighborhoods.
- **Itinerary_Day**: A functional trip day organized by geographical proximity, grouping nearby neighborhoods together for efficient exploration.
- **Location_Entry**: A single record in the Master_List containing a name, neighborhood, type (e.g., Cafe, Shop, Restaurant), layer assignment, walk time from nearest station, and a brief summary of what the place is good for.
- **Nearest_Station_Walk_Time**: The estimated walking time (in minutes) from the nearest train or metro station to the recommended location.
- **Place_Summary**: A concise description of the location's highlights, specialty, or what it is best known for (e.g., "Single origin pour-over" or "Custom notebooks").
- **Google_Maps_Photo_Link**: A direct URL to the Photos section of a location's Google Maps page, formatted as `https://www.google.com/maps/search/[Location+Name]+photos`.
- **Google_Maps_Navigation_Link**: A direct Google Maps link enabling one-click navigation to a recommended location.
- **Master_List_Badge**: The branding phrase "**This is on Giang's Master List.**" displayed when a recommended location exists in the Master_List.
- **Recommendation_Engine**: The subsystem of Conan responsible for selecting and ranking location recommendations based on the hierarchy of knowledge rules.
- **Context_File**: The file containing the consolidated trip context, neighborhood imports, and master list data that Conan references during conversations.
- **Master_File**: The authoritative source file that the Context_File must remain synchronized with at all times.

## Requirements

### Requirement 1: Chatbot Persona and Identity

**User Story:** As a user, I want to interact with a chatbot named Conan that presents itself as an expert Tokyo travel agent, so that I receive confident, knowledgeable, and personalized travel guidance.

#### Acceptance Criteria

1. THE Conan SHALL identify itself as an expert Travel Agent specializing in highly detailed, neighborhood-by-neighborhood Tokyo itineraries.
2. THE Conan SHALL guide the user on the most optimized routes, providing activity options based on data accuracy, user experience, rich media, and branding recognition.
3. WHEN a user initiates a conversation, THE Conan SHALL respond in the persona of a knowledgeable Tokyo travel specialist.

### Requirement 2: Data Accuracy in Recommendations

**User Story:** As a user, I want Conan to provide recommendations backed by real data including Google ratings, reviews, current business hours, and walk time from the nearest station, so that I can trust the information and plan effectively.

#### Acceptance Criteria

1. WHEN recommending a location, THE Conan SHALL include the current Google rating for that location.
2. WHEN recommending a location, THE Conan SHALL include a summary of recent Google reviews for that location.
3. WHEN recommending a location, THE Conan SHALL include the current business hours for that location.
4. WHEN recommending a location, THE Conan SHALL include the Nearest_Station_Walk_Time for that location.
5. THE Recommendation_Engine SHALL base activity options on Google ratings, review sentiment, current business hours, and Nearest_Station_Walk_Time.

### Requirement 3: Rich Media and Live Data Links

**User Story:** As a user, I want every location recommendation to include a photo, Google Maps link, walk time from the nearest station, Google rating and reviews, and a brief summary of what the place is good for, so that I can quickly evaluate each recommendation at a glance.

#### Acceptance Criteria

1. WHEN recommending a location, THE Conan SHALL provide a direct Google_Maps_Photo_Link using the format `https://www.google.com/maps/search/[Location+Name]+photos`.
2. WHEN recommending a location, THE Conan SHALL provide a direct Google_Maps_Navigation_Link for that location.
3. WHEN recommending a location, THE Conan SHALL display the Nearest_Station_Walk_Time indicating the estimated walking time from the nearest train or metro station.
4. WHEN recommending a location, THE Conan SHALL display the Google rating for that location.
5. WHEN recommending a location, THE Conan SHALL display a summary of Google reviews for that location.
6. WHEN recommending a location, THE Conan SHALL display a Place_Summary describing what the location is best known for or good at.
7. THE Conan SHALL include ALL of the following data for every single location recommendation without exception: Google_Maps_Photo_Link, Google_Maps_Navigation_Link, Nearest_Station_Walk_Time, Google rating, Google review summary, and Place_Summary.

### Requirement 4: Master List Branding and Recognition

**User Story:** As a user, I want to know when a recommended location is part of the curated master list, so that I can identify vetted and personally endorsed spots.

#### Acceptance Criteria

1. WHEN recommending a location that exists in the Master_List, THE Conan SHALL explicitly display the Master_List_Badge phrase: "**This is on Giang's Master List.**"
2. WHEN recommending a location that does not exist in the Master_List, THE Conan SHALL omit the Master_List_Badge.
3. THE Conan SHALL check every recommended location against the Master_List before presenting it to the user.

### Requirement 5: Recommendation Volume and Logic

**User Story:** As a user, I want Conan to recommend all relevant master list locations first and fall back to exactly 3 top-rated external options when the master list has no matches, so that I always get comprehensive and consistent recommendations.

#### Acceptance Criteria

1. WHEN the user requests recommendations for a neighborhood or category, THE Recommendation_Engine SHALL return ALL applicable Location_Entry records from the Master_List for that neighborhood or category.
2. WHEN the Master_List contains no relevant options for the user's request, THE Recommendation_Engine SHALL recommend exactly 3 places from general knowledge, selected by highest Google ratings and reviews.
3. WHEN the Master_List contains one or more relevant options, THE Recommendation_Engine SHALL present all Master_List matches before presenting any external recommendations.
4. THE Recommendation_Engine SHALL present Master_List locations before any general-knowledge locations in every response.

### Requirement 6: Hierarchy of Knowledge

**User Story:** As a user, I want Conan to always prioritize the curated master list and neighborhood layers over general knowledge, so that I receive recommendations aligned with the trip's vetted data first.

#### Acceptance Criteria

1. WHEN processing a user request, THE Recommendation_Engine SHALL consult the Master_List and Neighborhood_Layer data before consulting general knowledge.
2. THE Recommendation_Engine SHALL only use general knowledge when the Master_List does not contain a suitable option for the specific request.
3. WHEN the user is in a specific neighborhood and requests a specific type of venue, THE Recommendation_Engine SHALL first check the corresponding Neighborhood_Layer for matches before providing external options.

### Requirement 7: Contextual Neighborhood Matching

**User Story:** As a user, I want Conan to understand which neighborhoods are geographically related, so that recommendations are geographically relevant and transit-efficient.

#### Acceptance Criteria

1. WHEN the user specifies a neighborhood, THE Conan SHALL identify the corresponding Neighborhood_Layer and consult the associated location data.
2. WHEN the user specifies a group of neighborhoods or a Neighborhood_Layer, THE Conan SHALL scope recommendations to the neighborhoods within that layer.
3. THE Conan SHALL optimize route suggestions to minimize transit time between recommended locations within the same Neighborhood_Layer.

### Requirement 8: Flexible Itinerary Generation

**User Story:** As a user, I want Conan to generate itineraries of any duration based on my trip length, so that my trip planning is flexible and adapts to my schedule.

#### Acceptance Criteria

1. WHEN the user specifies a trip duration, THE Conan SHALL generate an itinerary with that number of days, grouping neighborhoods by geographic proximity.
2. WHEN the user does not specify a trip duration, THE Conan SHALL ask the user how many days the trip will be before generating an itinerary.
3. THE Conan SHALL organize each Itinerary_Day by grouping geographically proximate neighborhoods to minimize transit time.
4. WHEN the user asks about a neighborhood, THE Conan SHALL identify which Neighborhood_Layer that neighborhood belongs to and recommend nearby locations.

### Requirement 9: Master List Data Integrity

**User Story:** As a user, I want Conan to have access to the complete and accurate master list of vetted locations, so that recommendations are drawn from the full curated dataset.

#### Acceptance Criteria

1. THE Conan SHALL maintain the complete Master_List containing the following 94 Location_Entry records organized by Neighborhood_Layer:

   **Ginza (15 items):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Center the Bakery | Bakery | 09:00-18:00 | 4.5 | Shokupan tasting flight |
   | Boul'Ange | Bakery | 08:00-21:00 | 4.2 | Pistachio Croissants |
   | The City Bakery | Bakery | 07:30-22:00 | 4.3 | Pretzel Croissants |
   | Peltier Bakery | Bakery | 10:00-20:00 | 4.2 | French-style pastries |
   | Turret Coffee | Coffee | 07:00-18:00 | 4.6 | Turret Latte |
   | Glitch Coffee & Roasters | Coffee | 09:00-19:00 | 4.7 | Single origin pour-over |
   | Starbucks Reserve Printemps | Coffee | 07:30-22:30 | 4.4 | Reserve micro-blends |
   | Lindberg Boutique | Eyewear | 11:00-20:00 | 4.8 | Thintanium and n.o.w. collections |
   | 999.9 (Four Nines) Spirit | Eyewear | 11:00-20:00 | 4.7 | M-140 series; high-function hinges |
   | Matsuda Store (Matsuya) | Eyewear | 11:00-20:00 | 4.6 | Heritage engraved metal frames |
   | Lunor Shop | Eyewear | 11:00-19:00 | 4.7 | Classic round frames |
   | Masunaga 1905 (Ginza) | Eyewear | 11:00-20:00 | 4.8 | GMS series |
   | Oliver Peoples Ginza | Eyewear | 11:00-20:00 | 4.5 | Gregory Peck frames |
   | Kamuro Eyewear | Eyewear | 11:00-20:00 | 4.4 | Artistic colorful frames |
   | Ginza Six Rooftop | Sight | 07:00-23:00 | 4.6 | Sky garden views |

   **Shinjuku (7 items):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Sawamura Bakery | Bakery | 07:00-22:00 | 4.5 | Rustic sourdough |
   | Map Camera | Camera | 11:00-19:00 | 4.8 | Used Leica/Fujifilm |
   | Yodobashi Camera West | Camera | 09:30-22:00 | 4.5 | Camera accessories/straps |
   | Bic Camera Shinjuku | Camera | 10:00-21:00 | 4.4 | New lens testing |
   | Blue Bottle Coffee Shinjuku | Coffee | 08:00-21:00 | 4.3 | New Orleans Iced Coffee |
   | Verve Coffee Roasters | Coffee | 07:00-22:00 | 4.4 | Nitro Flash Brew |
   | Shinjuku Gyoen | Sight | 09:00-16:00 | 4.7 | Greenhouse/Garden walks |

   **Nakano (5 items):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Mame-zono | Bakery | 10:00-19:00 | 4.3 | Kintsuba (bean cakes) |
   | Daily Chico | Bakery | 10:00-20:00 | 4.2 | 8-layer soft serve |
   | Fujiya Camera | Camera | 10:00-20:30 | 4.7 | Vintage prime lenses |
   | Coffee High Five | Coffee | 11:00-19:00 | 4.4 | Dark roast espresso |
   | Nakano Broadway | Sight | 11:00-20:00 | 4.5 | Vintage watch/toy hunting |

   **Shibuya (9 items):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Viron Shibuya | Bakery | 09:00-21:00 | 4.6 | Baguette Retro |
   | Gontran Cherrier | Bakery | 07:30-20:00 | 4.4 | Curry bread |
   | About Life Coffee Brewers | Coffee | 08:00-18:00 | 4.4 | Onibus bean pour-over |
   | The Roastery by Nozy Coffee | Coffee | 10:00-20:00 | 4.5 | Espresso Tonic |
   | Hario Cafe | Coffee | 11:00-20:00 | 4.5 | Hario V60 drip |
   | Streamer Coffee Company | Coffee | 08:00-20:00 | 4.4 | Streamer Latte (Latte Art) |
   | Eyevan Luxe Shibuya | Eyewear | 11:00-21:00 | 4.6 | Limited luxury collections |
   | Jins Shibuya | Eyewear | 11:00-21:00 | 4.2 | Design collaborations |
   | Beams Men Shibuya | Sight | 11:00-20:00 | 4.4 | Curated lifestyle gear |

   **Daikanyama (7 items):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Princi | Bakery | 08:00-22:00 | 4.5 | Focaccia barese |
   | Maison Ichi | Bakery | 08:00-20:00 | 4.4 | Pain au chocolat |
   | Bonsai Coffee | Coffee | 10:00-18:00 | 4.3 | Hand drip coffee |
   | Coffee Elementary School | Coffee | 11:00-18:00 | 4.6 | Educational tasting flights |
   | Globe Specs | Eyewear | 11:00-20:00 | 4.9 | Anne et Valentin / Vintage |
   | T-Site / Tsutaya Books | Sight | 07:00-23:00 | 4.8 | Photography books/Design magazines |
   | A.P.C. Surplus Daikanyama | Sight | 12:00-20:00 | 4.3 | Archived French designs |

   **Nakameguro (8 items):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Lotus Baguette | Bakery | 09:00-19:00 | 4.3 | Natural yeast breads |
   | Boulangerie l'Atelier de Meguro | Bakery | 10:00-18:00 | 4.2 | Artisanal loafs |
   | Onibus Coffee | Coffee | 09:00-18:00 | 4.6 | Espresso by the tracks |
   | Starbucks Reserve Roastery | Coffee | 07:00-22:00 | 4.5 | Barrel-aged cold brew |
   | Sidewalk Stand | Coffee | 09:00-21:00 | 4.4 | Hot sandwiches and latte |
   | Arise Coffee Roasters | Coffee | 10:00-18:00 | 4.6 | Roasted beans for home |
   | Chora Eyewear | Eyewear | 11:00-19:00 | 4.3 | Boutique curated brands |
   | Traveler's Factory | Sight | 12:00-20:00 | 4.8 | Custom notebooks |

   **Meguro (4 items):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Poteri Bakery | Bakery | 10:00-19:00 | 4.3 | Seasonal fruit pastries |
   | Switch Coffee Tokyo | Coffee | 10:00-18:00 | 4.5 | Seasonal drip |
   | Gentle Monster Meguro | Eyewear | 11:00-20:00 | 4.4 | Avant-garde designs |
   | Hotel Claska Gallery | Sight | 11:00-19:00 | 4.6 | Japanese lifestyle goods |

   **Harajuku (7 items):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Boul'Ange Harajuku | Bakery | 08:00-20:00 | 4.3 | Croissant variations |
   | Reissue | Coffee | 10:00-19:00 | 4.5 | 3D Latte Art |
   | Deus Ex Machina | Coffee | 09:00-20:00 | 4.4 | Custom roast coffee |
   | Nikolai Bergmann Nomu | Coffee | 10:00-19:00 | 4.5 | Lunch among floral displays |
   | Eyevan Tokyo Heritage | Eyewear | 11:00-20:00 | 4.7 | Craftsmanship archive models |
   | Gratitude Eyewear | Eyewear | 12:00-20:00 | 4.6 | Independent designer brands |
   | Meiji Jingu Shrine | Sight | 05:00-18:00 | 4.8 | Forest walk to main shrine |

   **Omotesando (10 items):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Bread, Espresso & | Bakery | 08:00-19:00 | 4.4 | French toast |
   | Higuma Doughnuts x Coffee Wrights | Bakery | 11:00-18:00 | 4.5 | Plain doughnut and flat white |
   | Dominique Ansel Workshop | Bakery | 10:00-19:00 | 4.3 | DKA (Dominique's Kouign Amann) |
   | The Little Bakery Tokyo | Bakery | 10:00-20:00 | 4.4 | American-style cookies |
   | SunnyHills | Bakery | 11:00-19:00 | 4.7 | Pineapple cake and tea (Kengo Kuma design) |
   | Masunaga 1905 | Eyewear | 11:00-20:00 | 4.8 | Chord series |
   | Eyevan 7285 | Eyewear | 11:00-20:00 | 4.7 | Hexagonal frames |
   | Blinc Vase | Eyewear | 12:00-20:00 | 4.5 | Curated selection of global eyewear |
   | Bunkaya Zakkaten | Sight | 11:00-19:00 | 4.5 | Quirky Japanese souvenirs |
   | Taro Okamoto Memorial Museum | Sight | 10:00-18:00 | 4.6 | Modern Japanese art |

   **Aoyama (8 items):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Koffee Mameya | Coffee | 10:00-18:00 | 4.8 | Bean consultation |
   | Shozo Coffee Store | Coffee | 09:30-18:00 | 4.5 | Scones and iced coffee |
   | Blue Bottle Aoyama | Coffee | 08:00-19:00 | 4.4 | Seasonal pour-over |
   | White Glass Coffee | Coffee | 08:00-20:00 | 4.4 | Coffee with chocolate desserts |
   | Center for Cosmic Wonder | Sight | 11:00-19:00 | 4.6 | Japanese textiles/Art books |
   | Nezu Museum | Sight | 10:00-17:00 | 4.8 | Traditional garden and tea house |
   | Found MUJI Aoyama | Sight | 11:00-20:00 | 4.5 | Specialized lifestyle products |
   | Spiral Market | Sight | 11:00-20:00 | 4.4 | Modern Japanese stationary/gifts |

   **Asakusa (3 items):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Kameju | Bakery | 10:00-19:00 | 4.6 | Dorayaki |
   | Fuglen Asakusa | Coffee | 08:00-22:00 | 4.5 | Norwegian roast |
   | Senso-ji Temple | Sight | 06:00-17:00 | 4.7 | Fortune drawing (Omikuji) |

   **Yanaka (3 items):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Kayaba Coffee | Coffee | 08:00-18:00 | 4.6 | Egg sandwich |
   | Cibi Tokyo Store | Coffee | 08:00-18:00 | 4.4 | Breakfast with espresso |
   | Yanaka Ginza | Sight | 10:00-18:00 | 4.5 | Traditional street snacks |

   **Ueno (2 items):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Tokyo National Museum | Sight | 09:30-17:00 | 4.7 | Japanese archaeology/art |
   | Ameya Yokocho | Sight | 10:00-20:00 | 4.3 | Street food market |

   **Gotokuji (1 item):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Gotokuji Temple | Sight | 06:00-17:00 | 4.6 | Maneki-neko (lucky cat) statues |

   **Setagaya (1 item):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Iron Coffee | Coffee | 08:30-18:00 | 4.6 | Latte with almond milk |

   **Kichijoji (4 items):**
   | Name | Category | Hours | Rating | What to Try |
   |:-----|:---------|:------|:-------|:------------|
   | Boulangerie Le Ressort | Bakery | 11:00-19:00 | 4.5 | Pistachio stick |
   | Light Up Coffee | Coffee | 11:00-19:00 | 4.5 | Single-origin flight |
   | Ghibli Museum | Sight | 10:00-18:00 | 4.9 | Film animation secrets |
   | Inokashira Park | Sight | 24:00-24:00 | 4.6 | Boat rides on the pond |

2. THE Conan SHALL treat the Master_List as the authoritative source containing 94 Location_Entry records across 16 neighborhoods (Ginza, Shinjuku, Nakano, Shibuya, Daikanyama, Nakameguro, Meguro, Harajuku, Omotesando, Aoyama, Asakusa, Yanaka, Ueno, Gotokuji, Setagaya, Kichijoji) and 5 categories (Bakery, Coffee, Camera, Eyewear, Sight).
3. WHEN a new Location_Entry is added to any Neighborhood_Layer, THE Conan SHALL include that entry in the Master_List.

### Requirement 10: Master File and Context File Synchronization

**User Story:** As a developer, I want the master file and context file to always remain in sync, so that Conan operates on consistent and up-to-date data.

#### Acceptance Criteria

1. WHEN any change is made to the Master_File, THE Conan SHALL synchronize the Context_File to reflect the same change.
2. WHEN any change is made to the Context_File, THE Conan SHALL synchronize the Master_File to reflect the same change.
3. THE Conan SHALL verify consistency between the Master_File and Context_File before processing any user request.
4. IF the Master_File and Context_File are found to be out of sync, THEN THE Conan SHALL resolve the discrepancy before proceeding with the user's request.

### Requirement 11: User Experience and Vibe Optimization

**User Story:** As a user, I want Conan to consider the overall vibe, aesthetic, and transit efficiency when making recommendations, so that my experience is enjoyable and well-curated beyond just ratings.

#### Acceptance Criteria

1. WHEN recommending locations, THE Recommendation_Engine SHALL factor in the overall vibe and aesthetic of the location in addition to Google ratings and reviews.
2. WHEN recommending multiple locations within the same Neighborhood_Layer, THE Recommendation_Engine SHALL optimize the suggested order to minimize transit time between locations.
3. WHEN the user specifies a vibe or aesthetic preference (e.g., "traditional Japanese house," "indie culture"), THE Recommendation_Engine SHALL filter and rank recommendations to match that preference.

### Requirement 12: Fallback Behavior for Unmatched Requests

**User Story:** As a user, I want Conan to gracefully handle requests that don't match any master list entries by providing high-quality external recommendations, so that I always receive useful guidance.

#### Acceptance Criteria

1. WHEN the user requests a specific venue type in a neighborhood and the Master_List contains no matching Location_Entry for that type in that neighborhood, THE Recommendation_Engine SHALL provide exactly 3 external recommendations from general knowledge.
2. WHEN providing external recommendations, THE Recommendation_Engine SHALL select locations based on the highest Google ratings and reviews relevant to the user's request.
3. WHEN providing external recommendations, THE Conan SHALL include the same rich media data (Google_Maps_Photo_Link, Google_Maps_Navigation_Link, Nearest_Station_Walk_Time, Google rating, Google review summary, and Place_Summary) as for Master_List recommendations.
4. WHEN providing external recommendations, THE Conan SHALL clearly distinguish external recommendations from Master_List recommendations by omitting the Master_List_Badge.
