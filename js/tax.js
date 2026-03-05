/* tax.js */

// 1. Constants based on IRD 2025/2026 Guidelines
const RELIEF = 1800000;
const SOLAR_MAX_RELIEF = 600000;
const SLABS = [
    { limit: 1000000, rate: 0.06, color: '#10B981', label: '6%' }, // bg-emerald-500
    { limit: 500000, rate: 0.18, color: '#34D399', label: '18%' }, // bg-emerald-400
    { limit: 500000, rate: 0.24, color: '#06B6D4', label: '24%' }, // bg-cyan-500
    { limit: 500000, rate: 0.30, color: '#3B82F6', label: '30%' }, // bg-blue-500
    { limit: Infinity, rate: 0.36, color: '#8B5CF6', label: '36%' }// bg-violet-500
];

let pieChart = null;

// 2. Main Calculation Function
function calculateTax() {
    const basic = Number(document.getElementById('basicSalary').value) || 0;
    const allowances = Number(document.getElementById('allowances').value) || 0;
    const bonus = Number(document.getElementById('annualBonus').value) || 0;
    const solarInput = Number(document.getElementById('solarExpense').value) || 0;

    const monthlyGross = basic + allowances;
    const annualGross = (monthlyGross * 12) + bonus;

    // Apply Reliefs
    const appliedSolarRelief = Math.min(solarInput, SOLAR_MAX_RELIEF);
    const taxableIncome = Math.max(0, annualGross - RELIEF - appliedSolarRelief);

    let remaining = taxableIncome;
    let totalAnnualTax = 0;
    let slabUtilization = [];

    // Calculate Slabs Annually, but store the Monthly equivalents for the UI
    for (let slab of SLABS) {
        if (remaining <= 0) break;
        let taxableAtRate = Math.min(remaining, slab.limit);
        let taxForSlab = taxableAtRate * slab.rate;
        
        totalAnnualTax += taxForSlab;
        
        slabUtilization.push({
            percentage: (taxableAtRate / taxableIncome) * 100,
            color: slab.color,
            rateLabel: slab.label,
            taxAmountMonthly: taxForSlab / 12,       // For monthly breakdown
            taxableAmountMonthly: taxableAtRate / 12 // For monthly breakdown
        });
        
        remaining -= taxableAtRate;
    }

    // EPF/ETF Calculation
    const monthlyEPF = monthlyGross * 0.08;
    const employerEPF = monthlyGross * 0.12;
    const employerETF = monthlyGross * 0.03;

    // Final Totals
    const monthlyTax = totalAnnualTax / 12;
    const monthlyNet = monthlyGross - monthlyEPF - monthlyTax;

    updateUI({
        monthlyNet,
        monthlyTax,
        annualTax: totalAnnualTax,
        annualGross: annualGross,
        monthlyEPF,
        empEPF: employerEPF,
        empETF: employerETF,
        effectiveRate: annualGross > 0 ? (totalAnnualTax / annualGross) * 100 : 0,
        slabs: slabUtilization
    });

    updateChart(monthlyNet, monthlyTax, monthlyEPF);
}

// 3. UI Update Helpers
function updateUI(data) {
    const format = (v) => Math.round(v).toLocaleString();
    
    // Main Display
    document.getElementById('monthlyNet').innerText = format(data.monthlyNet);
    document.getElementById('resMonthlyTax').innerText = format(data.monthlyTax);
    document.getElementById('effectiveRate').innerText = data.effectiveRate.toFixed(1);
    
    // Annual Summary Display
    document.getElementById('resAnnualIncome').innerText = format(data.annualGross);
    document.getElementById('resAnnualTax').innerText = format(data.annualTax);

    // Secondary Cards
    document.getElementById('monthlyTax').innerText = format(data.monthlyTax);
    document.getElementById('monthlyEPF').innerText = format(data.monthlyEPF);
    document.getElementById('empEPF').innerText = format(data.empEPF);
    document.getElementById('empETF').innerText = format(data.empETF);

    // Update Slab Bar
    const barContainer = document.getElementById('slabProgressContainer');
    barContainer.innerHTML = '';
    
    // Update Slab Breakdown List (Now rendering Monthly amounts)
    const detailsContainer = document.getElementById('slabBreakdownDetails');
    detailsContainer.innerHTML = '';

    if (data.slabs.length === 0) {
        detailsContainer.innerHTML = '<div class="text-slate-400 text-xs italic py-2 text-center">Income is entirely within the tax-free relief limits. No tax payable.</div>';
    } else {
        data.slabs.forEach(s => {
            // Build the Progress Bar Segments
            const div = document.createElement('div');
            div.className = `h-full transition-all duration-700 ease-out border-r border-slate-900/50`;
            div.style.width = `${s.percentage}%`;
            div.style.backgroundColor = s.color;
            barContainer.appendChild(div);

            // Build the Detailed Breakdown Rows (Monthly)
            const row = document.createElement('div');
            row.className = 'flex justify-between items-center text-xs py-2 border-b border-slate-700/50 last:border-0';
            row.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full" style="background-color: ${s.color}"></div>
                    <span class="text-slate-300 font-medium">${s.rateLabel} Slab <span class="text-slate-500">(on LKR ${format(s.taxableAmountMonthly)})</span></span>
                </div>
                <span class="font-bold text-slate-100">LKR ${format(s.taxAmountMonthly)}</span>
            `;
            detailsContainer.appendChild(row);
        });
    }
}

// 4. Chart.js Logic
function updateChart(net, tax, epf) {
    const ctx = document.getElementById('taxPieChart').getContext('2d');
    
    if (pieChart) pieChart.destroy();
    
    pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Take-Home', 'Tax', 'EPF'],
            datasets: [{
                data: [net, tax, epf],
                backgroundColor: ['#10b981', '#f87171', '#fbbf24'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { family: 'Inter', size: 10 } }
                }
            },
            cutout: '75%'
        }
    });
}

// 5. Initialize
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', calculateTax);
});

window.onload = calculateTax;