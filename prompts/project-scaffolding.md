Playwright-only setup (with CI)

Goal: Set up Playwright to test the app at:
https://order.wendys.com/us/en

What to include
- Install only Playwright test runner (no extra frameworks)
- Configure baseURL and a reasonable timeout (at most 5 seconds)
- Create a tests/ directory and a first spec using @playwright/test
- CI: GitLab CI/CD workflow that installs and runs only Chromium

Local setup
1) Install dev dependency
	- npm i -D @playwright/test

2) Install only Chromium browser binaries (smaller and faster)
	- npx playwright install --with-deps chromium

GitLab CI/CD (Chromium only)
- Create .gitlab-ci.yml with a job that:
  - Checks out the repo
  - Sets up Node.js
  - Runs npm ci
  - Runs npx playwright install --with-deps chromium
  - Runs npm test
  - Uploads the HTML report as an artifact on failure
