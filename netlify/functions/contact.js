const admin = require('firebase-admin');

// Initialize later inside the handler to catch config errors
let db;



exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Initialize Firebase safely
        if (!admin.apps.length) {
            if (!process.env.FIREBASE_PRIVATE_KEY) {
                throw new Error("Missing FIREBASE_PRIVATE_KEY environment variable in Netlify.");
            }
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
        }
        db = admin.firestore();

        const body = JSON.parse(event.body);

        await db.collection('contacts').add({
            name: body.name || '',
            email: body.email || '',
            phone: body.phone || '',
            unit: body.unit || '',
            airbnbUnit: body['airbnb-unit'] || '',
            apartmentUnit: body['apartment-unit'] || '',
            rentalTerm: body['rental-term'] || '',
            checkInDate: body['check-in-date'] || '',
            checkOutDate: body['check-out-date'] || '',
            visitDate: body['visit-date'] || '',
            message: body.message || '',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                message: 'Thank you for your message! Your submission has been securely documented.',
            }),
        };
    } catch (error) {
        console.error('Contact error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                message: 'Server Error: ' + error.message,
            }),
        };
    }
};
