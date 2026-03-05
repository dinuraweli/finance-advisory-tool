const fdData = {
    "Commercial Bank": {
        1: 7.00,
        6: 7.50,
        12: 8.25,
        24: 8.75,
        36: 9.00,
        48: 9.25
    },
    "Bank of Ceylon": {
        6: 7.25,
        12: 8.00,
        24: 8.50,
        36: 8.75,
        48: 9.00,
        60: 9.25
    },
    "People's Bank": {
        6: 7.25,
        12: 8.00,
        24: 8.50,
        36: 8.75,
        48: 9.00
    },
    "Sampath Bank": {
        6: 7.75,
        12: 8.50,
        24: 9.00,
        36: 9.25,
        48: 9.50
    },
    "Hatton National Bank": {
        6: 7.50,
        12: 8.25,
        24: 8.75,
        36: 9.00,
        48: 9.25,
        60: 9.50
    },
    "DFCC Bank": {
        6: 8.00,
        12: 8.75,
        24: 9.25,
        36: 9.50,
        48: 9.75
    },
    "National Savings Bank": {
        12: 8.00,
        24: 8.50,
        36: 8.75,
        48: 9.00,
        60: 9.25
    },
    "Seylan Bank": {
        6: 7.50,
        12: 8.25,
        24: 8.75,
        36: 9.00,
        48: 9.25
    },
    "NDB Bank": {
        6: 7.75,
        12: 8.50,
        24: 9.00,
        36: 9.25
    },
    "Nations Trust Bank": {
        6: 7.50,
        12: 8.25,
        24: 8.75,
        36: 9.00,
        48: 9.25,
        60: 9.50
    }
};

// Format number with commas
function formatNumber(num) {
    return num.toLocaleString('en-LK');
}

// Get all unique tenures available across banks
function getAllTenures() {
    const tenures = new Set();
    for (const bank in fdData) {
        Object.keys(fdData[bank]).forEach(tenure => tenures.add(parseInt(tenure)));
    }
    return Array.from(tenures).sort((a, b) => a - b);
}

// Enhanced updateRatesTable function
function updateRatesTable() {
    const selectedTenure = document.getElementById('tenureFilter').value;
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    const banksWithDetails = [];
    let banksWithSelectedTenure = 0;

    for (const bank in fdData) {
        const rates = fdData[bank];
        const availableTenures = Object.keys(rates).map(t => parseInt(t)).sort((a, b) => a - b);
        
        // Find best rate for this bank
        let bestRate = 0;
        let bestTenure = '';
        for (const tenure in rates) {
            if (rates[tenure] > bestRate) {
                bestRate = rates[tenure];
                bestTenure = tenure;
            }
        }

        // Check if bank offers the selected tenure
        const hasSelectedTenure = selectedTenure === 'all' ? true : rates[selectedTenure];
        if (hasSelectedTenure && selectedTenure !== 'all') {
            banksWithSelectedTenure++;
        }

        // Create tenure display string
        const tenureDisplay = availableTenures.map(t => {
            const isSelected = selectedTenure !== 'all' && t === parseInt(selectedTenure);
            return `${t}m (${rates[t].toFixed(2)}%)`;
        }).join(', ');

        banksWithDetails.push({
            name: bank,
            availableTenures: availableTenures,
            tenureDisplay: tenureDisplay,
            bestRate: bestRate,
            bestTenure: bestTenure,
            rateForSelected: selectedTenure !== 'all' ? rates[selectedTenure] : null,
            hasSelected: hasSelectedTenure
        });
    }

    // Sort banks
    if (selectedTenure !== 'all') {
        // Sort by those offering selected tenure first, then by rate for selected tenure
        banksWithDetails.sort((a, b) => {
            if (a.hasSelected && !b.hasSelected) return -1;
            if (!a.hasSelected && b.hasSelected) return 1;
            if (a.hasSelected && b.hasSelected) {
                return b.rateForSelected - a.rateForSelected;
            }
            return 0;
        });
    } else {
        // Sort by best rate overall
        banksWithDetails.sort((a, b) => b.bestRate - a.bestRate);
    }

    // Update table
    if (banksWithDetails.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-data">No banks available</td></tr>';
        return;
    }

    banksWithDetails.forEach(bank => {
        const row = document.createElement('tr');
        
        if (selectedTenure !== 'all') {
            // Highlight rows that offer the selected tenure
            if (bank.hasSelected) {
                row.classList.add('best-rate');
            }
            
            row.innerHTML = `
                <td>${bank.name}</td>
                <td><span class="tenure-badge">${bank.tenureDisplay}</span></td>
                <td>${bank.hasSelected ? 
                    `<span class="rate-highlight">${bank.rateForSelected.toFixed(2)}%</span>` : 
                    '<span class="na-badge">Not Available</span>'}
                </td>
            `;
        } else {
            row.innerHTML = `
                <td>${bank.name}</td>
                <td><span class="tenure-badge">${bank.tenureDisplay}</span></td>
                <td><span class="rate-highlight">${bank.bestRate.toFixed(2)}% (${bank.bestTenure}m)</span></td>
            `;
        }
        
        tbody.appendChild(row);
    });

    // Update tenure filter options to show all available tenures
    updateTenureFilterOptions();
}

// Update tenure filter dropdown with all available tenures
function updateTenureFilterOptions() {
    const tenureFilter = document.getElementById('tenureFilter');
    const currentValue = tenureFilter.value;
    const allTenures = getAllTenures();
    
    // Clear existing options except "All Tenures"
    while (tenureFilter.options.length > 1) {
        tenureFilter.remove(1);
    }
    
    // Add all available tenures
    allTenures.forEach(tenure => {
        const option = document.createElement('option');
        option.value = tenure;
        
        // Format month display (handle singular/plural)
        if (tenure === 1) {
            option.textContent = `${tenure} Month`;
        } else {
            option.textContent = `${tenure} Months`;
        }
        
        tenureFilter.appendChild(option);
    });
    
    // Restore previous selection if still valid
    if (currentValue !== 'all' && allTenures.includes(parseInt(currentValue))) {
        tenureFilter.value = currentValue;
    }
}

// Populate bank dropdown
function populateBankDropdowns() {
    const banks = Object.keys(fdData).sort();
    const bank1 = document.getElementById('bank1');
    const bank2 = document.getElementById('bank2');

    // Clear existing options
    bank1.innerHTML = '<option value="">-- Select Bank --</option>';
    bank2.innerHTML = '<option value="">-- Select Bank --</option>';

    banks.forEach(bank => {
        const option1 = document.createElement('option');
        option1.value = bank;
        option1.textContent = bank;
        bank1.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = bank;
        option2.textContent = bank;
        bank2.appendChild(option2);
    });
}

// Update tenure dropdown based on selected bank
function updateTenureDropdown(calculatorNum) {
    const bankSelect = document.getElementById(`bank${calculatorNum}`);
    const tenureSelect = document.getElementById(`tenure${calculatorNum}`);
    const selectedBank = bankSelect.value;

    tenureSelect.innerHTML = '<option value="">-- Select Period --</option>';
    
    if (!selectedBank) {
        tenureSelect.disabled = true;
        return;
    }

    const tenures = Object.keys(fdData[selectedBank]).map(t => parseInt(t)).sort((a, b) => a - b);

    if (tenures.length === 0) {
        tenureSelect.disabled = true;
        return;
    }

    tenureSelect.disabled = false;
    
    tenures.forEach(tenure => {
        const option = document.createElement('option');
        option.value = tenure;
        
        // Format month display (handle singular/plural)
        if (tenure === 1) {
            option.textContent = `${tenure} Month (${fdData[selectedBank][tenure].toFixed(2)}% p.a.)`;
        } else {
            option.textContent = `${tenure} Months (${fdData[selectedBank][tenure].toFixed(2)}% p.a.)`;
        }
        
        tenureSelect.appendChild(option);
    });
}

// Calculate maturity amount
function calculateMaturity(calculatorNum) {
    const bank = document.getElementById(`bank${calculatorNum}`).value;
    const tenure = parseInt(document.getElementById(`tenure${calculatorNum}`).value);
    const amount = parseFloat(document.getElementById(`amount${calculatorNum}`).value);

    if (!bank || !tenure || !amount || amount <= 0) {
        document.getElementById(`results${calculatorNum}`).style.display = 'none';
        updateComparison();
        return;
    }

    const rate = fdData[bank][tenure];
    if (!rate) {
        document.getElementById(`results${calculatorNum}`).style.display = 'none';
        updateComparison();
        return;
    }

    // Simple interest calculation: Interest = (P × R × T) / 100
    // where P = Principal, R = Rate per annum, T = Time in years
    const years = tenure / 12;
    const interest = (amount * rate * years) / 100;
    const maturityAmount = amount + interest;

    // Display results
    document.getElementById(`maturity${calculatorNum}`).textContent = `LKR ${formatNumber(Math.round(maturityAmount))}`;
    document.getElementById(`rate${calculatorNum}`).textContent = `${rate.toFixed(2)}%`;
    document.getElementById(`interest${calculatorNum}`).textContent = `LKR ${formatNumber(Math.round(interest))}`;
    document.getElementById(`results${calculatorNum}`).style.display = 'block';
    
    updateComparison();
}

// Compare two options
function updateComparison() {
    const results1 = document.getElementById('results1');
    const results2 = document.getElementById('results2');
    
    // Check if comparison summary element exists, create if it doesn't
    let comparisonDiv = document.getElementById('comparisonSummary');
    if (!comparisonDiv) {
        comparisonDiv = document.createElement('div');
        comparisonDiv.id = 'comparisonSummary';
        comparisonDiv.className = 'comparison-summary';
        
        // Insert after the calculators
        const calculatorSection = document.querySelector('.grid-2');
        if (calculatorSection) {
            calculatorSection.parentNode.insertBefore(comparisonDiv, calculatorSection.nextSibling);
        }
    }
    
    if (results1 && results2 && results1.style.display === 'block' && results2.style.display === 'block') {
        const maturity1 = parseFloat(document.getElementById('maturity1').textContent.replace(/[^0-9]/g, ''));
        const maturity2 = parseFloat(document.getElementById('maturity2').textContent.replace(/[^0-9]/g, ''));
        
        const bank1 = document.getElementById('bank1').value;
        const bank2 = document.getElementById('bank2').value;
        const tenure1 = document.getElementById('tenure1').value;
        const tenure2 = document.getElementById('tenure2').value;
        const amount1 = parseFloat(document.getElementById('amount1').value);
        const amount2 = parseFloat(document.getElementById('amount2').value);
        
        let comparisonText = '';
        let recommendation = '';
        
        // Compare based on effective returns
        const return1 = ((maturity1 - amount1) / amount1) * 100;
        const return2 = ((maturity2 - amount2) / amount2) * 100;
        
        if (return1 > return2) {
            comparisonText = `${bank1} offers ${(return1 - return2).toFixed(2)}% higher effective return than ${bank2}.`;
            recommendation = `${bank1} is the better choice for this investment.`;
        } else if (return2 > return1) {
            comparisonText = `${bank2} offers ${(return2 - return1).toFixed(2)}% higher effective return than ${bank1}.`;
            recommendation = `${bank2} is the better choice for this investment.`;
        } else {
            comparisonText = 'Both options offer the same effective return.';
            recommendation = 'You can choose either bank based on other preferences.';
        }
        
        comparisonDiv.innerHTML = `
            <h4>Comparison Result</h4>
            <div class="comparison-content">
                <div class="comparison-item">
                    <strong>${bank1}</strong> (${tenure1} months): LKR ${formatNumber(Math.round(maturity1))}
                </div>
                <div class="comparison-item">
                    <strong>${bank2}</strong> (${tenure2} months): LKR ${formatNumber(Math.round(maturity2))}
                </div>
                <div class="comparison-difference">
                    Difference: LKR ${formatNumber(Math.abs(Math.round(maturity1 - maturity2)))}
                </div>
                <div class="comparison-text">${comparisonText}</div>
                <div class="recommendation">${recommendation}</div>
            </div>
        `;
        comparisonDiv.style.display = 'block';
    } else {
        if (comparisonDiv) {
            comparisonDiv.style.display = 'none';
        }
    }
}

// Filter by specific tenure
function filterByTenure(tenure) {
    const tenureFilter = document.getElementById('tenureFilter');
    tenureFilter.value = tenure;
    updateRatesTable();
}

// Quick filter function for tenure buttons
function setupQuickFilters() {
    const quickFilters = [1, 3, 6, 12, 24, 36, 48, 60];
    const container = document.createElement('div');
    container.className = 'quick-filters';
    container.innerHTML = '<label>Quick Filters:</label>';
    
    quickFilters.forEach(tenure => {
        const button = document.createElement('button');
        button.className = 'quick-filter-btn';
        button.textContent = tenure === 1 ? '1M' : `${tenure}M`;
        button.onclick = () => filterByTenure(tenure);
        container.appendChild(button);
    });
    
    // Add "Show All" button
    const allButton = document.createElement('button');
    allButton.className = 'quick-filter-btn';
    allButton.textContent = 'All';
    allButton.onclick = () => filterByTenure('all');
    container.appendChild(allButton);
    
    // Insert after tenure filter
    const tenureFilter = document.getElementById('tenureFilter');
    if (tenureFilter && tenureFilter.parentNode) {
        tenureFilter.parentNode.appendChild(container);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    populateBankDropdowns();
    updateRatesTable();
    
    // Add event listeners
    document.getElementById('tenureFilter').addEventListener('change', updateRatesTable);
    
    // Calculator 1 listeners
    document.getElementById('bank1').addEventListener('change', () => {
        updateTenureDropdown(1);
        calculateMaturity(1);
    });
    document.getElementById('tenure1').addEventListener('change', () => calculateMaturity(1));
    document.getElementById('amount1').addEventListener('input', () => calculateMaturity(1));
    
    // Calculator 2 listeners
    document.getElementById('bank2').addEventListener('change', () => {
        updateTenureDropdown(2);
        calculateMaturity(2);
    });
    document.getElementById('tenure2').addEventListener('change', () => calculateMaturity(2));
    document.getElementById('amount2').addEventListener('input', () => calculateMaturity(2));
    
    // Setup quick filters
    setupQuickFilters();
});

// Add required CSS classes dynamically
const style = document.createElement('style');
style.textContent = `
    .tenure-badge {
        font-size: 0.85rem;
        color: #666;
    }
    
    .na-badge {
        color: #999;
        font-style: italic;
    }
    
    .rate-highlight {
        font-weight: bold;
        color: #00a86b;
    }
    
    .best-rate {
        background-color: rgba(0, 168, 107, 0.1);
    }
    
    .best-rate td:first-child {
        border-left: 3px solid #00a86b;
    }
    
    .quick-filters {
        margin: 10px 0;
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
        align-items: center;
    }
    
    .quick-filter-btn {
        padding: 5px 10px;
        background: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 15px;
        cursor: pointer;
        font-size: 0.85rem;
    }
    
    .quick-filter-btn:hover {
        background: #e0e0e0;
    }
    
    .comparison-summary {
        margin-top: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #0a2472;
    }
    
    .comparison-content {
        margin-top: 10px;
    }
    
    .comparison-item {
        padding: 5px 0;
    }
    
    .comparison-difference {
        padding: 8px 0;
        font-weight: bold;
        color: #0a2472;
    }
    
    .comparison-text {
        padding: 8px 0;
        color: #666;
    }
    
    .recommendation {
        padding: 8px 0;
        font-weight: bold;
        color: #00a86b;
    }
`;

document.head.appendChild(style);