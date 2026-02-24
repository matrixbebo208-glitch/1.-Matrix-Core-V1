// 1. تعريف البيانات الأساسية
let products = JSON.parse(localStorage.getItem('matrix_p')) || [];
let pendingOrders = JSON.parse(localStorage.getItem('matrix_orders')) || [];
let cart = [];
let currency = 'EGP';
const WHATSAPP = "201224815487";
const ADMIN_PASS = "01224815487";

// 2. محرك مطر الماتريكس (Background Animation)
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const drops = Array(Math.floor(canvas.width / 16)).fill(1);

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff41";
    ctx.font = "16px Cairo";
    drops.forEach((y, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    });
}
setInterval(drawMatrix, 50);

// 3. وظيفة تحويل العملة (Fix)
function toggleCurrency() {
    currency = (currency === 'EGP') ? 'USD' : 'EGP';
    document.getElementById('currBtn').innerText = (currency === 'EGP') ? 'عرض بـ USD $' : 'عرض بـ EGP ج.م';
    renderStore();
}

// 4. عرض المنتجات والبحث
function renderStore(data = products) {
    const display = document.getElementById('productsDisplay');
    display.innerHTML = data.map(p => `
        <div class="product-card ${p.stock === 'out' ? 'sold-out' : ''}">
            ${p.stock === 'out' ? '<span class="sold-out-tag" style="background:red; color:white; position:absolute; top:10px; right:10px; padding:2px 10px; border-radius:5px;">نفذت</span>' : ''}
            <img src="${p.img}">
            <h3 style="margin:10px 0;">${p.n}</h3>
            <div class="price" style="color:#00ff41; font-weight:bold; font-size:1.2rem;">
                ${currency === 'EGP' ? p.egp.toLocaleString() + ' ج.م' : '$' + p.usd}
            </div>
            <button class="btn-action btn-cart" onclick="addToCart(${p.id})">🛒 أضف للسلة</button>
        </div>
    `).join('');
}

function searchProducts() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => p.n.toLowerCase().includes(term));
    renderStore(filtered);
}

// 5. نظام السلة وتسجيل الطلبات (Analytics)
function addToCart(id) {
    const item = products.find(p => p.id === id);
    if (item.stock === 'out') return alert("المنتج غير متوفر");
    cart.push(item);
    updateCartUI();
}

function updateCartUI() {
    document.getElementById('cartCount').innerText = cart.length;
    const list = document.getElementById('cartItemsList');
    let total = 0;
    list.innerHTML = cart.map((p, i) => {
        total += p.egp;
        return `<div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #222;">
            <span>${p.n}</span>
            <span style="color:red; cursor:pointer" onclick="removeFromCart(${i})">حذف</span>
        </div>`;
    }).join('');
    document.getElementById('cartTotal').innerText = total.toLocaleString() + " ج.م";
}

function removeFromCart(i) { cart.splice(i, 1); updateCartUI(); }

function checkoutWhatsApp() {
    if (cart.length === 0) return alert("السلة فارغة");
    
    // تسجيل الطلب في التحليلات
    const order = {
        id: Date.now(),
        items: cart.map(p => p.n).join(', '),
        total: cart.reduce((s, p) => s + p.egp, 0),
        time: new Date().toLocaleString()
    };
    pendingOrders.push(order);
    localStorage.setItem('matrix_orders', JSON.stringify(pendingOrders));

    // إرسال واتساب
    let msg = `طلب جديد من Matrix:\n${order.items}\nالإجمالي: ${order.total} ج.م`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`);
    
    cart = []; updateCartUI();
    renderOrdersLog();
}

// 6. لوحة الإدارة والتحليلات
function renderOrdersLog() {
    const log = document.getElementById('ordersLog');
    log.innerHTML = pendingOrders.reverse().map(o => `
        <div class="order-row" style="background:#000; margin-bottom:10px; padding:10px; border-right:3px solid #00ff41;">
            <div style="color:#00ff41">📦 طلب رقم: ${o.id}</div>
            <div style="font-size:12px;">الأصناف: ${o.items}</div>
            <div style="font-size:12px;">الإجمالي: ${o.total} ج.م | الوقت: ${o.time}</div>
            <button onclick="deleteOrder(${o.id})" style="background:red; color:white; border:none; cursor:pointer; font-size:10px; margin-top:5px;">حذف السجل</button>
        </div>
    `).join('');
}

function deleteOrder(id) {
    pendingOrders = pendingOrders.filter(o => o.id !== id);
    localStorage.setItem('matrix_orders', JSON.stringify(pendingOrders));
    renderOrdersLog();
}

// 7. وظائف الأدمن والشات
function saveProduct() {
    const n = document.getElementById('pName').value;
    const egp = document.getElementById('pEGP').value;
    const file = document.getElementById('fileInput').files[0];

    if (!n || !egp || !file) return alert("أكمل البيانات");

    const reader = new FileReader();
    reader.onload = (e) => {
        products.push({
            id: Date.now(), n, egp: parseInt(egp), 
            usd: document.getElementById('pUSD').value,
            d: document.getElementById('pDesc').value,
            img: e.target.result, stock: document.getElementById('pStock').value
        });
        localStorage.setItem('matrix_p', JSON.stringify(products));
        location.reload();
    };
    reader.readAsDataURL(file);
}

function sendMessage() {
    const input = document.getElementById('userInput');
    let txt = input.value.trim().toLowerCase();
    if (txt === "open matrix") {
        if (prompt("Matrix Identity:") === ADMIN_PASS) {
            togglePopup('adminSection');
            renderOrdersLog();
        }
        input.value = '';
    }
}

function togglePopup(id) {
    const el = document.getElementById(id);
    el.style.display = (el.style.display === 'block') ? 'none' : 'block';
}

// التشغيل الأولي
window.onload = renderStore;
