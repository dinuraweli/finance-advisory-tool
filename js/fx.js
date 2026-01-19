// Exchange Rate Data - Sri Lankan Banks
const BANKS = [
    {
        id: 'commercial',
        name: 'Commercial Bank',
        color: '#16a34a',
        rates: {
            USD: { buy: 323.50, sell: 335.20 },
            EUR: { buy: 352.30, sell: 365.80 },
            GBP: { buy: 412.15, sell: 428.90 },
            AUD: { buy: 213.45, sell: 221.30 },
            JPY: { buy: 2.18, sell: 2.26 },
            INR: { buy: 3.89, sell: 4.03 },
            SGD: { buy: 241.20, sell: 250.15 },
            AED: { buy: 88.15, sell: 91.40 }
        }
    },
    {
        id: 'boa',
        name: 'Bank of Ceylon',
        color: '#0066cc',
        rates: {
            USD: { buy: 324.00, sell: 336.00 },
            EUR: { buy: 353.00, sell: 366.50 },
            GBP: { buy: 413.00, sell: 429.50 },
            AUD: { buy: 214.00, sell: 222.00 },
            JPY: { buy: 2.19, sell: 2.27 },
            INR: { buy: 3.90, sell: 4.04 },
            SGD: { buy: 242.00, sell: 251.00 },
            AED: { buy: 88.50, sell: 91.80 }
        }
    },
    {
        id: 'sampath',
        name: 'Sampath Bank',
        color: '#ea580c',
        rates: {
            USD: { buy: 323.00, sell: 335.50 },
            EUR: { buy: 351.80, sell: 365.20 },
            GBP: { buy: 411.50, sell: 428.00 },
            AUD: { buy: 213.00, sell: 221.50 },
            JPY: { buy: 2.17, sell: 2.25 },
            INR: { buy: 3.88, sell: 4.02 },
            SGD: { buy: 240.80, sell: 249.80 },
            AED: { buy: 87.90, sell: 91.20 }
        }
    },
    {
        id: 'hnb',
        name: 'Hatton National Bank',
        color: '#9333ea',
        rates: {
            USD: { buy: 323.80, sell: 335.80 },
            EUR: { buy: 352.50, sell: 366.00 },
            GBP: { buy: 412.50, sell: 429.00 },
            AUD: { buy: 213.70, sell: 221.80 },
            JPY: { buy: 2.18, sell: 2.26 },
            INR: { buy: 3.89, sell: 4.03 },
            SGD: { buy: 241.50, sell: 250.50 },
            AED: { buy: 88.30, sell: 91.60 }
        }
    },
    {
        id: 'peoples',
        name: 'People\'s Bank',
        color: '#dc2626',
        rates: {
            USD: { buy: 324.20, sell: 336.50 },
            EUR: { buy: 353.50, sell: 367.00 },
            GBP: { buy: 413.50, sell: 430.00 },
            AUD: { buy: 214.20, sell: 222.50 },
            JPY: { buy: 2.19, sell: 2.27 },
            INR: { buy: 3.90, sell: 4.04 },
            SGD: { buy: 242.20, sell: 251.50 },
            AED: { buy: 88.60, sell: 92.00 }
        }
    }
];

// Currency Flags (emoji)
const CURRENCY_FLAGS = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    AUD: '🇦🇺',
    JPY: '🇯🇵',
    INR: '🇮🇳',
    SGD: '🇸🇬',
    AED: '🇦🇪',
    LKR: '🇱🇰'
};

// Generate historical data for trends
function generateHistoricalData(currency, days) {
    const data = [];
    const baseRate = getMidRate(currency);
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Generate realistic fluctuations
        const variance = baseRate * 0.02; // 2% variance
        const randomChange = (Math.random() - 0.5) * variance;
        const rate = baseRate + randomChange;
        
        data.push({
            date: date.toISOString().split('T')[0],
            rate: parseFloat(rate.toFixed(2))
        });
    }
    
    return data;
}

// State
let state = {
    view: 'converter',
    selectedCurrency: 'USD',
    trendsPeriod: '7d',
    historicalData: {}
};

let charts = {
    buy: null,
    sell: null,
    trends: null
};

// Get mid rate (average of all banks)
function getMidRate(currency) {
    if (currency === 'LKR') return 1;
    
    let totalBuy = 0;
    let totalSell = 0;
    
    BANKS.forEach(function(bank) {
        totalBuy += bank.rates[currency].buy;
        totalSell += bank.rates[currency].sell;
    });
    
    return (totalBuy + totalSell) / (BANKS.length * 2);
}

// Get specific rate type
function getRate(currency, type) {
    if (currency === 'LKR') return 1;
    
    if (type === 'mid') {
        return getMidRate(currency);
    }
    
    // Average of all banks for buy/sell
    let total = 0;
    BANKS.forEach(function(bank) {
        total += bank.rates[currency][type];
    });
    
    return total / BANKS.length;
}

// Format currency
function formatCurrency(value, currency) {
    if (currency === 'LKR') {
        return 'LKR ' + value.toLocaleString('en-LK', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    });
}

// Set View
function setView(view) {
    state.view = view;
    
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.querySelectorAll('.view-content').forEach(function(content) {
        content.classList.remove('active');
    });
    document.getElementById(view + 'View').classList.add('active');
    
    if (view === 'comparison') {
        updateComparison();
    } else if (view === 'trends') {
        updateTrends();
    }
}

// Convert Currency
function convertCurrency() {
    const fromAmount = parseFloat(document.getElementById('fromAmount').value) || 0;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    
    const rateTypeRadios = document.getElementsByName('rateType');
    let rateType = 'mid';
    for (let i = 0; i < rateTypeRadios.length; i++) {
        if (rateTypeRadios[i].checked) {
            rateType = rateTypeRadios[i].value;
            break;
        }
    }
    
    let result = fromAmount;
    let conversionRate = 1;
    
    if (fromCurrency === toCurrency) {
        result = fromAmount;
        conversionRate = 1;
    } else if (fromCurrency === 'LKR') {
        // LKR to foreign
        const rate = getRate(toCurrency, rateType === 'buy' ? 'sell' : 'buy');
        result = fromAmount / rate;
        conversionRate = rate;
    } else if (toCurrency === 'LKR') {
        // Foreign to LKR
        const rate = getRate(fromCurrency, rateType);
        result = fromAmount * rate;
        conversionRate = rate;
    } else {
        // Foreign to foreign (via LKR)
        const fromRate = getRate(fromCurrency, rateType);
        const toRate = getRate(toCurrency, rateType === 'buy' ? 'sell' : 'buy');
        result = (fromAmount * fromRate) / toRate;
        conversionRate = fromRate / toRate;
    }
    
    document.getElementById('toAmount').value = result.toFixed(4);
    
    // Update conversion info
    let infoText;
    if (fromCurrency === 'LKR') {
        infoText = '1 ' + toCurrency + ' = ' + conversionRate.toFixed(2) + ' LKR';
    } else if (toCurrency === 'LKR') {
        infoText = '1 ' + fromCurrency + ' = ' + conversionRate.toFixed(2) + ' LKR';
    } else {
        infoText = '1 ' + fromCurrency + ' = ' + conversionRate.toFixed(4) + ' ' + toCurrency;
    }
    
    document.getElementById('conversionInfo').textContent = infoText;
}

// Swap Currencies
function swapCurrencies() {
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const fromAmount = document.getElementById('fromAmount').value;
    const toAmount = document.getElementById('toAmount').value;
    
    document.getElementById('fromCurrency').value = toCurrency;
    document.getElementById('toCurrency').value = fromCurrency;
    document.getElementById('fromAmount').value = toAmount;
    
    convertCurrency();
}

// Render Quick Rates
function renderQuickRates() {
    const currencies = ['USD', 'EUR', 'GBP', 'AUD', 'SGD'];
    const quickRates = document.getElementById('quickRates');
    
    quickRates.innerHTML = currencies.map(function(currency) {
        const rate = getMidRate(currency);
        const change = (Math.random() - 0.5) * 2; // Random change for demo
        const changeClass = change >= 0 ? 'positive' : 'negative';
        const changeSymbol = change >= 0 ? '↑' : '↓';
        
        return '<div class="rate-item">' +
            '<div class="rate-currency">' +
            '<span class="currency-flag">' + CURRENCY_FLAGS[currency] + '</span>' +
            '<div>' +
            '<div class="currency-code">' + currency + '</div>' +
            '<div class="rate-change ' + changeClass + '">' + changeSymbol + ' ' + Math.abs(change).toFixed(2) + '%</div>' +
            '</div>' +
            '</div>' +
            '<div class="rate-value">' + rate.toFixed(2) + '</div>' +
            '</div>';
    }).join('');
}

// Render Popular Pairs
function renderPopularPairs() {
    const pairs = [
        { from: 'USD', to: 'LKR' },
        { from: 'EUR', to: 'LKR' },
        { from: 'GBP', to: 'LKR' },
        { from: 'INR', to: 'LKR' }
    ];
    
    const popularPairs = document.getElementById('popularPairs');
    
    popularPairs.innerHTML = pairs.map(function(pair) {
        const rate = getMidRate(pair.from);
        const change = (Math.random() - 0.5) * 2;
        const changeSymbol = change >= 0 ? '↑' : '↓';
        
        return '<div class="pair-card">' +
            '<div class="pair-header">' + CURRENCY_FLAGS[pair.from] + ' ' + pair.from + ' → ' + CURRENCY_FLAGS[pair.to] + ' ' + pair.to + '</div>' +
            '<div class="pair-rate">1 ' + pair.from + ' = ' + rate.toFixed(2) + ' LKR</div>' +
            '<div class="pair-change">' + changeSymbol + ' ' + Math.abs(change).toFixed(2) + '% today</div>' +
            '</div>';
    }).join('');
}

// Update Comparison
function updateComparison() {
    const currency = document.getElementById('comparisonCurrency').value;
    
    // Update charts
    renderComparisonCharts(currency);
    
    // Update table
    renderComparisonTable(currency);
    
    // Update best rates summary
    renderBestRatesSummary(currency);
}

// Render Comparison Charts
function renderComparisonCharts(currency) {
    const buyCtx = document.getElementById('buyChart');
    const sellCtx = document.getElementById('sellChart');
    
    if (charts.buy) charts.buy.destroy();
    if (charts.sell) charts.sell.destroy();
    
    const labels = BANKS.map(function(bank) { return bank.name; });
    const colors = BANKS.map(function(bank) { return bank.color; });
    const buyRates = BANKS.map(function(bank) { return bank.rates[currency].buy; });
    const sellRates = BANKS.map(function(bank) { return bank.rates[currency].sell; });
    
    charts.buy = new Chart(buyCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Buy Rate',
                data: buyRates,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'LKR ' + context.raw.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
    
    charts.sell = new Chart(sellCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sell Rate',
                data: sellRates,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'LKR ' + context.raw.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Render Comparison Table
function renderComparisonTable(currency) {
    const table = document.getElementById('comparisonTable');
    
    let bestBuy = { bank: null, rate: 0 };
    let bestSell = { bank: null, rate: Infinity };
    
    BANKS.forEach(function(bank) {
        if (bank.rates[currency].buy > bestBuy.rate) {
            bestBuy = { bank: bank.name, rate: bank.rates[currency].buy };
        }
        if (bank.rates[currency].sell < bestSell.rate) {
            bestSell = { bank: bank.name, rate: bank.rates[currency].sell };
        }
    });
    
    table.innerHTML = '<thead><tr>' +
        '<th>Bank</th>' +
        '<th style="text-align: right">Buying Rate</th>' +
        '<th style="text-align: right">Selling Rate</th>' +
        '<th style="text-align: right">Spread</th>' +
        '</tr></thead><tbody>' +
        BANKS.map(function(bank) {
            const buyRate = bank.rates[currency].buy;
            const sellRate = bank.rates[currency].sell;
            const spread = sellRate - buyRate;
            const isBestBuy = bank.name === bestBuy.bank;
            const isBestSell = bank.name === bestSell.bank;
            
            return '<tr>' +
                '<td><span class="bank-color" style="background: ' + bank.color + '"></span>' + bank.name + '</td>' +
                '<td style="text-align: right">' +
                'LKR ' + buyRate.toFixed(2) +
                (isBestBuy ? ' <span class="best-rate">Best</span>' : '') +
                '</td>' +
                '<td style="text-align: right">' +
                'LKR ' + sellRate.toFixed(2) +
                (isBestSell ? ' <span class="best-rate">Best</span>' : '') +
                '</td>' +
                '<td style="text-align: right">LKR ' + spread.toFixed(2) + '</td>' +
                '</tr>';
        }).join('') +
        '</tbody>';
}

// Render Best Rates Summary
function renderBestRatesSummary(currency) {
    const summary = document.getElementById('bestRatesSummary');
    
    let bestBuy = { bank: null, rate: 0 };
    let bestSell = { bank: null, rate: Infinity };
    
    BANKS.forEach(function(bank) {
        if (bank.rates[currency].buy > bestBuy.rate) {
            bestBuy = { bank: bank.name, rate: bank.rates[currency].buy };
        }
        if (bank.rates[currency].sell < bestSell.rate) {
            bestSell = { bank: bank.name, rate: bank.rates[currency].sell };
        }
    });
    
    summary.innerHTML = '<h4>Best Rates for ' + currency + '</h4>' +
        '<div class="summary-item">If you are <strong>selling ' + currency + '</strong> (bank buying from you): ' +
        '<span class="summary-highlight">' + bestBuy.bank + '</span> offers the best rate at ' +
        '<span class="summary-highlight">LKR ' + bestBuy.rate.toFixed(2) + '</span></div>' +
        '<div class="summary-item">If you are <strong>buying ' + currency + '</strong> (bank selling to you): ' +
        '<span class="summary-highlight">' + bestSell.bank + '</span> offers the best rate at ' +
        '<span class="summary-highlight">LKR ' + bestSell.rate.toFixed(2) + '</span></div>';
}

// Set Period for Trends
function setPeriod(period) {
    state.trendsPeriod = period;
    
    document.querySelectorAll('.period-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updateTrends();
}

// Update Trends
function updateTrends() {
    const currency = document.getElementById('trendsCurrency').value;
    const period = state.trendsPeriod;
    
    let days;
    switch(period) {
        case '7d': days = 7; break;
        case '30d': days = 30; break;
        case '90d': days = 90; break;
        case '1y': days = 365; break;
        default: days = 7;
    }
    
    const historicalData = generateHistoricalData(currency, days);
    
    renderStatsCards(currency, historicalData);
    renderTrendsChart(historicalData);
    renderTrendAnalysis(currency, historicalData);
}

// Render Stats Cards
function renderStatsCards(currency, data) {
    const statsCards = document.getElementById('statsCards');
    
    const current = data[data.length - 1].rate;
    const previous = data[0].rate;
    const change = current - previous;
    const changePercent = (change / previous) * 100;
    
    const rates = data.map(function(d) { return d.rate; });
    const high = Math.max.apply(null, rates);
    const low = Math.min.apply(null, rates);
    const avg = rates.reduce(function(a, b) { return a + b; }, 0) / rates.length;
    
    const changeSymbol = change >= 0 ? '↑' : '↓';
    
    statsCards.innerHTML = '<div class="stat-card">' +
        '<div class="stat-label">Current Rate</div>' +
        '<div class="stat-value">LKR ' + current.toFixed(2) + '</div>' +
        '<div class="stat-change">' + changeSymbol + ' ' + Math.abs(change).toFixed(2) + ' (' + changePercent.toFixed(2) + '%)</div>' +
        '</div>' +
        '<div class="stat-card">' +
        '<div class="stat-label">Period High</div>' +
        '<div class="stat-value">LKR ' + high.toFixed(2) + '</div>' +
        '</div>' +
        '<div class="stat-card">' +
        '<div class="stat-label">Period Low</div>' +
        '<div class="stat-value">LKR ' + low.toFixed(2) + '</div>' +
        '</div>' +
        '<div class="stat-card">' +
        '<div class="stat-label">Average Rate</div>' +
        '<div class="stat-value">LKR ' + avg.toFixed(2) + '</div>' +
        '</div>';
}

// Render Trends Chart
function renderTrendsChart(data) {
    const ctx = document.getElementById('trendsChart');
    
    if (charts.trends) charts.trends.destroy();
    
    charts.trends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(function(d) { return d.date; }),
            datasets: [{
                label: 'Exchange Rate (LKR)',
                data: data.map(function(d) { return d.rate; }),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'LKR ' + context.raw.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Render Trend Analysis
function renderTrendAnalysis(currency, data) {
    const analysis = document.getElementById('trendAnalysis');
    
    const current = data[data.length - 1].rate;
    const previous = data[0].rate;
    const change = current - previous;
    const changePercent = (change / previous) * 100;
    
    let trend = 'stable';
    if (Math.abs(changePercent) < 0.5) {
        trend = 'stable';
    } else if (changePercent > 0) {
        trend = 'up';
    } else {
        trend = 'down';
    }
    
    let trendText;
    if (trend === 'up') {
        trendText = '<span class="trend-indicator up">Weakening LKR</span> - The LKR has depreciated against ' + currency + ', making imports more expensive.';
    } else if (trend === 'down') {
        trendText = '<span class="trend-indicator down">Strengthening LKR</span> - The LKR has appreciated against ' + currency + ', making imports cheaper.';
    } else {
        trendText = '<span class="trend-indicator stable">Stable</span> - The exchange rate has remained relatively stable.';
    }
    
    analysis.innerHTML = '<h4>Trend Analysis</h4>' +
        '<div class="analysis-item">' + trendText + '</div>' +
        '<div class="analysis-item">Over this period, the rate has changed by <strong>' + change.toFixed(2) + ' LKR</strong> (' + changePercent.toFixed(2) + '%).</div>' +
        '<div class="analysis-item">For travelers: ' +
        (trend === 'down' ? 'This is a good time to exchange LKR to ' + currency + ' as you will get more foreign currency.' :
         trend === 'up' ? 'Consider waiting if possible, as the LKR is weakening against ' + currency + '.' :
         'The rate is stable, so timing may not significantly impact your exchange.') +
        '</div>';
}

// Initialize
function init() {
    convertCurrency();
    renderQuickRates();
    renderPopularPairs();
    updateComparison();
    updateTrends();
    
    // Update timestamp
    const now = new Date();
    document.getElementById('lastUpdated').textContent = 'Last updated: ' + now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

// Run on page load
init();