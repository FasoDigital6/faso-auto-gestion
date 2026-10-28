const configuration = {
    firebase: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    },
    emulatorHost: process.env.NEXT_PUBLIC_EMULATOR_HOST,
    emulator: process.env.NEXT_PUBLIC_EMULATOR === "true",
    environment: process.env.NODE_ENV ?? "development",
    production: process.env.NODE_ENV === "production",
    paths: {
        appHome: "/",
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    },
};

export default configuration;
