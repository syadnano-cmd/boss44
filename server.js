const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { return { products: [], orders: [] }; }
}
function writeDB(data) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ─── SEED ───
const SEED = [
  // Kadın
  { id:1,  name:'Siyah Dalgalı Detaylı Abaya',      cat:'Kadın Giyim', desc:'Şık dalgalı detaylara sahip zarif siyah abaya', img:'', cost:850,  badge:'Çok Satan' },
  { id:2,  name:'Keten Nakışlı Abaya & Eşarp Seti',  cat:'Kadın Giyim', desc:'Tül nakışlı keten kumaş, eşarp dahil',          img:'', cost:1100, badge:'Çok Satan' },
  { id:3,  name:'Çiçek Desenli Bohem Elbise',        cat:'Kadın Giyim', desc:'Uzun kollu şık bohem maxi elbise',              img:'', cost:650,  badge:'Yeni' },
  { id:4,  name:'Namaz Elbisesi 2 Parça',            cat:'Kadın Giyim', desc:'Rahat ve pratik 2 parçalı namaz elbisesi',      img:'', cost:320,  badge:'Çok Satan' },
  { id:5,  name:'Sarı Çiçekli Tesettür Elbise',      cat:'Kadın Giyim', desc:'Zarif sarı çiçekli tesettür elbise',            img:'', cost:720,  badge:'Çok Satan' },
  { id:6,  name:'Mint Yeşili Jakarlı Elbise',        cat:'Kadın Giyim', desc:'Bel vurgulu jakarlı pamuklu elbise',            img:'', cost:780,  badge:'Yeni' },
  { id:7,  name:'Düğmeli Çizgili Elbise',            cat:'Kadın Giyim', desc:'Şık düğmeli çizgili günlük elbise',            img:'', cost:490,  badge:'' },
  { id:8,  name:'Bordo Dantel Abiye',                cat:'Kadın Giyim', desc:'İnce dantel kumaştan lüks bordo abiye',         img:'', cost:980,  badge:'Çok Satan' },
  { id:9,  name:'Beyaz Dantel Uzun Abiye',           cat:'Kadın Giyim', desc:'Uzun kollu yüksek yakalı beyaz dantel elbise', img:'', cost:920,  badge:'Çok Satan' },
  { id:10, name:'Pembe Çizgili Bağlamalı Gömlek',   cat:'Kadın Giyim', desc:'Önde bağlamalı şık pembe çizgili gömlek',      img:'', cost:380,  badge:'' },
  { id:11, name:'Lacivert Süet Kemerli Etek',        cat:'Kadın Giyim', desc:'Kemerli lacivert süet şık etek',               img:'', cost:520,  badge:'' },
  { id:12, name:'Mürdüm Fırfırlı Kupra Takım',      cat:'Kadın Giyim', desc:'Fırfırlı kemerli kupra kumaş iki parça takım', img:'', cost:860,  badge:'Yeni' },
  // Erkek
  { id:13, name:'Slim Fit Pamuklu Gömlek',           cat:'Erkek Giyim', desc:'%100 pamuk slim fit modern kesim gömlek',      img:'', cost:420,  badge:'Çok Satan' },
  { id:14, name:'Klasik Keten Gömlek',               cat:'Erkek Giyim', desc:'Nefes alan keten kumaş günlük kullanım',       img:'', cost:390,  badge:'' },
  { id:15, name:'Slim Fit Chino Pantolon',           cat:'Erkek Giyim', desc:'Rahat slim fit chino pantolon',                img:'', cost:580,  badge:'Çok Satan' },
  { id:16, name:'Fermuarlı Kapüşonlu Sweatshirt',    cat:'Erkek Giyim', desc:'Yumuşak kumaş kapüşonlu sweatshirt',           img:'', cost:650,  badge:'Yeni' },
  { id:17, name:'Slim Fit Takım Elbise',             cat:'Erkek Giyim', desc:'Modern slim fit iki parça takım elbise',       img:'', cost:1800, badge:'Çok Satan' },
  { id:18, name:'Polo Yaka T-Shirt',                 cat:'Erkek Giyim', desc:'Klasik polo yaka günlük t-shirt',              img:'', cost:280,  badge:'' },
  // Çocuk
  { id:19, name:'Kız Çocuk Çiçekli Elbise',         cat:'Çocuk Giyim', desc:'Renkli çiçekli şirin kız çocuk elbisesi',     img:'', cost:290,  badge:'Yeni' },
  { id:20, name:'Erkek Çocuk Spor Takım',            cat:'Çocuk Giyim', desc:'Rahat spor üst + alt takım seti',             img:'', cost:350,  badge:'Çok Satan' },
  { id:21, name:'Bebek Tulum Seti 3 Parça',          cat:'Çocuk Giyim', desc:'Yumuşak pamuk 3 parça bebek tulum seti',      img:'', cost:420,  badge:'Çok Satan' },
  { id:22, name:'Kız Çocuk Kot Elbise',              cat:'Çocuk Giyim', desc:'Sevimli kot kumaş günlük elbise',             img:'', cost:310,  badge:'' },
];

function calcFinal(cost) {
  // Türkiye içi — %55 kar marjı
  return Math.ceil(cost * 1.55);
}

function initDB() {
  const db = readDB();
  if (db.products.length === 0) {
    db.products = SEED.map(p => ({ ...p, finalPrice: calcFinal(p.cost) }));
    writeDB(db);
  }
}
initDB();

// ─── PRODUCTS ───
app.get('/api/products', (req, res) => res.json(readDB().products));

app.post('/api/products', (req, res) => {
  const db = readDB();
  const { name, cat, desc, img, cost, badge } = req.body;
  if (!name || !cost) return res.status(400).json({ error: 'Eksik alan' });
  const product = { id: Date.now(), name, cat, desc: desc||'', img: img||'', cost: parseFloat(cost), finalPrice: calcFinal(parseFloat(cost)), badge: badge||'' };
  db.products.unshift(product);
  writeDB(db);
  res.json(product);
});

app.put('/api/products/:id', (req, res) => {
  const db = readDB();
  const idx = db.products.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Bulunamadı' });
  const cost = parseFloat(req.body.cost) || db.products[idx].cost;
  db.products[idx] = { ...db.products[idx], ...req.body, cost, finalPrice: calcFinal(cost) };
  writeDB(db);
  res.json(db.products[idx]);
});

app.delete('/api/products/:id', (req, res) => {
  const db = readDB();
  db.products = db.products.filter(p => p.id != req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

// ─── ORDERS ───
app.get('/api/orders', (req, res) => res.json(readDB().orders));

app.post('/api/orders', (req, res) => {
  const db = readDB();
  const { name, phone, city, address, productId, notes } = req.body;
  if (!name || !phone || !city || !address || !productId)
    return res.status(400).json({ error: 'Eksik alan' });
  const product = db.products.find(p => p.id == productId);
  if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
  if (product.finalPrice < 500) return res.status(400).json({ error: 'Minimum sipariş 500 TL' });
  const order = {
    id: Date.now(), productId: product.id, productName: product.name,
    amount: product.finalPrice, name, phone, city, address, notes: notes||'',
    status: 'Yeni', date: new Date().toLocaleDateString('tr-TR'), createdAt: new Date().toISOString()
  };
  db.orders.unshift(order);
  writeDB(db);
  res.json(order);
});

app.put('/api/orders/:id/status', (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id == req.params.id);
  if (!order) return res.status(404).json({ error: 'Bulunamadı' });
  order.status = req.body.status;
  writeDB(db);
  res.json(order);
});

app.get('/api/stats', (req, res) => {
  const db = readDB();
  res.json({
    totalProducts: db.products.length,
    totalOrders: db.orders.length,
    newOrders: db.orders.filter(o => o.status === 'Yeni').length,
    totalRevenue: db.orders.reduce((s, o) => s + o.amount, 0)
  });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`BOSS44 TR running on port ${PORT}`));
