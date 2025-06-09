class ChartManager {
    constructor() {
        this.revenueChart = null;
        this.connectionsChart = null;
        this.hourlyChart = null;
    }

    initializeCharts() {
        this.initRevenueChart();
        this.initConnectionsChart();
        this.initHourlyChart();
    }

    initRevenueChart() {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        this.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Revenue ($)',
                    data: [],
                    borderColor: 'rgba(0, 255, 195, 1)',
                    backgroundColor: 'rgba(0, 255, 195, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(0, 255, 195, 1)',
                    pointBorderColor: 'rgba(0, 255, 195, 1)',
                    pointHoverBackgroundColor: 'white',
                    pointHoverBorderColor: 'rgba(0, 255, 195, 1)',
                    pointRadius: 3,
                    pointHoverRadius: 5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Revenue (30 Days)',
                        color: 'white',
                        font: {
                            family: "'Inter', 'system-ui', sans-serif",
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 25, 40, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        displayColors: false,
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `Revenue: $${context.parsed.y.toFixed(4)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                            }
                        },
                        title: {
                            display: true,
                            text: 'Date',
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                            },
                            callback: function(value) {
                                return '$' + value.toFixed(4);
                            }
                        },
                        title: {
                            display: true,
                            text: 'Revenue ($)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                animations: {
                    tension: {
                        duration: 1000,
                        easing: 'easeOutQuad',
                        from: 0.8,
                        to: 0.4,
                    }
                }
            }
        });
    }

    initConnectionsChart() {
        const ctx = document.getElementById('connectionsChart').getContext('2d');
        
        this.connectionsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Visitors',
                    data: [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    pointBorderColor: 'rgba(255, 99, 132, 1)',
                    pointHoverBackgroundColor: 'white',
                    pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
                    pointRadius: 3,
                    pointHoverRadius: 5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Visitors (30 Days)',
                        color: 'white',
                        font: {
                            family: "'Inter', 'system-ui', sans-serif",
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 25, 40, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        displayColors: false,
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `Visitors: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                            }
                        },
                        title: {
                            display: true,
                            text: 'Date',
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                            }
                        },
                        title: {
                            display: true,
                            text: 'Visitors',
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                animations: {
                    tension: {
                        duration: 1000,
                        easing: 'easeOutQuad',
                        from: 0.8,
                        to: 0.4,
                    }
                }
            }
        });
    }

    initHourlyChart() {
        const ctx = document.getElementById('hourlyChart').getContext('2d');
        
        this.hourlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')),
                datasets: [{
                    label: 'Hourly Visitors',
                    data: Array(24).fill(0),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                    hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Visitors by Hour (Last 24h)',
                        color: 'white',
                        font: {
                            family: "'Inter', 'system-ui', sans-serif",
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 25, 40, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        displayColors: false,
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `Visitors: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                            }
                        },
                        title: {
                            display: true,
                            text: 'Hour',
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                            }
                        },
                        title: {
                            display: true,
                            text: 'Visitors',
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: {
                                family: "'Inter', 'system-ui', sans-serif",
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuad'
                }
            }
        });
    }

    updateRevenueChart(labels, data) {
        if (this.revenueChart) {
            this.revenueChart.data.labels = labels;
            this.revenueChart.data.datasets[0].data = data;
            this.revenueChart.update();
        }
    }

    updateConnectionsChart(labels, data) {
        if (this.connectionsChart) {
            this.connectionsChart.data.labels = labels;
            this.connectionsChart.data.datasets[0].data = data;
            this.connectionsChart.update();
        }
    }

    updateHourlyChart(data) {
        if (this.hourlyChart) {
            this.hourlyChart.data.datasets[0].data = data;
            this.hourlyChart.update();
        }
    }
}

window.chartManager = new ChartManager();