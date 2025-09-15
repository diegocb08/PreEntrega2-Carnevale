const { Router } = require("express");
const ProductManager = require("../ProductManager");

const router = Router();
const productManager = new ProductManager();

router.get("/", async (req, res) => {
    const products = await productManager.getProducts();
    res.render("home", { title: "Home", products });
});

router.get("/realtimeproducts", async (req, res) => {
    const products = await productManager.getProducts();
    res.render("realTimeProducts", { title: "Tiempo Real", products });
});

module.exports = router;
