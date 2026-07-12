import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyARvU5QdapKBkt2fNoxwvPeguLdheQnkUM",
  authDomain: "zekoo-iraq.firebaseapp.com",
  projectId: "zekoo-iraq",
  storageBucket: "zekoo-iraq.firebasestorage.app",
  messagingSenderId: "651541279060",
  appId: "1:651541279060:web:66bad656aacdcc3ab098c1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

window.cart = [];

// عرض المنتجات
window.loadProducts = function () {
    onSnapshot(collection(db, "products"), (snapshot) => {
        const container = document.getElementById("products-container");
        container.innerHTML = "";
        snapshot.forEach((doc) => {
            const p = doc.data();
            const docId = doc.id;
            
            // تحويل السلاسل إلى مصفوفات
            const sizes = p.sizes ? p.sizes.split(',') : ["S", "M", "L", "XL"];
            const colors = p.colors ? p.colors.split(',') : ["أسود", "أبيض"];

            container.innerHTML += `
            <div class="card">
                <img src="${p.img}" alt="${p.title}">
                <h3>${p.title}</h3>
                <p>💰 السعر : ${p.price} د.ع</p>
                
                <div style="padding: 0 15px;">
                    <select id="size-${docId}" style="width:45%; padding:5px;">${sizes.map(s => `<option value="${s.trim()}">${s.trim()}</option>`).join('')}</select>
                    <select id="color-${docId}" style="width:45%; padding:5px;">${colors.map(c => `<option value="${c.trim()}">${c.trim()}</option>`).join('')}</select>
                </div>

                <button onclick="addToCart('${p.title}', ${p.price}, document.getElementById('size-${docId}').value, document.getElementById('color-${docId}').value)">
                🛒 إضافة إلى السلة
                </button>
            </div>
            `;
        });
    });
};

// إضافة منتج
window.addProduct = async () => {
    const file = document.getElementById("p-img-file").files[0];
    if (!file) { alert("اختر صورة أولاً"); return; }
    const storageRef = ref(storage, "images/" + file.name);
    await uploadBytes(storageRef, file);
    const imageURL = await getDownloadURL(storageRef);
    await addDoc(collection(db, "products"), {
        title: document.getElementById("p-title").value,
        price: Number(document.getElementById("p-price").value),
        img: imageURL,
        sizes: document.getElementById("p-sizes").value,
        colors: document.getElementById("p-colors").value
    });
    alert("✅ تم إضافة المنتج");
};

// السلة
window.addToCart = (title, price, size, color) => {
    const id = Date.now();
    cart.push({ id, title, price, size, color });
    updateCartUI();
};

window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
};

window.updateCartUI = () => {
    const items = document.getElementById("cart-items");
    items.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
        total += Number(item.price);
        items.innerHTML += `
        <div style="background:#222; margin:10px 0; padding:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong>${item.title}</strong><br>
                ${item.price} د.ع | ${item.size} | ${item.color}
            </div>
            <button onclick="removeFromCart(${item.id})" style="background:red; border:none; color:white; padding:5px 10px; border-radius:5px; cursor:pointer;">X</button>
        </div>
        `;
    });
    document.getElementById("cart-total").innerText = "المجموع : " + total + " د.ع";
};

// إرسال الطلب
window.sendOrder = () => {
    if (cart.length === 0) { alert("السلة فارغة"); return; }
    let message = "🛍️ طلب جديد%0A%0A";
    let total = 0;
    cart.forEach(item => {
        total += Number(item.price);
        message += `• ${item.title} (${item.size}, ${item.color}) - ${item.price} د.ع%0A`;
    });
    message += `%0A💰 المجموع : ${total} د.ع`;
    window.open("https://wa.me/9647732155557?text=" + message, "_blank");
};

document.addEventListener("DOMContentLoaded", loadProducts);

