const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { engine } = require("express-handlebars");
const path = require("path");

const productsRouter = require("./routers/products.router");
const cartsRouter = require("./routers/carts.router");
const viewsRouter = require("./routers/views.router");

const ProductManager = require("./ProductManager");
const productManager = new ProductManager();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 8080;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));


app.set("io", io);


app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.use("/", viewsRouter);

// WebSockets
io.on("connection", async (socket) => {
  console.log("Cliente conectado:", socket.id);

  const products = await productManager.getProducts();
  socket.emit("updateProducts", products);

  socket.on("createProduct", async (data) => {
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        stock: Number(data.stock),
      };
      await productManager.addProduct(payload);
      const list = await productManager.getProducts();
      io.emit("updateProducts", list); // avisamos a todos
    } catch (err) {
      socket.emit("error", { message: err.message });
    }
  });

  socket.on("deleteProduct", async (pid) => {
    try {
      await productManager.deleteProduct(pid);
      const list = await productManager.getProducts();
      io.emit("updateProducts", list);
    } catch (err) {
      socket.emit("error", { message: err.message });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
