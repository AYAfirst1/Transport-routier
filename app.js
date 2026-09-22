const form = document.getElementById("quoteForm");
const status = document.getElementById("formStatus");

function getOrders() {
  return JSON.parse(localStorage.getItem("belle_transport_orders") || "[]");
}
function saveOrders(orders) {
  localStorage.setItem("belle_transport_orders", JSON.stringify(orders));
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const order = {
    id: "BT-" + Date.now().toString().slice(-7),
    ...data,
    status: "pending",
    createdAt: new Date().toISOString(),
    amount: 0
  };
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
  form.reset();
  status.textContent = "✓ Demande envoyée. Nous vous contacterons rapidement.";
  status.className = "form-status success";
});

document.querySelector(".menu-btn")?.addEventListener("click", () => {
  document.querySelector(".desktop-nav")?.classList.toggle("open");
});
