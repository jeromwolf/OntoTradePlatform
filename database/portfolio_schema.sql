-- Portfolio Management System Database Schema
-- OntoTradePlatform - Task 5.1

-- 1. 포트폴리오 테이블
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    initial_balance DECIMAL(15, 2) NOT NULL DEFAULT 1000000.00, -- 초기 자본금 (기본 100만원)
    current_balance DECIMAL(15, 2) NOT NULL DEFAULT 1000000.00, -- 현재 현금 잔고
    total_value DECIMAL(15, 2) NOT NULL DEFAULT 1000000.00, -- 총 포트폴리오 가치
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    risk_level VARCHAR(20) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    investment_goal TEXT,
    target_return DECIMAL(5, 2), -- 목표 수익률 (%)

    -- 메타데이터
    metadata JSONB DEFAULT '{}',

    -- 제약조건
    CONSTRAINT positive_balances CHECK (
        initial_balance > 0 AND
        current_balance >= 0 AND
        total_value >= 0
    )
);

-- 2. 포트폴리오 보유 종목 테이블 (Holdings)
CREATE TABLE portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL, -- 종목 코드 (예: AAPL, MSFT)
    quantity INTEGER NOT NULL DEFAULT 0, -- 보유 수량
    average_cost DECIMAL(10, 4) NOT NULL, -- 평균 매입가
    current_price DECIMAL(10, 4), -- 현재가 (실시간 업데이트)
    market_value DECIMAL(15, 2), -- 시장가치 (quantity * current_price)
    unrealized_pnl DECIMAL(15, 2), -- 미실현 손익
    realized_pnl DECIMAL(15, 2) DEFAULT 0, -- 실현 손익
    first_purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 제약조건
    CONSTRAINT positive_quantity CHECK (quantity >= 0),
    CONSTRAINT positive_prices CHECK (average_cost > 0),
    UNIQUE(portfolio_id, symbol)
);

-- 3. 거래 내역 테이블 (Transactions)
CREATE TABLE portfolio_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 4) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL, -- quantity * price + fees
    fees DECIMAL(10, 2) DEFAULT 0,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_id UUID, -- 연결된 주문 ID (향후 확장용)

    -- 메타데이터
    metadata JSONB DEFAULT '{}',

    -- 제약조건
    CONSTRAINT positive_values CHECK (
        quantity > 0 AND
        price > 0 AND
        total_amount > 0 AND
        fees >= 0
    )
);

-- 4. 포트폴리오 성과 히스토리 테이블
CREATE TABLE portfolio_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_value DECIMAL(15, 2) NOT NULL,
    cash_balance DECIMAL(15, 2) NOT NULL,
    invested_amount DECIMAL(15, 2) NOT NULL,
    daily_return DECIMAL(10, 6), -- 일일 수익률
    cumulative_return DECIMAL(10, 6), -- 누적 수익률
    benchmark_return DECIMAL(10, 6), -- 벤치마크 대비 수익률
    volatility DECIMAL(10, 6), -- 변동성
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(portfolio_id, date)
);

-- 5. 포트폴리오 설정 테이블
CREATE TABLE portfolio_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE UNIQUE,
    max_position_size DECIMAL(5, 2) DEFAULT 20.00, -- 최대 단일 종목 비중 (%)
    max_sector_exposure DECIMAL(5, 2) DEFAULT 30.00, -- 최대 섹터 노출 (%)
    stop_loss_threshold DECIMAL(5, 2) DEFAULT -10.00, -- 손절매 기준 (%)
    take_profit_threshold DECIMAL(5, 2) DEFAULT 20.00, -- 익절매 기준 (%)
    rebalancing_frequency VARCHAR(20) DEFAULT 'monthly', -- 리밸런싱 주기
    auto_rebalancing BOOLEAN DEFAULT FALSE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_alerts BOOLEAN DEFAULT TRUE,

    -- 제약조건
    CONSTRAINT valid_thresholds CHECK (
        max_position_size > 0 AND max_position_size <= 100 AND
        max_sector_exposure > 0 AND max_sector_exposure <= 100 AND
        stop_loss_threshold < 0 AND
        take_profit_threshold > 0
    )
);

-- 인덱스 생성
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_active ON portfolios(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_holdings_portfolio_id ON portfolio_holdings(portfolio_id);
CREATE INDEX idx_holdings_symbol ON portfolio_holdings(symbol);
CREATE INDEX idx_transactions_portfolio_id ON portfolio_transactions(portfolio_id);
CREATE INDEX idx_transactions_symbol ON portfolio_transactions(symbol);
CREATE INDEX idx_transactions_date ON portfolio_transactions(executed_at);
CREATE INDEX idx_performance_portfolio_date ON portfolio_performance(portfolio_id, date);
CREATE INDEX idx_performance_date ON portfolio_performance(date);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;

-- 포트폴리오 RLS 정책: 본인 포트폴리오만 접근 가능
CREATE POLICY "Users can only access their own portfolios" ON portfolios
    FOR ALL USING (auth.uid() = user_id);

-- 보유 종목 RLS 정책: 본인 포트폴리오의 보유종목만 접근 가능
CREATE POLICY "Users can only access holdings of their portfolios" ON portfolio_holdings
    FOR ALL USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

-- 거래 내역 RLS 정책: 본인 포트폴리오의 거래내역만 접근 가능
CREATE POLICY "Users can only access transactions of their portfolios" ON portfolio_transactions
    FOR ALL USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

-- 성과 히스토리 RLS 정책: 본인 포트폴리오의 성과만 접근 가능
CREATE POLICY "Users can only access performance of their portfolios" ON portfolio_performance
    FOR ALL USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

-- 설정 RLS 정책: 본인 포트폴리오 설정만 접근 가능
CREATE POLICY "Users can only access settings of their portfolios" ON portfolio_settings
    FOR ALL USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON portfolio_holdings
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
