const taxTableBody = document.querySelector("#taxTable tbody");
const taxSummary = document.getElementById("taxSummary");
const taxCalculateBtn = document.getElementById("taxCalculateBtn");

let taxConfig = null;

fetch("json/taxSlabs.json")
  .then(res => res.json())
  .then(data => taxConfig = data);

taxCalculateBtn.addEventListener("click", () => {
  const income = +annualIncome.value;

  if (!income || income <= 0) {
    alert("Enter a valid annual income.");
    return;
  }

  taxTableBody.innerHTML = "";
  taxSummary.innerHTML = "";

  let taxableIncome = Math.max(0, income - taxConfig.personalRelief);
  let remaining = taxableIncome;
  let totalTax = 0;

  taxConfig.slabs.forEach((slab, index) => {
    if (remaining <= 0) return;

    const slabAmount =
      slab.limit === null
        ? remaining
        : Math.min(remaining, slab.limit);

    const tax = slabAmount * (slab.rate / 100);
    totalTax += tax;
    remaining -= slabAmount;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>Slab ${index + 1}</td>
      <td>LKR ${slabAmount.toLocaleString()}</td>
      <td>${slab.rate}%</td>
      <td>LKR ${tax.toLocaleString()}</td>
    `;
    taxTableBody.appendChild(row);
  });

  taxSummary.innerHTML = `
    <p><strong>Total Annual Tax:</strong> LKR ${totalTax.toLocaleString()}</p>
    <p><strong>Estimated Monthly PAYE:</strong> LKR ${(totalTax / 12).toFixed(2)}</p>
  `;
});
