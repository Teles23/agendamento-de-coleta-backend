import { app } from "./app";
import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT) || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
  console.log(`Access locally: http://localhost:${port}`);
});
