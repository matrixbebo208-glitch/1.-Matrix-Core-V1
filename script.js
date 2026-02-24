// 1. الإعدادات والبيانات الأساسية
let products = JSON.parse(localStorage.getItem('matrix_p')) || [];
let cart = [];
let currency = 'EGP';
const WHATSAPP = "201224815487";
const ADMIN_PASS = "01224815487";

// 2. محرك مطر الماتريكس (Matrix Rain)
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff41";
    ctx.font = fontSize + "px Cairo";
    drops.forEach((y, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    });
}
setInterval(drawMatrix, 50);

// 3. عرض المنتجات والبحث (Render & Search)
function renderStore(filterData = products) {
    const display = document.getElementById('productsDisplay');
    if (filterData.length === 0) {
        display.innerHTML = `<p style="color:gray">لا توجد نتائج تطابق بحثك في نظام Matrix...</p>`;
        return;
    }
    display.innerHTML = filterData.map(p => `
        <div class="product-card ${p.stock === 'out' ? 'sold-out' : ''}">
            ${p.stock === 'out' ? '<span class="sold-out-tag">نفذت</span>' : ''}
            <img src="${p.img}">
            <h3>${p.n}</h3>
            <div class="price">${currency === 'EGP' ? p.egp.toLocaleString() + ' ج.م' : '$' + p.usd}</div>
            <div style="display:flex; gap:5px; margin-top:10px;">
                <button class="btn-action btn-cart" onclick="addToCart(${p.id})" style="flex:2">🛒 أضف للسلة</button>
                <button class="btn-action btn-compare" onclick="prepareCompare(${p.id})" style="flex:1">⚖️</button>
            </div>
            <div onclick="shareProduct(${p.id})" style="cursor:pointer; font-size:11px; color:#888; margin-top:8px;">🔗 نسخ الرابط</div>
        </div>
    `).join('');
}

function searchProducts() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => p.n.toLowerCase().includes(term) || p.d.toLowerCase().includes(term));
    renderStore(filtered);
}

// 4. نظام السلة (Shopping Cart)
function addToCart(id) {
    const item = products.find(p => p.id === id);
    if (item.stock === 'out') return alert("هذا المنتج غير متوفر حالياً");
    cart.push(item);
    updateCartUI();
    logActivity(`تمت إضافة [${item.n}] للسلة`);
}

function updateCartUI() {
    document.getElementById('cartCount').innerText = cart.length;
    const list = document.getElementById('cartItemsList');
    let total = 0;
    list.innerHTML = cart.map((item, index) => {
        total += item.egp;
        return `<div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:14px;">
            <span>${item.n}</span>
            <span style="color:red; cursor:pointer" onclick="removeFromCart(${index})">حذف</span>
        </div>`;
    }).join('');
    document.getElementById('cartTotal').innerText = total.toLocaleString() + " EGP";
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function checkoutWhatsApp() {
    if (cart.length === 0) return alert("السلة فارغة!");
    let msg = "مرحباً Matrix Electronics، أريد طلب الآتي:\n";
    cart.forEach((item, i) => msg += `${i+1}- ${item.n} (${item.egp} ج.م)\n`);
    const total = cart.reduce((sum, item) => sum + item.egp, 0);
    msg += `\nالإجمالي: ${total} ج.م`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`);
    logActivity(`طلب جديد بقيمة ${total} ج.م`);
}

// 5. المقارنة ومشاركة الروابط
let compArray = [];
function prepareCompare(id) {
    const item = products.find(p => p.id === id);
    if (compArray.length >= 2) compArray.shift();
    compArray.push(item);
    if (compArray.length === 2) {
        togglePopup('comparePopup');
        document.getElementById('compareTableContent').innerHTML = `
            <table>
                <tr><th>المواصفات</th><th>${compArray[0].n}</th><th>${compArray[1].n}</th></tr>
                <tr><td>السعر</td><td>${compArray[0].egp} ج.م</td><td>${compArray[1].egp} ج.م</td></tr>
                <tr><td>الوصف</td><td>${compArray[0].d}</td><td>${compArray[1].d}</td></tr>
            </table>`;
    } else { alert("اختر منتجاً آخر للمقارنة"); }
}

function shareProduct(id) {
    const link = window.location.origin + window.location.pathname + "?id=" + id;
    navigator.clipboard.writeText(link);
    alert("تم نسخ الرابط المباشر للمنتج!");
}

// 6. لوحة التحكم والشات
function sendMessage() {
    const input = document.getElementById('userInput');
    let txt = input.value.trim().toLowerCase();
    if (!txt) return;
    
    appendChat('user', txt);
    input.value = '';

    if (txt === "open matrix") {
        if (prompt("Matrix Identity Verification:") === ADMIN_PASS) {
            togglePopup('adminSection');
        }
        return;
    }
    // تحليل ميزانية سريع
    setTimeout(() => {
        const budget = txt.match(/\d+/);
        if (budget) {
            const match = products.filter(p => p.egp <= parseInt(budget[0])).sort((a,b) => b.egp - a.egp)[0];
            if (match) appendChat('bot', `أرشح لك تجميعة [${match.n}] بسعر ${match.egp} ج.م`);
            else appendChat('bot', "لا توجد نتائج لميزانيتك حالياً.");
        } else { appendChat('bot', "أنا نظام Matrix الذكي، كيف أخدمك؟"); }
    }, 600);
}

// 7. وظائف الأدمن
function saveProduct() {
    const n = document.getElementById('pName').value;
    const egp = document.getElementById('pEGP').value;
    const files = document.getElementById('fileInput').files;
    if (!n || !egp || !files[0]) return alert("البيانات ناقصة!");

    const reader = new FileReader();
    reader.onload = (e) => {
        products.push({
            id: Date.now(), n, d: document.getElementById('pDesc').value,
            egp: parseInt(egp), usd: document.getElementById('pUSD').value,
            img: e.target.result, stock: document.getElementById('pStock').value
        });
        localStorage.setItem('matrix_p', JSON.stringify(products));
        location.reload();
    };
    reader.readAsDataURL(files[0]);
}

// وظائف عامة
function togglePopup(id) {
    const el = document.getElementById(id);
    el.style.display = (el.style.display === 'block') ? 'none' : 'block';
}
function toggleCurrency() {
    currency = (currency === 'EGP') ? 'USD' : 'EGP';
    document.getElementById('currBtn').innerText = (currency === 'EGP') ? 'تبديل لـ $' : 'تبديل لـ ج.م';
    renderStore();
}
function logActivity(msg) {
    const log = document.getElementById('ordersLog');
    log.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}<br>` + log.innerHTML;
}
function appendChat(role, txt) {
    const msgBox = document.getElementById('chat-messages');
    msgBox.innerHTML += `<div class="msg ${role}-msg">${txt}</div>`;
    msgBox.scrollTop = msgBox.scrollHeight;
}
function closeAdmin() { document.getElementById('adminSection').style.display = 'none'; }

// فحص روابط المشاركة
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pId = urlParams.get('id');
    if (pId) {
        const p = products.find(x => x.id == pId);
        if (p) alert(`عرض خاص لمنتج: ${p.n}\nالسعر: ${p.egp} ج.م`);
    }
    renderStore();
};
