// ==============================
// CARRINHO (PERSISTENTE)
// ==============================
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function clearCart() {
  cart = [];
  localStorage.removeItem('cart');
  updateUI();
}

// ==============================
// NAVEGAÇÃO
// ==============================
function scrollToCategory(id) {
  const element = document.getElementById(id);
  window.scrollTo({ top: element.offsetTop - 110, behavior: "smooth" });
}

// ==============================
// MODAIS
// ==============================
function openPizzaModal() {
  document.getElementById('pizzaModal').style.display = 'flex';
}

function closePizzaModal() {
  document.getElementById('pizzaModal').style.display = 'none';
}

function openCart() {
  const list = document.getElementById('cartList');
  let total = 0;
  list.innerHTML = '';

  cart.forEach(item => {
    total += item.price * item.quantity;

    list.innerHTML += `
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        margin-bottom:15px;
        padding: 0 15px;
      ">
        <div style="display:flex;flex-direction:column;">
          <div style="font-weight:600; font-size:14px;">
            ${item.name}
          </div>
          <div style="color:#777; font-size:12px;">
            ${item.quantity}x R$ ${item.price.toFixed(2)}
          </div>
        </div>

        <div style="font-weight:600;">
          R$ ${(item.price * item.quantity).toFixed(2)}
        </div>
      </div>
    `;
  });

  document.getElementById('cartTotal').innerText = `R$ ${total.toFixed(2)}`;
  document.getElementById('cartModal').style.display = 'flex';
}

function closeCart() {
  document.getElementById('cartModal').style.display = 'none';
}

// ==============================
// ADIÇÃO DE ITENS
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
}


// Remover ou Decrementar
function removeItem(name) {
  const index = cart.findIndex(item => item.name === name);
  
  if (index > -1) {
    if (cart[index].quantity > 1) {
      cart[index].quantity--; // Diminui a quantidade
    } else {
      cart.splice(index, 1); // Remove o item se chegar a zero
    }
  }
  
  saveCart(); // Atualiza o LocalStorage
  updateUI();
  openCart(); // Recarrega a lista visual do carrinho
}

// Renderizar a lista na Sacola
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

  document.getElementById('cartModal').style.display = 'flex';
}

// Persistência (LocalStorage)
function saveCart() {
  localStorage.setItem('carrinho_bv', JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem('carrinho_bv');
  if (saved) {
    cart = JSON.parse(saved);
    updateUI();
  }
}

// Chame loadCart ao carregar a página
window.onload = function() {
  loadCart();
  updateUI();
};


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
// UI (CONTADOR + TOTAL)
// ==============================
function updateUI() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  document.getElementById('cart-count').innerText = count;
  document.getElementById('cart-total-footer').innerText = `R$ ${total.toFixed(2)}`;
  document.querySelector('footer').style.display = count > 0 ? 'block' : 'none';
}

// Função para mostrar/esconder o campo de troco
function toggleTroco() {
  const method = document.getElementById('paymentMethod').value;
  const trocoDiv = document.getElementById('trocoContainer');
  trocoDiv.style.display = (method === "Dinheiro") ? "block" : "none";
}

// ATUALIZAÇÃO DA FUNÇÃO SEND WHATSAPP
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
    document.getElementById('paymentMethod').focus(); // Dá foco no campo para o usuário ver
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

  let total = 0;
  cart.forEach(item => {
    texto += `• ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2)})\n`;
    total += item.price * item.quantity;
  });

  texto += `\n------------------------------\n`;
  texto += `💰 *TOTAL: R$ ${total.toFixed(2)}*\n`;
  texto += `------------------------------\n`;
  texto += `_Pedido enviado via Cardápio Digital_`;

  const phone = "5571992471530";
  const link = `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;
  
  window.open(link, '_blank');


// 2. LIMPA O CARRINHO (Adicione estas linhas abaixo)
  cart = []; // Esvazia a lista de itens
  localStorage.removeItem('carrinho_bv'); // Remove o carrinho do localStorage
  
  updateUI();            // Atualiza a interface (zera o contador e esconde o footer)
  closeCart();           // Fecha o modal do carrinho
}


// ==============================
// CARGA INICIAL
// ==============================
window.onload = updateUI;
