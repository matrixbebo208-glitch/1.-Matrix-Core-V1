// مصفوفات البيانات
let products = JSON.parse(localStorage.getItem('matrix_p')) || [];
let botMem = JSON.parse(localStorage.getItem('matrix_b')) || [];

// الجملة السرية: "open matrix" (مفرقة للتصعيب)
const SEC_KEY = "open matrix"; 
const ADMIN_PASS = "01224815487";

// --- نظام الشات والذكاء ---
function sendMessage() {
    const input = document.getElementById('userInput');
    let rawText = input.value.trim();
    if (!rawText) return;

    // تطهير النص من أي أكواد HTML لمنع الثغرات
    let cleanText = rawText.replace(/<\/?[^>]+(>|$)/g, "");
    
    appendMsg('user', cleanText);
    input.value = '';

    // التحقق من الجملة السرية لفتح الأدمن
    if (cleanText.toLowerCase() === SEC_KEY) {
        let p = prompt("Matrix Security: ادخل رمز الوصول الرقمي:");
        if (p === ADMIN_PASS) {
            document.getElementById('adminSection').classList.add('active-gate');
            appendMsg('bot', "تم تفعيل وضع المسؤول. اللوحة مفتوحة الآن.");
        } else {
            appendMsg('bot', "خطأ في الرمز! تم تسجيل محاولة دخول غير مصرح بها.");
        }
        return;
    }

    // منطق الردود
    setTimeout(() => {
        // 1. البحث في الذاكرة الملقنة
        const custom = botMem.find(m => cleanText.includes(m.k));
        if (custom) return appendMsg('bot', custom.r);

        // 2. تحليل الميزانية
        const budget = cleanText.match(/\d+/);
        if (budget) {
            const val = parseInt(budget[0]);
            const match = products.filter(p => p.egp <= val).sort((a,b) => b.egp - a.egp)[0];
            if (match) {
                appendMsg('bot', `بناءً على ميزانيتك، أرشح لك: ${match.n}`);
                appendMsg('bot', `السعر: ${match.egp} ج.م | المواصفات: ${match.d}`);
            } else {
                appendMsg('bot', "لا توجد تجميعات حالياً بهذا السعر، جرب ميزانية مختلفة.");
            }
        } else {
            appendMsg('bot', "أنا نظام Matrix، كيف يمكنني مساعدتك في عالم الهاردوير؟");
        }
    }, 600);
}

// --- وظائف الأدمن ---
function previewImages() {
    const preview = document.getElementById('imagePreview');
    const files = document.getElementById('fileInput').files;
    preview.innerHTML = '';
    Array.from(files).slice(0, 4).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML += `<img src="${e.target.result}" style="width:60px;height:60px;border-radius:5px;border:1px solid #00ff41">`;
        };
        reader.readAsDataURL(file);
    });
}

function saveProduct() {
    const n = document.getElementById('pName').value;
    const egp = document.getElementById('priceEGP').value;
    const files = document.getElementById('fileInput').files;

    if (!n || !egp || files.length === 0) return alert("البيانات ناقصة!");

    const reader = new FileReader();
    reader.onload = function(e) {
        products.push({
            id: Date.now(), n, d: document.getElementById('pDesc').value,
            egp: parseInt(egp), usd: document.getElementById('priceUSD').value,
            img: e.target.result
        });
        localStorage.setItem('matrix_p', JSON.stringify(products));
        alert("تم الحفظ بنجاح.");
        location.reload();
    };
    reader.readAsDataURL(files[0]);
}

function trainBot() {
    const k = document.getElementById('userKeyword').value.toLowerCase();
    const r = document.getElementById('botResponse').value;
    if (k && r) {
        botMem.push({ k, r });
        localStorage.setItem('matrix_b', JSON.stringify(botMem));
        alert("تم التلقين.");
    }
}

function closeAdmin() {
    document.getElementById('adminSection').classList.remove('active-gate');
}

function appendMsg(role, txt) {
    const box = document.getElementById('chat-messages');
    box.innerHTML += `<div class="msg ${role}-msg">${txt}</div>`;
    box.scrollTop = box.scrollHeight;
}

// تشغيل زر الإرسال وEnter
document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('userInput').addEventListener('keypress', (e) => { if(e.key==='Enter') sendMessage(); });

// عرض المنتجات في الواجهة
if (products.length > 0) {
    document.getElementById('productsDisplay').innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.img}">
            <h3>${p.n}</h3>
            <div class="price">${p.egp.toLocaleString()} EGP</div>
            <div style="opacity:0.5; font-size:12px">$${p.usd}</div>
        </div>
    `).join('');
}
