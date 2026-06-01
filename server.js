const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public')); 

let orders = [];

// MENU DATA (Default items)
let menuItems = [
    { id: 'm1', name: 'Volcano Zinger', category: 'Fast Food', price: 550, image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=400', desc: 'Fiery fried chicken, jalapeño slaw, and ghost pepper mayo.', available: true },
    { id: 'm2', name: 'Truffle Pizza', category: 'Pizza', price: 1450, image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=400', desc: 'Roasted wild mushrooms, truffle oil drizzle, and fresh mozzarella.', available: true },
    { id: 'm3', name: 'Atomic Naga Wings', category: 'Fast Food', price: 690, image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=400', desc: '8pcs of double-fried wings tossed in authentic Naga pepper sauce.', available: true }
];

// ORDERS API
app.get('/api/orders', (req, res) => res.json(orders));
app.post('/api/orders', (req, res) => { orders.push(req.body); res.status(201).send("OK"); });
app.put('/api/orders/:id', (req, res) => {
    const i = orders.findIndex(o => o.id === req.params.id);
    if(i !== -1) { orders[i] = { ...orders[i], ...req.body }; res.send("Updated"); } else res.status(404).send("Not Found");
});

// MENU API
app.get('/api/menu', (req, res) => res.json(menuItems));
app.post('/api/menu', (req, res) => { menuItems.push(req.body); res.status(201).send("OK"); });
app.put('/api/menu/:id', (req, res) => {
    const i = menuItems.findIndex(m => m.id === req.params.id);
    if(i !== -1) { menuItems[i] = { ...menuItems[i], ...req.body }; res.send("Updated"); } else res.status(404).send("Not Found");
});
app.delete('/api/menu/:id', (req, res) => {
    menuItems = menuItems.filter(m => m.id !== req.params.id);
    res.send("Deleted");
});

app.listen(3000, () => console.log('🚀 Server started on http://localhost:3000'));