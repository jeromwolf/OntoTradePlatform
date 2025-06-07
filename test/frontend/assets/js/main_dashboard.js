// OntoTrade Main Dashboard JavaScript

// 언어 전환 함수
function switchLanguage(lang) {
    const elements = document.querySelectorAll('[data-ko][data-en]');
    const placeholderElements = document.querySelectorAll('[data-ko-placeholder][data-en-placeholder]');
    
    elements.forEach(element => {
        if (lang === 'ko') {
            element.textContent = element.getAttribute('data-ko');
        } else {
            element.textContent = element.getAttribute('data-en');
        }
    });
    
    placeholderElements.forEach(element => {
        if (lang === 'ko') {
            element.placeholder = element.getAttribute('data-ko-placeholder');
        } else {
            element.placeholder = element.getAttribute('data-en-placeholder');
        }
    });
    
    // 언어 버튼 상태 업데이트
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    
    // 언어 전환 버튼 이벤트
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });

    // 네비게이션 링크 클릭 이벤트
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.nav-link.active')?.classList.remove('active');
            this.classList.add('active');
            
            // 현재 언어 확인
            const currentLang = document.querySelector('.lang-btn.active').getAttribute('data-lang');
            
            // 페이지 제목 변경 (언어별)
            const linkText = this.textContent.trim();
            const panelTitle = document.querySelector('.panel-title');
            
            if (linkText.includes('포트폴리오') || linkText.includes('Portfolio')) {
                if (currentLang === 'ko') {
                    panelTitle.textContent = '💼 포트폴리오 관리';
                } else {
                    panelTitle.textContent = '💼 Portfolio Management';
                }
            } else if (linkText.includes('분석도구') || linkText.includes('Analytics')) {
                if (currentLang === 'ko') {
                    panelTitle.textContent = '📊 재무 분석 도구';
                } else {
                    panelTitle.textContent = '📊 Financial Analytics';
                }
            } else if (linkText.includes('리더보드') || linkText.includes('Leaderboard')) {
                if (currentLang === 'ko') {
                    panelTitle.textContent = '🏆 투자자 리더보드';
                } else {
                    panelTitle.textContent = '🏆 Trader Leaderboard';
                }
            } else if (linkText.includes('학습센터') || linkText.includes('Learn')) {
                if (currentLang === 'ko') {
                    panelTitle.textContent = '📚 투자 학습센터';
                } else {
                    panelTitle.textContent = '📚 Learning Center';
                }
            } else if (linkText.includes('설정') || linkText.includes('Settings')) {
                if (currentLang === 'ko') {
                    panelTitle.textContent = '⚙️ 계정 설정';
                } else {
                    panelTitle.textContent = '⚙️ Settings';
                }
            } else if (linkText.includes('대시보드') || linkText.includes('Dashboard')) {
                if (currentLang === 'ko') {
                    panelTitle.textContent = '애플 (AAPL) 분석';
                } else {
                    panelTitle.textContent = 'Apple Inc. (AAPL) Analysis';
                }
            }
        });
    });

    // 카테고리 아이템 클릭 이벤트
    document.querySelectorAll('.category-item:not(.disabled)').forEach(item => {
        item.addEventListener('click', function() {
            // 같은 섹션 내에서만 active 제거
            const section = this.closest('.category-section');
            section.querySelector('.category-item.active')?.classList.remove('active');
            this.classList.add('active');
        });
    });

    // 뷰 컨트롤 버튼 이벤트
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelector('.control-btn.active')?.classList.remove('active');
            this.classList.add('active');
        });
    });

    // 탭 이벤트
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelector('.tab.active')?.classList.remove('active');
            this.classList.add('active');
        });
    });

    // 회사 카드 클릭 이벤트
    document.querySelectorAll('.company-card').forEach(card => {
        card.addEventListener('click', function() {
            const companyName = this.querySelector('.company-name').textContent;
            const symbol = this.querySelector('.stock-symbol').textContent;
            const currentLang = document.querySelector('.lang-btn.active').getAttribute('data-lang');
            
            if (currentLang === 'ko') {
                document.querySelector('.panel-title').textContent = `${companyName} (${symbol}) 분석`;
            } else {
                document.querySelector('.panel-title').textContent = `${companyName} (${symbol}) Analysis`;
            }
        });
    });

    // 그래프 노드 클릭 이벤트
    document.querySelectorAll('.graph-node').forEach(node => {
        node.addEventListener('click', function() {
            // 클릭 시 살짝 확대 효과
            this.style.transform += ' scale(1.1)';
            setTimeout(() => {
                this.style.transform = this.style.transform.replace(' scale(1.1)', '');
            }, 200);
            
            // 연결선 하이라이트 효과
            document.querySelectorAll('.graph-connection').forEach(conn => {
                conn.style.background = '#3b82f6';
                setTimeout(() => {
                    conn.style.background = '#334155';
                }, 1000);
            });
        });
    });

    // 검색 기능 (기본적인 필터링)
    document.querySelector('.search-box').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        // 회사 카드 필터링
        document.querySelectorAll('.company-card').forEach(card => {
            const companyName = card.querySelector('.company-name').textContent.toLowerCase();
            const symbol = card.querySelector('.stock-symbol').textContent.toLowerCase();
            
            if (companyName.includes(searchTerm) || symbol.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = searchTerm === '' ? 'block' : 'none';
            }
        });
    });

    // 트레이딩 버튼 클릭 효과
    document.querySelector('.trade-button').addEventListener('click', function() {
        const currentLang = document.querySelector('.lang-btn.active').getAttribute('data-lang');
        
        this.style.background = '#1d4ed8';
        
        if (currentLang === 'ko') {
            this.textContent = '💹 처리중...';
            setTimeout(() => {
                this.style.background = '#3b82f6';
                this.textContent = '💹 거래하기';
            }, 1500);
        } else {
            this.textContent = '💹 Processing...';
            setTimeout(() => {
                this.style.background = '#3b82f6';
                this.textContent = '💹 Trade';
            }, 1500);
        }
    });

    // 뉴스 아이템 호버 효과
    document.querySelectorAll('.news-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.background = '#1e293b';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.background = '#0f172a';
        });
    });

    // 포트폴리오 아이템 호버 효과
    document.querySelectorAll('.portfolio-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.background = '#1e293b';
            this.style.borderRadius = '4px';
            this.style.padding = '10px 8px';
            this.style.margin = '0 -8px';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
            this.style.borderRadius = '0';
            this.style.padding = '10px 0';
            this.style.margin = '0';
        });
    });

    // 실시간 데이터 업데이트 시뮬레이션
    function updateRealTimeData() {
        // 주가 업데이트
        const priceElements = document.querySelectorAll('.price');
        priceElements.forEach(element => {
            const currentPrice = parseFloat(element.textContent.replace(', ''));
            const change = (Math.random() - 0.5) * 2; // -1 ~ +1 달러 변동
            const newPrice = Math.max(0, currentPrice + change);
            element.textContent = ' + newPrice.toFixed(2);
        });

        // 가격 변동률 업데이트
        const changeElements = document.querySelectorAll('.price-change');
        changeElements.forEach(element => {
            const isUp = Math.random() > 0.5;
            const changeValue = (Math.random() * 2).toFixed(1); // 0~2% 변동
            
            element.textContent = (isUp ? '+' : '-') + changeValue + '%';
            element.className = 'price-change ' + (isUp ? 'price-up' : 'price-down');
        });

        // 포트폴리오 값 업데이트
        const portfolioValue = document.querySelector('.portfolio-value');
        if (portfolioValue) {
            const currentValue = parseInt(portfolioValue.textContent.replace(/[₩,]/g, ''));
            const change = Math.floor((Math.random() - 0.5) * 10000);
            const newValue = currentValue + change;
            portfolioValue.textContent = '₩' + newValue.toLocaleString();
        }
    }

    // 5초마다 실시간 데이터 업데이트
    setInterval(updateRealTimeData, 5000);

    // 섹션 링크 클릭 이벤트
    document.querySelectorAll('.section-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const linkText = this.textContent;
            console.log('섹션 링크 클릭:', linkText);
            // 실제 구현 시 해당 페이지로 이동
        });
    });

    // 퀵 링크 클릭 이벤트
    document.querySelectorAll('.quick-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const linkText = this.textContent;
            console.log('퀵 링크 클릭:', linkText);
            // 실제 구현 시 해당 기능 실행
        });
    });

    // 배지 클릭 이벤트
    document.querySelectorAll('.badge').forEach(badge => {
        badge.addEventListener('click', function() {
            const badgeName = this.textContent;
            console.log('배지 클릭:', badgeName);
            // 배지 상세 정보 모달 표시
        });
    });

    // 뉴스 아이템 클릭 이벤트
    document.querySelectorAll('.news-item').forEach(item => {
        item.addEventListener('click', function() {
            const newsTitle = this.querySelector('.news-title').textContent;
            console.log('뉴스 클릭:', newsTitle);
            // 뉴스 상세 페이지 이동
        });
    });

    // 키보드 단축키
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    document.querySelector('.nav-link[data-ko*="대시보드"]').click();
                    break;
                case '2':
                    e.preventDefault();
                    document.querySelector('.nav-link[data-ko*="포트폴리오"]').click();
                    break;
                case '3':
                    e.preventDefault();
                    document.querySelector('.nav-link[data-ko*="분석도구"]').click();
                    break;
                case 'l':
                    e.preventDefault();
                    // 언어 토글
                    const currentLang = document.querySelector('.lang-btn.active').getAttribute('data-lang');
                    const newLang = currentLang === 'ko' ? 'en' : 'ko';
                    switchLanguage(newLang);
                    break;
                case 'f':
                    e.preventDefault();
                    document.querySelector('.search-box').focus();
                    break;
            }
        }
    });

    // 반응형 레이아웃 조정
    function adjustLayout() {
        const width = window.innerWidth;
        const mainContent = document.querySelector('.main-content');
        
        if (width < 1200) {
            mainContent.style.gridTemplateColumns = '1fr';
            mainContent.style.height = 'auto';
        } else if (width < 1400) {
            mainContent.style.gridTemplateColumns = '250px 1fr 300px';
        } else {
            mainContent.style.gridTemplateColumns = '280px 1fr 320px';
        }
    }

    // 윈도우 리사이즈 이벤트
    window.addEventListener('resize', adjustLayout);
    adjustLayout(); // 초기 실행

    // 스크롤 이벤트 (무한 스크롤 등에 활용)
    const panels = document.querySelectorAll('.sidebar, .main-panel, .right-panel');
    panels.forEach(panel => {
        panel.addEventListener('scroll', function() {
            // 스크롤 위치에 따른 추가 로직
            if (this.scrollTop + this.clientHeight >= this.scrollHeight - 10) {
                console.log('패널 끝에 도달:', this.className);
                // 추가 데이터 로드 등
            }
        });
    });

    // 툴팁 기능
    function addTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', function(e) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = this.getAttribute('data-tooltip');
                tooltip.style.cssText = `
                    position: absolute;
                    background: #1e293b;
                    color: #e2e8f0;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    white-space: nowrap;
                    z-index: 1000;
                    pointer-events: none;
                    border: 1px solid #334155;
                `;
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
            });
            
            element.addEventListener('mouseleave', function() {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        });
    }

    addTooltips();

    // 페이지 가시성 변경 감지 (탭 전환 시 실시간 업데이트 중지/재개)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            console.log('페이지가 백그라운드로 이동');
            // 실시간 업데이트 중지
        } else {
            console.log('페이지가 포그라운드로 복귀');
            // 실시간 업데이트 재개
        }
    });

    // 초기 로딩 완료 메시지
    console.log('OntoTrade 메인 대시보드 로딩 완료');
    
    // 개발 모드에서만 표시되는 디버그 정보
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('개발 모드에서 실행 중');
        console.log('키보드 단축키:');
        console.log('- Ctrl+1,2,3: 네비게이션');
        console.log('- Ctrl+L: 언어 전환');
        console.log('- Ctrl+F: 검색 포커스');
    }
});