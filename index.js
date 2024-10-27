import fs from "fs/promises";
import path from "path";
import { QBittorrent } from "@ctrl/qbittorrent";

const INCLUDE_CATEGORY = process.env.INCLUDE_CATEGORY?.split(",").map(s => s.trim()) || [];
const OMIT_CATEGORY = process.env.OMIT_CATEGORY?.split(",").map(s => s.trim()) || [];
const ORPHAN_TAG = process.env.ORPHAN_TAG || "orphan";

const client = new QBittorrent({
  baseUrl: process.env.QBIT_HOST || "http://localhost:8080",
  username: process.env.QBIT_USERNAME || "admin",
  password: process.env.QBIT_PASSWORD || "adminadmin",
});

async function main() {
  const res = await client.getAllData();
  const notOrphans = new Set();

  const filteredTorrents = res.torrents.filter(torrent => {
    if (torrent.tags.includes(ORPHAN_TAG)) {
      notOrphans.add(torrent.id);
      return false;
    }
    const label = torrent.label?.trim();
    const includeCheck = INCLUDE_CATEGORY.length === 0 || INCLUDE_CATEGORY.includes(label);
    const omitCheck = !OMIT_CATEGORY.includes(label);
    return includeCheck && omitCheck;
  });

  for (const torrent of filteredTorrents) {
    const files = await client.torrentFiles(torrent.id);

    for (const file of files) {
      if (file.priority === 0 && file.progress < 1) continue;
      const fullPath = path.join(torrent.savePath, file.name);

      try {
        const stats = await fs.stat(fullPath);

        if (stats.nlink > 1) {
          notOrphans.add(torrent.id);
        }
      } catch (err) {
        console.error("Error geting file stat:", err);
      }
    }
  }

  const orphans = filteredTorrents.filter(torrent => !notOrphans.has(torrent.id));

  if (orphans.length === 0) {
    console.log("No orphans found");
    return;
  } else {
    console.log("Adding orphan tag to ", orphans.length, " torrents");
  
    await client.addTorrentTags(orphans.map(t => t.id), ORPHAN_TAG);
  }
}

main()
  .catch(err => console.error(err));