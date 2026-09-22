const KEY = "belle_transport_orders";
const body = document.getElementById("ordersBody");
const empty = document.getElementById("emptyState");
const search = document.getElementById("searchInput");
const filter = document.getElementById("statusFilter");
let orders = JSON.parse(localStorage.getItem(KEY) || "[]");

const esc = (v="") => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const statusLabel = {pending:"En attente", confirmed:"Confirmée", done:"Terminée"};

function refreshStats() {
  document.getElementById("totalCount").textContent = orders.length;
  document.getElementById("pendingCount").textContent = orders.filter(o=>o.status==="pending").length;
  document.getElementById("confirmedCount").textContent = orders.filter(o=>o.status==="confirmed").length;
  const total = orders.reduce((s,o)=>s + Number(o.amount || 0), 0);
  document.getElementById("revenue").textContent = total.toLocaleString("fr-MA") + " DH";
}
function render() {
  const q = (search.value || "").toLowerCase();
  const f = filter.value;
  const shown = orders.filter(o => {
    const hay = `${o.name} ${o.phone} ${o.from} ${o.to} ${o.service} ${o.id}`.toLowerCase();
    return hay.includes(q) && (f==="all" || o.status===f);
  });
  body.innerHTML = shown.map(o => `
    <tr>
      <td><strong>${esc(o.name)}</strong><small>${esc(o.phone)}</small></td>
      <td>${esc(o.from)} → ${esc(o.to)}</td>
      <td>${esc(o.service)}</td>
      <td>${esc(o.date)}</td>
      <td><span class="badge ${o.status}">${statusLabel[o.status]}</span></td>
      <td><button class="view-btn" onclick="openOrder('${o.id}')">Voir</button></td>
    </tr>`).join("");
  empty.style.display = shown.length ? "none" : "block";
  refreshStats();
}
window.openOrder = function(id) {
  const o = orders.find(x=>x.id===id);
  if (!o) return;
  document.getElementById("modalTitle").textContent = `${o.name} · ${o.id}`;
  document.getElementById("modalContent").innerHTML = `
    <div><span>Téléphone</span><b>${esc(o.phone)}</b></div>
    <div><span>Trajet</span><b>${esc(o.from)} → ${esc(o.to)}</b></div>
    <div><span>Date</span><b>${esc(o.date)}</b></div>
    <div><span>Service</span><b>${esc(o.service)}</b></div>
    <div><span>Statut</span><select id="modalStatus"><option value="pending">En attente</option><option value="confirmed">Confirmée</option><option value="done">Terminée</option></select></div>
    <div><span>Montant (DH)</span><input id="modalAmount" type="number" min="0" value="${Number(o.amount||0)}"></div>
    <div class="full-detail"><span>Message</span><p>${esc(o.message || "Aucun détail supplémentaire.")}</p></div>`;
  document.getElementById("modalStatus").value = o.status;
  document.getElementById("callClient").href = `tel:${o.phone.replace(/\s/g,"")}`;
  document.getElementById("whatsappClient").href = `https://wa.me/${o.phone.replace(/\D/g,"")}?text=${encodeURIComponent("Bonjour " + o.name + ", concernant votre demande " + o.id + " chez Belle Transport Routier.")}`;
  document.getElementById("orderModal").classList.remove("hidden");
  document.getElementById("modalStatus").onchange = e => { o.status=e.target.value; persist(); };
  document.getElementById("modalAmount").onchange = e => { o.amount=Number(e.target.value||0); persist(); };
};
function persist() {
  localStorage.setItem(KEY, JSON.stringify(orders));
  render();
}
document.getElementById("closeModal").onclick = () => document.getElementById("orderModal").classList.add("hidden");
document.getElementById("orderModal").addEventListener("click", e => { if(e.target.id==="orderModal") e.currentTarget.classList.add("hidden"); });
search.addEventListener("input", render);
filter.addEventListener("change", render);

document.getElementById("exportBtn").onclick = () => {
  const header = ["ID","Client","Téléphone","Départ","Destination","Date","Service","Statut","Montant"];
  const rows = orders.map(o => [o.id,o.name,o.phone,o.from,o.to,o.date,o.service,statusLabel[o.status],o.amount||0]);
  const csv = [header,...rows].map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff"+csv], {type:"text/csv;charset=utf-8"});
  const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="belle-transport-commandes.csv"; a.click();
  URL.revokeObjectURL(a.href);
};
render();
