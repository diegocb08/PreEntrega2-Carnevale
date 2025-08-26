const express = require("express");
const productsRouter = require("./routers/products.router");
const cartsRouter = require("./routers/carts.router");

const app = express();
const PORT = 8080;

// Middleware para parsear JSON en las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.get("/", (req, res) => {
  res.send("<h1>¡Bienvenido a la API de E-commerce!</h1>");
});

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
});
ccc;
