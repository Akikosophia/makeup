const express = require('express'); 
const fetch = require('node-fetch')// Importeer node-fetch voor HTTP-verzoeken
const app = express(); // Declareer en initialiseer de app

// Stel ejs in als template enginenpm inst
app.set('view engine', 'ejs');

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.static("public"));

// Middleware om URL-encoded data te verwerken
app.use(express.urlencoded({ extended: true }));


app.get('/', async (req, res) => {
    try {
        const url = 'http://makeup-api.herokuapp.com/api/v1/products.json';
        const response = await fetch(url); // Maak een fetch verzoek
        const makeup = await response.json(); // Converteer de respons naar JSON
        console.log(makeup); // Dit zal de makeup-data loggen in de console

        // Render de 'home.ejs' template en geef de makeup data mee
        res.render('home', {
            makeup: makeup,
            messages: messages
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
        res.render('detail', { product: product, messages:messages });
        
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
            makeup: makeup, 
        });

    } catch (error) {
        console.error('Er is een fout opgetreden:', error);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van de data.');
    }
});

// Hier heb ik een lege array lijst gemaakt voor de rating
const messages = []

let makeup = []

app.post('/detail', function (request, response) {
    messages.push(request.body.bericht);
    response.render('detail', { 
        messages: messages, makeup: makeup  });
  });



app.get('/product', async (req, res) => {
    try {
        const url = 'http://makeup-api.herokuapp.com/api/v1/products.json';
        const response = await fetch(url); // Maak een fetch verzoek
        const makeup = await response.json(); // Converteer de respons naar JSON
        console.log(makeup); // Dit zal de makeup-data loggen in de console

        // Render de 'home.ejs' template en geef de makeup data mee
        res.render('product', {
            makeup: makeup, product: product
        });

    } catch (error) {
        console.error('Er is een fout opgetreden:', error);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van de data.');
    }
});




app.listen(3001, () => {
    console.log('Server draait op http://localhost:3001');
});
