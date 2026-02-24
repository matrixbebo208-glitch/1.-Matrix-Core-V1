<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matrix Electronics | الإصدار الآمن</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body oncontextmenu="return false;" onkeydown="if(event.keyCode==123) return false;">

    <canvas id="matrix-canvas"></canvas>

    <div id="cart-icon" onclick="togglePopup('cartPopup')">🛒 السلة (<span id="cartCount">0</span>)</div>
    <div class="currency-btn" id="currBtn" onclick="toggleCurrency()">عرض بـ USD $</div>

    <header>
        <div class="logo">MATRIX ELECTRONICS</div>
        <div class="search-bar">
            <input type="text" id="searchInput" placeholder="ابحث في قاعدة بيانات الماتريكس..." oninput="searchProducts()">
        </div>
    </header>

    <div class="container">
        <div class="products-grid" id="productsDisplay"></div>
    </div>

    <div id="cartPopup" class="overlay">
        <div class="popup-content">
            <span class="close-btn" onclick="togglePopup('cartPopup')">✖ إغلاق</span>
            <h2 style="color:var(--main-green)">فاتورة الشراء</h2>
            
            <div id="cartItemsList"></div>
            
            <div style="background:#111; padding:15px; border-radius:12px; margin-top:15px; border:1px solid #222;">
                <h4 style="margin-top:0;">بيانات التوصيل والدفع:</h4>
                <input type="text" id="custAddress" placeholder="عنوانك بالتفصيل (محافظة/مدينة/شارع)..." style="width:100%; margin-bottom:10px; height:45px; padding:10px; background:#000; border:1px solid #333; color:white;">
                
                <select id="payMethod" style="width:100%; height:45px; background:#000; color:white; border:1px solid #333; margin-bottom:10px;">
                    <option value="كاش عند الاستلام">كاش عند الاستلام</option>
                    <option value="فودافون كاش (محفظة)">فودافون كاش (محفظة)</option>
                    <option value="تحويل بنكي">تحويل بنكي مباشر</option>
                </select>

                <div style="display:flex; gap:5px;">
                    <input type="text" id="promoInput" placeholder="كود الخصم" style="flex:1; background:#000; border:1px solid #333; color:white; padding:10px;">
                    <button onclick="applyPromoCode()" style="background:var(--main-green); border:none; padding:0 15px; cursor:pointer; font-weight:bold; border-radius:5px;">تطبيق</button>
                </div>
            </div>

            <div style="margin-top:15px; font-size:1.2rem;">
                الإجمالي النهائي: <span id="cartTotal" style="color:var(--main-green)">0</span>
            </div>
            
            <button class="btn-action btn-buy" onclick="checkoutWhatsApp()" style="height:60px; font-size:1.3rem;">تأكيد الطلب عبر واتساب 🚀</button>
        </div>
    </div>

    <div id="adminSection" class="overlay">
        <div class="popup-content" style="max-width:1000px;">
            <span class="close-btn" onclick="togglePopup('adminSection')">✖ خروج آمن</span>
            <h1 style="color:var(--main-green); text-align:center; border-bottom:1px solid #333; padding-bottom:10px;">MATRIX COMMAND CENTER</h1>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px;">
                
                <div class="admin-card">
                    <h3 style="color:var(--main-green)">➕ إضافة منتج جديد</h3>
                    <input type="file" id="fileInput" multiple accept="image/*">
                    <input type="text" id="pName" placeholder="اسم المنتج/التجميعة">
                    <textarea id="pDesc" placeholder="المواصفات الفنية كاملة..."></textarea>
                    <div style="display:flex; gap:10px;">
                        <input type="number" id="pEGP" placeholder="EGP">
                        <input type="number" id="pUSD" placeholder="USD">
                    </div>
                    <select id="pStock">
                        <option value="in">متوفر في المخزن</option>
                        <option value="out">نفذت الكمية</option>
                    </select>
                    <button class="btn-action btn-cart" onclick="saveProduct()">نشر المنتج في المتجر</button>
                </div>

                <div class="admin-card">
                    <h3 style="color:#0080ff">🤖 تدريب Matrix AI</h3>
                    <p style="font-size:11px; color:gray;">علم البوت كيف يرد على الكلمات المفتاحية.</p>
                    <button class="btn-action" style="background:#0080ff; color:white;" onclick="trainBot()">إضافة رد ذكي جديد</button>
                    
                    <h3 style="margin-top:25px; color:#ff3333;">🗑️ إدارة وحذف المحتوى</h3>
                    <div id="adminProductsList" style="max-height:250px; overflow-y:auto; border:1px solid #222; padding:5px; border-radius:5px;">
                        </div>
                </div>
            </div>

            <div class="admin-card" style="margin-top:25px;">
                <h3 style="color:var(--order-gold)">📊 سجل الطلبات والتحليلات المعلقة</h3>
                <div id="ordersLog"></div>
            </div>
            
            <button onclick="formatSystem()" style="width:100%; margin-top:20px; background:none; border:1px solid #333; color:#444; cursor:pointer; padding:10px;">تصفير بيانات النظام بالكامل</button>
        </div>
    </div>

    <div id="chat-widget">
        <div class="chat-header">Matrix AI Support</div>
        <div id="chat-messages"></div>
        <div class="chat-input">
            <input type="text" id="userInput" placeholder="اكتب 'open matrix' للإدارة...">
            <button onclick="sendMessage()">ارسل</button>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
