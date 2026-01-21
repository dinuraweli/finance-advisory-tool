// Tax Calculator for Sri Lanka - Assessment Year 2025/2026

// Constants
const PERSONAL_RELIEF = 1800000; // LKR 1.8M tax-free threshold
const EMPLOYER_EPF_RATE = 0.12; // 12%
const EMPLOYER_ETF_RATE = 0.03; // 3%

const TAX_SLABS = [
    { limit: 1000000, rate: 0.06, label: 'First LKR 1M' },
    { limit: 500000, rate: 0.18, label: 'Next LKR 500K' },
    { limit: 500000, rate: 0.24, label: 'Next LKR 500K' },
    { limit: 500000, rate: 0.30, label: 'Next LKR 500K' },
    { limit: Infinity, rate: 0.36, label: 'Above LKR 2.5M' }
];

// Chart instances
let pieChart = null;
let barChart = null;

// Helper Functions
const getVal = id => Number(document.getElementById(id).value) || 0;
const formatLKR = n => n.toLocaleString("en-LK", { maximumFractionDigits: 0 });

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to all inputs
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', calculate);
    });
    
    // Initial calculation
    calculate();
});

// Main Calculation Function
function calculate() {
    // Get input values
    const basicSalary = getVal('basicSalary');
    const allowances = getVal('allowances');
    const annualBonus = getVal('bonus');
    const employeeEPFRate = getVal('epfRate') / 100;

    // Calculate gross income
    const monthlyGross = basicSalary + allowances;
    const annualGross = (monthlyGross * 12) + annualBonus;

    // Calculate taxable income (after personal relief)
    const taxableIncome = Math.max(0, annualGross - PERSONAL_RELIEF);

    // Calculate tax using slabs
    const taxBreakdown = calculateTaxBySlabs(taxableIncome);
    const totalTax = taxBreakdown.totalTax;

    // Calculate employee EPF
    const employeeEPF = annualGross * employeeEPFRate;

    // Calculate employer contributions
    const employerEPF = annualGross * EMPLOYER_EPF_RATE;
    const employerETF = annualGross * EMPLOYER_ETF_RATE;
    const totalEmployerCost = annualGross + employerEPF + employerETF;

    // Calculate net take-home
    const netTakeHome = annualGross - totalTax - employeeEPF;

    // Monthly calculations
    const monthlyTax = totalTax / 12;
    const monthlyEPF = employeeEPF / 12;
    const monthlyNet = netTakeHome / 12;

    // Update UI
    updateIncomeDisplay(monthlyGross, annualGross);
    updateEmployerContributions(employerEPF, employerETF, totalEmployerCost);
    updateSummaryCards(annualGross, taxableIncome, totalTax, netTakeHome);
    updateMonthlyBreakdown(monthlyGross, monthlyEPF, monthlyTax, monthlyNet);
    updateTaxSlabsBreakdown(taxBreakdown.slabs);
    updateCharts(annualGross, totalTax, employeeEPF, netTakeHome, taxBreakdown.slabs);
    updateOptimizationTips(annualGross, taxableIncome, totalTax);
}

// Calculate tax by slabs
function calculateTaxBySlabs(taxableIncome) {
    let remaining = taxableIncome;
    let totalTax = 0;
    const slabs = [];

    TAX_SLABS.forEach(slab => {
        if (remaining <= 0) {
            slabs.push({
                label: slab.label,
                rate: slab.rate,
                income: 0,
                tax: 0,
                percentage: 0
            });
            return;
        }

        const slabIncome = Math.min(slab.limit, remaining);
        const slabTax = slabIncome * slab.rate;
        const percentage = taxableIncome > 0 ? (slabIncome / taxableIncome) * 100 : 0;

        totalTax += slabTax;
        remaining -= slabIncome;

        slabs.push({
            label: slab.label,
            rate: slab.rate,
            income: slabIncome,
            tax: slabTax,
            percentage: percentage
        });
    });

    return { totalTax, slabs };
}

// Update income display
function updateIncomeDisplay(monthlyGross, annualGross) {
    document.getElementById('displayMonthlyGross').textContent = `LKR ${formatLKR(monthlyGross)}`;
    document.getElementById('displayAnnualGross').textContent = `LKR ${formatLKR(annualGross)}`;
}

// Update employer contributions
function updateEmployerContributions(epf, etf, total) {
    document.getElementById('employerEPF').textContent = `LKR ${formatLKR(epf)}`;
    document.getElementById('employerETF').textContent = `LKR ${formatLKR(etf)}`;
    document.getElementById('totalEmployerCost').textContent = `LKR ${formatLKR(total)}`;
}

// Update summary cards
function updateSummaryCards(gross, taxable, tax, takeHome) {
    document.getElementById('summaryGross').textContent = `LKR ${formatLKR(gross)}`;
    document.getElementById('summaryTaxable').textContent = `LKR ${formatLKR(taxable)}`;
    document.getElementById('summaryTax').textContent = `LKR ${formatLKR(tax)}`;
    document.getElementById('summaryTakeHome').textContent = `LKR ${formatLKR(takeHome)}`;
}

// Update monthly breakdown
function updateMonthlyBreakdown(gross, epf, tax, net) {
    document.getElementById('monthlyGross').textContent = `LKR ${formatLKR(gross)}`;
    document.getElementById('monthlyEPF').textContent = `- LKR ${formatLKR(epf)}`;
    document.getElementById('monthlyTax').textContent = `- LKR ${formatLKR(tax)}`;
    document.getElementById('monthlyTakeHome').textContent = `LKR ${formatLKR(net)}`;
}

// Update tax slabs breakdown
function updateTaxSlabsBreakdown(slabs) {
    const container = document.getElementById('taxSlabsBreakdown');
    let html = '';

    const activeSlabs = slabs.filter(slab => slab.income > 0);

    if (activeSlabs.length === 0) {
        html = '<div style="text-align: center; padding: 30px; color: #6b7280;">' +
               '<div style="font-size: 3em; margin-bottom: 10px;">🎉</div>' +
               '<div style="font-size: 1.1em; font-weight: 600;">No tax applicable</div>' +
               '<div style="font-size: 0.9em; margin-top: 5px;">Your income is below the tax-free threshold</div>' +
               '</div>';
    } else {
        activeSlabs.forEach(slab => {
            html += `
                <div class="slab-item">
                    <div class="slab-header">
                        <span class="slab-range">${slab.label}</span>
                        <span class="slab-rate">${(slab.rate * 100).toFixed(0)}%</span>
                    </div>
                    <div class="slab-details">
                        <div class="slab-detail">
                            Taxable Income: <strong>LKR ${formatLKR(slab.income)}</strong>
                        </div>
                        <div class="slab-detail">
                            Tax Amount: <strong>LKR ${formatLKR(slab.tax)}</strong>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${slab.percentage}%"></div>
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML = html;
}

// Update charts
function updateCharts(gross, tax, epf, net, slabs) {
    // Destroy existing charts
    if (pieChart) {
        pieChart.destroy();
    }
    if (barChart) {
        barChart.destroy();
    }

    // Pie Chart - Income Distribution
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: ['Take-Home', 'PAYE Tax', 'Employee EPF'],
            datasets: [{
                data: [net, tax, epf],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const percentage = ((value / gross) * 100).toFixed(1);
                            return `${label}: LKR ${formatLKR(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Bar Chart - Tax by Slab
    const activeSlabs = slabs.filter(s => s.income > 0);
    
    if (activeSlabs.length > 0) {
        const barCtx = document.getElementById('barChart').getContext('2d');
        barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: activeSlabs.map(s => s.label),
                datasets: [{
                    label: 'Tax Amount (LKR)',
                    data: activeSlabs.map(s => s.tax),
                    backgroundColor: '#667eea',
                    borderRadius: 8,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Tax: LKR ${formatLKR(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'LKR ' + formatLKR(value);
                            }
                        },
                        grid: {
                            color: '#f3f4f6'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    } else {
        // Show "No Tax" message in bar chart
        const barCtx = document.getElementById('barChart').getContext('2d');
        barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['No Tax Applicable'],
                datasets: [{
                    label: 'Tax Amount',
                    data: [0],
                    backgroundColor: '#e5e7eb'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

// Update optimization tips
function updateOptimizationTips(gross, taxable, tax) {
    const tipsContainer = document.getElementById('optimizationTips');
    const tips = [];
    const effectiveRate = gross > 0 ? (tax / gross) * 100 : 0;
    const monthlyGross = gross / 12;

    // Tip 1: Tax-free status
    if (gross < PERSONAL_RELIEF) {
        tips.push(`🎉 Great news! Your annual income is below the tax-free threshold of <span class="tip-highlight">LKR ${formatLKR(PERSONAL_RELIEF)}</span>. You don't owe any income tax!`);
    } else if (gross < PERSONAL_RELIEF * 1.2) {
        tips.push(`💡 You're close to the tax-free threshold. Consider if any <span class="tip-highlight">qualifying payment reliefs (QPR)</span> like life insurance premiums or approved donations could reduce your taxable income.`);
    }

    // Tip 2: Effective tax rate
    if (effectiveRate > 0) {
        tips.push(`📊 Your effective tax rate is <span class="tip-highlight">${effectiveRate.toFixed(2)}%</span> of your gross income. This is the actual percentage of your income going to taxes.`);
    }

    // Tip 3: EPF benefits
    if (monthlyGross > 0) {
        const totalEPF = gross * 0.20; // 8% employee + 12% employer
        tips.push(`🏦 Combined EPF savings (you + employer): <span class="tip-highlight">LKR ${formatLKR(totalEPF)}</span> annually. This is your retirement fund building up!`);
    }

    // Tip 4: Tax planning
    if (taxable > 0) {
        const savingsNeeded = Math.ceil(taxable / 100000) * 100000;
        tips.push(`📋 To reduce your tax burden, explore <span class="tip-highlight">tax-deductible investments</span> such as approved pension schemes, life insurance, or donations to approved charities.`);
    }

    // Tip 5: Monthly budgeting
    const monthlyNet = (gross - tax - (gross * 0.08)) / 12;
    if (monthlyNet > 0) {
        tips.push(`💰 Your monthly take-home is <span class="tip-highlight">LKR ${formatLKR(monthlyNet)}</span>. Consider setting aside 10-20% for savings and investments beyond EPF.`);
    }

    // Tip 6: Bonus planning
    if (gross > PERSONAL_RELIEF && taxable > 0) {
        tips.push(`🎯 Performance bonuses are added to your annual income and taxed accordingly. Plan your <span class="tip-highlight">year-end tax obligations</span> when negotiating bonuses.`);
    }

    // Display tips
    if (tips.length === 0) {
        tips.push('💡 Enter your income details to see personalized tax optimization tips!');
    }

    tipsContainer.innerHTML = tips.map(tip => `<div class="tip-item">${tip}</div>`).join('');
}