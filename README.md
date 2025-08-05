# Public Dataset Analysis Dashboard

A comprehensive web application for analyzing public datasets with interactive visualizations and statistical tools.

## Features

### 🏠 Home Page (index.html)
- **Data Import**: Support for CSV files, JSON APIs, and sample datasets
- **Data Preview**: Interactive table showing the first 10 rows of loaded data
- **Visualization Tools**: Multiple chart types (Bar, Line, Pie, Scatter plots)
- **Real-time Charts**: Dynamic chart generation using Chart.js

### 📊 Statistics Page (statistics.html)
- **Descriptive Statistics**: Mean, median, mode, standard deviation, variance, skewness
- **Correlation Analysis**: Correlation coefficients between numeric columns
- **Distribution Analysis**: Histogram generation and distribution metrics
- **Outlier Detection**: IQR-based outlier identification
- **Advanced Stats Cards**: Summary statistics, correlation matrix, and outlier analysis

## Technologies Used

- **HTML5**: Semantic markup with proper use of `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **JavaScript (ES6+)**: Data processing, statistical calculations, and DOM manipulation
- **Chart.js**: Interactive data visualization library

## Getting Started

1. **Clone or download** the project files to your local machine
2. **Open** `index.html` in a modern web browser
3. **Load a dataset** using one of these methods:
   - Upload a CSV or JSON file
   - Paste CSV data directly
   - Enter a JSON API URL
   - Use the sample dataset

## Data Import Options

### CSV Format
```csv
Name,Age,Salary,Department
John,25,50000,Engineering
Jane,30,65000,Marketing
Bob,35,70000,Engineering
```

### JSON Format
```json
[
  {"name": "John", "age": 25, "salary": 50000, "department": "Engineering"},
  {"name": "Jane", "age": 30, "salary": 65000, "department": "Marketing"}
]
```

### Sample Datasets
The application includes built-in sample datasets for:
- Sales data with monthly metrics
- Population data for major cities

## File Structure

```
├── index.html          # Main dashboard page
├── statistics.html     # Statistical analysis page
├── styles.css          # Comprehensive styling
├── script.js           # Main application logic
├── statistics.js       # Statistical analysis functions
└── README.md          # This file
```

## Statistical Features

### Descriptive Statistics
- Count, Mean, Median, Mode
- Standard Deviation and Variance
- Range, Quartiles (Q1, Q3)
- Skewness calculation

### Advanced Analysis
- **Correlation Analysis**: Pearson correlation coefficients
- **Distribution Analysis**: Histogram generation and shape analysis
- **Outlier Detection**: IQR method for identifying anomalous data points

### Visualization Types
- **Bar Charts**: For categorical data comparison
- **Line Charts**: For trend analysis over time
- **Pie Charts**: For proportional data representation
- **Scatter Plots**: For correlation visualization

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Usage Examples

### Loading Sample Data
1. Select "Sample Dataset" from the data source dropdown
2. Click "Load Dataset"
3. View the data preview and generate charts

### Analyzing Your Data
1. Upload your CSV/JSON file
2. Navigate to the Statistics page
3. Select a column for analysis
4. Choose analysis type and run the analysis

### Creating Visualizations
1. After loading data, select chart type
2. Choose X and Y axis columns
3. Click "Generate Chart" to create visualization

## Project Constraints Addressed

✅ **Two Pages**: Home (data import & visualization) and Statistics (analysis tools)  
✅ **Semantic HTML**: Uses `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, minimal `<div>` usage  
✅ **Data Forms**: Comprehensive form for data import from various sources  
✅ **Visualization Area**: Interactive charts with multiple types and customization  
✅ **Statistical Tools**: Advanced statistical analysis including correlation, distribution, and outlier detection  
✅ **No React**: Pure HTML, CSS, and JavaScript implementation

## Future Enhancements

- Export functionality for charts and statistics
- More advanced statistical tests
- Database connectivity
- Real-time data streaming
- Machine learning integration

## Contributing

This project was built as an educational example following web development best practices. Feel free to extend and modify as needed.

## License

This project is open source and available under the MIT License.
