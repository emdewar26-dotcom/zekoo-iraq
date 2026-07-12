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

            container.innerHTML += `
            <div class="card">

                <img src="${p.img}" alt="${p.title}">

                <h3>${p.title}</h3>

                <p>💰 السعر : ${p.price} د.ع</p>

                <p>📏 المقاسات : ${p.sizes || "S - M - L - XL"}</p>

                <p>🎨 الألوان : ${p.colors || "أسود - أبيض"}</p>

                <button onclick="addToCart('${p.title}', ${p.price})">
                🛒 إضافة إلى السلة
                </button>

                <a
                href="https://wa.me/9647732155557?text=${encodeURIComponent("السلام عليكم، أريد طلب " + p.title)}"
                target="_blank"
                style="
                display:block;
                margin:12px;
                background:#25D366;
                color:white;
                text-decoration:none;
                padding:12px;
                border-radius:10px;
                text-align:center;
                font-weight:bold;
                ">
                💬 اطلب عبر واتساب
                </a>

            </div>
            `;
        });

    });
};

// إضافة منتج
window.addProduct = async () => {

    const file = document.getElementById("p-img-file").files[0];

    if (!file) {
        alert("اختر صورة أولاً");
        return;
    }

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

window.addToCart = (title, price) => {

    cart.push({
        title,
        price
    });

    updateCartUI();

};

window.updateCartUI = () => {

    const items = document.getElementById("cart-items");

    items.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

        total += Number(item.price);

        items.innerHTML += `
        <div style="
        background:#222;
        margin:10px 0;
        padding:10px;
        border-radius:8px;">
        ${item.title}
        <br>
        ${item.price} د.ع
        </div>
        `;

    });

    document.getElementById("cart-total").innerText =
    "المجموع : " + total + " د.ع";

};

// إرسال الطلب

window.sendOrder = () => {

    if (cart.length === 0) {

        alert("السلة فارغة");

        return;

    }

    let message = "🛍️ طلب جديد%0A%0A";

    let total = 0;

    cart.forEach(item => {

        total += Number(item.price);

        message += `• ${item.title} - ${item.price} د.ع%0A`;

    });

    message += `%0A💰 المجموع : ${total} د.ع`;

    window.open(
        "https://wa.me/9647732155557?text=" + message,
        "_blank"
    );

};

document.addEventListener("DOMContentLoaded", loadProducts);
