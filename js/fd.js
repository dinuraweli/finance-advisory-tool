const fdData = {
            "Commercial Bank": {
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

        // Populate rates table based on selected tenure
        function updateRatesTable() {
            const tenure = parseInt(document.getElementById('tenureFilter').value);
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';

            const banksWithTenure = [];
            
            for (const bank in fdData) {
                if (fdData[bank][tenure]) {
                    banksWithTenure.push({
                        name: bank,
                        rate: fdData[bank][tenure]
                    });
                }
            }

            // Sort by rate (highest first)
            banksWithTenure.sort((a, b) => b.rate - a.rate);

            if (banksWithTenure.length === 0) {
                tbody.innerHTML = '<tr><td colspan="2" class="no-data">No banks offer this tenure period</td></tr>';
                return;
            }

            banksWithTenure.forEach(bank => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${bank.name}</td>
                    <td><span class="rate-highlight">${bank.rate.toFixed(2)}%</span></td>
                `;
                tbody.appendChild(row);
            });
        }

        // Populate bank dropdown
        function populateBankDropdowns() {
            const banks = Object.keys(fdData).sort();
            const bank1 = document.getElementById('bank1');
            const bank2 = document.getElementById('bank2');

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

            tenureSelect.disabled = false;
            const tenures = Object.keys(fdData[selectedBank]).sort((a, b) => a - b);

            tenures.forEach(tenure => {
                const option = document.createElement('option');
                option.value = tenure;
                option.textContent = `${tenure} Months`;
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
                return;
            }

            const rate = fdData[bank][tenure];
            if (!rate) {
                document.getElementById(`results${calculatorNum}`).style.display = 'none';
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
        }

        // Event listeners
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

        // Initialize
        populateBankDropdowns();
        updateRatesTable();