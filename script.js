const cartTotalEl = document.getElementById('cartTotal');
const catalog = document.getElementById('catalog');
const cartEl = document.getElementById('cart');

const API_URL = 'https://fakestoreapi.com/products';
const STORAGE_KEY = 'shop-cart';

async function fetchProducts() {
    try {
        const res = await fetch(API_URL);

        if (!res.ok) {
            throw new Error('Произошла ошибка');
        }

        const products = await res.json();
        return products;
    } catch (error) {
        console.log('Ошибка', error);
        return [];
    }
}

function renderCatalog(products) {
    if (!products.length) {
        catalog.innerHTML = '<p>Нет товаров для отображения</p>';
        return;
    }

    catalog.innerHTML = products.map(product => `
        <div class="product">
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            <p>Цена: $${product.price}</p>
            <button class="cart__btn" data-id="${product.id}">Добавить в корзину</button>
        </div>
    `).join('');
}

let cart = [];

let allProducts = [];


function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);

    if (!product) return;

    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    renderCart();

    saveCart(); // сделаем чуть позже, сохранять корзину в localStorage
}

const cartList = document.querySelector('.cart__list');

function renderCart() {
    if (!cart.length) {
        cartList.innerHTML = '<li>Корзина пуста</li>';
        cartTotalEl.textContent = '0';
        return;
    }

    cartList.innerHTML = cart.map(item => `
        <li>
            ${item.title} - $${item.price} x ${item.quantity}
            <button class="remove-btn" data-id="${item.id}">Удалить</button>
        </li>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotalEl.textContent = total.toFixed(2);
}

catalog.addEventListener('click', (e) => {
    const button = e.target.closest('.cart__btn');

    if (!button) return;

    const productId = parseInt(button.dataset.id, 10);
    addToCart(productId);
});

cartList.addEventListener('click', (e) => {
    const removeButton = e.target.closest('.remove-btn');
    if (!removeButton) return;

    const productId = parseInt(removeButton.dataset.id);
    removeFromCart(productId);
});

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
    saveCart(); // сохраняем изменения в localStorage
}

const cartClearEl = document.getElementById('cartClear');

cartClearEl.addEventListener('click', () => {
    cart = [];
    renderCart();
    saveCart(); // сохраняем изменения в localStorage
});

function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    if (!savedCart) return;

    try {
        cart = JSON.parse(savedCart);
    } catch (error) {
        console.log('Ошибка при загрузке корзины', error);
        cart = [];
    }
}


async function init() {
    loadCart();
    allProducts = await fetchProducts();
    renderCatalog(allProducts);
    renderCart();
}

init();
