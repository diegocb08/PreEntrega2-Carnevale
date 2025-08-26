const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

const PRODUCTS_FILE_PATH = path.join(__dirname, "data", "productos.json");

class ProductManager {
  constructor() {
    this.filePath = PRODUCTS_FILE_PATH;
    // Asegura que el directorio exista.
    const dir = path.dirname(this.filePath);
    fs.mkdir(dir, { recursive: true }).catch(console.error);
  }

  async #readFile() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw new Error(
        `Error al leer el archivo de productos: ${error.message}`
      );
    }
  }

  async #writeFile(products) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(products, null, 2));
    } catch (error) {
      console.error("Error al escribir el archivo de productos:", error);
      throw new Error(`Error al guardar los productos: ${error.message}`);
    }
  }

  async addProduct({
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnails = [],
  }) {
    if (!title || !description || !code || !price || !stock || !category) {
      throw new Error(
        "Todos los campos (title, description, code, price, stock, category) son obligatorios."
      );
    }

    const status = true;

    const products = await this.#readFile();

    if (products.some((p) => p.code === code)) {
      throw new Error(`El código de producto '${code}' ya existe.`);
    }

    const newProduct = {
      id: crypto.randomUUID(),
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    };

    products.push(newProduct);
    await this.#writeFile(products);
    return newProduct;
  }

  async getProducts() {
    return this.#readFile();
  }

  async getProductById(id) {
    const products = await this.#readFile();
    return products.find((p) => p.id === id) || null;
  }

  async updateProduct(id, updatedFields) {
    const products = await this.#readFile();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return null;
    }

    // Evita que se actualice el ID
    delete updatedFields.id;

    const updatedProduct = { ...products[index], ...updatedFields };
    products[index] = updatedProduct;

    await this.#writeFile(products);
    return updatedProduct;
  }

  async deleteProduct(id) {
    const products = await this.#readFile();
    const initialLength = products.length;
    const filteredProducts = products.filter((p) => p.id !== id);

    if (filteredProducts.length === initialLength) {
      return false;
    }

    await this.#writeFile(filteredProducts);
    return true;
  }
}

module.exports = ProductManager;
