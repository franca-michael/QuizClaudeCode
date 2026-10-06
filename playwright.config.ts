import { defineConfig, devices } from "@playwright/test";

const PORT = 3111;

export default defineConfig({
  testDir: "tests/e2e",
  // Em paralelo o servidor local trava no carregamento (Windows); 1 worker é estável.
  workers: 1,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
