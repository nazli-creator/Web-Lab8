import path from 'node:path';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve public/ relative to this file, so the server works from any folder.
const PUBLIC_DIR = path.join(import.meta.dirname, 'public');

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
