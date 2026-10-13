/* Alke Wallet - prototipo académico frontend.
   No procesa dinero real. Los datos se guardan en localStorage del navegador. */
(function ($) {
  "use strict";

  const KEYS = { user: "alkeWalletUser", balance: "alkeWalletBalance", contacts: "alkeWalletContacts", transactions: "alkeWalletTransactions" };
  const DEMO_EMAIL = "demo@alkewallet.cl";
  const DEMO_PASSWORD = "wallet123";
  const initialContacts = [
    { id: "c1", name: "Camila Rojas", email: "camila@ejemplo.cl" },
    { id: "c2", name: "Diego Muñoz", email: "diego@ejemplo.cl" },
    { id: "c3", name: "Valentina Soto", email: "valentina@ejemplo.cl" }
  ];

  function read(key, fallback) {
    try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); }
    catch (e) { return fallback; }
  }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function money(value) {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Number(value) || 0);
  }
  function getBalance() { return Number(read(KEYS.balance, 125000)); }
  function setBalance(value) { write(KEYS.balance, Math.round(value)); }
  function getContacts() {
    const stored = read(KEYS.contacts, null);
    if (Array.isArray(stored)) return stored;
    write(KEYS.contacts, initialContacts);
    return initialContacts.slice();
  }
  function getTransactions() {
    const stored = read(KEYS.transactions, null);
    if (Array.isArray(stored)) return stored;
    const starter = [
      { id: "t1", type: "deposit", title: "Depósito inicial", detail: "Saldo de demostración", amount: 125000, date: new Date(Date.now() - 86400000).toISOString() }
    ];
    write(KEYS.transactions, starter);
    return starter;
  }
  function saveTransaction(type, title, detail, amount) {
    const tx = { id: "t" + Date.now(), type, title, detail, amount: Math.round(amount), date: new Date().toISOString() };
    const txs = getTransactions();
    txs.unshift(tx);
    write(KEYS.transactions, txs);
    return tx;
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[ch]));
  }
  function displayBalance() { $("#balance-display").text(money(getBalance())); }
  function isLoggedIn() { return Boolean(read(KEYS.user, null)); }
  function requireLogin() {
    if ($("body").data("protected") && !isLoggedIn()) window.location.replace("login.html");
  }
  function typeLabel(type) {
    return ({ deposit: "Depósito", withdraw: "Retiro", transfer: "Transferencia enviada", received: "Dinero recibido" })[type] || "Movimiento";
  }
  function typeSymbol(type) { return ({ deposit: "＋", withdraw: "−", transfer: "↗", received: "↙" })[type] || "↻"; }
  function formattedDate(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "Fecha no disponible" : d.toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });
  }
  function renderTransactionRows(target, list, compact) {
    if (!list.length) {
      $(target).html('<div class="empty-state"><div class="empty-icon">↻</div><strong>No hay movimientos para mostrar</strong><p class="mb-0 mt-1">Cuando realices una operación, aparecerá aquí.</p></div>');
      return;
    }
    if (compact) {
      const html = list.slice(0, 4).map(tx => {
        const negative = tx.type === "transfer" || tx.type === "withdraw";
        return `<div class="transaction-row"><div class="transaction-symbol">${typeSymbol(tx.type)}</div><div class="transaction-details"><strong>${escapeHtml(tx.title)}</strong><small>${escapeHtml(tx.detail)} · ${escapeHtml(formattedDate(tx.date))}</small></div><div class="${negative ? "amount-negative" : "amount-positive"}">${negative ? "−" : "+"}${money(tx.amount)}</div></div>`;
      }).join("");
      $(target).html(html);
      return;
    }
    const rows = list.map(tx => {
      const negative = tx.type === "transfer" || tx.type === "withdraw";
      return `<tr><td><span class="transaction-symbol d-inline-flex me-2">${typeSymbol(tx.type)}</span><span class="fw-semibold">${escapeHtml(tx.title)}</span></td><td><span class="badge rounded-pill text-bg-light">${typeLabel(tx.type)}</span></td><td>${escapeHtml(tx.detail)}</td><td class="text-nowrap">${escapeHtml(formattedDate(tx.date))}</td><td class="text-end ${negative ? "amount-negative" : "amount-positive"}">${negative ? "−" : "+"}${money(tx.amount)}</td></tr>`;
    }).join("");
    $(target).html(`<div class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>Movimiento</th><th>Tipo</th><th>Detalle</th><th>Fecha</th><th class="text-end">Monto</th></tr></thead><tbody>${rows}</tbody></table></div>`);
  }
  function renderContacts() {
    const contacts = getContacts();
    const select = $("#contact-select");
    if (select.length) {
      select.find("option:not(:first)").remove();
      contacts.forEach(c => select.append(`<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}${c.email ? " — " + escapeHtml(c.email) : ""}</option>`));
    }
    if ($("#contacts-list").length) {
      if (!contacts.length) $("#contacts-list").html('<p class="small text-secondary">Todavía no tienes contactos. Agrega uno para comenzar.</p>');
      else $("#contacts-list").html(contacts.map(c => `<div class="contact-chip"><div class="contact-avatar">${escapeHtml(c.name.trim().charAt(0).toUpperCase())}</div><div><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.email || "Sin correo registrado")}</small></div></div>`).join(""));
    }
    if ($("#contact-search").length && $.ui && $.ui.autocomplete) {
      $("#contact-search").autocomplete({
        source: contacts.map(c => c.name),
        minLength: 0,
        select: function (event, ui) {
          const found = getContacts().find(c => c.name === ui.item.value);
          if (found) $("#contact-select").val(found.id);
        }
      }).on("focus", function () { $(this).autocomplete("search", $(this).val()); });
    }
  }

  $(function () {
    requireLogin();

    $("#login-form").on("submit", function (event) {
      event.preventDefault();
      const email = $("#email").val().trim().toLowerCase();
      const password = $("#password").val();
      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      emailInput.classList.toggle("is-invalid", !emailInput.checkValidity());
      passwordInput.classList.toggle("is-invalid", !passwordInput.checkValidity());
      if (!emailInput.checkValidity() || !passwordInput.checkValidity()) return;
      if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
        $("#login-alert").removeClass("d-none").text("Credenciales incorrectas. Usa demo@alkewallet.cl y wallet123 para probar.");
        return;
      }
      write(KEYS.user, { email, name: "Usuario demo" });
      if (localStorage.getItem(KEYS.balance) === null) setBalance(125000);
      getContacts(); getTransactions();
      window.location.href = "menu.html";
    });

    $("#logout-button").on("click", function () {
      localStorage.removeItem(KEYS.user);
      window.location.href = "login.html";
    });

    if ($("#welcome-name").length) {
      const user = read(KEYS.user, { name: "Usuario" });
      $("#welcome-name").text(user.name || "Usuario");
    }
    if ($("#balance-display").length) displayBalance();
    if ($("#recent-transactions").length) renderTransactionRows("#recent-transactions", getTransactions(), true);

    $("input[name='movement-type']").on("change", function () {
      const withdraw = $("#type-withdraw").is(":checked");
      $("#funds-submit").text(withdraw ? "Realizar retiro" : "Realizar depósito");
      $("#funds-amount").attr("max", withdraw ? getBalance() : null);
    });

    $("#funds-form").on("submit", function (event) {
      event.preventDefault();
      const amount = Number($("#funds-amount").val());
      const withdraw = $("#type-withdraw").is(":checked");
      const feedback = $("#funds-feedback");
      if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
        feedback.html('<div class="alert alert-warning mb-0">Ingresa un monto entero mayor que cero.</div>'); return;
      }
      if (withdraw && amount > getBalance()) {
        feedback.html('<div class="alert alert-danger mb-0">No tienes saldo suficiente para realizar ese retiro.</div>'); return;
      }
      setBalance(getBalance() + (withdraw ? -amount : amount));
      saveTransaction(withdraw ? "withdraw" : "deposit", withdraw ? "Retiro de fondos" : "Depósito de fondos", $("#funds-note").val().trim() || (withdraw ? "Retiro simulado" : "Depósito simulado"), amount);
      displayBalance();
      feedback.html(`<div class="alert alert-success mb-0">${withdraw ? "Retiro" : "Depósito"} realizado correctamente por <strong>${money(amount)}</strong>.</div>`);
      $("#funds-amount").val(""); $("#funds-note").val("");
    });

    renderContacts();

    $("#contact-form").on("submit", function (event) {
      event.preventDefault();
      const name = $("#new-contact-name").val().trim();
      const email = $("#new-contact-email").val().trim();
      if (name.length < 2) { $("#contact-feedback").html('<div class="text-danger small">Ingresa un nombre de al menos 2 caracteres.</div>'); return; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $("#contact-feedback").html('<div class="text-danger small">Revisa el formato del correo.</div>'); return; }
      const contacts = getContacts();
      if (contacts.some(c => c.name.toLowerCase() === name.toLowerCase())) { $("#contact-feedback").html('<div class="text-danger small">Ya existe un contacto con ese nombre.</div>'); return; }
      contacts.push({ id: "c" + Date.now(), name, email });
      write(KEYS.contacts, contacts);
      $("#contact-form")[0].reset();
      $("#contact-feedback").html('<div class="text-success small">Contacto guardado correctamente.</div>');
      renderContacts();
    });

    let pendingTransfer = null;
    $("#transfer-form").on("submit", function (event) {
      event.preventDefault();
      const contact = getContacts().find(c => c.id === $("#contact-select").val());
      const amount = Number($("#transfer-amount").val());
      if (!contact) { $("#transfer-feedback").html('<div class="alert alert-warning">Selecciona un contacto destinatario.</div>'); return; }
      if (!Number.isInteger(amount) || amount <= 0) { $("#transfer-feedback").html('<div class="alert alert-warning">Ingresa un monto entero mayor que cero.</div>'); return; }
      if (amount > getBalance()) { $("#transfer-feedback").html('<div class="alert alert-danger">Saldo insuficiente para esta transferencia.</div>'); return; }
      pendingTransfer = { contact, amount, message: $("#transfer-message").val().trim() };
      $("#transfer-confirmation").html(`<p>Vas a enviar <strong>${money(amount)}</strong> a <strong>${escapeHtml(contact.name)}</strong>.</p><p class="text-secondary small mb-0">${escapeHtml(pendingTransfer.message || "Sin mensaje adicional")}</p>`);
      if (window.bootstrap) bootstrap.Modal.getOrCreateInstance(document.getElementById("confirm-transfer-modal")).show();
    });
    $("#confirm-transfer-button").on("click", function () {
      if (!pendingTransfer) return;
      const { contact, amount, message } = pendingTransfer;
      setBalance(getBalance() - amount);
      saveTransaction("transfer", "Transferencia enviada", "A: " + contact.name + (message ? " · " + message : ""), amount);
      // Registro de recepción simulado para dejar evidencia de la operación dentro del prototipo.
      saveTransaction("received", "Transferencia recibida (simulada)", "Enviada por usuario demo a " + contact.name, amount);
      displayBalance();
      $("#transfer-feedback").html(`<div class="alert alert-success">Transferencia simulada de <strong>${money(amount)}</strong> a ${escapeHtml(contact.name)} realizada.</div>`);
      $("#transfer-form")[0].reset(); pendingTransfer = null;
      if (window.bootstrap) bootstrap.Modal.getOrCreateInstance(document.getElementById("confirm-transfer-modal")).hide();
    });

    function refreshTransactions() {
      const filter = $("#transaction-filter").val() || "all";
      const transactions = getTransactions();
      const filtered = filter === "all" ? transactions : transactions.filter(tx => tx.type === filter);
      renderTransactionRows("#transactions-table-wrap", filtered, false);
      displayBalance();
    }
    $("#transaction-filter").on("change", refreshTransactions);
    if ($("#transactions-table-wrap").length) refreshTransactions();

    // Efecto jQuery breve en el panel principal y mensajes accesibles.
    $(".action-card").on("mouseenter", function () { $(this).stop(true).animate({ opacity: 0.94 }, 100); })
      .on("mouseleave", function () { $(this).stop(true).animate({ opacity: 1 }, 100); });
  });
})(jQuery);
