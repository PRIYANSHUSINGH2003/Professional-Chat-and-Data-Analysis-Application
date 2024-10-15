import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import './LineGraph.css';

Chart.register(...registerables);

const LineGraph = () => {
    const [salaryData, setSalaryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSalaryData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/dataset');
                console.log('Fetched Data:', response.data);
                setSalaryData(response.data);
            } catch (err) {
                setError('Error fetching data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSalaryData();
    }, []);

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const categories = salaryData.length > 0 
        ? Object.keys(salaryData[0]).filter(key => key !== 'year' && key.trim() !== '') 
        : [];

    const datasets = categories.map(category => ({
        label: category,
        data: salaryData.map(item => {
            const value = parseFloat(item[category]); 
            return isNaN(value) ? 0 : value;
        }),
        borderColor: getRandomColor(),
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderWidth: 2,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(75,192,192,1)',
    }));

    const data = {
        labels: salaryData.map(item => item.year || item['Year'] || item.work_year || 'Unknown'), // Adjust to match your data structure
        datasets: datasets.filter(dataset => dataset.data.some(value => value !== undefined && value !== null)),
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(200, 200, 200, 0.5)',
                },
            },
        },
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 14,
                    },
                },
            },
        },
    };

    if (loading) return <div className="loading-message">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="line-graph-container">
            <h2>Job Distribution Over Years</h2>
            <div className="line-graph">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

export default LineGraph;
