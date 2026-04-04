import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

// Initialize Firebase Admin SDK for server-side operations
function initFirebaseAdmin() {
    const apps = getApps();

    try {
        if (!apps.length) {
            // Try loading from JSON file first (most reliable)
            const jsonPath = process.env.GOOGLE_APPLICATION_CREDENTIALS 
                || path.resolve(process.cwd(), "..", "prepwise-638a9-firebase-adminsdk-fbsvc-94f37c1f27.json");
            
            try {
                if (fs.existsSync(jsonPath)) {
                    const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
                    initializeApp({
                        credential: cert(serviceAccount),
                    });
                } else if (process.env.FIREBASE_PROJECT_ID) {
                    // Fall back to env vars
                    initializeApp({
                        credential: cert({
                            projectId: process.env.FIREBASE_PROJECT_ID,
                            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
                        }),
                    });
                } else {
                    console.warn("⚠️ Firebase Admin credentials missing. Using mock services for build phase.");
                    return createMockAuth();
                }
            } catch (error) {
                console.error("🔥 Firebase Admin initialization failed:", error);
                return createMockAuth();
            }
        }

        return {
            auth: getAuth(),
            db: getFirestore(),
        };
    } catch (error) {
        console.error("🔥 Firebase Admin initialization failed:", error);
        return createMockAuth();
    }
}

// Function to generate safe mock services for build-time evaluation
function createMockAuth() {
    const mockQuery = {
        get: async () => ({ empty: true, docs: [] }),
        where: () => mockQuery,
        limit: () => mockQuery,
    };

    return {
        auth: {
            verifyIdToken: async () => ({}),
            getUser: async () => ({}),
        } as any,
        db: {
            collection: () => ({
                doc: () => ({
                    get: async () => ({ exists: false }),
                    set: async () => {},
                    add: async () => ({ id: "mock-id" })
                }),
                where: () => mockQuery,
                add: async () => ({ id: "mock-id" }),
                get: async () => ({ empty: true, docs: [] }),
            })
        } as any,
    };
}

export const { auth: adminAuth, db } = initFirebaseAdmin();
