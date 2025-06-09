class DashboardManager {
    constructor() {
        this.initialData = null;
        this.averageRevenue = 0;
        this.totalRevenue = 0;
        this.dateLabels = [];
        this.revData = [];
        this.connData = [];
        this.hourlyData = Array(24).fill(0);
        this.isLoading = true;
        this.prevAverageRevenue = 0;
        this.last24hVisitors = 0;
        this.last12hRevenue = 0;
        this.last24hRevenue = 0;
        this.lastWeekRevenue = 0;
        this.monthlyRevenue = 0;
        this.countUpInstances = {};
        this.prevProjectedRevenue = 0;
    }

    init() {
        this.setupSocketListeners();
        this.connectSocket();
        this.updateCurrentYear();
    }

    setupSocketListeners() {
        window.socketService.addEventListener('initial_data', (data) => {
            this.handleInitialData(data);
        });

        window.socketService.addEventListener('revenue_update', (data) => {
            this.handleRevenueUpdate(data);
        });

        window.socketService.addEventListener('connection_update', (data) => {
            this.handleConnectionUpdate(data);
        });
    }

    connectSocket() {
        window.socketService.connect();
    }

    handleInitialData(data) {
        this.initialData = data;
        this.averageRevenue = data.averageRevenue ?? 0;
        this.prevAverageRevenue = data.averageRevenue ?? 0;
        this.prevProjectedRevenue = data.averageRevenue ?? 0;
        this.totalRevenue = data.totalRevenue ?? 0;
        this.last24hVisitors = data.last24hConnects ?? 0;
        this.last12hRevenue = data.last12hRevenue ?? 0;
        this.last24hRevenue = data.last24hRevenue ?? 0;
        this.lastWeekRevenue = data.lastWeekRevenue ?? 0;
        this.monthlyRevenue = data.monthlyRevenue ?? data.totalRevenue ?? 0;

        const labels = [];
        const revenues = [];
        const connections = [];

        data.revenuePerDay.forEach(r => {
            labels.push(r.date);
            revenues.push(parseFloat(r.revenue.toString()) || 0);
        });

        data.connPerDay.forEach(c => connections.push(c.connections ?? 0));

        const hourly = Array(24).fill(0);
        data.connPerHour.forEach(h => {
            const idx = parseInt(h.hour);
            hourly[idx] = h.connections ?? 0;
        });

        this.dateLabels = labels;
        this.revData = revenues;
        this.connData = connections;
        this.hourlyData = hourly;

        this.updateUI();
        this.updateCharts();
        this.hideLoading();
    }

    handleRevenueUpdate(data) {
        this.prevAverageRevenue = this.averageRevenue;
        this.prevProjectedRevenue = this.averageRevenue;
        this.averageRevenue = parseFloat(data.averageRevenue.toString()) || 0;

        const idx = this.dateLabels.indexOf(data.date);
        if (idx !== -1) {
            this.revData[idx] = parseFloat(data.amount.toString()) || 0;
        } else {
            this.dateLabels.push(data.date);
            this.revData.push(parseFloat(data.amount.toString()) || 0);
        }

        this.updateUI();
        this.updateCharts();
    }

    handleConnectionUpdate(data) {
        const idx = this.dateLabels.indexOf(data.date);
        if (idx !== -1) {
            this.connData[idx]++;
        }

        const h = parseInt(data.hour);
        if (!isNaN(h)) {
            this.hourlyData[h]++;
        }

        this.updateCharts();
    }

    updateUI() {
        this.animateValue('monthlyRevenue', this.monthlyRevenue, true);
        this.animateValue('lastWeekRevenue', this.lastWeekRevenue, true);
        this.animateValue('last24hRevenue', this.last24hRevenue, true);
        this.animateValue('last12hRevenue', this.last12hRevenue, true);
        this.animateValue('last24hVisitors', this.last24hVisitors, false);
        this.animateValue('actualDailyRevenue', this.monthlyRevenue / 30, true);
        this.animateProjectedRevenue(this.averageRevenue);
    }

    updateCharts() {
        window.chartManager.updateRevenueChart(this.dateLabels, this.revData);
        window.chartManager.updateConnectionsChart(this.dateLabels, this.connData);
        window.chartManager.updateHourlyChart(this.hourlyData);
    }

    animateValue(elementId, endValue, isCurrency = false) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = parseFloat(element.textContent.replace(/[$,]/g, '')) || 0;
        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuad = 1 - (1 - progress) * (1 - progress);
            const currentValue = startValue + (endValue - startValue) * easeOutQuad;

            if (isCurrency) {
                element.textContent = `$${currentValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
            } else {
                element.textContent = Math.round(currentValue).toLocaleString();
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    animateProjectedRevenue(endValue) {
        const elementId = 'projectedDailyRevenue';
        const element = document.getElementById(elementId);
        if (!element) return;

        if (this.countUpInstances[elementId]) {
            this.countUpInstances[elementId].reset();
        }

        const startValue = this.prevProjectedRevenue;

        const options = {
            startVal: startValue,
            decimalPlaces: 5,
            duration: 5,
            prefix: '$',
            separator: ',',
            useEasing: false,
            useGrouping: true
        };

        this.countUpInstances[elementId] = new countUp.CountUp(elementId, endValue, options);
        
        if (!this.countUpInstances[elementId].error) {
            this.countUpInstances[elementId].start();
            this.prevProjectedRevenue = endValue;
        } else {
            element.textContent = `$${endValue.toFixed(5)}`;
            this.prevProjectedRevenue = endValue;
        }
    }

    hideLoading() {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        this.isLoading = false;
    }

    updateCurrentYear() {
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }
}

window.dashboardManager = new DashboardManager();