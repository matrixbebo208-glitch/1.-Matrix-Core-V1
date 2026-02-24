// 1. التهيئة والبيانات
let products = JSON.parse(localStorage.getItem('matrix_p')) || [];
let pendingOrders = JSON.parse(localStorage.getItem('matrix_orders')) || [];
let botBrain = JSON.parse(localStorage.getItem('matrix_bot_brain')) || { "مرحبا": "أهلاً بك في ماتريكس! كيف أخدمك اليوم؟" };
let cart = [];
let currency = 'EGP';
let discount = 0;
const WHATSAPP = "201224815487";
const ADMIN_PASS = "01224815487";

// 2. محرك الخلفيات (Matrix, Gold, Streaming)
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
let matrixInterval;
let currentTheme = 'matrix';
const drops = Array(Math.floor(window.innerWidth / 16)).fill(1);

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = (currentTheme === 'gold') ? "#ffcc00" : "#00ff41";
    ctx.font = "16px Cairo";
    drops.forEach((y, i) => {
        const text = "01"[Math.floor(Math.random() * 2)];
        ctx.fillText(text, i * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    });
}

function changeTheme(theme) {
    currentTheme = theme;
    document.body.className = ''; 
    canvas.style.display = (theme === 'stream') ? 'none' : 'block';
    if (theme === 'stream') document.body.classList.add('theme-streaming');
    if (theme === 'gold') document.body.classList.add('theme-gold');
}
matrixInterval = setInterval(drawMatrix, 50);

// 3. عرض المنتجات (مع زر الحذف للأدمن)
function renderStore() {
    const display = document.getElementById('productsDisplay');
    display.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${Array.isArray(p.img) ? p.img[0] : p.img}">
            <h3>${p.n}</h3>
            <div style="color:var(--main-green); font-weight:bold; margin-bottom:10px;">
                ${currency === 'EGP' ? p.egp.toLocaleString() + ' ج.م' : '$' + p.usd}
            </div>
            <button class="btn-action btn-cart" onclick="addToCart(${p.id})">🛒 أضف للسلة</button>
        </div>
    `).join('');
    renderAdminList(); // تحديث قائمة الحذف في الإدارة تلقائياً
}

// 4. نظام الحذف الفوري والباركود (Admin Logic)
function renderAdminList() {
    const list = document.getElementById('adminProductsList');
    list.innerHTML = products.map(p => `
        <div class="delete-item">
            <span>${p.n}</span>
            <button class="delete-btn" onclick="deleteProduct(${p.id})">حذف 🗑️</button>
        </div>
    `).join('');
    
    // توليد الباركود للمتجر
    document.getElementById('qrcode').innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
        text: window.location.href,
        width: 128, height: 128
    });
}

function deleteProduct(id) {
    if (confirm("هل أنت متأكد من مسح هذا المنتج نهائياً من العرض؟")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('matrix_p', JSON.stringify(products));
        renderStore();
    }
}

// 5. نظام الشات العائم
function openChat(e) {
    const widget = document.getElementById('chat-widget');
    if (!widget.classList.contains('open')) widget.classList.add('open');
}

function closeChat(e) {
    e.stopPropagation();
    document.getElementById('chat-widget').classList.remove('open');
}

function sendMessage() {
    const input = document.getElementById('userInput');
    let txt = input.value.trim().toLowerCase();
    if (!txt) return;
    appendChat('user', txt);
    input.value = '';

    if (txt === ADMIN_PASS || txt === "open matrix") {
        togglePopup('adminSection');
        return;
    }

    setTimeout(() => {
        let res = "نظام Matrix AI معك.. كيف نطور جهازك اليوم؟";
        for (let key in botBrain) if (txt.includes(key)) res = botBrain[key];
        appendChat('bot', res);
    }, 600);
}

function appendChat(role, txt) {
    const box = document.getElementById('chat-messages');
    box.innerHTML += `<div style="margin-bottom:10px; padding:8px; border-radius:5px; background:${role==='user'?'var(--main-green)':'#222'}; color:${role==='user'?'black':'white'};">${txt}</div>`;
    box.scrollTop = box.scrollHeight;
}

// 6. السلة والخصومات والطلب
function addToCart(id) {
    const item = products.find(p => p.id === id);
    cart.push(item);
    updateCartUI();
}

function updateCartUI() {
    document.getElementById('cartCount').innerText = cart.length;
    let total = cart.reduce((s, p) => s + p.egp, 0);
    let finalTotal = total - (total * discount);
    document.getElementById('cartItemsList').innerHTML = cart.map(p => `<div style="padding:5px; border-bottom:1px solid #222;">${p.n}</div>`).join('');
    document.getElementById('cartTotal').innerText = finalTotal.toLocaleString() + " ج.م";
}

function applyPromoCode() {
    const code = document.getElementById('promoInput').value;
    if (code === "Matrix10") {
        discount = 0.10; alert("تم تفعيل خصم 10%!"); updateCartUI();
    } else { alert("كود الخصم غير صحيح"); }
}

function checkoutWhatsApp() {
    const addr = document.getElementById('custAddress').value;
    if (!addr) return alert("من فضلك أدخل العنوان!");
    let msg = `*طلب جديد من Matrix*\nالعنوان: ${addr}\nالأصناف:\n` + cart.map(p=>`- ${p.n}`).join('\n');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`);
}

// 7. إدارة الإضافة والبوب آب
function saveProduct() {
    const n = document.getElementById('pName').value;
    const egp = document.getElementById('pEGP').value;
    const file = document.getElementById('fileInput').files[0];
    if (!n || !egp || !file) return alert("أكمل البيانات!");

    const reader = new FileReader();
    reader.onload = (e) => {
        products.push({ id: Date.now(), n, egp: parseInt(egp), usd: document.getElementById('pUSD').value, img: e.target.result });
        localStorage.setItem('matrix_p', JSON.stringify(products));
        renderStore();
        alert("تم النشر!");
    };
    reader.readAsDataURL(file);
}

function togglePopup(id) {
    const el = document.getElementById(id);
    el.style.display = (el.style.display === 'block') ? 'none' : 'block';
}

function toggleCurrency() {
    currency = (currency === 'EGP') ? 'USD' : 'EGP';
    document.getElementById('currBtn').innerText = currency;
    renderStore();
}

window.onload = renderStore;
