import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BASE_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        isAdmin: {
          type: "boolean",
        },
      },
    }),
  ],
});
