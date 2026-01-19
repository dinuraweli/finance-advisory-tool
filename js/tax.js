// Tax Slabs for Sri Lanka
const TAX_SLABS = {
    2024: [
        { min: 0, max: 1200000, rate: 0 },
        { min: 1200000, max: 2400000, rate: 6 },
        { min: 2400000, max: 3600000, rate: 12 },
        { min: 3600000, max: 4800000, rate: 18 },
        { min: 4800000, max: 6000000, rate: 24 },
        { min: 6000000, max: Infinity, rate: 30 }
    ],
    2023: [
        { min: 0, max: 1200000, rate: 0 },
        { min: 1200000, max: 2400000, rate: 6 },
        { min: 2400000, max: 3600000, rate: 12 },
        { min: 3600000, max: 4800000, rate: 18 },
        { min: 4800000, max: 6000000, rate: 24 },
        { min: 6000000, max: Infinity, rate: 30 }
    ]
};

// Relief amounts
const RELIEFS = {
    self: 500000,
    spouse: 500000,
    child: 250000,
    disabled: 500000,
    maxChildren: 3
};

// State
let state = {
    inputType: 'monthly',
    taxYear: 2024
};

// Charts
let charts = {
    income: null,
    tax: null
};

// Format currency
function formatCurrency(value) {
    return 'LKR ' + Math.round(value).toLocaleString('en-LK');
}

// Toggle input type
function toggleInputType() {
    const radios = document.getElementsByName('inputType');
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            state.inputType = radios[i].value;
            break;
        }
    }
    
    // Update suffixes
    const suffix = state.inputType === 'monthly' ? '/month' : '/year';
    document.getElementById('salarySuffix').textContent = suffix;
    document.getElementById('allowancesSuffix').textContent = suffix;
    
    calculate();
}

// Calculate tax
function calculate() {
    // Get tax year
    state.taxYear = parseInt(document.getElementById('taxYear').value);
    
    // Get income values
    let basicSalary = parseFloat(document.getElementById('basicSalary').value) || 0;
    let allowances = parseFloat(document.getElementById('allowances').value) || 0;
    let bonuses = parseFloat(document.getElementById('bonuses').value) || 0;
    let overtime = parseFloat(document.getElementById('overtime').value) || 0;
    
    // Convert to annual if monthly
    if (state.inputType === 'monthly') {
        basicSalary *= 12;
        allowances *= 12;
        overtime *= 12;
    }
    
    const businessIncome = parseFloat(document.getElementById('businessIncome').value) || 0;
    const rentalIncome = parseFloat(document.getElementById('rentalIncome').value) || 0;
    const investmentIncome = parseFloat(document.getElementById('investmentIncome').value) || 0;
    const otherIncome = parseFloat(document.getElementById('otherIncome').value) || 0;
    
    // Calculate total gross income
    const employmentIncome = basicSalary + allowances + bonuses + overtime;
    const totalGrossIncome = employmentIncome + businessIncome + rentalIncome + investmentIncome + otherIncome;
    
    // Get deductions
    const epfContributions = parseFloat(document.getElementById('epfContributions').value) || 0;
    const pensionFund = parseFloat(document.getElementById('pensionFund').value) || 0;
    const lifeInsurance = parseFloat(document.getElementById('lifeInsurance').value) || 0;
    const medicalInsurance = parseFloat(document.getElementById('medicalInsurance').value) || 0;
    const donations = parseFloat(document.getElementById('donations').value) || 0;
    
    const qprDeductions = epfContributions + pensionFund + lifeInsurance + medicalInsurance + donations;
    
    // Get reliefs
    let reliefs = 0;
    if (document.getElementById('selfRelief').checked) {
        reliefs += RELIEFS.self;
    }
    if (document.getElementById('spouseRelief').checked) {
        reliefs += RELIEFS.spouse;
    }
    
    const children = Math.min(parseInt(document.getElementById('children').value) || 0, RELIEFS.maxChildren);
    reliefs += children * RELIEFS.child;
    
    if (document.getElementById('disabledRelief').checked) {
        reliefs += RELIEFS.disabled;
    }
    
    const totalDeductions = qprDeductions + reliefs;
    
    // Calculate taxable income
    const taxableIncome = Math.max(0, totalGrossIncome - totalDeductions);
    
    // Calculate tax using slabs
    const taxSlabs = TAX_SLABS[state.taxYear];
    let totalTax = 0;
    const slabBreakdown = [];
    
    for (let i = 0; i < taxSlabs.length; i++) {
        const slab = taxSlabs[i];
        const slabMin = slab.min;
        const slabMax = slab.max;
        const slabRate = slab.rate;
        
        if (taxableIncome > slabMin) {
            const taxableInSlab = Math.min(taxableIncome, slabMax) - slabMin;
            const taxInSlab = (taxableInSlab * slabRate) / 100;
            totalTax += taxInSlab;
            
            slabBreakdown.push({
                min: slabMin,
                max: slabMax,
                rate: slabRate,
                taxableAmount: taxableInSlab,
                taxAmount: taxInSlab
            });
        } else {
            slabBreakdown.push({
                min: slabMin,
                max: slabMax,
                rate: slabRate,
                taxableAmount: 0,
                taxAmount: 0
            });
        }
    }
    
    const effectiveTaxRate = totalGrossIncome > 0 ? (totalTax / totalGrossIncome) * 100 : 0;
    const annualTakeHome = totalGrossIncome - totalTax;
    const monthlyGross = totalGrossIncome / 12;
    const monthlyTax = totalTax / 12;
    const monthlyTakeHome = annualTakeHome / 12;
    
    // Update UI
    updateSummaryCards(totalGrossIncome, totalDeductions, taxableIncome, totalTax, effectiveTaxRate, annualTakeHome);
    updateCharts(employmentIncome, businessIncome, rentalIncome, investmentIncome, otherIncome, totalTax, annualTakeHome);
    updateTaxSlabs(slabBreakdown, taxableIncome);
    updateMonthlyDetails(monthlyGross, monthlyTax, monthlyTakeHome);
    updateOptimizationTips(totalGrossIncome, qprDeductions, reliefs, totalTax);
    
    // Update total displays
    document.getElementById('totalGrossIncome').textContent = formatCurrency(totalGrossIncome);
    document.getElementById('totalDeductions').textContent = formatCurrency(totalDeductions);
}

// Update summary cards
function updateSummaryCards(gross, deductions, taxable, tax, rate, takeHome) {
    document.getElementById('summaryGross').textContent = formatCurrency(gross);
    document.getElementById('summaryDeductions').textContent = formatCurrency(deductions);
    document.getElementById('summaryTaxable').textContent = formatCurrency(taxable);
    document.getElementById('summaryTax').textContent = formatCurrency(tax);
    document.getElementById('summaryRate').textContent = rate.toFixed(2) + '%';
    document.getElementById('summaryTakeHome').textContent = formatCurrency(takeHome);
}

// Update charts
function updateCharts(employment, business, rental, investment, other, tax, takeHome) {
    // Income breakdown chart
    const incomeCtx = document.getElementById('incomeChart');
    
    if (charts.income) {
        charts.income.destroy();
    }
    
    const incomeData = [];
    const incomeLabels = [];
    const incomeColors = [];
    
    if (employment > 0) {
        incomeData.push(employment);
        incomeLabels.push('Employment');
        incomeColors.push('#10b981');
    }
    if (business > 0) {
        incomeData.push(business);
        incomeLabels.push('Business');
        incomeColors.push('#3b82f6');
    }
    if (rental > 0) {
        incomeData.push(rental);
        incomeLabels.push('Rental');
        incomeColors.push('#f59e0b');
    }
    if (investment > 0) {
        incomeData.push(investment);
        incomeLabels.push('Investment');
        incomeColors.push('#8b5cf6');
    }
    if (other > 0) {
        incomeData.push(other);
        incomeLabels.push('Other');
        incomeColors.push('#ec4899');
    }
    
    if (incomeData.length > 0) {
        charts.income = new Chart(incomeCtx, {
            type: 'pie',
            data: {
                labels: incomeLabels,
                datasets: [{
                    data: incomeData,
                    backgroundColor: incomeColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = formatCurrency(context.raw);
                                const total = context.dataset.data.reduce(function(a, b) {
                                    return a + b;
                                }, 0);
                                const percent = ((context.raw / total) * 100).toFixed(1);
                                return label + ': ' + value + ' (' + percent + '%)';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Tax vs Take-home chart
    const taxCtx = document.getElementById('taxChart');
    
    if (charts.tax) {
        charts.tax.destroy();
    }
    
    charts.tax = new Chart(taxCtx, {
        type: 'doughnut',
        data: {
            labels: ['Tax Payable', 'Take-Home'],
            datasets: [{
                data: [tax, takeHome],
                backgroundColor: ['#ef4444', '#10b981']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.raw);
                            const total = context.dataset.data.reduce(function(a, b) {
                                return a + b;
                            }, 0);
                            const percent = ((context.raw / total) * 100).toFixed(1);
                            return label + ': ' + value + ' (' + percent + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Update tax slabs breakdown
function updateTaxSlabs(slabs, taxableIncome) {
    const container = document.getElementById('taxSlabsBreakdown');
    
    container.innerHTML = slabs.map(function(slab) {
        const rangeText = slab.max === Infinity 
            ? 'Above ' + formatCurrency(slab.min)
            : formatCurrency(slab.min) + ' - ' + formatCurrency(slab.max);
        
        const slabSize = slab.max === Infinity ? taxableIncome - slab.min : slab.max - slab.min;
        const percentFilled = slab.taxableAmount > 0 ? (slab.taxableAmount / slabSize) * 100 : 0;
        
        return '<div class="slab-item">' +
            '<div class="slab-header">' +
            '<span class="slab-range">' + rangeText + '</span>' +
            '<span class="slab-rate">' + slab.rate + '%</span>' +
            '</div>' +
            '<div class="slab-details">' +
            '<div class="slab-detail">Taxable in this slab: <strong>' + formatCurrency(slab.taxableAmount) + '</strong></div>' +
            '<div class="slab-detail">Tax: <strong>' + formatCurrency(slab.taxAmount) + '</strong></div>' +
            '</div>' +
            '<div class="slab-progress">' +
            '<div class="progress-bar">' +
            '<div class="progress-fill" style="width: ' + Math.min(percentFilled, 100) + '%"></div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }).join('');
}

// Update monthly details
function updateMonthlyDetails(gross, tax, takeHome) {
    document.getElementById('monthlyGross').textContent = formatCurrency(gross);
    document.getElementById('monthlyTax').textContent = formatCurrency(tax);
    document.getElementById('monthlyTakeHome').textContent = formatCurrency(takeHome);
}

// Update optimization tips
function updateOptimizationTips(gross, qpr, reliefs, tax) {
    const tips = [];
    
    // QPR suggestions
    const maxQPR = gross * 0.33; // 33% of gross income
    if (qpr < maxQPR) {
        const potential = maxQPR - qpr;
        tips.push('You can claim up to <span class="tip-highlight">' + formatCurrency(maxQPR) + '</span> in QPR deductions. Consider maximizing contributions to EPF, life insurance, or approved pension funds to reduce taxable income by an additional <span class="tip-highlight">' + formatCurrency(potential) + '</span>.');
    }
    
    // Relief suggestions
    if (!document.getElementById('spouseRelief').checked && gross > 1200000) {
        tips.push('If your spouse is not employed, you may be eligible for spouse relief of <span class="tip-highlight">' + formatCurrency(RELIEFS.spouse) + '</span>, potentially saving you significant tax.');
    }
    
    const children = parseInt(document.getElementById('children').value) || 0;
    if (children < RELIEFS.maxChildren && gross > 1200000) {
        tips.push('You can claim relief for up to <span class="tip-highlight">3 dependent children</span>. Each child provides <span class="tip-highlight">' + formatCurrency(RELIEFS.child) + '</span> in tax relief.');
    }
    
    // General tips
    if (tax > 0) {
        tips.push('Consider investing in tax-efficient instruments like approved pension schemes or unit trusts to reduce your tax liability while building long-term wealth.');
    }
    
    if (gross > 3600000) {
        tips.push('At your income level, maximizing all available deductions and reliefs is crucial. Consider consulting a tax professional to ensure you\'re optimizing your tax position.');
    }
    
    if (tips.length === 0) {
        tips.push('Great job! You\'re already maximizing your available tax deductions and reliefs.');
    }
    
    const container = document.getElementById('optimizationTips');
    container.innerHTML = tips.map(function(tip) {
        return '<div class="tip-item">' + tip + '</div>';
    }).join('');
}

// Initialize
calculate();