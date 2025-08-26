const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

const CARTS_FILE_PATH = path.join(__dirname, "data", "carts.json");

class CartManager {
  constructor() {
    this.filePath = CARTS_FILE_PATH;
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
      throw new Error(`Error al leer el archivo de carritos: ${error.message}`);
    }
  }

  async #writeFile(carts) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(carts, null, 2));
    } catch (error) {
      console.error("Error al escribir el archivo de carritos:", error);
      throw new Error(`Error al guardar los carritos: ${error.message}`);
    }
  }

  async createCart() {
    const carts = await this.#readFile();
    const newCart = {
      id: crypto.randomUUID(),
      products: [],
    };
    carts.push(newCart);
    await this.#writeFile(carts);
    return newCart;
  }

  async getCartById(cid) {
    const carts = await this.#readFile();
    return carts.find((cart) => cart.id === cid) || null;
  }

  async addProductToCart(cid, pid) {
    const carts = await this.#readFile();
    const cartIndex = carts.findIndex((cart) => cart.id === cid);

    if (cartIndex === -1) {
      return null;
    }

    const cart = carts[cartIndex];
    const productInCart = cart.products.find((p) => p.product === pid);

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await this.#writeFile(carts);
    return cart;
  }
}

module.exports = CartManager;
