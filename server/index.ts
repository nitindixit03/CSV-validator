import express from "express";
import cors from "cors";
import uploadRoutes from "./src/routes/uploadRoutes";
import { ensureDir, OUTPUT_DIR } from "./src/utils/fileUtils";

const app = express();
const PORT = process.env.PORT || 3001;

ensureDir(OUTPUT_DIR);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3001",
  "https://csv-validator-9782.onrender.com",
];

app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json());

app.use("/api", uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
