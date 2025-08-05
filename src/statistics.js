// Statistical analysis functionality
let statsChart = null;

// Initialize statistics page
document.addEventListener('DOMContentLoaded', function() {
    initializeStatsPage();
});

function initializeStatsPage() {
    // Load data from localStorage
    loadStoredData();
    
    // Set up event listeners
    const statsForm = document.getElementById('statsForm');
    if (statsForm) {
        statsForm.addEventListener('submit', handleStatisticalAnalysis);
    }
    
    // Populate column selector if data exists
    if (window.getCurrentData && window.getCurrentData().length > 0) {
        populateStatsColumns(window.getCurrentData());
        generateAdvancedStats(window.getCurrentData());
    } else {
        // Try to load from localStorage
        const storedData = localStorage.getItem('currentData');
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                if (data.length > 0) {
                    populateStatsColumns(data);
                    generateAdvancedStats(data);
                }
            } catch (error) {
                console.error('Error loading stored data:', error);
            }
        }
    }
}

// Populate statistics column selector
function populateStatsColumns(data) {
    const statsColumnSelect = document.getElementById('statsColumn');
    if (!statsColumnSelect || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    statsColumnSelect.innerHTML = '<option value="">Choose a column</option>';
    
    headers.forEach(header => {
        // Check if column contains numeric data
        const isNumeric = data.some(row => typeof row[header] === 'number');
        const label = isNumeric ? `${header} (numeric)` : `${header} (text)`;
        statsColumnSelect.innerHTML += `<option value="${header}">${label}</option>`;
    });
}

// Handle statistical analysis form submission
function handleStatisticalAnalysis(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const column = formData.get('statsColumn');
    const analysisType = formData.get('analysisType');
    
    if (!column) {
        showStatsError('Please select a column for analysis');
        return;
    }
    
    // Get current data
    let data = [];
    if (window.getCurrentData && window.getCurrentData().length > 0) {
        data = window.getCurrentData();
    } else {
        const storedData = localStorage.getItem('currentData');
        if (storedData) {
            try {
                data = JSON.parse(storedData);
            } catch (error) {
                showStatsError('Error loading data: ' + error.message);
                return;
            }
        }
    }
    
    if (data.length === 0) {
        showStatsError('No data available for analysis. Please load a dataset first.');
        return;
    }
    
    try {
        performStatisticalAnalysis(data, column, analysisType);
        showStatsSuccess('Analysis completed successfully!');
    } catch (error) {
        showStatsError('Error performing analysis: ' + error.message);
    }
}

// Perform statistical analysis based on type
function performStatisticalAnalysis(data, column, analysisType) {
    const columnData = data.map(row => row[column]).filter(val => val !== null && val !== undefined);
    const numericData = columnData.filter(val => typeof val === 'number');
    
    let results = '';
    
    switch (analysisType) {
        case 'descriptive':
            results = generateDescriptiveStats(columnData, numericData, column);
            createStatsVisualization('bar', column, numericData);
            break;
        case 'correlation':
            results = generateCorrelationAnalysis(data, column);
            createCorrelationChart(data, column);
            break;
        case 'distribution':
            results = generateDistributionAnalysis(numericData, column);
            createDistributionChart(numericData, column);
            break;
        case 'outliers':
            results = detectOutliers(numericData, column);
            createOutlierChart(numericData, column);
            break;
        default:
            throw new Error('Unknown analysis type');
    }
    
    displayStatsResults(results);
}

// Generate descriptive statistics
function generateDescriptiveStats(allData, numericData, column) {
    if (numericData.length === 0) {
        return `Column "${column}" contains no numeric data for statistical analysis.\n\nData Summary:\n- Total values: ${allData.length}\n- Unique values: ${new Set(allData).size}\n- Most frequent value: ${getMostFrequent(allData)}`;
    }
    
    const stats = calculateBasicStats(numericData);
    
    return `Descriptive Statistics for "${column}":

Count: ${stats.count}
Mean: ${stats.mean.toFixed(2)}
Median: ${stats.median.toFixed(2)}
Mode: ${stats.mode}
Standard Deviation: ${stats.stdDev.toFixed(2)}
Variance: ${stats.variance.toFixed(2)}
Range: ${stats.range.toFixed(2)}
Minimum: ${stats.min}
Maximum: ${stats.max}
Q1 (25th percentile): ${stats.q1.toFixed(2)}
Q3 (75th percentile): ${stats.q3.toFixed(2)}
Skewness: ${stats.skewness.toFixed(2)}`;
}

// Generate correlation analysis
function generateCorrelationAnalysis(data, column) {
    const numericColumns = getNumericColumns(data);
    
    if (numericColumns.length < 2) {
        return `Correlation analysis requires at least 2 numeric columns.\nFound ${numericColumns.length} numeric column(s).`;
    }
    
    let results = `Correlation Analysis for "${column}":\n\n`;
    
    numericColumns.forEach(otherColumn => {
        if (otherColumn !== column) {
            const correlation = calculateCorrelation(
                data.map(row => row[column]).filter(val => typeof val === 'number'),
                data.map(row => row[otherColumn]).filter(val => typeof val === 'number')
            );
            
            results += `${column} vs ${otherColumn}: ${correlation.toFixed(3)} (${interpretCorrelation(correlation)})\n`;
        }
    });
    
    return results;
}

// Generate distribution analysis
function generateDistributionAnalysis(numericData, column) {
    if (numericData.length === 0) {
        return `Column "${column}" contains no numeric data for distribution analysis.`;
    }
    
    const stats = calculateBasicStats(numericData);
    const histogram = createHistogram(numericData, 10);
    
    let results = `Distribution Analysis for "${column}":\n\n`;
    results += `Mean: ${stats.mean.toFixed(2)}\n`;
    results += `Median: ${stats.median.toFixed(2)}\n`;
    results += `Standard Deviation: ${stats.stdDev.toFixed(2)}\n`;
    results += `Skewness: ${stats.skewness.toFixed(2)}\n\n`;
    
    results += 'Histogram (10 bins):\n';
    histogram.forEach((bin, index) => {
        const bar = '█'.repeat(Math.floor(bin.count / Math.max(...histogram.map(b => b.count)) * 20));
        results += `${bin.range}: ${bin.count} ${bar}\n`;
    });
    
    return results;
}

// Detect outliers using IQR method
function detectOutliers(numericData, column) {
    if (numericData.length === 0) {
        return `Column "${column}" contains no numeric data for outlier analysis.`;
    }
    
    const sorted = [...numericData].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    const outliers = numericData.filter(val => val < lowerBound || val > upperBound);
    
    let results = `Outlier Analysis for "${column}":\n\n`;
    results += `Q1: ${q1.toFixed(2)}\n`;
    results += `Q3: ${q3.toFixed(2)}\n`;
    results += `IQR: ${iqr.toFixed(2)}\n`;
    results += `Lower Bound: ${lowerBound.toFixed(2)}\n`;
    results += `Upper Bound: ${upperBound.toFixed(2)}\n\n`;
    results += `Outliers found: ${outliers.length}\n`;
    
    if (outliers.length > 0) {
        results += `Outlier values: ${outliers.slice(0, 10).map(val => val.toFixed(2)).join(', ')}`;
        if (outliers.length > 10) {
            results += ` ... and ${outliers.length - 10} more`;
        }
    }
    
    return results;
}

// Calculate basic statistics
function calculateBasicStats(data) {
    if (data.length === 0) return {};
    
    const sorted = [...data].sort((a, b) => a - b);
    const count = data.length;
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    
    // Median
    const median = count % 2 === 0 
        ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
        : sorted[Math.floor(count / 2)];
    
    // Mode
    const frequency = {};
    data.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
    const mode = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
    
    // Variance and Standard Deviation
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);
    
    // Range
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    // Quartiles
    const q1 = sorted[Math.floor(count * 0.25)];
    const q3 = sorted[Math.floor(count * 0.75)];
    
    // Skewness
    const skewness = data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / count;
    
    return {
        count, sum, mean, median, mode: parseFloat(mode), variance, stdDev,
        min, max, range, q1, q3, skewness
    };
}

// Calculate correlation coefficient
function calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
}

// Interpret correlation strength
function interpretCorrelation(correlation) {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return 'Very Strong';
    if (abs >= 0.6) return 'Strong';
    if (abs >= 0.4) return 'Moderate';
    if (abs >= 0.2) return 'Weak';
    return 'Very Weak';
}

// Create histogram data
function createHistogram(data, bins) {
    if (data.length === 0) return [];
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binSize = (max - min) / bins;
    const histogram = [];
    
    for (let i = 0; i < bins; i++) {
        const binStart = min + i * binSize;
        const binEnd = min + (i + 1) * binSize;
        const count = data.filter(val => val >= binStart && (i === bins - 1 ? val <= binEnd : val < binEnd)).length;
        
        histogram.push({
            range: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
            count: count
        });
    }
    
    return histogram;
}

// Get numeric columns from data
function getNumericColumns(data) {
    if (data.length === 0) return [];
    
    const headers = Object.keys(data[0]);
    return headers.filter(header => 
        data.some(row => typeof row[header] === 'number')
    );
}

// Get most frequent value
function getMostFrequent(data) {
    const frequency = {};
    data.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
    return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
}

// Create statistics visualization
function createStatsVisualization(type, column, data) {
    if (data.length === 0) return;
    
    const canvas = document.getElementById('statsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (statsChart) {
        statsChart.destroy();
    }
    
    const histogram = createHistogram(data, 10);
    
    statsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: histogram.map(bin => bin.range),
            datasets: [{
                label: `Frequency Distribution - ${column}`,
                data: histogram.map(bin => bin.count),
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: '#667eea',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Distribution of ${column}`,
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                x: { title: { display: true, text: column } },
                y: { title: { display: true, text: 'Frequency' } }
            }
        }
    });
}

// Create correlation chart
function createCorrelationChart(data, column) {
    const numericColumns = getNumericColumns(data);
    if (numericColumns.length < 2) return;
    
    const otherColumn = numericColumns.find(col => col !== column) || numericColumns[0];
    const xData = data.map(row => row[column]).filter(val => typeof val === 'number');
    const yData = data.map(row => row[otherColumn]).filter(val => typeof val === 'number');
    
    const canvas = document.getElementById('statsChart');
    if (!canvas) return;
    
    if (statsChart) {
        statsChart.destroy();
    }
    
    statsChart = new Chart(canvas.getContext('2d'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: `${column} vs ${otherColumn}`,
                data: xData.map((x, i) => ({ x, y: yData[i] })),
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Correlation: ${column} vs ${otherColumn}`,
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                x: { title: { display: true, text: column } },
                y: { title: { display: true, text: otherColumn } }
            }
        }
    });
}

// Create distribution chart
function createDistributionChart(data, column) {
    createStatsVisualization('bar', column, data);
}

// Create outlier chart
function createOutlierChart(data, column) {
    if (data.length === 0) return;
    
    const canvas = document.getElementById('statsChart');
    if (!canvas) return;
    
    if (statsChart) {
        statsChart.destroy();
    }
    
    const sorted = [...data].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    const outliers = data.filter(val => val < lowerBound || val > upperBound);
    const normal = data.filter(val => val >= lowerBound && val <= upperBound);
    
    statsChart = new Chart(canvas.getContext('2d'), {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Normal Values',
                    data: normal.map((val, i) => ({ x: i, y: val })),
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: '#667eea'
                },
                {
                    label: 'Outliers',
                    data: outliers.map((val, i) => ({ x: data.indexOf(val), y: val })),
                    backgroundColor: 'rgba(244, 63, 94, 0.6)',
                    borderColor: '#f43f5e'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Outlier Detection - ${column}`,
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Data Point Index' } },
                y: { title: { display: true, text: column } }
            }
        }
    });
}

// Generate advanced statistics for the stats cards
function generateAdvancedStats(data) {
    if (data.length === 0) return;
    
    const numericColumns = getNumericColumns(data);
    
    // Summary Statistics
    const summaryElement = document.getElementById('summaryStats');
    if (summaryElement) {
        let summary = `Dataset Overview:\n`;
        summary += `Total Records: ${data.length}\n`;
        summary += `Total Columns: ${Object.keys(data[0]).length}\n`;
        summary += `Numeric Columns: ${numericColumns.length}\n`;
        summaryElement.textContent = summary;
    }
    
    // Distribution Stats
    const distributionElement = document.getElementById('distributionStats');
    if (distributionElement && numericColumns.length > 0) {
        const firstNumericCol = numericColumns[0];
        const columnData = data.map(row => row[firstNumericCol]).filter(val => typeof val === 'number');
        const stats = calculateBasicStats(columnData);
        
        let distribution = `${firstNumericCol}:\n`;
        distribution += `Mean: ${stats.mean.toFixed(2)}\n`;
        distribution += `Std Dev: ${stats.stdDev.toFixed(2)}\n`;
        distribution += `Skewness: ${stats.skewness.toFixed(2)}`;
        distributionElement.textContent = distribution;
    }
    
    // Correlation Matrix (simplified)
    const correlationElement = document.getElementById('correlationMatrix');
    if (correlationElement && numericColumns.length >= 2) {
        let correlations = 'Top Correlations:\n';
        
        for (let i = 0; i < Math.min(3, numericColumns.length - 1); i++) {
            for (let j = i + 1; j < Math.min(3, numericColumns.length); j++) {
                const col1Data = data.map(row => row[numericColumns[i]]).filter(val => typeof val === 'number');
                const col2Data = data.map(row => row[numericColumns[j]]).filter(val => typeof val === 'number');
                const correlation = calculateCorrelation(col1Data, col2Data);
                
                correlations += `${numericColumns[i]} × ${numericColumns[j]}: ${correlation.toFixed(3)}\n`;
            }
        }
        
        correlationElement.textContent = correlations;
    }
    
    // Outlier Analysis
    const outlierElement = document.getElementById('outlierAnalysis');
    if (outlierElement && numericColumns.length > 0) {
        const firstNumericCol = numericColumns[0];
        const columnData = data.map(row => row[firstNumericCol]).filter(val => typeof val === 'number');
        
        if (columnData.length > 0) {
            const sorted = [...columnData].sort((a, b) => a - b);
            const q1 = sorted[Math.floor(sorted.length * 0.25)];
            const q3 = sorted[Math.floor(sorted.length * 0.75)];
            const iqr = q3 - q1;
            const outliers = columnData.filter(val => val < q1 - 1.5 * iqr || val > q3 + 1.5 * iqr);
            
            let outlierText = `${firstNumericCol}:\n`;
            outlierText += `Outliers: ${outliers.length}\n`;
            outlierText += `Percentage: ${((outliers.length / columnData.length) * 100).toFixed(1)}%`;
            outlierElement.textContent = outlierText;
        }
    }
}

// Display statistics results
function displayStatsResults(results) {
    const statsOutput = document.getElementById('statsOutput');
    if (statsOutput) {
        statsOutput.innerHTML = `<pre class="stats-results">${results}</pre>`;
    }
}

// Utility functions for showing messages in stats page
function showStatsError(message) {
    showStatsMessage(message, 'error');
}

function showStatsSuccess(message) {
    showStatsMessage(message, 'success');
}

function showStatsMessage(message, type) {
    const existingMessage = document.querySelector('.stats-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageElement = document.createElement('article');
    messageElement.className = `stats-message ${type}`;
    messageElement.textContent = message;
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(messageElement, mainContent.firstChild);
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }
}
