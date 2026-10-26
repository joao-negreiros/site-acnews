import { writeFileSync } from "node:fs";
import { fetchLive } from "../lib/feeds";

const articles = await fetchLive();
writeFileSync("data/snapshot.json", JSON.stringify(articles));
console.log(`${articles.length} matérias salvas em data/snapshot.json`);
