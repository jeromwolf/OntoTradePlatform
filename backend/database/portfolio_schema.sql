-- OntoTradePlatform 포트폴리오 데이터베이스 스키마
-- 생성일: 2025-01-08
-- 설명: 포트폴리오 관리를 위한 테이블 및 관련 정책 정의

-- 1. portfolios 테이블
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    strategy VARCHAR(100),
    risk_level INTEGER CHECK (risk_level >= 1 AND risk_level <= 10) DEFAULT 5,
    total_value DECIMAL(15,2) DEFAULT 0.00,
    available_cash DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. portfolio_holdings 테이블 (포트폴리오 보유 종목)
CREATE TABLE IF NOT EXISTS portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(15,6) NOT NULL DEFAULT 0,
    average_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    current_price DECIMAL(15,2) DEFAULT 0.00,
    total_value DECIMAL(15,2) DEFAULT 0.00,
    unrealized_pnl DECIMAL(15,2) DEFAULT 0.00,
    unrealized_pnl_percentage DECIMAL(8,4) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(portfolio_id, symbol)
);

-- 3. transactions 테이블 (거래 내역)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
    quantity DECIMAL(15,6) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0.00,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. portfolio_performance 테이블 (성과 데이터)
CREATE TABLE IF NOT EXISTS portfolio_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    cash_value DECIMAL(15,2) NOT NULL,
    holdings_value DECIMAL(15,2) NOT NULL,
    daily_return DECIMAL(8,4) DEFAULT 0.00,
    cumulative_return DECIMAL(8,4) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(portfolio_id, date)
);

-- 5. portfolio_settings 테이블 (포트폴리오 설정)
CREATE TABLE IF NOT EXISTS portfolio_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE UNIQUE,
    auto_rebalance BOOLEAN DEFAULT FALSE,
    stop_loss_percentage DECIMAL(5,2),
    take_profit_percentage DECIMAL(5,2),
    max_position_size_percentage DECIMAL(5,2) DEFAULT 20.00,
    preferred_order_type VARCHAR(20) DEFAULT 'market',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON portfolios(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio_id ON portfolio_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_symbol ON portfolio_holdings(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_id ON transactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_executed_at ON transactions(executed_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_performance_portfolio_id ON portfolio_performance(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_performance_date ON portfolio_performance(date);

-- RLS (Row Level Security) 정책 활성화
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성: 사용자는 자신의 포트폴리오만 접근 가능
CREATE POLICY IF NOT EXISTS "Users can view own portfolios" ON portfolios
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own portfolios" ON portfolios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own portfolios" ON portfolios
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own portfolios" ON portfolios
    FOR DELETE USING (auth.uid() = user_id);

-- portfolio_holdings RLS 정책
CREATE POLICY IF NOT EXISTS "Users can view own portfolio holdings" ON portfolio_holdings
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

CREATE POLICY IF NOT EXISTS "Users can insert own portfolio holdings" ON portfolio_holdings
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

CREATE POLICY IF NOT EXISTS "Users can update own portfolio holdings" ON portfolio_holdings
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

CREATE POLICY IF NOT EXISTS "Users can delete own portfolio holdings" ON portfolio_holdings
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

-- transactions RLS 정책
CREATE POLICY IF NOT EXISTS "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

CREATE POLICY IF NOT EXISTS "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

-- portfolio_performance RLS 정책
CREATE POLICY IF NOT EXISTS "Users can view own portfolio performance" ON portfolio_performance
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

CREATE POLICY IF NOT EXISTS "Users can insert own portfolio performance" ON portfolio_performance
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

-- portfolio_settings RLS 정책
CREATE POLICY IF NOT EXISTS "Users can view own portfolio settings" ON portfolio_settings
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

CREATE POLICY IF NOT EXISTS "Users can insert own portfolio settings" ON portfolio_settings
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

CREATE POLICY IF NOT EXISTS "Users can update own portfolio settings" ON portfolio_settings
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

-- 함수: 포트폴리오 업데이트 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거: portfolios와 portfolio_settings 테이블에 updated_at 자동 갱신 적용
CREATE TRIGGER IF NOT EXISTS update_portfolios_updated_at 
    BEFORE UPDATE ON portfolios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_portfolio_settings_updated_at 
    BEFORE UPDATE ON portfolio_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 함수: 포트폴리오 생성 시 기본 설정 자동 생성
CREATE OR REPLACE FUNCTION create_default_portfolio_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO portfolio_settings (portfolio_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거: 포트폴리오 생성 시 기본 설정 자동 생성
CREATE TRIGGER IF NOT EXISTS create_portfolio_settings_trigger
    AFTER INSERT ON portfolios
    FOR EACH ROW EXECUTE FUNCTION create_default_portfolio_settings();

-- 포트폴리오 보유량 업데이트 함수
CREATE OR REPLACE FUNCTION update_portfolio_holding(
    p_portfolio_id UUID,
    p_symbol VARCHAR,
    p_quantity_change DECIMAL,
    p_price DECIMAL
)
RETURNS VOID AS $$
DECLARE
    current_quantity DECIMAL := 0;
    current_avg_price DECIMAL := 0;
    new_quantity DECIMAL;
    new_avg_price DECIMAL;
BEGIN
    -- 현재 보유량 조회
    SELECT quantity, average_price INTO current_quantity, current_avg_price
    FROM portfolio_holdings
    WHERE portfolio_id = p_portfolio_id AND symbol = p_symbol;
    
    IF NOT FOUND THEN
        -- 새로운 종목인 경우
        IF p_quantity_change > 0 THEN
            INSERT INTO portfolio_holdings (portfolio_id, symbol, quantity, average_price, current_price)
            VALUES (p_portfolio_id, p_symbol, p_quantity_change, p_price, p_price);
        END IF;
    ELSE
        -- 기존 종목인 경우
        new_quantity := current_quantity + p_quantity_change;
        
        IF new_quantity = 0 THEN
            -- 보유량이 0이 되면 삭제
            DELETE FROM portfolio_holdings
            WHERE portfolio_id = p_portfolio_id AND symbol = p_symbol;
        ELSE
            -- 평균단가 계산 (매수인 경우에만)
            IF p_quantity_change > 0 THEN
                new_avg_price := (current_quantity * current_avg_price + p_quantity_change * p_price) / new_quantity;
            ELSE
                new_avg_price := current_avg_price; -- 매도시에는 평균단가 유지
            END IF;
            
            UPDATE portfolio_holdings
            SET quantity = new_quantity,
                average_price = new_avg_price,
                current_price = p_price,
                last_updated = NOW()
            WHERE portfolio_id = p_portfolio_id AND symbol = p_symbol;
        END IF;
    END IF;
END;
$$ language 'plpgsql';
