// Global variables
let currentData = [];
let chart = null;

// Sample datasets for demonstration
const sampleDatasets = {
    sales: [
        { month: 'Jan', sales: 1200, profit: 400, region: 'North' },
        { month: 'Feb', sales: 1500, profit: 600, region: 'North' },
        { month: 'Mar', sales: 1800, profit: 700, region: 'South' },
        { month: 'Apr', sales: 2200, profit: 900, region: 'East' },
        { month: 'May', sales: 2800, profit: 1200, region: 'West' },
        { month: 'Jun', sales: 3200, profit: 1500, region: 'North' }
    ],
    population: [
        { city: 'New York', population: 8419000, area: 302.6, density: 27826 },
        { city: 'Los Angeles', population: 3980000, area: 468.7, density: 8495 },
        { city: 'Chicago', population: 2716000, area: 227.6, density: 11930 },
        { city: 'Houston', population: 2328000, area: 637.5, density: 3653 },
        { city: 'Phoenix', population: 1690000, area: 517.6, density: 3267 }
    ],
    healthcare: [
        { patientId: 1, age: 45, gender: 'Male', bloodPressure: '120/80', cholesterol: 200, disease: 'None' },
        { patientId: 2, age: 52, gender: 'Female', bloodPressure: '140/90', cholesterol: 230, disease: 'Hypertension' },
        { patientId: 3, age: 60, gender: 'Male', bloodPressure: '135/85', cholesterol: 210, disease: 'None' },
        { patientId: 4, age: 48, gender: 'Female', bloodPressure: '130/88', cholesterol: 245, disease: 'High Cholesterol' },
        { patientId: 5, age: 70, gender: 'Male', bloodPressure: '150/95', cholesterol: 260, disease: 'Hypertension' },
        { patientId: 6, age: 65, gender: 'Female', bloodPressure: '125/82', cholesterol: 220, disease: 'None' }
    ]
};

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    const dataForm = document.getElementById('dataForm');
    const fileInput = document.getElementById('fileInput');
    const dataSource = document.getElementById('dataSource');

    if (dataForm) {
        dataForm.addEventListener('submit', handleDataSubmission);
    }

    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
        
        // Display selected file name
        fileInput.addEventListener('change', function(e) {
            const fileName = document.getElementById('fileName');
            if (this.files && this.files.length > 0) {
                fileName.textContent = `Selected: ${this.files[0].name}`;
            } else {
                fileName.textContent = '';
            }
        });
    }

    if (dataSource) {
        dataSource.addEventListener('change', handleDataSourceChange);
    }

    // Initialize chart controls
    const generateChartBtn = document.getElementById('generateChart');
    if (generateChartBtn) {
        generateChartBtn.addEventListener('click', generateVisualization);
    }

    // Load data from localStorage if available
    loadStoredData();
}

// Handle data source change
function handleDataSourceChange(event) {
    const dataInput = document.getElementById('dataInput');
    const fileInput = document.getElementById('fileInput');

    switch (event.target.value) {
        case 'csv':
            dataInput.placeholder = 'Paste CSV data here...\nExample:\nName,Age,City\nJohn,25,New York\nJane,30,Los Angeles';
            fileInput.style.display = 'block';
            break;
        case 'json':
            dataInput.placeholder = 'Enter JSON API URL or paste JSON data...\nExample: https://api.example.com/data';
            fileInput.style.display = 'none';
            break;
        case 'sample-sales':
        case 'sample-population':
        case 'sample-healthcare':
            dataInput.placeholder = 'Sample dataset will be loaded automatically';
            fileInput.style.display = 'none';
            break;
        default:
            dataInput.placeholder = 'Select a data source type first';
            fileInput.style.display = 'none';
    }
}

// Handle data form submission
async function handleDataSubmission(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const dataSource = formData.get('dataSource');
    const dataInput = formData.get('dataInput');

    try {
        showLoading('Loading dataset...');

        switch (dataSource) {
            case 'csv':
                if (dataInput.trim()) {
                    currentData = parseCSV(dataInput);
                } else {
                    throw new Error('Please provide CSV data');
                }
                break;
            case 'json':
                if (dataInput.trim()) {
                    if (dataInput.startsWith('http')) {
                        currentData = await fetchJSONData(dataInput);
                    } else {
                        currentData = JSON.parse(dataInput);
                    }
                } else {
                    throw new Error('Please provide JSON data or URL');
                }
                break;
            case 'sample-sales':
                currentData = sampleDatasets.sales;
                break;
            case 'sample-population':
                currentData = sampleDatasets.population;
                break;
            case 'sample-healthcare':
                currentData = sampleDatasets.healthcare;
                break;
            default:
                throw new Error('Please select a data source type');
        }

        if (currentData.length === 0) {
            throw new Error('No data found or invalid format');
        }

        // Store data for use across pages
        localStorage.setItem('currentData', JSON.stringify(currentData));

        displayDataPreview(currentData);
        populateAxisSelectors(currentData);
        
        // Update statistics tab if functions are available
        if (typeof populateStatsColumns === 'function') {
            populateStatsColumns(currentData);
        }
        if (typeof generateAdvancedStats === 'function') {
            generateAdvancedStats(currentData);
        }
        
        showSuccess('Dataset loaded successfully!');

    } catch (error) {
        showError('Error loading dataset: ' + error.message);
    }
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;

        try {
            if (file.name.endsWith('.csv')) {
                currentData = parseCSV(content);
            } else if (file.name.endsWith('.json')) {
                currentData = JSON.parse(content);
            } else {
                throw new Error('Unsupported file format');
            }

            localStorage.setItem('currentData', JSON.stringify(currentData));
            displayDataPreview(currentData);
            populateAxisSelectors(currentData);
            showSuccess('File uploaded successfully!');

        } catch (error) {
            showError('Error reading file: ' + error.message);
        }
    };

    reader.readAsText(file);
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('CSV must have at least a header and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                const value = values[index];
                // Try to convert to number if possible
                row[header] = isNaN(value) ? value : parseFloat(value);
            });
            data.push(row);
        }
    }

    return data;
}

// Fetch JSON data from URL
async function fetchJSONData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        throw new Error('Failed to fetch data from URL: ' + error.message);
    }
}

// Display data preview
function displayDataPreview(data) {
    const previewContainer = document.getElementById('dataPreview');
    if (!previewContainer) return;

    if (data.length === 0) {
        previewContainer.innerHTML = '<p>No data to display.</p>';
        return;
    }

    const headers = Object.keys(data[0]);
    const maxRows = Math.min(data.length, 10); // Show first 10 rows

    let tableHTML = `
        <section class="table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        ${headers.map(header => `<th title="${header}">${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;

    for (let i = 0; i < maxRows; i++) {
        tableHTML += '<tr>';
        headers.forEach(header => {
            const cellValue = data[i][header] || '';
            const displayValue = typeof cellValue === 'string' && cellValue.length > 30
                ? cellValue.substring(0, 30) + '...'
                : cellValue;
            tableHTML += `<td title="${cellValue}">${displayValue}</td>`;
        });
        tableHTML += '</tr>';
    }

    tableHTML += '</tbody></table></section>';

    if (data.length > 10) {
        tableHTML += `<p style="margin-top: 1rem; font-style: italic; text-align: center;">Showing first 10 rows of ${data.length} total rows.</p>`;
    }

    // Add scroll hint for wide tables
    if (headers.length > 5) {
        tableHTML += `<p style="margin-top: 0.5rem; font-size: 0.85rem; color: #666; text-align: center; font-style: italic;">💡 Scroll horizontally to view all ${headers.length} columns</p>`;
    }

    previewContainer.innerHTML = tableHTML;
}

// Populate axis selectors for charts
function populateAxisSelectors(data) {
    const xAxisSelect = document.getElementById('xAxis');
    const yAxisSelect = document.getElementById('yAxis');

    if (!xAxisSelect || !yAxisSelect || data.length === 0) return;

    const headers = Object.keys(data[0]);

    // Clear existing options except the first placeholder
    xAxisSelect.innerHTML = '<option value="">Select X-Axis</option>';
    yAxisSelect.innerHTML = '<option value="">Select Y-Axis</option>';

    headers.forEach(header => {
        xAxisSelect.innerHTML += `<option value="${header}">${header}</option>`;
        yAxisSelect.innerHTML += `<option value="${header}">${header}</option>`;
    });
}

// Generate visualization
function generateVisualization() {
    const chartType = document.getElementById('chartType').value;
    const xAxis = document.getElementById('xAxis').value;
    const yAxis = document.getElementById('yAxis').value;

    if (!xAxis || !yAxis) {
        showError('Please select both X and Y axis values');
        return;
    }

    if (currentData.length === 0) {
        showError('Please load a dataset first');
        return;
    }

    try {
        createChart(chartType, xAxis, yAxis, currentData);
        showSuccess('Chart generated successfully!');
    } catch (error) {
        showError('Error generating chart: ' + error.message);
    }
}

// Create chart using Chart.js
function createChart(type, xAxis, yAxis, data) {
    const canvas = document.getElementById('dataChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (chart) {
        chart.destroy();
    }

    // Prepare data for Chart.js
    const labels = data.map(item => item[xAxis]);
    const values = data.map(item => {
        const value = item[yAxis];
        return typeof value === 'number' ? value : 0;
    });

    const chartConfig = {
        type: type === 'scatter' ? 'scatter' : type,
        data: {
            labels: type === 'scatter' ? undefined : labels,
            datasets: [{
                label: `${yAxis} vs ${xAxis}`,
                data: type === 'scatter' ?
                    data.map(item => ({
                        x: typeof item[xAxis] === 'number' ? item[xAxis] : 0,
                        y: typeof item[yAxis] === 'number' ? item[yAxis] : 0
                    })) : values,
                backgroundColor: generateColors(data.length),
                borderColor: '#667eea',
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${yAxis} vs ${xAxis}`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: type === 'pie'
                }
            },
            scales: type === 'pie' ? {} : {
                x: {
                    title: {
                        display: true,
                        text: xAxis
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: yAxis
                    }
                }
            }
        }
    };

    chart = new Chart(ctx, chartConfig);
}

// Generate colors for chart
function generateColors(count) {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
    ];

    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

// Load stored data
function loadStoredData() {
    const storedData = localStorage.getItem('currentData');
    if (storedData) {
        try {
            currentData = JSON.parse(storedData);
            if (currentData.length > 0) {
                displayDataPreview(currentData);
                populateAxisSelectors(currentData);
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
        }
    }
}

// Utility functions for showing messages
function showLoading(message) {
    showMessage(message, 'loading');
}

function showError(message) {
    showMessage(message, 'error');
}

function showSuccess(message) {
    showMessage(message, 'success');
}

function showMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message
    const messageElement = document.createElement('article');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;

    // Insert at the top of main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(messageElement, mainContent.firstChild);

        // Auto-remove after 5 seconds for success/error messages
        if (type !== 'loading') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 5000);
        }
    }
}

// Export data for use in statistics page
window.getCurrentData = function () {
    return currentData;
};

window.loadStoredData = loadStoredData;

// Tab Switching Functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
                
                // If switching to statistics tab, refresh stats if data exists
                if (targetTab === 'statistics' && currentData.length > 0) {
                    if (typeof populateStatsColumns === 'function') {
                        populateStatsColumns(currentData);
                    }
                    if (typeof generateAdvancedStats === 'function') {
                        generateAdvancedStats(currentData);
                    }
                }
            }
        });
    });
});
