const FLAGS: Record<string, string> = {
  // North & Central America + Caribbean
  "United States": "🇺🇸",
  "Mexico": "🇲🇽",
  "Canada": "🇨🇦",
  "Honduras": "🇭🇳",
  "Costa Rica": "🇨🇷",
  "Panama": "🇵🇦",
  "Jamaica": "🇯🇲",
  "Trinidad and Tobago": "🇹🇹",
  "Cuba": "🇨🇺",
  "El Salvador": "🇸🇻",
  "Haiti": "🇭🇹",
  "Guatemala": "🇬🇹",
  "Suriname": "🇸🇷",
  "Curaçao": "🇨🇼",
  "Guyana": "🇬🇾",
  "Bermuda": "🇧🇲",
  "Barbados": "🇧🇧",
  "Dominican Republic": "🇩🇴",

  // South America
  "Brazil": "🇧🇷",
  "Argentina": "🇦🇷",
  "Colombia": "🇨🇴",
  "Ecuador": "🇪🇨",
  "Uruguay": "🇺🇾",
  "Chile": "🇨🇱",
  "Paraguay": "🇵🇾",
  "Bolivia": "🇧🇴",
  "Venezuela": "🇻🇪",
  "Peru": "🇵🇪",

  // Europe
  "Spain": "🇪🇸",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Netherlands": "🇳🇱",
  "Portugal": "🇵🇹",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Belgium": "🇧🇪",
  "Switzerland": "🇨🇭",
  "Italy": "🇮🇹",
  "Croatia": "🇭🇷",
  "Denmark": "🇩🇰",
  "Serbia": "🇷🇸",
  "Austria": "🇦🇹",
  "Poland": "🇵🇱",
  "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Sweden": "🇸🇪",
  "Norway": "🇳🇴",
  "Ukraine": "🇺🇦",
  "Turkey": "🇹🇷",
  "Czechia": "🇨🇿",
  "Czech Republic": "🇨🇿",
  "Slovakia": "🇸🇰",
  "Albania": "🇦🇱",
  "Wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  "Romania": "🇷🇴",
  "Hungary": "🇭🇺",
  "Greece": "🇬🇷",
  "Slovenia": "🇸🇮",
  "Finland": "🇫🇮",
  "Georgia": "🇬🇪",
  "Iceland": "🇮🇸",
  "Ireland": "🇮🇪",
  "Bosnia-Herzegovina": "🇧🇦",
  "Kosovo": "🇽🇰",
  "North Macedonia": "🇲🇰",
  "Montenegro": "🇲🇪",
  "Israel": "🇮🇱",
  "Luxembourg": "🇱🇺",

  // Africa
  "Morocco": "🇲🇦",
  "Senegal": "🇸🇳",
  "Egypt": "🇪🇬",
  "Nigeria": "🇳🇬",
  "South Africa": "🇿🇦",
  "Ivory Coast": "🇨🇮",
  "Ghana": "🇬🇭",
  "Cameroon": "🇨🇲",
  "Algeria": "🇩🇿",
  "Tunisia": "🇹🇳",
  "Mali": "🇲🇱",
  "DR Congo": "🇨🇩",
  "Zambia": "🇿🇲",
  "Tanzania": "🇹🇿",
  "Mozambique": "🇲🇿",
  "Angola": "🇦🇴",
  "Cape Verde Islands": "🇨🇻",
  "Benin": "🇧🇯",
  "Kenya": "🇰🇪",
  "Guinea": "🇬🇳",
  "Uganda": "🇺🇬",
  "Zimbabwe": "🇿🇼",
  "Comoros": "🇰🇲",
  "Burkina Faso": "🇧🇫",

  // Asia & Middle East
  "Japan": "🇯🇵",
  "South Korea": "🇰🇷",
  "Australia": "🇦🇺",
  "Iran": "🇮🇷",
  "Saudi Arabia": "🇸🇦",
  "New Zealand": "🇳🇿",
  "China": "🇨🇳",
  "Indonesia": "🇮🇩",
  "Uzbekistan": "🇺🇿",
  "Iraq": "🇮🇶",
  "Jordan": "🇯🇴",
  "United Arab Emirates": "🇦🇪",
  "Qatar": "🇶🇦",
  "Oman": "🇴🇲",
  "Kuwait": "🇰🇼",
  "Bahrain": "🇧🇭",
  "Thailand": "🇹🇭",
  "Vietnam": "🇻🇳",
  "India": "🇮🇳",
  "Palestine": "🇵🇸",
  "Tajikistan": "🇹🇯",
  "Kyrgyzstan": "🇰🇬",
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/[^a-z0-9 ]/g, "");
}

const LOOKUP = new Map(
  Object.entries(FLAGS).map(([name, flag]) => [normalize(name), flag]),
);

export function getFlag(teamName: string): string {
  const key = normalize(teamName);
  const exact = LOOKUP.get(key);
  if (exact) return exact;
  for (const [name, flag] of LOOKUP) {
    if (name.includes(key) || key.includes(name)) return flag ?? "";
  }
  return "";
}
