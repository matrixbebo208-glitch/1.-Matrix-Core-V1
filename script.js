// مصفوفات تخزين البيانات (تحميل من الذاكرة المحلية)
let products = JSON.parse(localStorage.getItem('matrix_products')) || [];
let botInstructions = JSON.parse(localStorage.getItem('matrix_training')) || [];

// --- وظائف لوحة الأدمن ---

// 1. عرض معاينة الصور عند اختيارها
function previewImages() {
    const preview = document.getElementById('imagePreview');
    const files = document.getElementById('fileInput').files;
    preview.innerHTML = '';
    
    Array.from(files).slice(0, 4).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '70px';
            img.style.height = '70px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '5px';
            img.style.border = '1px solid #00ff41';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

// 2. حفظ المنتج الجديد
function saveProduct() {
    const name = document.getElementById('pName').value;
    const desc = document.getElementById('pDesc').value;
    const egp = document.getElementById('priceEGP').value;
    const usd = document.getElementById('priceUSD').value;
    const files = document.getElementById('fileInput').files;

    if (!name || !egp || files.length === 0) {
        alert("برجاء إدخال الاسم والسعر وصورة واحدة على الأقل");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const newProduct = {
            id: Date.now(),
            name: name,
            desc: desc,
            priceEGP: parseInt(egp),
            priceUSD: usd,
            image: e.target.result // يحفظ الصورة الأولى كصورة أساسية
        };

        products.push(newProduct);
        localStorage.setItem('matrix_products', JSON.stringify(products));
        alert("تم نشر التجميعة في Matrix بنجاح!");
        location.reload();
    };
    reader.readAsDataURL(files[0]);
}

// 3. تدريب البوت
function trainBot() {
    const key = document.getElementById('userKeyword').value.trim().toLowerCase();
    const res = document.getElementById('botResponse').value.trim();

    if (key && res) {
        botInstructions.push({ key, res });
        localStorage.setItem('matrix_training', JSON.stringify(botInstructions));
        alert("تم تحديث ذاكرة Matrix AI");
        document.getElementById('userKeyword').value = '';
        document.getElementById('botResponse').value = '';
    }
}

// --- وظائف المتجر والشات بوت ---

// 1. عرض المنتجات في الصفحة الرئيسية
if (document.getElementById('productsDisplay')) {
    const display = document.getElementById('productsDisplay');
    if (products.length === 0) {
        display.innerHTML = '<p style="color: gray;">لا توجد تجميعات معروضة حالياً. ادخل للأدمن وأضف أول تجميعة!</p>';
    } else {
        display.innerHTML = products.map(p => `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}">
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p style="font-size: 13px; color: #888;">${p.desc.substring(0, 50)}...</p>
                    <div class="price">${p.priceEGP.toLocaleString()} <span style="font-size:12px">EGP</span></div>
                    <div style="opacity: 0.6; font-size: 14px;">$${p.priceUSD}</div>
                </div>
            </div>
        `).join('');
    }
}

// 2. إرسال رسالة في الشات
function sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim().toLowerCase();
    if (!text) return;

    appendMessage('user', text);
    input.value = '';

    setTimeout(() => {
        // أ- البحث في التدريبات المخصصة
        const customMatch = botInstructions.find(i => text.includes(i.key));
        if (customMatch) {
            appendMessage('bot', customMatch.res);
            return;
        }

        // ب- البحث عن ميزانية (أرقام)
        const budgetMatch = text.match(/\d+/);
        if (budgetMatch) {
            const budget = parseInt(budgetMatch[0]);
            const match = products
                .filter(p => p.priceEGP <= budget)
                .sort((a, b) => b.priceEGP - a.priceEGP)[0];

            if (match) {
                appendMessage('bot', `بناءً على ميزانيتك، أرشح لك تجميعة: ${match.name}`);
                appendMessage('bot', `السعر: ${match.priceEGP} ج.م. المواصفات: ${match.desc}`);
            } else {
                appendMessage('bot', "للأسف لا توجد تجميعات بهذا السعر حالياً، جرب زيادة الميزانية قليلاً.");
            }
        } else {
            appendMessage('bot', "أنا هنا لمساعدتك! قولي ميزانيتك كام أو اسأل عن (الضمان، الشحن، أو مكان المحل).");
        }
    }, 700);
}

function appendMessage(role, text) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `msg ${role === 'user' ? 'user-msg' : 'bot-msg'}`;
    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// تشغيل الإرسال عند الضغط على Enter
if (document.getElementById('userInput')) {
    document.getElementById('userInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
}
