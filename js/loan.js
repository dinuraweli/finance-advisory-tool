const BANKS = [
    { id: 'boa', name: 'Bank of Ceylon', loanRate: 14.5, leaseRate: 16.2, color: '#0066cc' },
    { id: 'peoples', name: 'People\'s Bank', loanRate: 14.8, leaseRate: 16.5, color: '#dc2626' },
    { id: 'commercial', name: 'Commercial Bank', loanRate: 15.2, leaseRate: 17.0, color: '#16a34a' },
    { id: 'sampath', name: 'Sampath Bank', loanRate: 15.5, leaseRate: 17.2, color: '#ea580c' },
    { id: 'hnb', name: 'Hatton National Bank', loanRate: 15.3, leaseRate: 17.1, color: '#9333ea' },
    { id: 'dfcc', name: 'DFCC Bank', loanRate: 15.8, leaseRate: 17.5, color: '#0891b2' },
    { id: 'ndb', name: 'NDB Bank', loanRate: 15.6, leaseRate: 17.3, color: '#db2777' }
];

let state = {
    type: 'loan',
    amount: 5000000,
    downPayment: 1000000,
    period: 60,
    selectedBanks: ['boa', 'peoples', 'commercial'],
    lumpSums: [],
    view: 'calculator'
};

let charts = {
    pie: null,
    line: null,
    bar1: null,
    bar2: null
};

function formatCurrency(value) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function setType(type) {
    state.type = type;
    document.querySelectorAll('.type-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.getElementById('amountLabel').textContent = type === 'loan' ? 'Loan Amount' : 'Asset Value';
    document.getElementById('downPaymentGroup').style.display = type === 'lease' ? 'block' : 'none';
    
    calculate();
}

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
    
    calculate();
}

function toggleBank(bankId) {
    const index = state.selectedBanks.indexOf(bankId);
    if (index > -1) {
        state.selectedBanks.splice(index, 1);
    } else {
        state.selectedBanks.push(bankId);
    }
    calculate();
}

function addLumpSum() {
    const month = parseInt(document.getElementById('lumpMonth').value);
    const amount = parseFloat(document.getElementById('lumpAmount').value);
    
    if (month > 0 && month <= state.period && amount > 0) {
        state.lumpSums.push({ month: month, amount: amount });
        state.lumpSums.sort(function(a, b) {
            return a.month - b.month;
        });
        document.getElementById('lumpMonth').value = '';
        document.getElementById('lumpAmount').value = '';
        renderLumpSums();
        calculate();
    }
}

function removeLumpSum(index) {
    state.lumpSums.splice(index, 1);
    renderLumpSums();
    calculate();
}

function renderLumpSums() {
    const list = document.getElementById('lumpSumList');
    list.innerHTML = state.lumpSums.map(function(ls, idx) {
        return '<div class="lumpsum-item">' +
            '<span>Month ' + ls.month + ': <strong>' + formatCurrency(ls.amount) + '</strong></span>' +
            '<button class="btn-remove" onclick="removeLumpSum(' + idx + ')">Remove</button>' +
            '</div>';
    }).join('');
}

function calculatePayment(principal, rate, months, lumpsums) {
    lumpsums = lumpsums || [];
    const monthlyRate = rate / 100 / 12;
    let balance = principal;
    const schedule = [];
    
    for (let month = 1; month <= months; month++) {
        const lumpSum = lumpsums.find(function(ls) {
            return ls.month === month;
        });
        
        if (lumpSum) {
            balance -= lumpSum.amount;
            if (balance < 0) balance = 0;
        }
        
        if (balance <= 0) {
            schedule.push({ month: month, payment: 0, principal: 0, interest: 0, balance: 0 });
            continue;
        }
        
        const interest = balance * monthlyRate;
        const remainingMonths = months - month + 1;
        const monthlyPayment = (balance * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) / 
                             (Math.pow(1 + monthlyRate, remainingMonths) - 1);
        const principalPayment = monthlyPayment - interest;
        
        balance -= principalPayment;
        
        schedule.push({
            month: month,
            payment: monthlyPayment,
            principal: principalPayment,
            interest: interest,
            balance: Math.max(0, balance)
        });
    }
    
    return schedule;
}

function calculate() {
    state.amount = parseFloat(document.getElementById('amount').value);
    state.downPayment = parseFloat(document.getElementById('downPayment').value);
    state.period = parseInt(document.getElementById('period').value);
    
    const financedAmount = state.type === 'lease' ? state.amount - state.downPayment : state.amount;
    
    document.getElementById('amountInfo').textContent = formatCurrency(state.amount);
    document.getElementById('downPaymentInfo').textContent = 
        formatCurrency(state.downPayment) + ' (' + ((state.downPayment/state.amount)*100).toFixed(1) + '%)';
    document.getElementById('financedAmount').textContent = formatCurrency(financedAmount);
    document.getElementById('periodInfo').textContent = 
        state.period + ' months (' + (state.period/12).toFixed(1) + ' years)';
    
    const calculations = state.selectedBanks.map(function(bankId) {
        const bank = BANKS.find(function(b) {
            return b.id === bankId;
        });
        const rate = state.type === 'loan' ? bank.loanRate : bank.leaseRate;
        const schedule = calculatePayment(financedAmount, rate, state.period, state.lumpSums);
        
        const totalPayment = schedule.reduce(function(sum, item) {
            return sum + item.payment;
        }, 0);
        const totalInterest = schedule.reduce(function(sum, item) {
            return sum + item.interest;
        }, 0);
        const monthlyPayment = schedule[0] ? schedule[0].payment : 0;
        const finalMonth = schedule.findIndex(function(s) {
            return s.balance === 0;
        }) + 1 || state.period;
        
        return {
            bank: bank,
            rate: rate,
            monthlyPayment: monthlyPayment,
            totalPayment: totalPayment,
            totalInterest: totalInterest,
            totalAmount: totalPayment + (state.type === 'lease' ? state.downPayment : 0),
            schedule: schedule,
            finalMonth: finalMonth
        };
    });
    
    if (state.view === 'calculator') {
        renderCalculatorView(calculations, financedAmount);
    } else if (state.view === 'comparison') {
        renderComparisonView(calculations);
    } else if (state.view === 'schedule') {
        renderScheduleView(calculations);
    }
}

function renderCalculatorView(calculations, financedAmount) {
    const summaryCards = document.getElementById('summaryCards');
    summaryCards.innerHTML = calculations.slice(0, 3).map(function(calc) {
        let html = '<div class="summary-card" style="border-top-color: ' + calc.bank.color + '">' +
            '<h3>' + calc.bank.name + '</h3>' +
            '<div class="rate">' + calc.rate + '% p.a.</div>' +
            '<div class="summary-item">' +
            '<div class="summary-label">Monthly Payment</div>' +
            '<div class="summary-value">' + formatCurrency(calc.monthlyPayment) + '</div>' +
            '</div>' +
            '<div class="summary-item">' +
            '<div class="summary-label">Total Interest</div>' +
            '<div class="summary-value interest">' + formatCurrency(calc.totalInterest) + '</div>' +
            '</div>' +
            '<div class="summary-item">' +
            '<div class="summary-label">Total Payment</div>' +
            '<div class="summary-value total">' + formatCurrency(calc.totalAmount) + '</div>' +
            '</div>';
        
        if (state.lumpSums.length > 0) {
            html += '<div class="summary-item">' +
                '<div class="summary-label">Completion</div>' +
                '<div class="summary-value completion">' + calc.finalMonth + ' months (' + (calc.finalMonth/12).toFixed(1) + ' years)</div>' +
                '</div>';
        }
        
        html += '</div>';
        return html;
    }).join('');
    
    if (calculations.length > 0) {
        renderPieChart(calculations[0], financedAmount);
        renderLineChart(calculations[0]);
    }
}

function renderPieChart(calc, financedAmount) {
    const ctx = document.getElementById('pieChart');
    if (charts.pie) charts.pie.destroy();
    
    const labels = state.type === 'lease' && state.downPayment > 0 
        ? ['Principal', 'Interest', 'Down Payment']
        : ['Principal', 'Interest'];
    
    const dataValues = state.type === 'lease' && state.downPayment > 0
        ? [financedAmount, calc.totalInterest, state.downPayment]
        : [financedAmount, calc.totalInterest];
    
    const data = {
        labels: labels,
        datasets: [{
            data: dataValues,
            backgroundColor: ['#10b981', '#ef4444', '#3b82f6']
        }]
    };
    
    charts.pie = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
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

function renderLineChart(calc) {
    const ctx = document.getElementById('lineChart');
    if (charts.line) charts.line.destroy();
    
    const data = calc.schedule.filter(function(item, i) {
        return i % 6 === 0;
    });
    
    charts.line = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(function(d) {
                return d.month;
            }),
            datasets: [{
                label: 'Balance',
                data: data.map(function(d) {
                    return d.balance;
                }),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
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
                            return formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return (value/1000000).toFixed(1) + 'M';
                        }
                    }
                }
            }
        }
    });
}

function renderComparisonView(calculations) {
    const ctx1 = document.getElementById('barChart1');
    const ctx2 = document.getElementById('barChart2');
    
    if (charts.bar1) charts.bar1.destroy();
    if (charts.bar2) charts.bar2.destroy();
    
    const labels = calculations.map(function(c) {
        return c.bank.name;
    });
    const colors = calculations.map(function(c) {
        return c.bank.color;
    });
    
    charts.bar1 = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Payment',
                data: calculations.map(function(c) {
                    return c.monthlyPayment;
                }),
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
                            return formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return (value/1000).toFixed(0) + 'K';
                        }
                    }
                }
            }
        }
    });
    
    charts.bar2 = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Interest',
                data: calculations.map(function(c) {
                    return c.totalInterest;
                }),
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
                            return formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return (value/1000000).toFixed(1) + 'M';
                        }
                    }
                }
            }
        }
    });
    
    const table = document.getElementById('comparisonTable');
    table.innerHTML = '<thead><tr>' +
        '<th>Bank</th>' +
        '<th style="text-align: right">Rate</th>' +
        '<th style="text-align: right">Monthly</th>' +
        '<th style="text-align: right">Total Interest</th>' +
        '<th style="text-align: right">Total Amount</th>' +
        '</tr></thead><tbody>' +
        calculations.map(function(calc) {
            return '<tr>' +
                '<td><span class="bank-color" style="background: ' + calc.bank.color + '"></span>' + calc.bank.name + '</td>' +
                '<td style="text-align: right">' + calc.rate + '%</td>' +
                '<td style="text-align: right; font-weight: 600; color: #667eea">' + formatCurrency(calc.monthlyPayment) + '</td>' +
                '<td style="text-align: right; color: #ef4444">' + formatCurrency(calc.totalInterest) + '</td>' +
                '<td style="text-align: right; font-weight: 600">' + formatCurrency(calc.totalAmount) + '</td>' +
                '</tr>';
        }).join('') +
        '</tbody>';
}

function renderScheduleView(calculations) {
    if (calculations.length === 0) return;
    
    const calc = calculations[0];
    document.getElementById('scheduleTitle').textContent = 'Payment Schedule - ' + calc.bank.name;
    
    const table = document.getElementById('scheduleTable');
    table.innerHTML = '<thead><tr>' +
        '<th>Month</th>' +
        '<th>Payment</th>' +
        '<th>Principal</th>' +
        '<th>Interest</th>' +
        '<th>Balance</th>' +
        '</tr></thead><tbody>' +
        calc.schedule.map(function(row) {
            const hasLumpSum = state.lumpSums.find(function(ls) {
                return ls.month === row.month;
            });
            return '<tr class="' + (hasLumpSum ? 'lumpsum-row' : '') + '">' +
                '<td>' + row.month + (hasLumpSum ? '<span style="color: #10b981; font-weight: 600; font-size: 0.8em"> + Lump Sum</span>' : '') + '</td>' +
                '<td>' + formatCurrency(row.payment) + '</td>' +
                '<td>' + formatCurrency(row.principal) + '</td>' +
                '<td style="color: #ef4444">' + formatCurrency(row.interest) + '</td>' +
                '<td style="font-weight: 600; color: #667eea">' + formatCurrency(row.balance) + '</td>' +
                '</tr>';
        }).join('') +
        '</tbody>';
}

function initBankList() {
    const bankList = document.getElementById('bankList');
    bankList.innerHTML = BANKS.map(function(bank) {
        const isChecked = state.selectedBanks.indexOf(bank.id) !== -1;
        return '<div class="bank-item">' +
            '<input type="checkbox" id="bank-' + bank.id + '" ' +
            (isChecked ? 'checked' : '') +
            ' onchange="toggleBank(\'' + bank.id + '\')">' +
            '<div class="bank-info">' +
            '<div class="bank-name">' + bank.name + '</div>' +
            '<div class="bank-rate" id="rate-' + bank.id + '">' + bank.loanRate + '% p.a.</div>' +
            '</div></div>';
    }).join('');
}

// Initialize on page load
initBankList();
calculate();