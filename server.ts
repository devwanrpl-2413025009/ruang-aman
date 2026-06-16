import app from "./api/index";
import { createServer as createViteServer } from "vite";

const PORT = 3000;

async function startDev() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ruang Aman dev server running on http://localhost:${PORT}`);
  });
}

startDev().catch((err) => {
  console.error("Failed to start dev server:", err);
  process.exit(1);
});
