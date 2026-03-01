const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

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

        // ─── Send Email Notification via Nodemailer ─────────
        try {
            // Configure transporter (using Gmail as an example, but you can use any SMTP)
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER, // e.g., your-email@gmail.com
                    pass: process.env.EMAIL_PASS  // your App Password
                }
            });

            const mailOptions = {
                from: `"JB's Apartment" <${process.env.EMAIL_USER}>`,
                to: 'jbsapartment8@gmail.com', // ⬅️ Change this to whatever email you want to receive notifications
                subject: `New Inquiry from ${body.name || 'Guest'}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <h2 style="color: #b8892a; margin-top: 0;">New Reservation Inquiry</h2>
                        <p><strong>Name:</strong> ${body.name || '-'}</p>
                        <p><strong>Email:</strong> ${body.email || '-'}</p>
                        <p><strong>Phone:</strong> ${body.phone || '-'}</p>
                        <p><strong>Unit Preference:</strong> ${body.preferredUnit || '-'}</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p><strong>Check-in:</strong> ${body.checkInDate || '-'}</p>
                        <p><strong>Check-out:</strong> ${body.checkOutDate || '-'}</p>
                        <p><strong>Guests:</strong> ${body.numGuests || '-'}</p>
                        <p><strong>Special Requests:</strong><br/>${(body.specialRequests || '-').replace(/\n/g, '<br>')}</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Email sending failed (but inquiry was saved to Firebase):', emailError);
            // We don't throw here because Firebase write was successful
        }
        // ────────────────────────────────────────────────────

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
