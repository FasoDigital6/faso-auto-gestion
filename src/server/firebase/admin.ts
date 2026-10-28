
import "server-only";

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth'
import configuration from '@/lib/configuration';

const projectId = configuration.firebase.projectId;
const storageBucket = configuration.firebase.storageBucket;

if (!getApps().length) {
    initializeApp({
        credential: cert({
            clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
            privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
            projectId,
        }),
        storageBucket,
    });
}

const dbAdmin = getFirestore();
const authAdmin = getAuth()

export { dbAdmin, authAdmin };