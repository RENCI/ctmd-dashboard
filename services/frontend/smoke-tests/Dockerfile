# Containerised Playwright smoke suite, run in-cluster by ArgoCD as a PostSync hook
# against staging (http://ctmd-frontend:3000). Built/pushed by Build-Staging as
# containers.renci.org/ctmd/ctmd-smoke:<tag>.
#
# Base image bundles chromium + all OS deps for this Playwright version, so no
# `playwright install` / apt at runtime (the cluster has no such egress anyway).
FROM mcr.microsoft.com/playwright:v1.61.1-jammy

WORKDIR /smoke

# Install just the playwright npm package (browsers already in the base image).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY . .

# Writable HOME for arbitrary (OpenShift) UIDs, and no-sandbox for non-root chromium.
ENV HOME=/tmp \
    SMOKE_NO_SANDBOX=1 \
    SMOKE_BASE_URL=http://ctmd-frontend:3000

# Let an arbitrary GID (OpenShift assigns one) read/exec the app dir.
RUN chgrp -R 0 /smoke && chmod -R g=u /smoke

CMD ["node", "run.js"]
