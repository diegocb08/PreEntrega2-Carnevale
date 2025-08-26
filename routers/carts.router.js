const { Router } = require("express");
const CartManager = require("../CartManager");

const cartManager = new CartManager();
const cartsRouter = Router();

cartsRouter.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res
      .status(201)
      .json({ message: "Carrito creado exitosamente", cart: newCart });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el carrito." });
  }
});

cartsRouter.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getCartById(cid);

    if (cart) {
      res.json({ products: cart.products });
    } else {
      res.status(404).json({ error: "Carrito no encontrado." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener los productos del carrito." });
  }
});

cartsRouter.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.addProductToCart(cid, pid);

    if (updatedCart) {
      res.json({
        message: "Producto agregado al carrito exitosamente",
        cart: updatedCart,
      });
    } else {
      res.status(404).json({ error: "Carrito o producto no encontrado." });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto al carrito." });
  }
});

module.exports = cartsRouter;
