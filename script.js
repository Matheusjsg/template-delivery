// ==============================
// CARRINHO (PERSISTENTE)
// ==============================
let cart = JSON.parse(localStorage.getItem('carrinho_bv')) || [];

function saveCart() {
  localStorage.setItem('carrinho_bv', JSON.stringify(cart));
}

// ==============================
// NAVEGAÇÃO
// ==============================
function scrollToCategory(id) {
  const element = document.getElementById(id);
  window.scrollTo({ top: element.offsetTop - 110, behavior: "smooth" });
}

// ==============================
// GESTÃO DOS MODAIS
// ==============================
function openPizzaModal() {
  document.getElementById('pizzaModal').style.display = 'flex';
}

function closePizzaModal() {
  document.getElementById('pizzaModal').style.display = 'none';
}

function closeCart() {
  document.getElementById('cartModal').style.display = 'none';
  document.body.style.overflow = 'auto'; // Destrava o scroll quando fecha
}

// Renderizar a lista na Sacola (Usa as classes do seu CSS)
function openCart() {
  const list = document.getElementById('cartList');
  const totalEl = document.getElementById('cartTotal');
  let total = 0;
  list.innerHTML = '';

  if (cart.length === 0) {
    list.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">Sua sacola está vazia.</p>';
    totalEl.innerText = "R$ 0,00";
  } else {
    cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      
      list.innerHTML += `
        <div class="cart-item">
          <div class="cart-item-info">
            <strong>${item.name}</strong>
            <span>R$ ${item.price.toFixed(2)}</span>
          </div>
          <div class="cart-item-controls">
            <button onclick="removeItem('${item.name}')" class="btn-qty">-</button>
            <span class="qty-num">${item.quantity}</span>
            <button onclick="addItem('${item.name}', ${item.price})" class="btn-qty">+</button>
            <span class="cart-item-subtotal">R$ ${subtotal.toFixed(2)}</span>
          </div>
        </div>`;
    });
    totalEl.innerText = `R$ ${total.toFixed(2)}`;
  }
  document.body.style.overflow = 'hidden'; // Trava o scroll da página atrás do modal
  document.getElementById('cartModal').style.display = 'flex';


}

// ==============================
// LÓGICA DE ITENS
// ==============================
function addItem(name, price) {
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  saveCart();
  updateUI();
  // Se o carrinho estiver aberto, atualiza a lista visualmente
  if(document.getElementById('cartModal').style.display === 'flex') {
      openCart();
  }
}

function removeItem(name) {
  const index = cart.findIndex(item => item.name === name);
  
  if (index > -1) {
    if (cart[index].quantity > 1) {
      cart[index].quantity--;
    } else {
      cart.splice(index, 1);
    }
  }
  
  saveCart();
  updateUI();
  openCart(); // Recarrega a lista visual
}

function addPizza() {
  const rawFlavor1 = document.getElementById('flavor1').value;
  const rawFlavor2 = document.getElementById('flavor2').value;

  const [name1, price1] = rawFlavor1.split('|');
  let finalName = '';
  let finalPrice = 0;

  if (rawFlavor2 === '') {
    finalName = `Pizza Média (${name1})`;
    finalPrice = parseFloat(price1);
  } else {
    const [name2, price2] = rawFlavor2.split('|');
    finalName = `Pizza Média (${name1} / ${name2})`;
    finalPrice = Math.max(parseFloat(price1), parseFloat(price2));
  }

  addItem(finalName, finalPrice);
  closePizzaModal();
}

// ==============================
// UI E PAGAMENTO
// ==============================
function updateUI() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  document.getElementById('cart-count').innerText = count;
  document.getElementById('cart-total-footer').innerText = `R$ ${total.toFixed(2)}`;
  
  const footer = document.querySelector('footer');
  if(footer) footer.style.display = count > 0 ? 'block' : 'none';
}

function toggleTroco() {
  const method = document.getElementById('paymentMethod').value;
  const trocoDiv = document.getElementById('trocoContainer');
  trocoDiv.style.display = (method === "Dinheiro") ? "block" : "none";
}

// ==============================
// ENVIO WHATSAPP
// ==============================
function sendWhatsApp() {
  const name = document.getElementById('userName').value;
  const address = document.getElementById('userAddress').value;
  const payment = document.getElementById('paymentMethod').value;
  const troco = document.getElementById('trocoValue').value;

  if (!name || !address) {
    alert("Por favor, preencha Nome e Endereço!");
    return;
  }
  
  if (payment === "") {
    alert("Por favor, selecione uma Forma de Pagamento!");
    return;
  }

  if (cart.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  let texto = `*NOVO PEDIDO - BV CONVENIÊNCIA*\n`;
  texto += `------------------------------\n`;
  texto += `👤 *Cliente:* ${name}\n`;
  texto += `📍 *Endereço:* ${address}\n`;
  texto += `💳 *Pagamento:* ${payment}\n`;
  
  if (payment === "Dinheiro" && troco) {
    texto += `💵 *Troco para:* R$ ${troco}\n`;
  }
  
  texto += `------------------------------\n\n`;
  texto += `*ITENS DO PEDIDO:*\n`;

  let totalFinal = 0;
  cart.forEach(item => {
    texto += `• ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2)})\n`;
    totalFinal += item.price * item.quantity;
  });

  texto += `\n------------------------------\n`;
  texto += `💰 *TOTAL: R$ ${totalFinal.toFixed(2)}*\n`;
  texto += `------------------------------\n`;
  texto += `_Pedido enviado via Cardápio Digital_`;

  const phone = "5571992471530";
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(texto)}`, '_blank');

  // Limpeza após envio
  cart = [];
  localStorage.removeItem('carrinho_bv');
  updateUI();
  closeCart();
}

// ==============================
// CARGA INICIAL
// ==============================
window.onload = function() {
    updateUI();
};