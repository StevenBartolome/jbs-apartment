require('dotenv').config();
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase with your Service Account Key
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Get a reference to Firestore
const db = admin.firestore();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static directories
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// ─── API: Inquiry form (new) ────────────────────────────────
app.post('/api/inquiry', async (req, res) => {
    console.log('--- New Inquiry Submission ---');
    console.log('Data:', req.body);
    try {
        await db.collection('inquiries').add({
            name: req.body.name || '',
            phone: req.body.phone || '',
            email: req.body.email || '',
            preferredUnit: req.body.preferredUnit || '',
            checkInDate: req.body.checkInDate || '',
            checkOutDate: req.body.checkOutDate || '',
            numGuests: req.body.numGuests || '',
            specialRequests: req.body.specialRequests || '',
            agreedToRules: req.body.agreedToRules || false,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        // ─── Send Email Notification via Nodemailer ─────────
        try {
            // Configure transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER, // e.g., your-email@gmail.com
                    pass: process.env.EMAIL_PASS  // your App Password
                }
            });

            const mailOptions = {
                from: `"JB's Apartment" <${process.env.EMAIL_USER}>`,
                to: 'kopimendoza@gmail.com', // ⬅️ Destination email
                subject: `New Inquiry from ${req.body.name || 'Guest'}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <h2 style="color: #b8892a; margin-top: 0;">New Reservation Inquiry</h2>
                        <p><strong>Name:</strong> ${req.body.name || '-'}</p>
                        <p><strong>Email:</strong> ${req.body.email || '-'}</p>
                        <p><strong>Phone:</strong> ${req.body.phone || '-'}</p>
                        <p><strong>Unit Preference:</strong> ${req.body.preferredUnit || '-'}</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p><strong>Check-in:</strong> ${req.body.checkInDate || '-'}</p>
                        <p><strong>Check-out:</strong> ${req.body.checkOutDate || '-'}</p>
                        <p><strong>Guests:</strong> ${req.body.numGuests || '-'}</p>
                        <p><strong>Special Requests:</strong><br/>${(req.body.specialRequests || '-').replace(/\n/g, '<br>')}</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Email sending failed (but inquiry was saved to Firebase):', emailError);
            // We don't throw here because Firebase write was successful
        }
        // ────────────────────────────────────────────────────

        res.json({ success: true, message: 'Thank you! Our team will confirm availability within 24 hours.' });
    } catch (error) {
        console.error('Error saving inquiry to Firebase:', error);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
});

// ─── API: Contact form (legacy – kept for compatibility) ────
app.post('/api/contact', express.urlencoded({ extended: true }), async (req, res) => {
    console.log('--- New Contact Form Submission ---');
    try {
        await db.collection('contacts').add({
            name: req.body.name || '',
            email: req.body.email || '',
            phone: req.body.phone || '',
            unit: req.body.unit || '',
            airbnbUnit: req.body['airbnb-unit'] || '',
            apartmentUnit: req.body['apartment-unit'] || '',
            rentalTerm: req.body['rental-term'] || '',
            checkInDate: req.body['check-in-date'] || '',
            checkOutDate: req.body['check-out-date'] || '',
            visitDate: req.body['visit-date'] || '',
            message: req.body.message || '',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ success: true, message: 'Thank you for your message! Your submission has been securely documented.' });
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
});

// ─── Page Routes ────────────────────────────────────────────
const ALLOWED_PAGES = ['index', 'units', 'inquiry', 'location', 'policies', 'about', 'amenities', 'contact'];

// Root → index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// With .html extension
app.get('/:page.html', (req, res) => {
    const page = req.params.page;
    if (ALLOWED_PAGES.includes(page)) {
        res.sendFile(path.join(__dirname, 'views', `${page}.html`));
    } else {
        res.status(404).send('<h1>404 - Page Not Found</h1>');
    }
});

// Without .html extension
app.get('/:page', (req, res) => {
    const page = req.params.page;
    if (ALLOWED_PAGES.includes(page)) {
        res.sendFile(path.join(__dirname, 'views', `${page}.html`));
    } else {
        if (!req.path.startsWith('/api/') && !req.path.startsWith('/assets/') && !req.path.startsWith('/views/')) {
            res.status(404).send('<h1>404 - Page Not Found</h1>');
        } else {
            res.status(404).end();
        }
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
