import dotenv from "dotenv";
import { connectMongo } from "./config/mongodb.js";

dotenv.config({ path: "backend/.env" });
dotenv.config();

const { default: app } = await import("./app.js");

const PORT = Number(process.env.PORT || 4000);
const RETRY_MS = 5000;

const connectWithRetry = async () => {
  try {
    await connectMongo();
    // eslint-disable-next-line no-console
    console.log("MongoDB connected successfully.");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection failed. Retrying in 5s...", error?.message || error);
    setTimeout(connectWithRetry, RETRY_MS);
  }
};

const start = async () => {
  await connectWithRetry();
  // initialize Agenda after DB connected
  try {
    const { default: agendaModule } = await import('./config/agenda.js');
    // pass mongoose connection
    // connectMongo() returns mongoose.connection
    // eslint-disable-next-line no-console
    await agendaModule.initAgenda(require('mongoose').connection);
    // eslint-disable-next-line no-console
    console.log('Agenda scheduler started.');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Agenda not started:', err?.message || err);
  }

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API server running on http://localhost:${PORT}`);
  });
};

start();
