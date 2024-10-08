const express = require('express'); 
const fetch = require('node-fetch')// Importeer node-fetch voor HTTP-verzoeken
const app = express(); // Declareer en initialiseer de app
const path = require('path');
const fs = require('fs');


// Stel ejs in als template enginenpm inst
app.set('view engine', 'ejs');

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.static("public"));

// Middleware om URL-encoded data te verwerken
app.use(express.urlencoded({ extended: true }));



const messages = []
// Asynchroon JSON-bestand lezen
// fs.readFile('./data.json', 'utf8', (err, jsonString) => {
//     if (err) {
//         console.log("File read failed:", err);
//         return;
//     }
//     try {
//         const data = JSON.parse(jsonString);
//         console.log(`Name: ${data.name}`);
//         console.log(`Age: ${data.age}`);
//         console.log(`Email: ${data.email}`);
//     } catch (err) {
//         console.log('Error parsing JSON:', err);
//     }
// });

const jsonFilePath = path.join(__dirname, 'data.json');

app.get('/view-data', (req, res) => {
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).send('Server error');
        }
        res.json(JSON.parse(data));
    });
});


app.post('/detail/:id', async (req, res) => {
    const productId = req.params.id;
    const { rate, beoordeling } = req.body;

    console.log('Received productId:', productId);
    console.log('Received body:', req.body);

    try {
        // Lees het bestaande JSON-bestand
        const data = fs.readFileSync(jsonFilePath, 'utf8');
        let jsonData = JSON.parse(data);

        // Zoek het juiste product op ID in de lokale JSON data
        const product = jsonData.products.find(p => p.id === productId);
        if (product) {
            // Voeg de nieuwe rating en beoordeling toe
            if (!product.ratings) {
                product.ratings = [];
            }
            product.ratings.push({
                rate: parseInt(rate, 10),  // Zorg ervoor dat de rating een integer is
                beoordeling: beoordeling.trim()
            });

            console.log('Updated product with new rating:', product);

            // Schrijf de gewijzigde data terug naar het JSON-bestand
            fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

            // Verkrijg de productgegevens van de externe API
            const urlid = `https://makeup-api.herokuapp.com/api/v1/products/${productId}.json`;
            const response = await fetch(urlid);
            const apiProduct = await response.json();

            // Voeg de lokale ratings toe aan het API product
            apiProduct.ratings = product.ratings;

            // Verzamel de berichten voor weergave
            const messages = apiProduct.ratings.map(r => `Rating: ${r.rate} - Beoordeling: ${r.beoordeling}`);

            // Render de 'detail.ejs' template en geef het API-product en de berichten door
            res.render('detail', { product: apiProduct, messages: messages });

        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});


app.get('/detail/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        // Verkrijg productgegevens van de externe API
        const urlid = `https://makeup-api.herokuapp.com/api/v1/products/${productId}.json`;
        const response = await fetch(urlid);
        const apiProduct = await response.json();

        // Lees de lokale JSON data om beoordelingen op te halen
        const data = fs.readFileSync(jsonFilePath, 'utf8');
        const jsonData = JSON.parse(data);

        // Zoek het juiste product in de lokale data om eventuele beoordelingen op te halen
        const localProduct = jsonData.products.find(p => p.id === productId);

        let messages = [];
        if (localProduct && localProduct.ratings) {
            // Verwerk de bestaande beoordelingen om weer te geven
            messages = localProduct.ratings.map(r => `Rating: ${r.rate} - Beoordeling: ${r.beoordeling.trim()}`);
            
            // Voeg de lokale ratings toe aan de API-productgegevens
            apiProduct.ratings = localProduct.ratings;
        } else {
            // Zorg ervoor dat er een lege array is als er geen beoordelingen zijn
            apiProduct.ratings = [];
        }

        // Render de 'detail.ejs' template en geef zowel de API-productgegevens als de berichten door
        res.render('detail', { product: apiProduct, messages: messages });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});


app.get('/', async (req, res) => {
    try {
        const url = 'http://makeup-api.herokuapp.com/api/v1/products.json';
        const response = await fetch(url); // Maak een fetch verzoek
        const makeup = await response.json(); // Converteer de respons naar JSON
        console.log(makeup); // Dit zal de makeup-data loggen in de console

        // Render de 'home.ejs' template en geef de makeup data mee
        res.render('home', {
            makeup: makeup,
            // messages: messages
        });
    } catch (error) {
        console.error('Er is een fout opgetreden:', error);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van de data.');
    }
});

app.get('/detail', async (req, res) => {
    try {
        const url = 'http://makeup-api.herokuapp.com/api/v1/products.json';
        const response = await fetch(url); // Maak een fetch verzoek
        const makeup = await response.json(); // Converteer de respons naar JSON
        console.log(makeup); // Dit zal de makeup-data loggen in de console

        // Render de 'home.ejs' template en geef de makeup data mee
        res.render('detail', {
             makeup: makeup
        });

    } catch (error) {
        console.error('Er is een fout opgetreden:', error);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van de data.');
    }
});

// Hier heb ik een lege array lijst gemaakt voor de rating
// const messages = []

// let makeup = []

// app.post('/detail', function (request, response) {
//     messages.push(request.body.bericht);
//     response.render('detail', { 
//         messages: messages  });
//   });

app.get('/product', async (req, res) => {
    try {
        const url = 'http://makeup-api.herokuapp.com/api/v1/products.json';
        const response = await fetch(url);
        const makeup = await response.json();
        res.render('product', { makeup: makeup });
    } catch (error) {
        console.error('Er is een fout opgetreden:', error);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van de data.');
    }
});




app.listen(3001, () => {
    console.log('Server draait op http://localhost:3001');
});
