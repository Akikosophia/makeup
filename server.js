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


app.post('/detail/:id', (req, res) => {
    const productId = req.params.id;
    const { rate, beoordeling } = req.body;

    console.log('Received productId:', productId);
    console.log('Received body:', req.body);


    // Lees het bestaande JSON-bestand
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).send('Server error');
        }

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing JSON data:', parseErr);
            return res.status(500).send('Server error');
        }

        // Zoek het juiste product op ID
        const product = jsonData.products.find(p => p.id === productId);
        if (product) {
            // Voeg de nieuwe rating en beoordeling toe
            if (!product.ratings) {
                product.ratings = [];
            }
            product.ratings.push({
                rate: rate,
                beoordeling: beoordeling
            });

            console.log('Updated product:', product);

            // Schrijf de gewijzigde data terug naar het JSON-bestand
            fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Error writing JSON file:', writeErr);
                    return res.status(500).send('Server error');
                }
                res.redirect(`/detail/${productId}`);
            });
        } else {
            res.status(404).send('Product not found');
        }
    });
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


  app.get('/detail/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const urlid = `https://makeup-api.herokuapp.com/api/v1/products/${productId}.json`;
        const back = await fetch(urlid);
        const product = await back.json(); // Haalt het specifieke product op

        console.log(product);
        // Render de 'product.ejs' template en geef het product door
        res.render('detail', { product: product, messages: messages });
        
    } catch (error) {
        console.error('Er is een fout opgetreden:', error);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van het product.');
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
