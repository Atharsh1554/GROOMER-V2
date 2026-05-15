import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// YouCam API configuration
const YOUCAM_API_KEY = process.env.YOUCAM_API_KEY;
const YOUCAM_BASE = "https://yce-api-01.makeupar.com";

// CORS — allow the frontend origin with credentials
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000", "https://groomer-app-jithu.loca.lt"],
    credentials: true,
  })
);

// Better Auth handler — MUST be before express.json() middleware
// It handles all /api/auth/* routes
app.all("/api/auth/*", toNodeHandler(auth));

// Express JSON — increased limit for base64 image uploads
app.use(express.json({ limit: "10mb" }));

/* ═══════════════════════════════════════════════════════════════
   YouCam AI Hair Style Virtual Try-On Proxy
   POST /api/hairstyle-preview
   Body: { imageBase64: string, styleId: string }
   Returns: { resultImageUrl: string } or { error: string }
   ═══════════════════════════════════════════════════════════════ */
app.post("/api/hairstyle-preview", async (req, res) => {
  const { imageBase64, styleId } = req.body;

  if (!imageBase64 || !styleId) {
    return res.status(400).json({ error: "Missing imageBase64 or styleId" });
  }

  try {
    const headers = {
      Authorization: `Bearer ${YOUCAM_API_KEY}`,
      "Content-Type": "application/json",
    };

    // ── Step 0: Prep Image ──────────────────────────────────
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");
    const fileSize = imageBuffer.length;

    // ── Step 1: Request upload URL + file_id ──────────────────
    console.log("[YouCam] Step 1: Requesting upload URL...");
    const fileRes = await fetch(`${YOUCAM_BASE}/s2s/v2.0/file/hair-style`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        files: [
          {
            file_name: "photo.jpg",
            content_type: "image/jpeg",
            file_size: fileSize
          }
        ]
      }),
    });

    if (!fileRes.ok) {
      const errText = await fileRes.text();
      console.error("[YouCam] File endpoint error:", fileRes.status, errText);
      return res.status(502).json({ error: `YouCam file upload init failed: ${fileRes.status} - ${errText}` });
    }

    const fileData = await fileRes.json();
    const fileInfo = fileData.data?.files?.[0] || fileData.files?.[0] || fileData.data || fileData;
    
    // V2.0 puts the upload details in a requests array
    const requestInfo = fileInfo.requests?.[0] || {};
    const uploadUrl = requestInfo.url || fileInfo.url;
    const uploadMethod = requestInfo.method || fileInfo.method || "PUT";
    const uploadHeaders = requestInfo.headers || fileInfo.headers || {};
    const file_id = fileInfo.file_id;

    if (!uploadUrl || !file_id) {
        throw new Error("Failed to get upload URL or file_id from YouCam");
    }

    console.log("[YouCam] Got file_id:", file_id);

    // ── Step 2: Upload the image ──────────────────────────────
    console.log("[YouCam] Step 2: Uploading image (%d bytes)...", fileSize);
    const putRes = await fetch(uploadUrl, {
      method: uploadMethod,
      headers: {
        "Content-Type": "image/jpeg",
        ...uploadHeaders,
      },
      body: imageBuffer,
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      console.error("[YouCam] PUT upload error:", putRes.status, errText);
      return res.status(502).json({ error: `Image upload to storage failed: ${putRes.status}` });
    }

    console.log("[YouCam] Image uploaded successfully");

    // ── Step 3: Start hair-style task ─────────────────────────
    console.log("[YouCam] Step 3: Starting hair-style task with style:", styleId);
    const taskRes = await fetch(`${YOUCAM_BASE}/s2s/v2.0/task/hair-style`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        src_file_id: file_id,
        template_id: styleId,
      }),
    });

    if (!taskRes.ok) {
      const errText = await taskRes.text();
      console.error("[YouCam] Task start error:", taskRes.status, errText);
      return res.status(502).json({ error: `YouCam task start failed: ${taskRes.status} - ${errText}` });
    }

    const taskData = await taskRes.json();
    const task_id = taskData.data?.task_id || taskData.task_id;

    console.log("[YouCam] Got task_id:", task_id);

    // ── Step 4: Poll for result (max 60 seconds) ──────────────
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds total
    const pollingInterval = 2000;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`[YouCam] Polling attempt ${attempts}/${maxAttempts}...`);

      const statusRes = await fetch(`${YOUCAM_BASE}/s2s/v2.0/task/hair-style/${task_id}`, {
        headers,
      });

      if (!statusRes.ok) {
          console.error("[YouCam] Poll request failed:", statusRes.status);
          await new Promise((resolve) => setTimeout(resolve, pollingInterval));
          continue;
      }

      const pollData = await statusRes.json();
      const data = pollData.data || {};
      const taskStatus = data.task_status || pollData.status;

      if (taskStatus === "success" || taskStatus === "completed") {
        const resultUrl = data.results?.url || data.result_url || pollData.result_url;
        if (resultUrl) {
          console.log("[YouCam] ✓ Success! Result URL obtained");
          return res.json({ resultImageUrl: resultUrl, rawResult: pollData });
        }
        console.log("[YouCam] Success but result structure:", JSON.stringify(pollData));
      }

      if (taskStatus === "error" || taskStatus === "failed") {
        const errorMsg = data.error || pollData.error || "Task failed";
        console.error("[YouCam] Task failed:", errorMsg);
        return res.status(502).json({ error: `YouCam processing failed: ${errorMsg}`, rawResult: pollData });
      }

      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    }

    // Timeout
    console.error("[YouCam] Timeout: task did not complete in 30s");
    return res.status(504).json({ error: "AI processing timed out. Please try again." });

  } catch (err) {
    console.error("[YouCam] Server error:", err);
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
});

// Serve the frontend static files from the project root
app.use(express.static(path.join(__dirname, "..")));

// SPA fallback — serve index.html for all non-API, non-static routes
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api/")) {
    res.sendFile(path.join(__dirname, "..", "index.html"));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ✂️  GROOMER Server running!
  
  Local:   http://localhost:${PORT}
  API:     http://localhost:${PORT}/api/auth
  AI:      http://localhost:${PORT}/api/hairstyle-preview
  
  Press Ctrl+C to stop
  `);
});
