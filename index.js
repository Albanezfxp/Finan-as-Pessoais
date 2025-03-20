let transactions = [];

function createTransactionContainer(id) {
  const container = document.createElement("div");
  container.classList.add("transaction");
  container.id = `transaction-${id}`;
  return container;
}

function createTransactionTitle(name) {
  const title = document.createElement("span");
  title.classList.add("transaction-title");
  title.textContent = name;
  return title;
}

function createTransactionAmount(amount) {
  const span = document.createElement("span");
  span.classList.add("transaction-amount");
  const formater = Intl.NumberFormat("pt-BR", {
    compactDisplay: "long",
    currency: "BRL",
    style: "currency",
  });
  const formattedAmount = formater.format(amount);
  if (amount > 0) {
    span.textContent = `${formattedAmount} C`;
    span.classList.add("credit");
  } else {
    span.textContent = `${formattedAmount} D`;
    span.classList.add("debit");
  }
  return span;
}

function createEditTransactionBtn(transaction) {
  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-btn");
  editBtn.textContent = "Editar";
  editBtn.addEventListener("click", () => {
    document.querySelector("#id").value = transaction.id;
    document.querySelector("#name").value = transaction.name;
    document.querySelector("#amount").value = transaction.amount;
  });
  return editBtn;
}

function createDeleteTransactionBtn(id) {
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.textContent = "Excluir";
  deleteBtn.addEventListener("click", () => {
    const indexToRemove = transactions.findIndex((t) => t.id === id);
    transactions.splice(indexToRemove, 1);
    deleteBtn.parentElement.remove();
    updateBalance();
    saveToLocalStorage();
  });
  return deleteBtn;
}

function renderTransaction(transaction) {
  const container = createTransactionContainer(transaction.id);
  const title = createTransactionTitle(transaction.name);
  const amount = createTransactionAmount(transaction.amount);
  const editBtn = createEditTransactionBtn(transaction);
  const deleteBtn = createDeleteTransactionBtn(transaction.id);
  container.append(title, amount, editBtn, deleteBtn);
  document.querySelector("#transactions").append(container);
}

function saveTransaction(ev) {
  ev.preventDefault();

  const id = document.querySelector("#id").value;
  const name = document.querySelector("#name").value;
  const amount = parseFloat(document.querySelector("#amount").value);

  if (id) {
    const indexToUpdate = transactions.findIndex((t) => t.id === parseInt(id));
    transactions[indexToUpdate] = { ...transactions[indexToUpdate], name, amount };
    document.querySelector(`#transaction-${id}`).remove();
    renderTransaction(transactions[indexToUpdate]);
  } else {
    const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
    const transaction = { id: newId, name, amount };
    transactions.push(transaction);
    renderTransaction(transaction);
  }

  ev.target.reset();
  updateBalance();
  saveToLocalStorage();
}

function updateBalance() {
  const balanceSpan = document.querySelector("#balance");
  const balance = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );
  const formater = Intl.NumberFormat("pt-BR", {
    compactDisplay: "long",
    currency: "BRL",
    style: "currency",
  });
  balanceSpan.textContent = formater.format(balance);
}

function saveToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadFromLocalStorage() {
  const savedTransactions = localStorage.getItem('transactions');
  if (savedTransactions) {
    transactions = JSON.parse(savedTransactions);
    return true;
  }
  return false;
}

async function setup() {
  if (!loadFromLocalStorage()) {
    try {
      const response = await fetch('./db.json');
      const data = await response.json();
      transactions = data.transactions;
      saveToLocalStorage();
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  }
  transactions.forEach(renderTransaction);
  updateBalance();
}

document.addEventListener("DOMContentLoaded", setup);
document.querySelector("form").addEventListener("submit", saveTransaction);
