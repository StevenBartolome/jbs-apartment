const admin = require('firebase-admin');

// Initialize only once (functions may be reused in same container)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Netlify stores \n literally — replace with real newlines
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);

        await db.collection('inquiries').add({
            name: body.name || '',
            phone: body.phone || '',
            email: body.email || '',
            preferredUnit: body.preferredUnit || '',
            checkInDate: body.checkInDate || '',
            checkOutDate: body.checkOutDate || '',
            numGuests: body.numGuests || '',
            specialRequests: body.specialRequests || '',
            agreedToRules: body.agreedToRules || false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                message: 'Thank you! Our team will confirm availability within 24 hours.',
            }),
        };
    } catch (error) {
        console.error('Inquiry error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                message: 'Something went wrong. Please try again later.',
            }),
        };
    }
};
