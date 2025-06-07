// OntoTrade Simulation Dashboard JavaScript

class SimulationDashboard {
    constructor() {
        this.currentLang = 'ko';
        this.simulationData = this.initializeSimulationData();
        this.leaderboardData = this.initializeLeaderboardData();
        this.newsData = this.initializeNewsData();
        this.userStats = this.initializeUserStats();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupLanguageToggle();
        this.startRealTimeUpdates();
        this.updateProgressBars();
        this.animateCounters();
    }

    // ===== 데이터 초기화 =====
    initializeSimulationData() {
        return {
            'tech-focus': {
                name: { ko: '기술주 집중 투자', en: 'Tech Stock Focus' },
                duration: 30,
                currentDay: 7,
                initialValue: 100000,
                currentValue: 108400,
                rank: 23,
                status: 'active',
                startDate: '2024.06.01'
            },
            'dividend-stable': {
                name: { ko: '배당주 안정형', en: 'Dividend Stable' },
                duration: 90,
                currentDay: 23,
                initialValue: 50000,
                currentValue: 51600,
                rank: 89,
                status: 'active',
                startDate: '2024.05.15'
            },
            'esg-challenge': {
                name: { ko: 'ESG 투자 챌린지', en: 'ESG Investment Challenge' },
                duration: 14,
                participants: 847,
                maxParticipants: 1000,
                initialValue: 25000,
                prize: 10000,
                status: 'pending',
                startDate: '2024.06.10'
            },
            'crisis-scenario': {
                name: { ko: '금융위기 시나리오', en: 'Financial Crisis Scenario' },
                duration: 30,
                currentDay: 30,
                initialValue: 100000,
                currentValue: 97900,
                rank: 156,
                status: 'completed',
                endDate: '2024.05.30'
            }
        };
    }

    initializeLeaderboardData() {
        return [
            { rank: 1, username: 'InvestorKing', level: '전문가', experience: '3년차', return: 47.2, todayChange: 2.1, avatar: '👑' },
            { rank: 2, username: 'TechGuru99', level: '고급자', experience: '2년차', return: 42.8, todayChange: 1.3, avatar: '🚀' },
            { rank: 3, username: 'ValueHunter', level: '중급자', experience: '1년차', return: 38.9, todayChange: -0.5, avatar: '⭐' },
            { rank: 127, username: '나 (투자자님)', level: '초급자', experience: '3개월차', return: 12.3, todayChange: 0.8, avatar: '👤', isMe: true }
        ];
    }

    initializeNewsData() {
        return [
            { 
                title: { ko: 'Fed 기준금리 0.25%p 인하 결정', en: 'Fed Cuts Interest Rate by 0.25%' },
                time: { ko: '30분 전', en: '30 min ago' },
                impact: 'positive',
                sector: { ko: '📈 주식 긍정적', en: '📈 Bullish for Stocks' }
            },
            { 
                title: { ko: '애플 신제품 발표회 예정', en: 'Apple Event Scheduled' },
                time: { ko: '2시간 전', en: '2 hours ago' },
                impact: 'neutral',
                sector: { ko: '⚡ 기술주 영향', en: '⚡ Tech Impact' }
            },
            { 
                title: { ko: '유가 급등으로 에너지주 상승', en: 'Energy Stocks Rise on Oil Surge' },
                time: { ko: '4시간 전', en: '4 hours ago' },
                impact: 'positive',
                sector: { ko: '🛢️ 에너지 섹터', en: '🛢️ Energy Sector' }
            }
        ];
    }

    initializeUserStats() {
        return {
            activeSimulations: 3,
            rank: 127,
            avgReturn: 12.3,
            completedSimulations: 8,
            totalSimulations: 12,
            winRate: 67,
            rankChange: 23,
            monthlyReturn: 2.1,
            weeklyGains: 1
        };
    }

    // ===== 이벤트 리스너 설정 =====
    setupEventListeners() {
        // 시뮬레이션 카드 클릭
        document.querySelectorAll('.simulation-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleSimulationCardClick(e));
        });

        // 액션 버튼들
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => this.handleActionClick(e));
        });

        // 업적 클릭
        document.querySelectorAll('.achievement').forEach(achievement => {
            achievement.addEventListener('click', (e) => this.handleAchievementClick(e));
        });

        // 리더보드 아이템 클릭
        document.querySelectorAll('.leaderboard-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleLeaderboardClick(e));
        });

        // 뉴스 아이템 클릭
        document.querySelectorAll('.news-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNewsClick(e));
        });
    }

    setupLanguageToggle() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.switchLanguage(lang);
            });
        });
    }

    // ===== 언어 전환 =====
    switchLanguage(lang) {
        if (this.currentLang === lang) return;
        
        this.currentLang = lang;
        
        // 언어 버튼 상태 업데이트
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        // 모든 다국어 텍스트 업데이트
        document.querySelectorAll('[data-ko][data-en]').forEach(element => {
            const text = element.dataset[lang];
            if (text) {
                element.textContent = text;
            }
        });

        // 애니메이션 효과
        document.body.style.transition = 'opacity 0.2s ease';
        document.body.style.opacity = '0.8';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 200);
    }

    // ===== 시뮬레이션 카드 클릭 처리 =====
    handleSimulationCardClick(e) {
        const card = e.currentTarget;
        const simulationId = card.dataset.simulationId;
        const action = card.dataset.action;

        if (action === 'create-new') {
            this.showCreateSimulationModal();
            return;
        }

        if (simulationId) {
            this.openSimulationDetail(simulationId);
        }
    }

    // ===== 액션 버튼 클릭 처리 =====
    handleActionClick(e) {
        const action = e.currentTarget.dataset.action;
        
        switch (action) {
            case 'new-simulation':
            case 'create-new':
                this.showCreateSimulationModal();
                break;
            case 'performance':
                this.showPerformanceAnalysis();
                break;
            default:
                console.log(`Action: ${action}`);
        }
    }

    // ===== 업적 클릭 처리 =====
    handleAchievementClick(e) {
        const achievement = e.currentTarget;
        const achievementId = achievement.dataset.achievement;
        
        if (achievement.classList.contains('earned')) {
            this.showAchievementDetail(achievementId);
        } else {
            this.showAchievementProgress(achievementId);
        }
    }

    // ===== 리더보드 클릭 처리 =====
    handleLeaderboardClick(e) {
        const item = e.currentTarget;
        this.showUserProfile(item);
    }

    // ===== 뉴스 클릭 처리 =====
    handleNewsClick(e) {
        const newsItem = e.currentTarget;
        this.showNewsDetail(newsItem);
    }

    // ===== 모달 및 상세 화면 =====
    showCreateSimulationModal() {
        const modal = this.createModal({
            title: { ko: '새 시뮬레이션 생성', en: 'Create New Simulation' },
            content: this.createSimulationForm(),
            buttons: [
                { text: { ko: '취소', en: 'Cancel' }, action: 'close', style: 'secondary' },
                { text: { ko: '시작하기', en: 'Start' }, action: 'create', style: 'primary' }
            ]
        });
        
        document.body.appendChild(modal);
    }

    createSimulationForm() {
        return `
            <div class="form-section">
                <label data-ko="시뮬레이션 유형" data-en="Simulation Type">시뮬레이션 유형</label>
                <select class="form-select" id="simulation-type">
                    <option value="free" data-ko="자유 투자" data-en="Free Trading">자유 투자</option>
                    <option value="mission" data-ko="미션 기반" data-en="Mission Based">미션 기반</option>
                    <option value="competition" data-ko="경쟁 모드" data-en="Competition">경쟁 모드</option>
                    <option value="scenario" data-ko="시나리오" data-en="Scenario">시나리오</option>
                </select>
            </div>
            <div class="form-section">
                <label data-ko="기간" data-en="Duration">기간</label>
                <select class="form-select" id="simulation-duration">
                    <option value="7" data-ko="1주일" data-en="1 Week">1주일</option>
                    <option value="30" data-ko="1개월" data-en="1 Month">1개월</option>
                    <option value="90" data-ko="3개월" data-en="3 Months">3개월</option>
                    <option value="365" data-ko="1년" data-en="1 Year">1년</option>
                </select>
            </div>
            <div class="form-section">
                <label data-ko="초기 자금" data-en="Initial Capital">초기 자금</label>
                <select class="form-select" id="initial-capital">
                    <option value="10000">$10,000</option>
                    <option value="50000">$50,000</option>
                    <option value="100000">$100,000</option>
                    <option value="500000">$500,000</option>
                </select>
            </div>
        `;
    }

    openSimulationDetail(simulationId) {
        const simulation = this.simulationData[simulationId];
        if (!simulation) return;

        // 시뮬레이션 상세 페이지로 이동 또는 모달 표시
        console.log(`Opening simulation: ${simulationId}`, simulation);
        
        // 실제로는 새 페이지로 이동하거나 상세 모달을 표시
        this.showSimulationDetailModal(simulation);
    }

    showSimulationDetailModal(simulation) {
        const modal = this.createModal({
            title: simulation.name,
            content: this.createSimulationDetailContent(simulation),
            size: 'large'
        });
        
        document.body.appendChild(modal);
    }

    createSimulationDetailContent(simulation) {
        const returnRate = ((simulation.currentValue - simulation.initialValue) / simulation.initialValue * 100).toFixed(1);
        
        return `
            <div class="simulation-detail">
                <div class="detail-stats">
                    <div class="detail-stat">
                        <span class="detail-value">${returnRate}%</span>
                        <span class="detail-label" data-ko="수익률" data-en="Return">수익률</span>
                    </div>
                    <div class="detail-stat">
                        <span class="detail-value">$${simulation.currentValue.toLocaleString()}</span>
                        <span class="detail-label" data-ko="현재 가치" data-en="Current Value">현재 가치</span>
                    </div>
                    <div class="detail-stat">
                        <span class="detail-value">${simulation.rank}위</span>
                        <span class="detail-label" data-ko="순위" data-en="Rank">순위</span>
                    </div>
                </div>
                <div class="detail-chart">
                    <canvas id="performance-chart" width="400" height="200"></canvas>
                </div>
                <div class="detail-actions">
                    <button class="action-button" data-ko="거래하기" data-en="Trade Now">거래하기</button>
                    <button class="action-button secondary" data-ko="분석하기" data-en="Analyze">분석하기</button>
                </div>
            </div>
        `;
    }

    // ===== 모달 생성 유틸리티 =====
    createModal({ title, content, buttons = [], size = 'medium' }) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        const modalContent = document.createElement('div');
        modalContent.className = `modal-content ${size}`;
        
        const titleText = typeof title === 'object' ? title[this.currentLang] : title;
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${titleText}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${buttons.length > 0 ? `
                <div class="modal-footer">
                    ${buttons.map(btn => {
                        const btnText = typeof btn.text === 'object' ? btn.text[this.currentLang] : btn.text;
                        return `<button class="action-button ${btn.style || ''}" data-action="${btn.action}">${btnText}</button>`;
                    }).join('')}
                </div>
            ` : ''}
        `;
        
        modal.appendChild(modalContent);
        
        // 모달 이벤트 리스너
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                this.closeModal(modal);
            }
        });
        
        modalContent.addEventListener('click', (e) => {
            if (e.target.dataset.action) {
                this.handleModalAction(e.target.dataset.action, modal);
            }
        });
        
        return modal;
    }

    closeModal(modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    handleModalAction(action, modal) {
        switch (action) {
            case 'close':
                this.closeModal(modal);
                break;
            case 'create':
                this.createNewSimulation();
                this.closeModal(modal);
                break;
            default:
                console.log(`Modal action: ${action}`);
        }
    }

    // ===== 실시간 업데이트 =====
    startRealTimeUpdates() {
        // 5초마다 데이터 업데이트
        setInterval(() => {
            this.updateSimulationData();
            this.updateLeaderboard();
            this.updateMarketData();
        }, 5000);

        // 30초마다 뉴스 업데이트
        setInterval(() => {
            this.updateNews();
        }, 30000);
    }

    updateSimulationData() {
        Object.keys(this.simulationData).forEach(id => {
            const simulation = this.simulationData[id];
            if (simulation.status === 'active') {
                // 가상의 가격 변동 (-2% ~ +2%)
                const change = (Math.random() - 0.5) * 0.04;
                simulation.currentValue *= (1 + change);
                
                // UI 업데이트
                this.updateSimulationCard(id, simulation);
            }
        });
    }

    updateSimulationCard(id, simulation) {
        const card = document.querySelector(`[data-simulation-id="${id}"]`);
        if (!card) return;

        const returnRate = ((simulation.currentValue - simulation.initialValue) / simulation.initialValue * 100).toFixed(1);
        const valueElement = card.querySelector('[data-value]');
        const returnElement = card.querySelector('[data-return]');

        if (valueElement) {
            valueElement.textContent = `$${Math.round(simulation.currentValue).toLocaleString()}`;
            valueElement.dataset.value = Math.round(simulation.currentValue);
        }

        if (returnElement) {
            returnElement.textContent = `${returnRate > 0 ? '+' : ''}${returnRate}%`;
            returnElement.dataset.return = returnRate;
            
            // 색상 업데이트
            returnElement.style.color = returnRate >= 0 ? '#10b981' : '#ef4444';
        }
    }

    updateLeaderboard() {
        // 리더보드 순위 변동 시뮬레이션
        this.leaderboardData.forEach(user => {
            if (!user.isMe) {
                // 다른 사용자들의 수익률 변동
                const change = (Math.random() - 0.5) * 0.02;
                user.return += change;
                user.todayChange = change;
            }
        });

        // 순위 재정렬
        this.leaderboardData.sort((a, b) => b.return - a.return);
        this.leaderboardData.forEach((user, index) => {
            user.rank = index + 1;
        });
    }

    updateMarketData() {
        // 가상자산 업데이트
        const virtualMoneyElement = document.querySelector('.virtual-money');
        if (virtualMoneyElement) {
            const currentValue = 10000000 + (Math.random() - 0.5) * 100000;
            const text = this.currentLang === 'ko' 
                ? `💰 가상자산 $${currentValue.toLocaleString()}` 
                : `💰 Virtual $${currentValue.toLocaleString()}`;
            virtualMoneyElement.textContent = text;
        }
    }

    updateNews() {
        // 새로운 뉴스 아이템 추가 (실제로는 API에서 가져옴)
        const newNews = {
            title: { ko: '새로운 시장 뉴스', en: 'New Market News' },
            time: { ko: '방금 전', en: 'Just now' },
            impact: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)],
            sector: { ko: '📊 시장 전반', en: '📊 Overall Market' }
        };

        this.newsData.unshift(newNews);
        if (this.newsData.length > 5) {
            this.newsData.pop();
        }
    }

    // ===== 애니메이션 =====
    updateProgressBars() {
        document.querySelectorAll('.progress-fill').forEach(bar => {
            const targetWidth = bar.dataset.progress + '%';
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 100);
        });
    }

    animateCounters() {
        document.querySelectorAll('.stat-value').forEach(element => {
            const finalValue = element.textContent;
            const isNumber = !isNaN(parseFloat(finalValue));
            
            if (isNumber) {
                const target = parseFloat(finalValue.replace(/[^0-9.-]/g, ''));
                this.animateValue(element, 0, target, 1000, finalValue.includes('%') ? '%' : '');
            }
        });
    }

    animateValue(element, start, end, duration, suffix = '') {
        const range = end - start;
        const startTime = performance.now();
        
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (range * this.easeOutCubic(progress));
            const displayValue = Math.round(current * 10) / 10;
            
            element.textContent = (displayValue > 0 && !suffix.includes('-') ? '+' : '') + displayValue + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        
        requestAnimationFrame(updateValue);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // ===== 유틸리티 메서드 =====
    showPerformanceAnalysis() {
        console.log('Opening performance analysis...');
        // 성과 분석 페이지로 이동 또는 모달 표시
    }

    showAchievementDetail(achievementId) {
        console.log(`Showing achievement detail: ${achievementId}`);
        // 업적 상세 정보 모달 표시
    }

    showAchievementProgress(achievementId) {
        console.log(`Showing achievement progress: ${achievementId}`);
        // 업적 진행 상황 모달 표시
    }

    showUserProfile(item) {
        console.log('Showing user profile...');
        // 사용자 프로필 모달 표시
    }

    showNewsDetail(newsItem) {
        console.log('Showing news detail...');
        // 뉴스 상세 내용 모달 표시
    }

    createNewSimulation() {
        console.log('Creating new simulation...');
        // 새 시뮬레이션 생성 로직
        
        // 임시로 성공 메시지 표시
        this.showNotification({
            type: 'success',
            message: { ko: '새 시뮬레이션이 생성되었습니다!', en: 'New simulation created successfully!' }
        });
    }

    showNotification({ type, message, duration = 3000 }) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = typeof message === 'object' ? message[this.currentLang] : message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
}

// ===== CSS 스타일 추가 (인라인) =====
const additionalStyles = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 1;
        transition: opacity 0.3s ease;
    }

    .modal-content {
        background: #131629;
        border: 1px solid #1e293b;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    }

    .modal-content.large {
        max-width: 800px;
    }

    .modal-header {
        padding: 20px 24px 16px;
        border-bottom: 1px solid #1e293b;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .modal-title {
        font-size: 18px;
        font-weight: 600;
        color: #e2e8f0;
        margin: 0;
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #64748b;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s ease;
    }

    .modal-close:hover {
        background: #1e293b;
        color: #e2e8f0;
    }

    .modal-body {
        padding: 20px 24px;
    }

    .modal-footer {
        padding: 16px 24px 20px;
        border-top: 1px solid #1e293b;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    }

    .form-section {
        margin-bottom: 16px;
    }

    .form-section label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #e2e8f0;
        margin-bottom: 6px;
    }

    .form-select {
        width: 100%;
        padding: 8px 12px;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 6px;
        color: #e2e8f0;
        font-size: 14px;
        transition: border-color 0.2s ease;
    }

    .form-select:focus {
        outline: none;
        border-color: #3b82f6;
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        font-weight: 500;
        font-size: 14px;
        z-index: 1001;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
    }

    .notification.show {
        transform: translateX(0);
        opacity: 1;
    }

    .notification.success {
        background: #10b981;
        color: white;
    }

    .notification.error {
        background: #ef4444;
        color: white;
    }

    .notification.info {
        background: #3b82f6;
        color: white;
    }

    .simulation-detail {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .detail-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }

    .detail-stat {
        text-align: center;
        padding: 16px;
        background: #1e293b;
        border-radius: 6px;
    }

    .detail-value {
        display: block;
        font-size: 20px;
        font-weight: 600;
        color: #e2e8f0;
        margin-bottom: 4px;
    }

    .detail-label {
        font-size: 12px;
        color: #64748b;
        text-transform: uppercase;
    }

    .detail-chart {
        background: #1e293b;
        border-radius: 6px;
        padding: 16px;
        text-align: center;
    }

    .detail-actions {
        display: flex;
        gap: 8px;
    }
`;

// 스타일 추가
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// 페이지 로드시 대시보드 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.simulationDashboard = new SimulationDashboard();
});