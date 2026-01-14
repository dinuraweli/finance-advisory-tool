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
fetch("json/loanRates.json")
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
      alert("You can compare up to 3 banks only.");
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
  const monthlyRate = r / 100 / 12;
  return (P * monthlyRate * Math.pow(1 + monthlyRate, n)) /
         (Math.pow(1 + monthlyRate, n) - 1);
}

function calculateFlatEMI(P, r, n) {
  const totalInterest = P * (r / 100) * (n / 12);
  return (P + totalInterest) / n;
}

// ===============================
// EXPLANATION GENERATOR
// ===============================
function generateLoanExplanation(results, tenure) {
  if (results.length < 2) return "";

  const sorted = [...results].sort((a, b) => a.total - b.total);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const savings = worst.total - best.total;

  const structureNote =
    best.mode === "reducing"
      ? "Reducing balance structure lowers interest as the principal reduces."
      : "Flat-rate structure results in higher lifetime interest cost.";

  return `
    <div class="explanation-box">
      <strong>Why ${best.bank} is the best option</strong>
      <ul>
        <li>Saves <strong>${formatCurrency(savings)}</strong> compared to the most expensive option</li>
        <li>${structureNote}</li>
        <li>Total repayment over ${tenure} months is lowest</li>
      </ul>
    </div>
  `;
}

// ===============================
// COMPARE
// ===============================
loanCompareBtn.addEventListener("click", () => {
  const amount = +loanAmount.value;
  const tenure = +loanTenure.value;
  const modeSelect = interestMode.value;

  if (!amount || !tenure || selectedLoans.length < 2) {
    alert("Please check loan amount, tenure, and selections.");
    return;
  }

  loanComparisonBody.innerHTML = "";
  document.querySelector(".explanation-box")?.remove();

  let results = [];

  selectedLoans.forEach(i => {
    const loan = loanRates[i];

    if (tenure > loan.maxTenureMonths) return;

    const mode = modeSelect === "auto" ? loan.interestType : modeSelect;

    const emi =
      mode === "flat"
        ? calculateFlatEMI(amount, loan.interestRate, tenure)
        : calculateReducingEMI(amount, loan.interestRate, tenure);

    const totalPayment = emi * tenure;
    const processingFeeAmount = amount * (loan.processingFee / 100);
    const grandTotal = totalPayment + processingFeeAmount;

    results.push({
      bank: loan.bankName,
      mode,
      emi,
      interest: totalPayment - amount,
      total: grandTotal
    });
  });

  if (results.length < 2) {
    alert("Selected tenure exceeds some banks' maximum limits.");
    return;
  }

  const bestTotal = Math.min(...results.map(r => r.total));

  results.forEach(r => {
    const tr = document.createElement("tr");
    if (r.total === bestTotal) tr.classList.add("best-option");

    tr.innerHTML = `
      <td>${r.bank}</td>
      <td>${formatCurrency(r.emi)}</td>
      <td>${formatCurrency(r.interest)}</td>
      <td>${formatCurrency(r.total)}</td>
    `;
    loanComparisonBody.appendChild(tr);
  });

  // Inject explanation
  loanComparisonBody.insertAdjacentHTML(
    "afterend",
    generateLoanExplanation(results, tenure)
  );
});
