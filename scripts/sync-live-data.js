const fs = require('fs');
const path = require('path');

const LIVE_BASE_URL = 'https://hisfuturetalent.his.edu.dz';

async function fetchJson(endpoint) {
  const url = `${LIVE_BASE_URL}${endpoint}`;
  console.log(`Fetching ${url}...`);
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : (data.data || []);
}

async function downloadFile(remoteUrl, localPath) {
  try {
    if (fs.existsSync(localPath)) {
      return true; // Already downloaded
    }
    const res = await fetch(remoteUrl);
    if (!res.ok) {
      console.warn(`[CV DOWNLOAD] Could not fetch ${remoteUrl}: ${res.status}`);
      return false;
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, buffer);
    console.log(`[CV DOWNLOAD] Saved ${path.basename(localPath)} (${buffer.length} bytes)`);
    return true;
  } catch (err) {
    console.warn(`[CV DOWNLOAD] Error downloading ${remoteUrl}:`, err.message);
    return false;
  }
}

async function syncAll() {
  console.log('=== STARTING LIVE DATA SYNC ===');

  // 1. Fetch live datasets
  const liveStudents = await fetchJson('/api/students');
  const liveLeads = await fetchJson('/api/leads');
  const liveSponsors = await fetchJson('/api/sponsors');

  console.log(`Received: ${liveStudents.length} live students, ${liveLeads.length} live leads, ${liveSponsors.length} live sponsors`);

  // 2. Read local datasets
  const studentsFilePath = path.join(process.cwd(), 'data', 'students.json');
  const leadsFilePath = path.join(process.cwd(), 'data', 'leads.json');
  const sponsorsFilePath = path.join(process.cwd(), 'data', 'sponsors.json');

  let localStudents = [];
  let localLeads = [];
  let localSponsors = [];

  try { localStudents = JSON.parse(fs.readFileSync(studentsFilePath, 'utf8')); } catch (e) {}
  try { localLeads = JSON.parse(fs.readFileSync(leadsFilePath, 'utf8')); } catch (e) {}
  try { localSponsors = JSON.parse(fs.readFileSync(sponsorsFilePath, 'utf8')); } catch (e) {}

  console.log(`Local counts: ${localStudents.length} students, ${localLeads.length} leads, ${localSponsors.length} sponsors`);

  // 3. Merge Students (preserving all live students + any unique local entries)
  const studentMap = new Map();
  // Add local students first
  for (const s of localStudents) {
    const key = (s.email || '').toLowerCase().trim() || s.id || s.badgeId;
    if (key) studentMap.set(key, s);
  }
  // Overlay/Add live students (authoritative)
  for (const s of liveStudents) {
    const key = (s.email || '').toLowerCase().trim() || s.id || s.badgeId;
    if (key) studentMap.set(key, s);
  }
  const mergedStudents = Array.from(studentMap.values()).sort((a, b) => {
    return new Date(b.submittedAt || b.createdAt || 0).getTime() - new Date(a.submittedAt || a.createdAt || 0).getTime();
  });

  // 4. Merge Leads (preserving all live leads + any unique local entries)
  const leadMap = new Map();
  for (const l of localLeads) {
    const key = (l.email || '').toLowerCase().trim() || l.id;
    if (key) leadMap.set(key, l);
  }
  for (const l of liveLeads) {
    const key = (l.email || '').toLowerCase().trim() || l.id;
    if (key) leadMap.set(key, l);
  }
  const mergedLeads = Array.from(leadMap.values()).sort((a, b) => {
    return new Date(b.submittedAt || b.createdAt || 0).getTime() - new Date(a.submittedAt || a.createdAt || 0).getTime();
  });

  // 5. Merge Sponsors
  const sponsorMap = new Map();
  for (const sp of localSponsors) {
    const key = `${sp.slug}_${sp.edition || 2026}`;
    sponsorMap.set(key, sp);
  }
  for (const sp of liveSponsors) {
    const key = `${sp.slug}_${sp.edition || 2026}`;
    sponsorMap.set(key, sp);
  }
  const mergedSponsors = Array.from(sponsorMap.values());

  console.log(`Merged totals: ${mergedStudents.length} students, ${mergedLeads.length} leads, ${mergedSponsors.length} sponsors`);

  // 6. Save updated local JSON files
  fs.writeFileSync(studentsFilePath, JSON.stringify(mergedStudents, null, 2), 'utf8');
  fs.writeFileSync(leadsFilePath, JSON.stringify(mergedLeads, null, 2), 'utf8');
  fs.writeFileSync(sponsorsFilePath, JSON.stringify(mergedSponsors, null, 2), 'utf8');
  console.log('Saved merged data to data/*.json');

  // 7. Create Timestamped Backup Snapshot
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-');
  const snapshotPath = path.join(process.cwd(), 'data', 'backups', `snapshot_all_data_2026_09_10.json`);
  const snapshotContent = {
    timestamp: now.toISOString(),
    counts: {
      leads: mergedLeads.length,
      students: mergedStudents.length,
      sponsors: mergedSponsors.length,
    },
    leads: mergedLeads,
    students: mergedStudents,
    sponsors: mergedSponsors,
  };
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshotContent, null, 2), 'utf8');
  console.log(`Created complete snapshot backup at: ${snapshotPath}`);

  // 8. Download all CV PDFs referenced in students
  console.log('Syncing CV files...');
  const cvDir = path.join(process.cwd(), 'public', 'uploads', 'cv');
  fs.mkdirSync(cvDir, { recursive: true });

  let downloadedCount = 0;
  let existingCount = 0;
  let failedCount = 0;

  for (const student of mergedStudents) {
    if (student.cvUrl && student.cvUrl.includes('/uploads/cv/')) {
      const filename = path.basename(student.cvUrl);
      const localPath = path.join(cvDir, filename);
      if (fs.existsSync(localPath)) {
        existingCount++;
      } else {
        const remoteUrl = `${LIVE_BASE_URL}/uploads/cv/${filename}`;
        const ok = await downloadFile(remoteUrl, localPath);
        if (ok) downloadedCount++;
        else failedCount++;
      }
    }
  }

  console.log(`CV sync complete: ${existingCount} already present, ${downloadedCount} newly downloaded, ${failedCount} failed.`);
  console.log('=== SYNC COMPLETED SUCCESSFULLY ===');
}

syncAll().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
