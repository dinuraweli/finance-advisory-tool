const fxTableBody = document.querySelector("#fxTable tbody");
const fxComparisonBody = document.querySelector("#fxComparisonTable tbody");
const fxCompareBtn = document.getElementById("fxCompareBtn");

let fxRates = [];
let selectedFX = [];

fetch("json/fxRates.json")
  .then(res => res.json())
  .then(data => {
    fxRates = data;
    renderFXTable(fxRates);
  });

function renderFXTable(rates) {
  fxTableBody.innerHTML = "";

  rates.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" data-index="${i}" onchange="selectFX(this)"></td>
      <td>${r.bankName}</td>
      <td>${r.buyRate}</td>
      <td>${r.sellRate}</td>
      <td>${(r.sellRate - r.buyRate).toFixed(2)}</td>
    `;
    fxTableBody.appendChild(tr);
  });
}

function selectFX(cb) {
  const i = +cb.dataset.index;
  if (cb.checked) {
    if (selectedFX.length >= 3) {
      alert("Max 3 banks.");
      cb.checked = false;
      return;
    }
    selectedFX.push(i);
  } else {
    selectedFX = selectedFX.filter(x => x !== i);
  }
}

fxCompareBtn.addEventListener("click", () => {
  const amount = +fxAmount.value;
  const currency = fxCurrency.value;
  const direction = fxDirection.value;

  if (!amount || selectedFX.length < 2) {
    alert("Enter amount and select at least 2 banks.");
    return;
  }

  fxComparisonBody.innerHTML = "";
  let results = [];

  selectedFX.forEach(i => {
    const fx = fxRates[i];
    if (fx.currency !== currency) return;

    const rate = direction === "sell" ? fx.buyRate : fx.sellRate;
    const converted =
      direction === "sell"
        ? amount * rate
        : amount / rate;

    results.push({
      bank: fx.bankName,
      converted
    });
  });

  const best =
    direction === "sell"
      ? Math.max(...results.map(r => r.converted))
      : Math.min(...results.map(r => r.converted));

  results.forEach(r => {
    const tr = document.createElement("tr");
    if (r.converted === best) tr.classList.add("best-option");

    tr.innerHTML = `
      <td>${r.bank}</td>
      <td>LKR ${r.converted.toLocaleString()}</td>
    `;
    fxComparisonBody.appendChild(tr);
  });
});
