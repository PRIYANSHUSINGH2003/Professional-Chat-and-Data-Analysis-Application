import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import './MainTable.css';

// Custom Hook for fetching data
const useFetchData = (url) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(url);
                setData(response.data);
            } catch (err) {
                setError('Error fetching data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [url]);

    return { data, loading, error };
};

const MainTable = () => {
    const { data: tableData, loading, error } = useFetchData('http://localhost:5000/api/dataset');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [selectedYear, setSelectedYear] = useState(null);
    const [detailedData, setDetailedData] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Adjust this value to change the number of items per page

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return tableData;
        return [...tableData].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }, [tableData, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage]);

    const requestSort = (key) => {
        const direction = (sortConfig.key === key && sortConfig.direction === 'ascending') ? 'descending' : 'ascending';
        setSortConfig({ key, direction });
    };

    const handleRowClick = useCallback((year) => {
        setSelectedYear(year);
        const details = tableData
            .filter((entry) => entry.year === year)
            .reduce((acc, curr) => {
                const jobTitle = curr.job_title || 'Unknown';
                acc[jobTitle] = (acc[jobTitle] || 0) + 1;
                return acc;
            }, {});
        
        const formattedDetails = Object.entries(details).map(([job_title, count]) => ({
            job_title,
            count,
        }));
        
        setDetailedData(formattedDetails);
    }, [tableData]);

    const headers = useMemo(() => (
        tableData.length > 0 ? Object.keys(tableData[0]) : []
    ), [tableData]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    if (loading) return <div className="loading-message">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="main-table-container">
            <h1>The dataset provides information (Basic Table)</h1>
            <table className="main-table">
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header} onClick={() => requestSort(header)}>
                                {header.charAt(0).toUpperCase() + header.slice(1)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((item, index) => (
                        <tr key={index} onClick={() => handleRowClick(item.year)}>
                            {headers.map((header) => (
                                <td key={header}>{item[header]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedYear && (
                <div className="details-table-container">
                    <h2>Details for {selectedYear}</h2>
                    <table className="details-table">
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Number of Jobs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedData.map((detail, index) => (
                                <tr key={index}>
                                    <td>{detail.job_title}</td>
                                    <td>{detail.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            <div className="pagination-controls">
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    Previous
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default MainTable;
