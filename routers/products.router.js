const { Router } = require("express");
const ProductManager = require("../ProductManager");

const productManager = new ProductManager();
const productsRouter = Router();

// Middleware de validación para las rutas POST y PUT
const validateProductFields = (req, res, next) => {
  const { title, description, code, price, stock, category } = req.body;
  if (!title || !description || !code || !price || !stock || !category) {
    return res
      .status(400)
      .json({ error: "Todos los campos obligatorios deben estar presentes." });
  }
  next();
};

productsRouter.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: "Error al listar los productos." });
  }
});

productsRouter.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productManager.getProductById(pid);

    if (product) {
      res.json({ product });
    } else {
      res.status(404).json({ error: "Producto no encontrado." });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto por ID." });
  }
});

productsRouter.post("/", validateProductFields, async (req, res) => {
  try {
    const newProductData = req.body;
    const newProduct = await productManager.addProduct(newProductData);

    const io = req.app.get("io");
    if (io) {
      const products = await productManager.getProducts();
      io.emit("updateProducts", products);
    }

    res
      .status(201)
      .json({ message: "Producto agregado exitosamente", product: newProduct });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

productsRouter.put("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const updatedProductData = req.body;
    const updatedProduct = await productManager.updateProduct(
      pid,
      updatedProductData
    );

    if (updatedProduct) {
      const io = req.app.get("io");
      if (io) {
        const products = await productManager.getProducts();
        io.emit("updateProducts", products);
      }

      res.json({
        message: "Producto actualizado exitosamente",
        product: updatedProduct,
      });
    } else {
      res
        .status(404)
        .json({ error: "Producto no encontrado para actualizar." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

productsRouter.delete("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const success = await productManager.deleteProduct(pid);

    if (success) {
      const io = req.app.get("io");
      if (io) {
        const products = await productManager.getProducts();
        io.emit("updateProducts", products);
      }

      res.json({ message: "Producto eliminado exitosamente." });
    } else {
      res.status(404).json({ error: "Producto no encontrado para eliminar." });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto." });
  }
});

module.exports = productsRouter;
