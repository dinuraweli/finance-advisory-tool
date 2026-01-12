const tableBody = document.querySelector("#rateTable tbody");
const comparisonBody = document.querySelector("#comparisonTable tbody");
const compareBtn = document.getElementById("compareBtn");
const principalInput = document.getElementById("principalInput");
const tenureFilter = document.getElementById("tenureFilter");

let currentProductType = "FD";

let bankRates = [];
let displayedRates = [];
let selectedBanks = [];

// ===============================
// FETCH DATA
// ===============================
fetch("bankRates.json")
  .then(res => res.json())
  .then(data => {
    bankRates = data;
    filterAndRender();
  });

// ===============================
// RENDER TABLE
// ===============================
function renderTable(rates) {
  tableBody.innerHTML = "";
  displayedRates = rates;

  rates.forEach((rate, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <input type="checkbox" data-index="${index}" onchange="handleSelection(this)">
      </td>
      <td>${rate.bankName}</td>
      <td>${rate.productType}</td>
      <td>${rate.tenureMonths ?? "-"}</td>
      <td>${rate.interestRate}</td>
      <td>${rate.payoutMethod}</td>
      <td>${rate.lastUpdated}</td>
    `;

    tableBody.appendChild(row);
  });
}

// ===============================
// HANDLE BANK SELECTION
// ===============================
function handleSelection(checkbox) {
  const index = parseInt(checkbox.dataset.index);

  if (checkbox.checked) {
    if (selectedBanks.length >= 3) {
      alert("You can select up to 3 banks only.");
      checkbox.checked = false;
      return;
    }
    selectedBanks.push(index);
  } else {
    selectedBanks = selectedBanks.filter(i => i !== index);
  }
}

// ===============================
// COMPARE RETURNS
// ===============================
compareBtn.addEventListener("click", compareReturns);

function compareReturns() {
  const principal = parseFloat(principalInput.value);

  if (!principal || principal <= 0) {
    alert("Please enter a valid principal amount.");
    return;
  }

  if (selectedBanks.length < 2) {
    alert("Please select at least 2 banks to compare.");
    return;
  }

  comparisonBody.innerHTML = "";
  let results = [];

  selectedBanks.forEach(index => {
    const bank = displayedRates[index];

    let grossInterest = 0;

    if (currentProductType === "FD") {
      const tenureYears = bank.tenureMonths / 12;
      grossInterest = principal * (bank.interestRate / 100) * tenureYears;
    } else {
      // Savings: annualized estimate
      grossInterest = principal * (bank.interestRate / 100);
    }

    const tax = grossInterest * (bank.taxRate / 100);
    const netInterest = grossInterest - tax;
    const maturityValue = principal + netInterest;

    results.push({
      bankName: bank.bankName,
      rate: bank.interestRate,
      grossInterest,
      tax,
      netInterest,
      maturityValue
    });
  });

  const best = Math.max(...results.map(r => r.maturityValue));

  results.forEach(r => {
    const row = document.createElement("tr");

    if (r.maturityValue === best) {
      row.classList.add("best-option");
    }

    row.innerHTML = `
      <td>${r.bankName}</td>
      <td>${r.rate}%</td>
      <td>${format(r.grossInterest)}</td>
      <td>${format(r.tax)}</td>
      <td>${format(r.netInterest)}</td>
      <td>${format(r.maturityValue)}</td>
    `;

    comparisonBody.appendChild(row);
  });
}

// ===============================
// FORMAT CURRENCY
// ===============================
function format(value) {
  return "LKR " + value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ===============================
// TENURE FILTER
// ===============================
tenureFilter.addEventListener("change", applyTenureFilter);

function applyTenureFilter() {
  const selectedTenure = tenureFilter.value;
  selectedBanks = [];
  comparisonBody.innerHTML = "";

  let filtered = bankRates.filter(r => r.productType === currentProductType);

  if (selectedTenure !== "all") {
    filtered = filtered.filter(
      r => r.tenureMonths === parseInt(selectedTenure)
    );
  }

  renderTable(filtered);
}

// ===============================
// PRODUCT TYPE TOGGLE (FD / SAVINGS)
// ===============================
document.querySelectorAll('input[name="productType"]').forEach(radio => {
  radio.addEventListener("change", () => {
    currentProductType = radio.value;
    tenureFilter.value = "all";
    selectedBanks = [];
    comparisonBody.innerHTML = "";
    filterAndRender();
  });
});

function filterAndRender() {
  const filteredRates = bankRates.filter(
    r => r.productType === currentProductType
  );
  renderTable(filteredRates);
}
