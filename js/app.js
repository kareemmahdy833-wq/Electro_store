"use strict";

/* ============================================================
   ElectroStore — منطق الموقع
   بحث + تصفية + سلة (sessionStorage) + مودال تفاصيل + طلب واتساب
   البيانات كلها في js/products.js
   ============================================================ */

const $ = (s) => document.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// السعر المعروض: سعر الشراء + هامش الربح لو 100 جنيه أو أكتر
function basePrice(ram) {
  return ram >= 100 ? ram + MARKUP : ram;
}

// تنسيق السعر: 2.5 → "2.5 ج" — 362 → "362 ج"
function fmt(n) {
  return parseFloat(n.toFixed(2)) + " ج";
}

// مسار الصورة: الاسم بدون امتداد يعني jpg
function imgSrc(name) {
  return "images/" + (name.includes(".") ? name : name + ".jpg");
}

// الاسم المزدوج: "عربي | English" — بيتقسم لاسمين
function nameParts(name) {
  const i = name.indexOf(" | ");
  return i === -1 ? [name, ""] : [name.slice(0, i), name.slice(i + 3)];
}

// سعر الوحدة النهائي — الباندل سعره النهائي جاهز (الهامش محسوب جواه)
function unitPrice(p, opt) {
  if (isBundle(p)) return p[3];
  let price = basePrice(p[3]);
  if (Array.isArray(opt) && opt.length === 3) {
    if (opt[1] === "+") price += opt[2];
    if (opt[1] === "x") price *= opt[2];
  }
  return price;
}

// نص الاختيار المعروض
function optLabel(opt) {
  return Array.isArray(opt) ? opt[0] : String(opt);
}

// هل المنتج باندل؟
function isBundle(p) {
  return p[2] === 14;
}

/* ---------- الحالة ---------- */
let cart = loadCart();          // { "id|اختيار": {name, opt, unit, qty, img} }
let searchTerm = "";
let activeCat = null;           // رقم القسم المختار أو null

function loadCart() {
  try {
    return JSON.parse(sessionStorage.getItem("electrostore_cart")) || {};
  } catch (e) {
    return {};
  }
}
function saveCart() {
  sessionStorage.setItem("electrostore_cart", JSON.stringify(cart));
}

/* ---------- الأقسام (كرتات + شرائح تصفية + الفوتر) ---------- */
function catSlug(name) {
  return name.split(" ")[0].toLowerCase();
}

function renderCategories() {
  const grid = $("#catGrid");
  grid.innerHTML = C.map((name, i) => `
    <button class="cat-card" data-cat="${i}" type="button" aria-label="${esc(name)}">
      <img src="images/cat-${catSlug(name)}.jpg" alt="${esc(name)}" loading="lazy">
      <span>${esc(name)}</span>
    </button>`).join("");

  const chips = $("#chips");
  chips.innerHTML =
    `<button class="chip active" data-cat="all" type="button">الكل</button>` +
    C.map((name, i) => `<button class="chip" data-cat="${i}" type="button">${esc(name)}</button>`).join("");

  $("#footerCats").innerHTML = C.map((name, i) =>
    `<a href="#shop" data-cat="${i}">${esc(name)}</a>`).join("");
}

/* ---------- شبكة المنتجات ---------- */
function filteredProducts() {
  const q = searchTerm.trim().toLowerCase();
  return P.filter((p) => {
    if (activeCat !== null && p[2] !== activeCat) return false;
    if (!q) return true;
    const hay = (p[0] + " " + p[1] + " " + C[p[2]] + " " + (p[8] || "")).toLowerCase();
    return hay.includes(q);
  });
}

// قائمة محتويات الباندل — شكل ✓ على الكارت
function bundleListHTML(p) {
  if (!isBundle(p) || !p[8]) return "";
  const lines = p[8].split("\n").filter(Boolean);
  return `<ul class="bundle-check">${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
}

function renderGrid() {
  const grid = $("#grid");
  const list = filteredProducts();
  $("#noResults").hidden = list.length > 0;

  grid.innerHTML = list.map((p) => {
    const [name, desc, cat, ram, popular, img, id, optKey] = p;
    const [ar, en] = nameParts(p[0]);
    const options = optKey ? O[optKey] : null;
    return `
    <article class="card${isBundle(p) ? " card-bundle" : ""}" data-id="${id}" tabindex="0" role="button" aria-label="${esc(ar)}">
      <div class="card-img">
        ${popular ? `<span class="badge-popular">الأكثر طلباً</span>` : ""}
        <img class="skeleton" loading="lazy" src="${imgSrc(img)}" alt="${esc(ar)}"
             onload="this.classList.remove('skeleton')"
             onerror="this.onerror=null;this.classList.remove('skeleton');this.src='images/placeholder.svg'">
      </div>
      <div class="card-body">
        <span class="card-cat">${esc(C[cat])}</span>
        <h3 class="card-name">${esc(ar)}</h3>
        ${en ? `<span class="card-name-en" dir="ltr">${esc(en)}</span>` : ""}
        <p class="card-desc">${esc(desc)}</p>
        ${bundleListHTML(p)}
        <div class="card-price" data-ram="${ram}">${fmt(unitPrice(p, null))}</div>
        ${options ? `
        <select aria-label="اختر النوع">
          ${options.map((o, i) => `<option value="${i}">${esc(optLabel(o))}</option>`).join("")}
        </select>` : ""}
        <button class="btn-add" type="button">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          أضف للسلة
        </button>
      </div>
    </article>`;
  }).join("");
}

// تحديث سعر الكرت عند تغيير الاختيار (للخيارات اللي بتغير السعر)
function onCardSelectChange(e) {
  const select = e.target.closest("select");
  if (!select) return;
  const card = select.closest(".card");
  const p = P.find((x) => x[6] === card.dataset.id);
  const opt = O[p[7]][Number(select.value)];
  card.querySelector(".card-price").textContent = fmt(unitPrice(p, opt));
}

/* ---------- إضافة للسلة ---------- */
function addItems(p, opt, qty) {
  const label = opt ? optLabel(opt) : "";
  const key = p[6] + "|" + label;
  const [ar, en] = nameParts(p[0]);

  if (cart[key]) cart[key].qty += qty;
  else cart[key] = { name: ar, en: en, opt: label, unit: unitPrice(p, opt), qty: qty, img: imgSrc(p[5]) };

  saveCart();
  updateCartUI();
}

// تغذية راجعة على زر الكرت
function flashAdded(btn) {
  btn.classList.add("added");
  btn.textContent = "تمت الإضافة";
  setTimeout(() => {
    btn.classList.remove("added");
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg> أضف للسلة`;
  }, 1100);
}

/* ---------- السلة ---------- */
function cartCount() {
  return Object.values(cart).reduce((s, it) => s + it.qty, 0);
}
function cartTotal() {
  return Object.values(cart).reduce((s, it) => s + it.unit * it.qty, 0);
}

function updateCartUI() {
  const n = cartCount();
  const badge = $("#cartCount");
  badge.textContent = n;
  badge.hidden = n === 0;
  $("#cartTotal").textContent = fmt(cartTotal());
  renderCartItems();
}

function renderCartItems() {
  const box = $("#cartItems");
  const keys = Object.keys(cart);
  if (!keys.length) {
    box.innerHTML = `<p class="cart-empty">السلة فاضية — ابدأ التسوق!</p>`;
    return;
  }
  box.innerHTML = keys.map((key) => {
    const it = cart[key];
    return `
    <div class="cart-item" data-key="${esc(key)}">
      <img src="${it.img}" alt="">
      <div class="ci-info">
        <div class="ci-name">${esc(it.name)}${it.opt ? ` — ${esc(it.opt)}` : ""}</div>
        ${it.en ? `<div class="card-name-en" dir="ltr">${esc(it.en)}</div>` : ""}
        <div class="ci-price">${fmt(it.unit)}</div>
        <div class="ci-controls">
          <button class="qty-btn" data-act="minus" type="button" aria-label="تقليل الكمية">−</button>
          <span class="ci-qty">${it.qty}</span>
          <button class="qty-btn" data-act="plus" type="button" aria-label="زيادة الكمية">+</button>
          <button class="ci-del" data-act="del" type="button" aria-label="حذف المنتج">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M9 7V5h6v2m-8 0 1 13h8l1-13"/></svg>
          </button>
        </div>
      </div>
    </div>`;
  }).join("");
}

function onCartItemClick(e) {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const key = btn.closest(".cart-item").dataset.key;
  const it = cart[key];
  if (!it) return;

  if (btn.dataset.act === "plus") it.qty++;
  if (btn.dataset.act === "minus") it.qty--;
  if (btn.dataset.act === "del" || it.qty <= 0) delete cart[key];

  saveCart();
  updateCartUI();
}

/* ---------- فتح وإغلاق الدرجر ---------- */
function openCart(e) {
  if (e) e.preventDefault();
  const drawer = $("#drawer");
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  const ov = $("#overlay");
  ov.hidden = false;
  void ov.offsetWidth; /* إجبار إعادة التدفق قبل إضافة الكلاس لضمان حركة الظهور */
  ov.classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  const drawer = $("#drawer");
  if (drawer.contains(document.activeElement)) document.activeElement.blur();
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  const ov = $("#overlay");
  ov.classList.remove("show");
  setTimeout(() => { ov.hidden = true; }, 250);
  document.body.style.overflow = "";
}

/* ---------- مودال تفاصيل المنتج ---------- */
let modalP = null;   // المنتج المعروض حالياً
let modalQty = 1;

function openModal(id) {
  const p = P.find((x) => x[6] === id);
  if (!p) return;
  modalP = p;
  modalQty = 1;

  const [ar, en] = nameParts(p[0]);
  $("#mImg").src = imgSrc(p[5]);
  $("#mImg").alt = ar;
  $("#mCat").textContent = C[p[2]];
  $("#mNameAr").textContent = ar;
  $("#mNameEn").textContent = en || "";
  $("#mNameEn").hidden = !en;
  $("#mDesc").textContent = p[1];
  $("#mModalQty").textContent = "1";

  // التفاصيل: الباندل محتوياته كقائمة، والمنتج العادي فقرة
  const det = $("#mDetails");
  if (p[8]) {
    const lines = p[8].split("\n").filter(Boolean);
    det.innerHTML = lines.map((l) => `<li>${esc(l)}</li>`).join("");
    det.className = isBundle(p) ? "modal-details bundle-list" : "modal-details";
    det.hidden = false;
  } else {
    det.hidden = true;
  }

  // الاختيارات لو موجودة
  const optBox = $("#mOpts");
  if (p[7] && O[p[7]]) {
    optBox.innerHTML = `
      <select id="mSelect" aria-label="اختر النوع">
        ${O[p[7]].map((o, i) => `<option value="${i}">${esc(optLabel(o))}</option>`).join("")}
      </select>`;
    $("#mSelect").addEventListener("change", updateModalPrice);
  } else {
    optBox.innerHTML = "";
  }

  updateModalPrice();

  const ov = $("#modalOverlay");
  ov.hidden = false;
  void ov.offsetWidth;
  ov.classList.add("show");
  document.body.style.overflow = "hidden";
  $("#modalClose").focus();
}

function modalSelectedOpt() {
  if (!modalP || !modalP[7] || !O[modalP[7]]) return null;
  const sel = $("#mSelect");
  return O[modalP[7]][Number(sel.value)];
}

function updateModalPrice() {
  $("#mPrice").textContent = fmt(unitPrice(modalP, modalSelectedOpt()) * modalQty);
}

function closeModal() {
  const ov = $("#modalOverlay");
  ov.classList.remove("show");
  if (ov.contains(document.activeElement)) document.activeElement.blur();
  setTimeout(() => { ov.hidden = true; }, 220);
  document.body.style.overflow = "";
}

function changeModalQty(d) {
  modalQty = Math.max(1, modalQty + d);
  $("#mModalQty").textContent = modalQty;
  updateModalPrice();
}

function addModalToCart() {
  addItems(modalP, modalSelectedOpt(), modalQty);
  const btn = $("#mAdd");
  btn.textContent = "تمت الإضافة";
  setTimeout(() => { btn.textContent = "أضف للسلة"; }, 1100);
}

/* ---------- الطلب عبر واتساب ---------- */
function submitOrder(e) {
  e.preventDefault();

  const fields = [
    { el: $("#fName"), label: "الاسم" },
    { el: $("#fPhone"), label: "رقم الموبايل" },
    { el: $("#fCollege"), label: "الكلية" },
    { el: $("#fDept"), label: "القسم" }
  ];

  let ok = true;
  fields.forEach((f) => {
    const empty = !f.el.value.trim();
    f.el.classList.toggle("invalid", empty);
    if (empty) ok = false;
  });

  const err = $("#formError");
  if (!cartCount()) {
    err.textContent = "السلة فاضية — أضف منتجات أولاً";
    err.hidden = false;
    return;
  }
  if (!ok) {
    err.textContent = "من فضلك اكمل البيانات المطلوبة (*)";
    err.hidden = false;
    return;
  }
  err.hidden = true;

  const lines = [];
  Object.entries(cart).forEach(([key, it], i) => {
    const full = it.en ? `${it.name} | ${it.en}` : it.name;
    lines.push(`${i + 1}) ${full}${it.opt ? ` — ${it.opt}` : ""} ×${it.qty} = ${fmt(it.unit * it.qty)}`);
    // محتويات الباندل تتبعت تحته
    const p = P.find((x) => x[6] === key.split("|")[0]);
    if (p && isBundle(p) && p[8]) {
      p[8].split("\n").filter(Boolean).forEach((c) => lines.push(`    • ${c}`));
    }
  });
  const year = $("#fYear").value || "—";

  const msg = [
    "*طلب جديد من موقع ElectroStore*",
    "",
    "*المنتجات:*",
    ...lines,
    "",
    `*الإجمالي:* ${fmt(cartTotal())}`,
    "التوصيل: بدون شحن — الاستلام من داخل الكلية",
    "",
    "*بيانات الطالب:*",
    `الاسم: ${$("#fName").value.trim()}`,
    `الموبايل: ${$("#fPhone").value.trim()}`,
    `الكلية: ${$("#fCollege").value.trim()}`,
    `القسم: ${$("#fDept").value.trim()}`,
    `السنة الدراسية: ${year}`
  ].join("\n");

  window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(msg), "_blank");
}

/* ---------- التصفية بالأقسام ---------- */
function setCategory(i) {
  activeCat = (activeCat === i) ? null : i; // الضغط تاني = إلغاء الفلتر
  document.querySelectorAll("#chips .chip").forEach((ch) => {
    const v = ch.dataset.cat === "all" ? null : Number(ch.dataset.cat);
    ch.classList.toggle("active", v === activeCat);
  });
  renderGrid();
  if (activeCat !== null) {
    const shop = $("#shop");
    shop.scrollIntoView({ behavior: "smooth" });
  }
}

/* ---------- ربط الأحداث ---------- */
function initEvents() {
  // بحث فوري
  $("#searchInput").addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderGrid();
  });

  // شرائح الأقسام
  $("#chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    setCategory(chip.dataset.cat === "all" ? null : Number(chip.dataset.cat));
  });

  // كرتات الأقسام + روابط الفوتر
  [$("#catGrid"), $("#footerCats")].forEach((box) => {
    box.addEventListener("click", (e) => {
      const link = e.target.closest("[data-cat]");
      if (!link) return;
      e.preventDefault();
      activeCat = null; // نضمن إن الفلتر هيتفعّل مش يتلغي
      setCategory(Number(link.dataset.cat));
    });
  });

  // تغيير الاختيار داخل الكرت
  $("#grid").addEventListener("change", onCardSelectChange);

  // كليك على الشبكة: زر أضف للسلة / فتح تفاصيل المنتج
  $("#grid").addEventListener("click", (e) => {
    const addBtn = e.target.closest(".btn-add");
    const card = e.target.closest(".card");
    if (!card) return;
    if (addBtn) {
      const p = P.find((x) => x[6] === card.dataset.id);
      const select = card.querySelector("select");
      const opt = select ? O[p[7]][Number(select.value)] : null;
      addItems(p, opt, 1);
      flashAdded(addBtn);
      return;
    }
    // الضغط على الكارت نفسه (مش الزر ولا القايمة) = تفاصيل
    if (!e.target.closest("select")) openModal(card.dataset.id);
  });

  // Enter / المسافة على الكارت المركّز = تفاصيل
  $("#grid").addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".card");
    if (!card || e.target.closest("button, select")) return;
    e.preventDefault();
    openModal(card.dataset.id);
  });

  // السلة
  $("#cartBtn").addEventListener("click", openCart);
  $("#footerCartBtn").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#overlay").addEventListener("click", closeCart);
  $("#cartItems").addEventListener("click", onCartItemClick);

  // المودال
  $("#modalClose").addEventListener("click", closeModal);
  $("#modalOverlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  $("#mQtyMinus").addEventListener("click", () => changeModalQty(-1));
  $("#mQtyPlus").addEventListener("click", () => changeModalQty(1));
  $("#mAdd").addEventListener("click", addModalToCart);

  // Escape يقفل المودال أو السلة
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const ov = $("#modalOverlay");
    if (!ov.hidden && ov.classList.contains("show")) closeModal();
    else if ($("#drawer").classList.contains("open")) closeCart();
  });

  // إرسال الطلب
  $("#orderForm").addEventListener("submit", submitOrder);

  // إزالة علامة الخطأ عند الكتابة
  ["fName", "fPhone", "fCollege", "fDept"].forEach((id) => {
    $("#" + id).addEventListener("input", (e) => e.target.classList.remove("invalid"));
  });
}

/* ---------- تشغيل ---------- */
renderCategories();
renderGrid();
updateCartUI();
initEvents();
