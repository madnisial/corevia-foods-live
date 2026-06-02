window.addEventListener('load', () => {
    const loader = document.getElementById('loader-wrapper');
    if(loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 600);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    fetchMenu();
    fetchOrders(); 
    // Auto-refresh orders every 3 seconds
    setInterval(fetchOrders, 3000); 
    reveal();
});

function reveal() {
    document.querySelectorAll(".reveal").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 50) el.classList.add("active");
    });
}
window.addEventListener("scroll", reveal);

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
}

function toggleNotifPanel() {
    const panel = document.getElementById('notif-panel');
    panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
}

let orders = []; 
let dbMenu = [];
let curFulfillment = 'Pick';
let curItem = '';
let curPrice = 0;

// --- DEFAULT MENU ITEMS ---
const defaultMenu = [
    { id: 'm1', name: 'Zinger Burger', category: 'Fast Food', price: 450, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400', desc: 'Crispy chicken with secret sauce.', available: true },
    { id: 'm2', name: 'Fajita Pizza', category: 'Pizza', price: 1200, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400', desc: 'Loaded with cheese and chicken fajita.', available: true },
    { id: 'm3', name: 'Loaded Fries', category: 'Snacks', price: 350, image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=400', desc: 'Fries topped with melted cheese and jalapenos.', available: true }
];

// --- MENU LOGIC (UPDATED FOR LOCAL STORAGE) ---
function fetchMenu() {
    const storedMenu = localStorage.getItem('corevia_menu');
    if (storedMenu) {
        dbMenu = JSON.parse(storedMenu);
    } else {
        dbMenu = defaultMenu;
        localStorage.setItem('corevia_menu', JSON.stringify(dbMenu));
    }
    renderWebsiteMenu();
    renderAdminMenu();
}

function renderWebsiteMenu() {
    const container = document.getElementById('menu-grid');
    if(!container) return;
    container.innerHTML = dbMenu.filter(m => m.available).map(m => `
        <div class="menu-item-card reveal bg-slate-50 p-5 rounded-[2.5rem] border border-slate-100 flex flex-col active">
            <img src="${m.image}" class="w-full h-48 object-cover rounded-2xl mb-4">
            <h3 class="font-bold text-xl">${m.name}</h3>
            <p class="text-slate-500 text-sm mb-4 flex-grow">${m.desc}</p>
            <div class="flex justify-between items-center">
                <span class="text-orange-600 font-bold text-lg">Rs. ${m.price}</span>
                <button onclick="openOrderModal('${m.name}', ${m.price})" class="bg-white border border-slate-200 py-2 px-6 rounded-xl text-sm font-bold hover:bg-orange-600 hover:text-white transition-all">Add</button>
            </div>
        </div>
    `).join('');
}

function renderAdminMenu() {
    const list = document.getElementById('admin-menu-list');
    if(!list) return;
    list.innerHTML = dbMenu.map(m => `
        <tr class="border-b border-slate-50 hover:bg-slate-50 transition-all">
            <td class="py-4 font-bold text-slate-800">${m.name}</td>
            <td class="py-4 text-slate-500">${m.category}</td>
            <td class="py-4 font-black">Rs. ${m.price}</td>
            <td class="py-4">
                <span class="cursor-pointer px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${m.available ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}" onclick="toggleAvailability('${m.id}', ${!m.available})">${m.available ? 'In Stock' : 'Out of Stock'}</span>
            </td>
            <td class="py-4 text-left">
                <button onclick="deleteMenuItem('${m.id}')" class="w-8 h-8 bg-slate-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).reverse().join('');
}

function saveMenuItem() {
    const name = document.getElementById('m-name').value;
    const cat = document.getElementById('m-cat').value;
    const price = parseInt(document.getElementById('m-price').value);
    const img = document.getElementById('m-img').value || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400';
    const desc = document.getElementById('m-desc').value || 'Delicious food item.';

    if(!name || !price) return alert("Name and Price are required!");
    
    const newItem = { id: 'm' + Date.now(), name, category: cat, price, image: img, desc, available: true };
    dbMenu.push(newItem);
    localStorage.setItem('corevia_menu', JSON.stringify(dbMenu));
    
    closeModal('add-menu-modal');
    document.querySelectorAll('#add-menu-modal input, #add-menu-modal textarea').forEach(i => i.value = '');
    fetchMenu();
}

function deleteMenuItem(id) {
    if(confirm("This item will be deleted. Are you sure?")) {
        dbMenu = dbMenu.filter(m => m.id !== id);
        localStorage.setItem('corevia_menu', JSON.stringify(dbMenu));
        fetchMenu();
    }
}

function toggleAvailability(id, state) {
    const item = dbMenu.find(m => m.id === id);
    if(item) {
        item.available = state;
        localStorage.setItem('corevia_menu', JSON.stringify(dbMenu));
        fetchMenu();
    }
}

// --- ORDERS LOGIC (UPDATED FOR LOCAL STORAGE) ---
function fetchOrders() {
    const storedOrders = localStorage.getItem('corevia_orders');
    if (storedOrders) {
        orders = JSON.parse(storedOrders);
    }
    updateKitchenUI(); 
    updateAdminUI(); 
    updateNotifUI();
}

function openOrderModal(name, price) {
    curItem = name; curPrice = price;
    openModal('order-modal'); selectOption('Pick');
}

function selectOption(opt) {
    curFulfillment = opt;
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('border-orange-500', 'bg-orange-50'));
    document.getElementById('btn-' + opt.toLowerCase()).classList.add('border-orange-500', 'bg-orange-50');
    
    const extra = document.getElementById('extra-fields');
    if(opt === 'Table') extra.innerHTML = `<input type="number" id="f-table" placeholder="Table No (e.g. 5)" class="w-full p-4 bg-slate-100 rounded-2xl outline-none font-bold text-center border-2 border-slate-200 focus:border-orange-500">`;
    else if(opt === 'Delivery') extra.innerHTML = `<input type="text" id="f-name" placeholder="Name" class="w-full p-4 bg-slate-100 rounded-2xl outline-none font-bold mb-3"><input type="tel" id="f-phone" placeholder="Phone" class="w-full p-4 bg-slate-100 rounded-2xl outline-none font-bold mb-3"><textarea id="f-addr" placeholder="Address" class="w-full p-4 bg-slate-100 rounded-2xl outline-none font-bold"></textarea>`;
    else extra.innerHTML = ''; 
}

async function confirmOrder() {
    let details = "Self Pickup";
    if(curFulfillment === 'Table') {
        const t = document.getElementById('f-table').value;
        if(!t) return alert("Table Number is required!");
        details = "Table: " + t;
    } else if(curFulfillment === 'Delivery') {
        const n = document.getElementById('f-name').value, p = document.getElementById('f-phone').value, a = document.getElementById('f-addr').value;
        if(!n || !p || !a) return alert("Please fill in all details!");
        details = `Delivery | ${n} - ${p} - ${a}`;
    }
    
    const id = 'C-' + Math.floor(1000 + Math.random() * 9000);
    const pay = document.getElementById('payment-method').value;
    const order = { id, item: curItem, price: curPrice, fulfillment: curFulfillment, details, payment: pay, status: 'Preparing', delivered: false, date: new Date().toLocaleString() };
    
    orders.push(order);
    localStorage.setItem('corevia_orders', JSON.stringify(orders));
    
    closeModal('order-modal');
    fetchOrders();
    await generateReceipt(order);
}

// --- ADMIN LOGIC ---
function switchAdminTab(tab) {
    const tabs = ['analytics', 'orders', 'menu', 'customers'];
    tabs.forEach(t => {
        document.getElementById(`tab-${t}`).style.display = (t === tab) ? 'block' : 'none';
        const btn = document.getElementById(`tab-btn-${t}`);
        if(btn) btn.className = (t === tab) ? "w-full flex items-center gap-4 p-4 rounded-2xl bg-orange-600 text-white font-bold transition-all" : "w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-white font-bold transition-all";
    });
}

function filterTable(tableId, val) {
    document.querySelectorAll(`#${tableId} tr`).forEach(r => r.style.display = r.innerText.toLowerCase().includes(val.toLowerCase()) ? '' : 'none');
}

function updateAdminUI() {
    const list = document.getElementById('admin-order-list');
    const customerList = document.getElementById('admin-customer-list');
    let rev = 0; let customersData = {};

    orders.forEach(o => {
        rev += o.price;
        if(o.fulfillment === 'Delivery') {
            let detailsParts = o.details.split(' | ')[1];
            if(detailsParts) {
                let [name, phone] = detailsParts.split(' - ');
                if(name && phone) {
                    if(!customersData[phone]) customersData[phone] = { name: name.trim(), spent: 0, orders: 0 };
                    customersData[phone].spent += o.price;
                    customersData[phone].orders += 1;
                }
            }
        }
    });
    
    document.getElementById('admin-revenue').innerText = "Rs. " + rev;
    document.getElementById('admin-count').innerText = orders.length;
    document.getElementById('admin-pending').innerText = orders.filter(o => !o.delivered).length;
    
    if(list) list.innerHTML = orders.map(o => {
        let badge = o.delivered ? '<span class="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs">Delivered</span>' : '<span class="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-xs animate-pulse">Pending</span>';
        return `<tr class="border-b border-slate-50"><td class="py-4 text-slate-400">#${o.id}</td><td class="py-4 font-black">${o.item}</td><td class="py-4 text-xs text-slate-500">${o.details}</td><td class="py-4 text-[10px] uppercase">${o.payment}</td><td class="py-4">${badge}</td><td class="py-4 font-black">Rs.${o.price}</td><td class="py-4"><button onclick='reprint("${o.id}")' class="text-slate-400 hover:text-orange-600"><i class="fa-solid fa-print"></i></button></td></tr>`;
    }).reverse().join('');

    if(customerList) {
        if(Object.keys(customersData).length > 0) {
            customerList.innerHTML = Object.keys(customersData).map(phone => {
                let c = customersData[phone];
                return `<tr class="border-b border-slate-50"><td class="py-4 font-bold">${c.name}</td><td class="py-4 text-slate-500">${phone}</td><td class="py-4 text-orange-600 font-black">${c.orders} Orders</td><td class="py-4 font-black">Rs. ${c.spent}</td></tr>`;
            }).join('');
        } else customerList.innerHTML = `<tr><td colspan="4" class="py-10 text-center text-slate-400">No delivery data yet.</td></tr>`;
    }
}

async function generateReceipt(o) {
    document.getElementById('r-date').innerText = o.date;
    document.getElementById('r-id').innerText = "ORDER #" + o.id;
    document.getElementById('r-item').innerText = o.item;
    document.getElementById('r-price').innerText = "Rs. " + o.price;
    document.getElementById('r-type').innerText = "Details: " + o.details;
    document.getElementById('r-pay').innerText = "Payment: " + o.payment;
    document.getElementById('r-total').innerText = "TOTAL: RS. " + o.price;
    const tmp = document.getElementById('receipt-template');
    tmp.style.display = 'block';
    const canvas = await html2canvas(tmp);
    const link = document.createElement('a');
    link.download = `Receipt-${o.id}.png`; link.href = canvas.toDataURL(); link.click();
    tmp.style.display = 'none';
}
function reprint(id) { const o = orders.find(x => x.id === id); if(o) generateReceipt(o); }

// --- KITCHEN LOGIC ---
function updateKitchenUI() {
    const d = document.getElementById('kitchen-display');
    const stats = document.getElementById('kitchen-stats');
    const active = orders.filter(o => !o.delivered);
    
    if(stats) stats.innerText = `${active.length} Pending`;

    if(!active.length) { 
        d.innerHTML = `
            <div class="col-span-full h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-3xl bg-slate-800/20 backdrop-blur-sm">
                <i class="fa-solid fa-mug-hot text-5xl mb-4 opacity-50"></i>
                <p class="font-bold text-lg uppercase tracking-widest">Queue is Empty</p>
            </div>`; 
        return; 
    }
    
    d.innerHTML = active.map(o => {
        const isReady = o.status === 'Ready';
        const statusColor = isReady ? 'emerald' : 'orange';
        const glowClass = isReady ? 'shadow-[0_0_30px_rgba(16,185,129,0.15)] border-emerald-500/30' : 'shadow-[0_0_30px_rgba(249,115,22,0.1)] border-orange-500/30';

        return `
        <div class="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col hover:${glowClass} transition-all duration-300 relative overflow-hidden group">
            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-${statusColor}-500"></div>
            <div class="flex justify-between items-start mb-4 pl-2">
                <div>
                    <span class="text-slate-400 text-xs font-bold tracking-widest uppercase">Order</span>
                    <h3 class="text-white text-xl font-black">#${o.id}</h3>
                </div>
                <div class="px-3 py-1 rounded-lg bg-${statusColor}-500/10 border border-${statusColor}-500/20 flex items-center gap-2">
                    <i class="fa-solid ${isReady ? 'fa-check' : 'fa-fire animate-pulse'} text-${statusColor}-500 text-xs"></i>
                    <span class="text-${statusColor}-500 text-xs font-bold uppercase tracking-wider">${o.status}</span>
                </div>
            </div>
            <div class="pl-2 mb-6 flex-1">
                <h4 class="text-2xl font-black text-white mb-3 leading-tight">${o.item}</h4>
                <div class="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-slate-300 text-sm font-medium">
                    <i class="fa-solid fa-utensils text-slate-500 mr-2"></i> ${o.details}
                </div>
            </div>
            <div class="flex gap-3 pl-2 mt-auto">
                ${!isReady ? `<button onclick="markAsReady('${o.id}')" class="flex-1 py-3.5 bg-slate-800 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 border border-slate-700 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">Mark Ready</button>` : ''}
                <button onclick="deliverOrder('${o.id}')" class="flex-1 py-3.5 ${isReady ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)] border-orange-500' : 'bg-slate-800/50 text-slate-600 border-slate-800 pointer-events-none'} rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 border">Delivered</button>
            </div>
        </div>`;
    }).join('');
}

// --- NOTIFICATION PANEL UPDATE ---
function updateNotifUI() {
    const list = document.getElementById('notif-list');
    const active = orders.filter(o => !o.delivered); 
    
    document.getElementById('notif-badge').innerText = active.length;
    document.getElementById('notif-badge').style.display = active.length ? 'flex' : 'none';
    
    if (active.length > 0) {
        list.innerHTML = active.map(o => {
            if (o.status === 'Ready') {
                return `
                <div class="p-4 bg-green-50 rounded-2xl border border-green-200">
                    <div class="flex justify-between font-bold text-xs mb-1">
                        <span class="text-slate-800">${o.item}</span>
                        <span class="text-green-600 uppercase animate-pulse">Ready</span>
                    </div>
                    <p class="text-green-700 text-[11px] font-bold">Your order is ready. Enjoy your meal, thank you!</p>
                </div>`;
            } else {
                return `
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex justify-between font-bold text-xs mb-1">
                        <span class="text-slate-800">${o.item}</span>
                        <span class="text-orange-600 uppercase">Preparing</span>
                    </div>
                    <p class="text-slate-500 text-[11px]">Chef is preparing your food...</p>
                </div>`;
            }
        }).join('');
    } else {
        list.innerHTML = '<p class="text-slate-400 text-center py-4">No active orders.</p>';
    }
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function checkAdminPass() { 
    if(document.getElementById('admin-pass').value === "corevia12") { 
        closeModal('admin-lock'); 
        document.body.style.overflow = 'hidden'; 
        document.querySelectorAll('header, section, footer').forEach(el => el.style.display = '');
        document.querySelectorAll('header, section:not(#admin-panel), footer').forEach(el => el.style.display = 'none');
        document.getElementById('kitchen-panel').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden'); 
        switchAdminTab('analytics'); 
        updateAdminUI(); 
    } else alert("Incorrect Password!"); 
}

function checkKitchenPass() { 
    if(document.getElementById('staff-pass').value === "corevia") { 
        closeModal('kitchen-lock'); 
        document.body.style.overflow = 'hidden'; 
        document.querySelectorAll('header, section, footer').forEach(el => el.style.display = '');
        document.querySelectorAll('header, section:not(#kitchen-panel), footer').forEach(el => el.style.display = 'none');
        document.getElementById('admin-panel').classList.add('hidden');
        document.getElementById('kitchen-panel').classList.remove('hidden'); 
        updateKitchenUI(); 
    } else alert("Incorrect Password!"); 
}

function logout(id) { 
    document.getElementById(id).classList.add('hidden'); 
    document.body.style.overflow = 'auto'; 
    document.querySelectorAll('header, section:not(#admin-panel, #kitchen-panel), footer').forEach(el => el.style.display = '');
}

function markAsReady(id) { 
    const o = orders.find(x => x.id === id); 
    if(o) { 
        o.status = 'Ready'; 
        localStorage.setItem('corevia_orders', JSON.stringify(orders));
        fetchOrders(); 
    } 
}

function deliverOrder(id) { 
    const o = orders.find(x => x.id === id); 
    if(o) { 
        o.delivered = true; 
        localStorage.setItem('corevia_orders', JSON.stringify(orders));
        fetchOrders(); 
    } 
}
