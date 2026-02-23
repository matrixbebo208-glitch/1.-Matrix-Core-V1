// مصفوفة لتخزين المنتجات (بيتم تحميلها من المتصفح)
let products = JSON.parse(localStorage.getItem('matrix_products')) || [];

// --- الجزء الخاص بالأدمن (حفظ المنتج) ---
function saveProduct() {
    const name = document.getElementById('pName').value;
    const desc = document.getElementById('pDesc').value;
    const egp = parseFloat(document.getElementById('priceEGP').value);
    const usd = parseFloat(document.getElementById('priceUSD').value);
    const imageFiles = document.getElementById('fileInput').files;

    if (!name || !egp || imageFiles.length === 0) {
        alert("تأكد من إدخال الاسم، السعر، وصورة واحدة على الأقل.");
        return;
    }

    // تحويل الصور لروابط نصية (DataURL) عشان تتحفظ في المتصفح
    const reader = new FileReader();
    reader.onload = function(e) {
        const newProduct = {
            id: Date.now(),
            name: name,
            description: desc,
            priceEGP: egp,
            priceUSD: usd,
            image: e.target.result // الصورة الأولى كصورة أساسية
        };

        products.push(newProduct);
        localStorage.setItem('matrix_products', JSON.stringify(products));
        alert("تم نشر المنتج بنجاح في Matrix!");
        window.location.href = 'index.html'; // العودة للمتجر
    };
    reader.readAsDataURL(imageFiles[0]); 
}

// --- الجزء الخاص بالشات بوت (Matrix AI) ---
function sendMessage() {
    const inputField = document.getElementById('userInput');
    const message = inputField.value.trim();
    if (!message) return;

    appendMessage('user', message);
    inputField.value = '';

    // تحليل الميزانية من نص الرسالة
    const budgetMatch = message.match(/\d+/); // بيستخرج أول رقم من الجملة
    
    setTimeout(() => {
        if (budgetMatch) {
            const userBudget = parseInt(budgetMatch[0]);
            findBestSetup(userBudget);
        } else {
            appendMessage('bot', "من فضلك قولي ميزانيتك كام بالظبط عشان أقدر أرشحلك أفضل تجميعة.");
        }
    }, 800);
}

function appendMessage(role, text) {
    const chatMessages = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${role === 'user' ? 'user-msg' : 'bot-msg'}`;
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// وظيفة البحث عن تجميعة تناسب الميزانية
function findBestSetup(budget) {
    // فلترة المنتجات اللي سعرها أقل من أو يساوي الميزانية
    const affordable = products.filter(p => p.priceEGP <= budget);

    if (affordable.length > 0) {
        // ترتيبهم من الأغلى للأرخص (عشان نجيب أقرب حاجة لميزانيته)
        affordable.sort((a, b) => b.priceEGP - a.priceEGP);
        const best = affordable[0];

        appendMessage('bot', `بناءً على ميزانيتك (${budget} ج.م)، أرشح لك: ${best.name}`);
        appendMessage('bot', `المواصفات: ${best.description} \n السعر: ${best.priceEGP} ج.م / $${best.priceUSD}`);
    } else {
        appendMessage('bot', "للأسف، لا يوجد تجميعة حالياً في Matrix بهذا السعر. جرب ميزانية أعلى قليلاً.");
    }
}

// --- الجزء الخاص بعرض المنتجات في الصفحة الرئيسية ---
if (document.getElementById('productsDisplay')) {
    const display = document.getElementById('productsDisplay');
    if (products.length === 0) {
        display.innerHTML = '<p style="color: gray;">لا توجد منتجات معروضة حالياً.</p>';
    } else {
        display.innerHTML = products.map(p => `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}">
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p>${p.description.substring(0, 100)}...</p>
                    <div class="price">${p.priceEGP} <span class="currency">EGP</span></div>
                    <div class="price" style="font-size: 14px; opacity: 0.7;">$${p.priceUSD}</div>
                </div>
            </div>
        `).join('');
    }
}
