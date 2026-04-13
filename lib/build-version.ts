const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "9010468";

export const BUILD_VERSION = `v0.1.0-${commitSha.slice(0, 7)}-stage3-interactive`;
