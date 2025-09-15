document.addEventListener("DOMContentLoaded", () => {
    const socket = io();

    const productsList = document.getElementById("productsList");
    const form = document.getElementById("productForm");

    function render(products) {
        if (!productsList) return;
        productsList.innerHTML = products.map(p => `
      <li data-id="${p.id}">
        <strong>${p.title}</strong> — ${p.description} — $${p.price}
        <button class="deleteBtn" data-id="${p.id}">Eliminar</button>
      </li>
    `).join("");
        attachDeleteHandlers();
    }

    function attachDeleteHandlers() {
        document.querySelectorAll(".deleteBtn").forEach(btn => {
            btn.onclick = () => {
                const pid = btn.dataset.id;
                socket.emit("deleteProduct", pid);
            };
        });
    }

    socket.on("updateProducts", render);

    socket.on("error", (err) => {
        console.error("Socket error:", err);
        alert(err.message || "Error del servidor");
    });

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const data = Object.fromEntries(fd.entries());
            if (data.price) data.price = Number(data.price);
            if (data.stock) data.stock = Number(data.stock);
            socket.emit("createProduct", data);
            form.reset();
        });
    }
});
