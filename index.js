import fs from "fs/promises";
import path from "path";
import { QBittorrent } from "@ctrl/qbittorrent";

const INCLUDE_CATEGORY = process.env.INCLUDE_CATEGORY?.split(",").map(s => s.trim()) || [];
const OMIT_CATEGORY = process.env.OMIT_CATEGORY?.split(",").map(s => s.trim()) || [];
const OMIT_TAGS = process.env.OMIT_TAGS?.split(",").map(s => s.trim()) || [];
const ORPHAN_TAG = process.env.ORPHAN_TAG || "orphan";

const client = new QBittorrent({
  baseUrl: process.env.QBIT_HOST || "http://localhost:8080",
  username: process.env.QBIT_USERNAME || "admin",
  password: process.env.QBIT_PASSWORD || "adminadmin",
});

async function checkIfOrphan(torrent) {
  const files = await client.torrentFiles(torrent.id);
  for (const file of files) {
    if (file.priority === 0 && file.progress < 1) continue;
    const fullPath = path.join(torrent.savePath, file.name);
    try {
      const stats = await fs.stat(fullPath);
      if (stats.nlink > 1) return false;
    } catch (err) {
      console.error("Error getting file stat:", err);
    }
  }
  return true;
}

function filterTorrentByCategoryAndTags(torrent) {
  const label = torrent.label?.trim();
  const includeCheck = INCLUDE_CATEGORY.length === 0 || INCLUDE_CATEGORY.includes(label);
  const omitCheck = !OMIT_CATEGORY.includes(label);
  const omitTagCheck = !OMIT_TAGS.some(tag => torrent.tags.includes(tag));
  return includeCheck && omitCheck && omitTagCheck;
}

async function main() {
  const res = await client.getAllData();
  const orphans = new Set();
  const notOrphans = new Set();

  for (const torrent of res.torrents) {
    if (!filterTorrentByCategoryAndTags(torrent)) continue;

    const isOrphan = await checkIfOrphan(torrent);
    const hasOrphanTag = torrent.tags.includes(ORPHAN_TAG);

    if (isOrphan) {
      if (torrent.tags.includes(ORPHAN_TAG)) continue;
      orphans.add(torrent.id);
    } else {
      notOrphans.add(torrent.id);
    }
  }

  await client.addTorrentTags([...orphans], ORPHAN_TAG);

  if (orphans.size > 0) {
    console.log("Adding orphan tag to", orphans.size, "torrents");
  } else {
    console.log("No new orphans found");
  }

  const torrentsToRemoveOrphanTag = [...notOrphans].filter(id => res.torrents.find(t => t.id === id).tags.includes(ORPHAN_TAG));
  
  await client.removeTorrentTags(torrentsToRemoveOrphanTag, ORPHAN_TAG);

  if (torrentsToRemoveOrphanTag.length > 0) {
    console.log("Removing orphan tag from", torrentsToRemoveOrphanTag.length, "torrents");
  } else {
    console.log("No orphan tags to remove");
  }
}

main().catch(err => console.error(err));
