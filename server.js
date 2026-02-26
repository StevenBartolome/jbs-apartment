const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing multipart/form-data
const upload = multer();

// Serve static directories respecting the original paths
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// API Endpoint for contact form submission
app.post('/api/contact', upload.none(), (req, res) => {
    console.log('--- New Contact Form Submission ---');
    console.log('Name:', req.body.name);
    console.log('Email:', req.body.email);
    console.log('Phone:', req.body.phone);
    console.log('Unit Type:', req.body.unit);
    console.log('Airbnb Unit:', req.body['airbnb-unit']);
    console.log('Apartment Unit:', req.body['apartment-unit']);
    console.log('Rental Term:', req.body['rental-term']);
    console.log('Check-in Date:', req.body['check-in-date']);
    console.log('Check-out Date:', req.body['check-out-date']);
    console.log('Visit Date:', req.body['visit-date']);
    console.log('Message:', req.body.message);
    console.log('-----------------------------------');
    
    // Simulate processing time
    setTimeout(() => {
        res.json({
            success: true,
            message: "Thank you for your message! We will get back to you within 24 hours."
        });
    }, 1000);
});

// Routing for page navigation like index.php does
// Default route redirects to views/index.html or serves it
app.get('/', (req, res) => {
    const allowedPages = ['index', 'about', 'units', 'amenities', 'contact'];
    let page = req.query.page || 'index';
    
    if (!allowedPages.includes(page)) {
        page = 'index';
    }
    
    const viewPath = path.join(__dirname, 'views', `${page}.html`);
    res.sendFile(viewPath, (err) => {
        if (err) {
            res.status(404).send('<h1>404 - Page Not Found</h1>');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
