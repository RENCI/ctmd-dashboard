# Containerised Playwright smoke suite, run in-cluster by ArgoCD as a PostSync hook
# against staging (http://ctmd-frontend:3000). Built/pushed by Build-Staging as
# containers.renci.org/ctmd/ctmd-smoke:<tag>.
#
# Base image bundles chromium + all OS deps for this Playwright version, so no
# `playwright install` / apt at runtime (the cluster has no such egress anyway).
#
# PINNED to 1.61.1 — do NOT bump without re-validating the full suite against
# staging. Playwright 1.65.1 (Chromium 159) hangs while evaluating this app's
# CRA/MUI-v4 bundle: the deferred main.js never finishes, React never mounts,
# document.readyState sticks at "interactive", so every page-render ("View:")
# check times out. The same bundle renders fine in real browsers (Firefox 158,
# current Chrome) and under Chromium from 1.61.1 — Playwright ships Chromium
# ahead of stable, so this is a bleeding-edge-engine incompatibility, not a
# user-facing bug. Keep base image and the npm "playwright" pin below in lockstep.
FROM mcr.microsoft.com/playwright:v1.61.1-jammy

WORKDIR /smoke

# Install just the playwright npm package (browsers already in the base image).
# package-lock.json is intentionally gitignored for this harness, so install (not ci) and
# pin the version in package.json to match the base image's bundled browsers.
COPY package.json ./
RUN npm install --omit=dev

COPY . .

# Writable HOME for arbitrary (OpenShift) UIDs, and no-sandbox for non-root chromium.
ENV HOME=/tmp \
    SMOKE_NO_SANDBOX=1 \
    SMOKE_BASE_URL=http://ctmd-frontend:3000

# Let an arbitrary GID (OpenShift assigns one) read/exec the app dir.
RUN chgrp -R 0 /smoke && chmod -R g=u /smoke

CMD ["node", "run.js"]
