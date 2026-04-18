import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: "http://localhost:3000"
})

// un_Y21JHIW0KMKKM2H0XWKWWK411JK2402I

export const { signIn, signUp, useSession } = createAuthClient()