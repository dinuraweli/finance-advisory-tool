// ===============================
// STATE
// ===============================
const loanTableBody = document.querySelector("#loanTable tbody");
const loanComparisonBody = document.querySelector("#loanComparisonTable tbody");
const loanCompareBtn = document.getElementById("loanCompareBtn");

let loanRates = [];
let selectedLoans = [];

// ===============================
// UTILITIES
// ===============================
function formatCurrency(num) {
  return "LKR " + num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ===============================
// FETCH DATA
// ===============================
fetch("loanRates.json")
  .then(res => res.json())
  .then(data => {
    loanRates = data;
    renderLoanTable(loanRates);
  });

// ===============================
// RENDER TABLE
// ===============================
function renderLoanTable(loans) {
  loanTableBody.innerHTML = "";

  loans.forEach((loan, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" data-index="${index}" onchange="handleLoanSelection(this)"></td>
      <td>${loan.bankName}</td>
      <td>${loan.loanType}</td>
      <td>${loan.interestRate}%</td>
      <td>${loan.interestType.toUpperCase()}</td>
      <td>${loan.maxTenureMonths}</td>
      <td>${loan.processingFee}%</td>
    `;
    loanTableBody.appendChild(row);
  });
}

function handleLoanSelection(cb) {
  const i = +cb.dataset.index;
  if (cb.checked) {
    if (selectedLoans.length >= 3) {
      alert("Maximum 3 banks.");
      cb.checked = false;
      return;
    }
    selectedLoans.push(i);
  } else {
    selectedLoans = selectedLoans.filter(x => x !== i);
  }
}

// ===============================
// CALCULATIONS
// ===============================
function calculateReducingEMI(P, r, n) {
  r = r / 100 / 12;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calculateFlatEMI(P, r, n) {
  const total = P + P * (r / 100) * (n / 12);
  return total / n;
}

// ===============================
// COMPARE
// ===============================
loanCompareBtn.addEventListener("click", () => {
  const amount = +loanAmount.value;
  const tenure = +loanTenure.value;
  const modeSelect = interestMode.value;

  if (!amount || !tenure || selectedLoans.length < 2) {
    alert("Check inputs and selections.");
    return;
  }

  loanComparisonBody.innerHTML = "";
  let results = [];

  selectedLoans.forEach(i => {
    const loan = loanRates[i];
    const mode = modeSelect === "auto" ? loan.interestType : modeSelect;

    const emi = mode === "flat"
      ? calculateFlatEMI(amount, loan.interestRate, tenure)
      : calculateReducingEMI(amount, loan.interestRate, tenure);

    results.push({
      bank: loan.bankName,
      mode,
      emi,
      total: emi * tenure
    });
  });

  const best = Math.min(...results.map(r => r.total));

  results.forEach(r => {
    const tr = document.createElement("tr");
    if (r.total === best) tr.classList.add("best-option");
    tr.innerHTML = `
      <td>${r.bank}</td>
      <td>${r.mode.toUpperCase()}</td>
      <td>${formatCurrency(r.emi)}</td>
      <td>${formatCurrency(r.total - amount)}</td>
      <td>${formatCurrency(r.total)}</td>
    `;
    loanComparisonBody.appendChild(tr);
  });
});
