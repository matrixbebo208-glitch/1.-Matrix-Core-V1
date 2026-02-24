// 1. البيانات والتحميل
let products = JSON.parse(localStorage.getItem('matrix_p')) || [];
let pendingOrders = JSON.parse(localStorage.getItem('matrix_orders')) || [];
let botBrain = JSON.parse(localStorage.getItem('matrix_bot_brain')) || {
    "مرحبا": "أهلاً بك في Matrix Electronics! كيف يمكنني مساعدتك في عالم الهاردوير اليوم؟",
    "اسعار": "يمكنك رؤية الأسعار مباشرة في المتجر، كما يمكنك التحويل بين الجنيه والدولار من الزر الطائر."
};
let cart = [];
let currency = 'EGP';
let discount = 0;
const WHATSAPP = "201224815487";
const ADMIN_PASS = "01224815487";

// 2. مطر الماتريكس (Background Animation)
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const drops = Array(Math.floor(canvas.width / 16)).fill(1);
function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff41"; ctx.font = "16px Cairo";
    drops.forEach((y, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    });
}
setInterval(drawMatrix, 50);

// 3. عرض المنتجات والتحويلات
function renderStore(data = products) {
    const display = document.getElementById('productsDisplay');
    display.innerHTML = data.map(p => `
        <div class="product-card">
            <img src="${Array.isArray(p.img) ? p.img[0] : p.img}" id="main-img-${p.id}">
            <h3>${p.n}</h3>
            <div class="price" style="color:#00ff41; font-weight:bold;">
                ${currency === 'EGP' ? p.egp.toLocaleString() + ' ج.م' : '$' + p.usd}
            </div>
            <button class="btn-action btn-cart" onclick="addToCart(${p.id})">🛒 أضف للسلة</button>
            <div style="display:flex; gap:5px; margin-top:8px;">
                <button onclick="showDetails(${p.id})" class="btn-mini">📄 مواصفات</button>
                <button onclick="shareProduct(${p.id})" class="btn-mini">🔗 مشاركة</button>
            </div>
        </div>
    `).join('');
}

function toggleCurrency() {
    currency = (currency === 'EGP') ? 'USD' : 'EGP';
    document.getElementById('currBtn').innerText = (currency === 'EGP') ? 'عرض بـ USD $' : 'عرض بـ EGP ج.م';
    renderStore();
}

// 4. نظام السلة والخصومات
function addToCart(id) {
    const item = products.find(p => p.id === id);
    if (item.stock === 'out') return alert("للأسف نفذت الكمية!");
    cart.push(item);
    updateCartUI();
}

function updateCartUI() {
    document.getElementById('cartCount').innerText = cart.length;
    const list = document.getElementById('cartItemsList');
    let subTotal = cart.reduce((s, p) => s + p.egp, 0);
    let finalTotal = subTotal - (subTotal * discount);
    
    list.innerHTML = cart.map((p, i) => `<div style="display:flex; justify-content:space-between; padding:5px; border-bottom:1px solid #222;">
        <span>${p.n}</span> <span onclick="removeFromCart(${i})" style="color:red; cursor:pointer;">❌</span>
    </div>`).join('');
    
    document.getElementById('cartTotal').innerText = finalTotal.toLocaleString() + " ج.م" + (discount > 0 ? " (خصم مفعّل)" : "");
}

function applyPromoCode() {
    const code = document.getElementById('promoInput').value;
    if (code === "Matrix10") {
        discount = 0.10; alert("تم تطبيق خصم 10%!"); updateCartUI();
    } else { alert("كود غير صحيح"); }
}

// 5. الطلب والفاتورة (WhatsApp Integration)
function checkoutWhatsApp() {
    const addr = document.getElementById('custAddress').value;
    const pay = document.getElementById('payMethod').value;
    if (!addr) return alert("العنوان مطلوب!");

    let subTotal = cart.reduce((s, p) => s + p.egp, 0);
    let finalTotal = subTotal - (subTotal * discount);
    
    let msg = `*فاتورة طلب Matrix Electronics*\n------------------\n`;
    cart.forEach((p, i) => msg += `${i+1}- ${p.n} (${window.location.origin}?id=${p.id})\n`);
    msg += `------------------\n📍 العنوان: ${addr}\n💳 الدفع: ${pay}\n💰 الإجمالي: ${finalTotal} ج.م`;

    const orderRecord = { id: Date.now(), items: cart.map(p=>p.n).join(', '), total: finalTotal, address: addr, pay, time: new Date().toLocaleString() };
    pendingOrders.push(orderRecord);
    localStorage.setItem('matrix_orders', JSON.stringify(pendingOrders));

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`);
    downloadInvoice(orderRecord);
    cart = []; updateCartUI(); togglePopup('cartPopup'); renderOrdersLog();
}

function downloadInvoice(o) {
    const content = `Matrix Electronics\nOrder ID: ${o.id}\nItems: ${o.items}\nTotal: ${o.total} EGP\nAddress: ${o.address}\nTime: ${o.time}`;
    const blob = new Blob([content], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `Invoice_${o.id}.txt`; a.click();
}

// 6. ذكاء البوت والبحث
function sendMessage() {
    const input = document.getElementById('userInput');
    let txt = input.value.trim().toLowerCase();
    if (!txt) return;
    appendChat('user', txt); input.value = '';

    if (txt === "open matrix") {
        if (prompt("Matrix Identity Verification:") === ADMIN_PASS) {
            togglePopup('adminSection'); renderAdminList(); renderOrdersLog();
        }
        return;
    }

    setTimeout(() => {
        let res = "عذراً، لم أفهم طلبك. جرب سؤالاً آخر عن التجميعات أو الأسعار.";
        for (let key in botBrain) if (txt.includes(key)) res = botBrain[key];
        products.forEach(p => { if (txt.includes(p.n.toLowerCase())) res = `المنتج ${p.n} متاح وسعره ${p.egp} ج.م.`; });
        appendChat('bot', res);
    }, 600);
}

function appendChat(role, txt) {
    const box = document.getElementById('chat-messages');
    box.innerHTML += `<div class="msg ${role}-msg">${txt}</div>`;
    box.scrollTop = box.scrollHeight;
}

// 7. إدارة الأدمن (حذف وإضافة)
function saveProduct() {
    const n = document.getElementById('pName').value;
    const egp = document.getElementById('pEGP').value;
    const files = document.getElementById('fileInput').files;
    if (!n || !egp || files.length === 0) return alert("البيانات ناقصة!");

    let images = []; let done = 0;
    for (let i = 0; i < files.length; i++) {
        const r = new FileReader();
        r.onload = (e) => {
            images.push(e.target.result); done++;
            if (done === files.length) {
                products.push({ id: Date.now(), n, egp: parseInt(egp), usd: document.getElementById('pUSD').value, d: document.getElementById('pDesc').value, img: images, stock: document.getElementById('pStock').value });
                localStorage.setItem('matrix_p', JSON.stringify(products)); location.reload();
            }
        };
        r.readAsDataURL(files[i]);
    }
}

function renderAdminList() {
    document.getElementById('adminProductsList').innerHTML = products.map(p => `
        <div style="display:flex; justify-content:space-between; background:#000; padding:10px; margin-bottom:5px; border-radius:5px;">
            <span>${p.n}</span> <button onclick="deleteProduct(${p.id})" style="color:red; background:none; border:none; cursor:pointer;">حذف</button>
        </div>`).join('');
}

function deleteProduct(id) {
    if (confirm("حذف نهائي؟")) { products = products.filter(p => p.id !== id); localStorage.setItem('matrix_p', JSON.stringify(products)); location.reload(); }
}

function renderOrdersLog() {
    document.getElementById('ordersLog').innerHTML = pendingOrders.slice().reverse().map(o => `
        <div style="background:#000; padding:15px; border-right:4px solid #00ff41; margin-bottom:10px; border-radius:10px;">
            <div>📦 طلب: ${o.id}</div>
            <div style="font-size:12px; color:gray;">${o.items}</div>
            <div style="font-size:12px; color:#00ff41;">الإجمالي: ${o.total} ج.م | ${o.time}</div>
            <button onclick="deleteOrder(${o.id})" style="background:red; color:white; border:none; margin-top:5px; padding:2px 8px; cursor:pointer;">حذف السجل</button>
        </div>`).join('');
}

function deleteOrder(id) {
    pendingOrders = pendingOrders.filter(o => o.id !== id); localStorage.setItem('matrix_orders', JSON.stringify(pendingOrders)); renderOrdersLog();
}

function trainBot() {
    const k = prompt("الكلمة:"); const v = prompt("الرد:");
    if (k && v) { botBrain[k.toLowerCase()] = v; localStorage.setItem('matrix_bot_brain', JSON.stringify(botBrain)); alert("تم التعليم!"); }
}

function togglePopup(id) { const el = document.getElementById(id); el.style.display = (el.style.display === 'block') ? 'none' : 'block'; }
function removeFromCart(i) { cart.splice(i, 1); updateCartUI(); }
function formatSystem() { if(confirm("مسح كل شيء؟")) { localStorage.clear(); location.reload(); } }
function shareProduct(id) { const link = `${window.location.origin}${window.location.pathname}?id=${id}`; navigator.clipboard.writeText(link); alert("تم نسخ رابط المنتج!"); }
function showDetails(id) { const p = products.find(i => i.id === id); alert(`مواصفات ${p.n}:\n\n${p.d}`); }

window.onload = renderStore;
