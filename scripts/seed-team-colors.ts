import { prisma } from "../lib/prisma";

// Secondary colors — used for away team display to avoid clashes with home primary.
// Key = same name keys as TEAM_COLORS. Value = secondary hex.
const SECONDARY_COLORS: Record<string, string> = {
  // Red teams → away kit is typically white or navy
  "Arsenal":                   "#9C824A", // gold
  "Arsenal FC":                "#9C824A",
  "Liverpool":                 "#00B2A9", // teal (their famous away)
  "Liverpool FC":              "#00B2A9",
  "Manchester United FC":      "#000000", // black third kit / away
  "Manchester United":         "#000000",
  "Man Utd":                   "#000000",
  "Bayern Munich":             "#001F5B", // navy away
  "Bayern München":            "#001F5B",
  "FC Bayern München":         "#001F5B",
  "Club Atlético de Madrid":   "#003DA5", // blue stripe
  "Atletico Madrid":           "#003DA5",
  "Atlético de Madrid":        "#003DA5",
  "Bayer Leverkusen":          "#FFFFFF", // white
  "Bayer 04 Leverkusen":       "#FFFFFF",
  "RB Leipzig":                "#FFFFFF", // white
  "AS Roma":                   "#D4AF37", // gold (Roma's secondary)
  "SK Slavia Praha":           "#FFFFFF", // white half
  "Galatasaray":               "#FFC72C", // gold/yellow
  "Galatasaray SK":            "#FFC72C",
  "Racing Club de Lens":       "#FFCD00", // yellow
  "RC Lens":                   "#FFCD00",
  "Monaco":                    "#FFFFFF", // white
  "AS Monaco":                 "#FFFFFF",
  // Blue/dark teams → secondary is often gold or red
  "FC Internazionale Milano":  "#000000", // black (Inter stripes)
  "Internazionale":            "#000000",
  "Paris Saint-Germain FC":    "#DA291C", // red
  "Paris Saint-Germain":       "#DA291C",
  "PSG":                       "#DA291C",
  "FC Porto":                  "#D4AF37", // gold
  "Porto":                     "#D4AF37",
  "Club Brugge KV":            "#000000", // black
  "Club Brugge":               "#000000",
  "Fenerbahçe SK":             "#003DA5", // blue
  "Fenerbahce":                "#003DA5",
  // Yellow teams → secondary black
  "Borussia Dortmund":         "#000000",
  "PAE AEK":                   "#000000",
  "AEK Athens":                "#000000",
  "FK Bodø/Glimt":             "#000000",
  "Bodø/Glimt":                "#000000",
  // Green
  "Sporting Clube de Portugal": "#FFD700", // gold
  "Sporting CP":               "#FFD700",
  // Light blue
  "Aston Villa FC":            "#95003B", // claret
  "Aston Villa":               "#95003B",
  "Manchester City FC":        "#1C2C5B", // dark navy
  "Manchester City":           "#1C2C5B",
  "Man City":                  "#1C2C5B",
  "SSC Napoli":                "#FFFFFF", // white away
  // Barcelona
  "FC Barcelona":              "#004D98", // blue half
  "Barcelona":                 "#004D98",
  // Real Madrid
  "Real Madrid CF":            "#00529F", // away navy
  "Real Madrid":               "#00529F",
};

// Primary colors for UCL 2024/25 clubs
const TEAM_COLORS: Record<string, string> = {
  // England
  "Arsenal": "#EF0107",
  "Aston Villa": "#95BFE5",
  "Manchester City": "#6CABDD",
  "Man City": "#6CABDD",
  "Liverpool": "#C8102E",
  // Spain
  "Real Madrid": "#FEBE10",
  "Atletico Madrid": "#CB3524",
  "Atlético de Madrid": "#CB3524",
  "Barcelona": "#A50044",
  "Bayer Leverkusen": "#E32221",
  // Germany
  "Bayern Munich": "#DC052D",
  "Bayern München": "#DC052D",
  "Borussia Dortmund": "#FDE100",
  "RB Leipzig": "#DD0741",
  "Bayer 04 Leverkusen": "#E32221",
  // Italy
  "Inter Milan": "#010E80",
  "Internazionale": "#010E80",
  "AC Milan": "#FB090B",
  "Milan": "#FB090B",
  "Juventus": "#000000",
  "Atalanta": "#1C3F94",
  "Bologna": "#1A1A2E",
  // France
  "Paris Saint-Germain": "#004170",
  "PSG": "#004170",
  "Monaco": "#CE1126",
  "AS Monaco": "#CE1126",
  "Lille": "#D80016",
  "LOSC Lille": "#D80016",
  "Brest": "#FFFFFF",
  "Stade Brestois": "#FF4300",
  // Portugal
  "Benfica": "#CE2028",
  "Sport Lisboa e Benfica": "#CE2028",
  "Porto": "#004B8D",
  "FC Porto": "#004B8D",
  "Sporting CP": "#006600",
  "Sporting Clube de Portugal": "#006600",
  // Netherlands
  "PSV Eindhoven": "#ED1C24",
  "PSV": "#ED1C24",
  "Feyenoord": "#C8102E",
  // Belgium
  "Club Brugge": "#1B3A73",
  // Scotland
  "Celtic": "#16A34A",
  "Rangers": "#1B458F",
  // Czech Republic
  "Sparta Prague": "#AC2B37",
  "AC Sparta Praha": "#AC2B37",
  // Slovakia
  "Slovan Bratislava": "#003DA5",
  "ŠK Slovan Bratislava": "#003DA5",
  // Croatia
  "Dinamo Zagreb": "#0038A8",
  "GNK Dinamo Zagreb": "#0038A8",
  // Serbia
  "Red Star Belgrade": "#CC0000",
  "FK Crvena zvezda": "#CC0000",
  // Turkey
  "Galatasaray": "#FF0000",
  // Greece
  "AEK Athens": "#FFFF00",
  "AEK Athen": "#FFFF00",
  // Austria
  "Red Bull Salzburg": "#CC0000",
  "FC Red Bull Salzburg": "#CC0000",
  // Switzerland
  "Young Boys": "#FFDB00",
  "BSC Young Boys": "#FFDB00",
  // Ukraine
  "Shakhtar Donetsk": "#F17B20",
  // Russia
  "CSKA Moscow": "#CC0000",
  // Other German
  "Sturm Graz": "#000000",
  "SK Sturm Graz": "#000000",
  "Girona": "#CC0000",
  "Girona FC": "#CC0000",
  // Italy (more)
  "FC Internazionale Milano": "#010E80",
  "Internazionale Milano": "#010E80",
  "SSC Napoli": "#12A0D7",
  "AS Roma": "#8B0000",
  "Roma": "#8B0000",
  // Spain (more)
  "Real Betis Balompié": "#00803A",
  "Real Betis": "#00803A",
  "Villarreal CF": "#FFCD00",
  "Villarreal": "#FFCD00",
  // England (more)
  "Manchester United FC": "#DA291C",
  "Manchester United": "#DA291C",
  "Man Utd": "#DA291C",
  // Germany (more)
  "VfB Stuttgart": "#E32221",
  "Stuttgart": "#E32221",
  // Czech Republic (more)
  "SK Slavia Praha": "#CC0000",
  "Slavia Praha": "#CC0000",
  // Austria (more)
  "LASK Linz": "#000000",
  "LASK": "#000000",
  // Norway
  "FK Bodø/Glimt": "#FFFF00",
  "Bodø/Glimt": "#FFFF00",
  "Viking FK": "#003DA5",
  "Viking": "#003DA5",
  // France (more)
  "Racing Club de Lens": "#E2001A",
  "RC Lens": "#E2001A",
  "Lens": "#E2001A",
  // Turkey (more)
  "Fenerbahçe SK": "#FBEE23",
  "Fenerbahce": "#FBEE23",
  // Greece (exact DB name)
  "PAE AEK": "#FFFF00",
  "AEK": "#FFFF00",
  // Italy (more)
  "Como 1907": "#0A5FA8",
  "Como": "#0A5FA8",
  // Azerbaijan
  "Sabah FK": "#D4AF37",
  "Sabah": "#D4AF37",
};

function normalize(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
}

function jaccard(a: string, b: string) {
  const setA = new Set(a.split(" ").filter(Boolean));
  const setB = new Set(b.split(" ").filter(Boolean));
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

function fuzzyMatch(name: string, map: Record<string, string>): { key: string; value: string; score: number } | null {
  // Direct match first
  if (map[name]) return { key: name, value: map[name], score: 1 };
  // Fuzzy
  const norm = normalize(name);
  let bestScore = 0;
  let bestKey = "";
  let bestValue = "";
  for (const [key, value] of Object.entries(map)) {
    const score = jaccard(norm, normalize(key));
    if (score > bestScore) { bestScore = score; bestKey = key; bestValue = value; }
  }
  return bestScore >= 0.4 ? { key: bestKey, value: bestValue, score: bestScore } : null;
}

async function main() {
  const teams = await prisma.team.findMany();
  console.log(`Found ${teams.length} teams in DB`);

  let updated = 0;
  const unmatched: string[] = [];

  for (const team of teams) {
    const primary = fuzzyMatch(team.name, TEAM_COLORS);
    const secondary = fuzzyMatch(team.name, SECONDARY_COLORS);

    if (!primary) {
      unmatched.push(team.name);
      continue;
    }

    await prisma.team.update({
      where: { id: team.id },
      data: {
        primaryColor: primary.value,
        secondaryColor: secondary?.value ?? null,
      },
    });

    const tag = primary.score === 1 ? "✓" : `~${(primary.score * 100).toFixed(0)}%`;
    const sec = secondary ? ` | 2nd: ${secondary.value}` : "";
    console.log(`  ${tag} ${team.name} → ${primary.value}${sec}`);
    updated++;
  }

  console.log(`\nUpdated: ${updated}/${teams.length}`);
  if (unmatched.length) console.log(`Unmatched: ${JSON.stringify(unmatched)}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
