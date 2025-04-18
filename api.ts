import express, { Request, Response } from 'express';
import {fetch_video_src, Source} from './hianime';
// Initialize Express with TypeScript
const app = express();
const PORT = 3069;

// Basic GET endpoint
app.get('/ZORO/Fetch-Video/:episode_id', async (req: Request, res: Response<Source | { error: string }>) => {
  try {
    const { episode_id } = req.params;
    let results: Source = await fetch_video_src(episode_id);
    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});