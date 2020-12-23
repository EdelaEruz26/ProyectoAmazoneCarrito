const fs = require('fs');
const express = require('express');
const app = express();
const port = 8080;

app.listen(port, () => {
    console.log('EN LINEA.........');
})

app.get('/stok/:filter/:keyword', (req, res) => {
    let filter = req.params.filter;
    let keyword = req.params.keyword;
    let qStok = fs.readFileSync('./stok.txt', 'utf8');
    let qProduct = JSON.parse(qStok);
    let queryRes = qProduct.filter(product => product[filter] === keyword);
    res.send(queryRes);
})

app.get('/stok', (req, res) => {
    let qStok = fs.readFileSync('./stok.txt', 'utf8');
    let qProduct = JSON.parse(qStok);
    res.send(qProduct);
})

app.get('/car', (req, res) => {
    let carData = fs.readFileSync('./car.txt', 'utf8');
    let carProduct = JSON.parse(carData);
    res.send(carProduct);
})

app.delete('/car', (req, res) => {
    fs.writeFileSync('./car.txt', '[]');
    res.send('eliminaste todos los articulos');
})

app.post('/car/products/:product', (req, res) => {
    let carData = fs.readFileSync('./car.txt', 'utf8');
    let carProduct = JSON.parse(carData);
    let nProduct = JSON.parse(req.params.product);
    const index = carProduct.findIndex(product => product.id === nProduct.id);
    if(index === -1){
        carProduct.push(nProduct);
    }else{
        carProduct.splice(index, 1, nProduct);
    }
    fs.writeFileSync('./car.txt', '');
    fs.writeFileSync('./car.txt', JSON.stringify(carProduct)); 
    res.send('agregaste un producto al carrito');
})

app.put('/car/products/:id/:quantity', (req, res) => {
    let carData = fs.readFileSync('./car.txt', 'utf8');
    let carProduct = JSON.parse(carData);
    let quant = parseInt(req.params.quantity);
    let productId = parseInt(req.params.id);
    const index = carProduct.findIndex(product => product.id === productId);
    const match = carProduct[index];
    match.quantity = quant;
    carProduct.splice(index, 1, match);
    fs.writeFileSync('./car.txt', '');
    fs.writeFileSync('./car.txt', JSON.stringify(carProduct));
    res.send('carrito actualizado');
})

app.delete('/car/products/:id/', (req, res) => {
    let carData = fs.readFileSync('./car.txt', 'utf8');
    let carProduct = JSON.parse(carData);
    let productId = parseInt(req.params.id);
    const index = carProduct.findIndex(product => product.id === productId);
    carProduct.splice(index, 1);
    fs.writeFileSync('./car.txt', '');
    fs.writeFileSync('./car.txt', JSON.stringify(carProduct));
    res.send('producto eliminado del carrito');
})

app.post('/checkout', (req, res) => {
    let msg = '';
    let total = 0;
    let errFlag = 0;
    let carData = fs.readFileSync('./car.txt', 'utf8');
    let carProduct = JSON.parse(carData);
    let qStok = fs.readFileSync('./stok.txt', 'utf8');
    let qProduct = JSON.parse(qStok);
    carProduct.forEach(product => {
        let index = qProduct.findIndex(qProd => qProd.id === product.id)
        total += parseInt(qProduct[index].price) * product.quantity;
        if(product.quantity > qProduct[index].quantity){
            errFlag = 1;
        }
    });
    if(errFlag === 0){
        
        carProduct.forEach(product => {
            let index = qProduct.findIndex(qProd => qProd.id === product.id)
            qProduct[index].quantity -= product.quantity;
        });
        msg = 'el total es ' + total;
        fs.writeFileSync('./car.txt', '[]');
        fs.writeFileSync('./stok.txt', '');
        fs.writeFileSync('./stok.txt', JSON.stringify(qProduct));
    }else{
        msg = 'limite de productos excedido'
    } 
    res.send(msg);
})

