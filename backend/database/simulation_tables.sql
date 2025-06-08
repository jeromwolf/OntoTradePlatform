-- 시뮬레이션 데이터베이스 테이블 생성
-- OntoTradePlatform - Simulation Module

-- 1. 시뮬레이션 세션 테이블
CREATE TABLE IF NOT EXISTS simulation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_name VARCHAR(100) DEFAULT '기본 시뮬레이션',
    initial_cash DECIMAL(15,2) DEFAULT 100000000.00, -- 1억원 시작 자금
    current_cash DECIMAL(15,2) DEFAULT 100000000.00, -- 1억원 현재 현금
    total_value DECIMAL(15,2) DEFAULT 100000000.00, -- 1억원 총 자산
    total_pnl DECIMAL(15,2) DEFAULT 0.00,
    total_pnl_percent DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, session_name)
);

-- 2. 시뮬레이션 보유종목 테이블
CREATE TABLE IF NOT EXISTS simulation_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    company_name VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    avg_price DECIMAL(10,2) NOT NULL CHECK (avg_price > 0),
    current_price DECIMAL(10,2),
    market_value DECIMAL(15,2),
    unrealized_pnl DECIMAL(15,2) DEFAULT 0.00,
    unrealized_pnl_percent DECIMAL(5,2) DEFAULT 0.00,
    first_bought_date TIMESTAMP WITH TIME ZONE, -- 최초 매수일
    last_transaction_date TIMESTAMP WITH TIME ZONE, -- 마지막 거래일
    total_bought_quantity INTEGER DEFAULT 0, -- 총 매수 수량
    total_sold_quantity INTEGER DEFAULT 0, -- 총 매도 수량
    avg_buy_price DECIMAL(10,2), -- 평균 매수가
    realized_pnl DECIMAL(15,2) DEFAULT 0.00, -- 실현 손익 (매도시)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, symbol)
);

-- 3. 시뮬레이션 거래내역 테이블
CREATE TABLE IF NOT EXISTS simulation_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    company_name VARCHAR(100),
    transaction_type VARCHAR(4) NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    total_amount DECIMAL(15,2) NOT NULL,
    commission DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(15,2) NOT NULL,
    cash_before DECIMAL(15,2) NOT NULL,
    cash_after DECIMAL(15,2) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_user_id ON simulation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_created_at ON simulation_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_simulation_holdings_session_id ON simulation_holdings(session_id);
CREATE INDEX IF NOT EXISTS idx_simulation_holdings_symbol ON simulation_holdings(symbol);
CREATE INDEX IF NOT EXISTS idx_simulation_transactions_session_id ON simulation_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_simulation_transactions_symbol ON simulation_transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_simulation_transactions_executed_at ON simulation_transactions(executed_at);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE simulation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_transactions ENABLE ROW LEVEL SECURITY;

-- 사용자별 데이터 접근 정책
CREATE POLICY "Users can view their own simulation sessions" ON simulation_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own simulation sessions" ON simulation_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own simulation sessions" ON simulation_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own simulation sessions" ON simulation_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- 보유종목 정책
CREATE POLICY "Users can view their own simulation holdings" ON simulation_holdings
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM simulation_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own simulation holdings" ON simulation_holdings
    FOR ALL USING (
        session_id IN (
            SELECT id FROM simulation_sessions WHERE user_id = auth.uid()
        )
    );

-- 거래내역 정책
CREATE POLICY "Users can view their own simulation transactions" ON simulation_transactions
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM simulation_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own simulation transactions" ON simulation_transactions
    FOR INSERT WITH CHECK (
        session_id IN (
            SELECT id FROM simulation_sessions WHERE user_id = auth.uid()
        )
    );

-- 리더보드를 위한 공개 뷰 생성 (거래내역 기반으로 계산)
CREATE OR REPLACE VIEW simulation_leaderboard AS
SELECT 
    s.id as session_id,
    u.email as user_email,
    s.session_name,
    s.total_value,
    s.total_pnl,
    s.total_pnl_percent,
    s.created_at,
    s.updated_at,
    COUNT(h.id) as num_positions,
    COUNT(t.id) as num_transactions
FROM simulation_sessions s
LEFT JOIN auth.users u ON s.user_id = u.id
LEFT JOIN simulation_holdings h ON s.id = h.session_id AND h.quantity > 0
LEFT JOIN simulation_transactions t ON s.id = t.session_id
WHERE s.is_active = true
GROUP BY s.id, u.email, s.session_name, s.total_value, s.total_pnl, s.total_pnl_percent, s.created_at, s.updated_at
ORDER BY s.total_pnl_percent DESC, s.total_value DESC;

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_simulation_sessions_updated_at BEFORE UPDATE ON simulation_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simulation_holdings_updated_at BEFORE UPDATE ON simulation_holdings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 초기 데이터 삽입을 위한 함수
CREATE OR REPLACE FUNCTION create_default_simulation_session(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    new_session_id UUID;
BEGIN
    INSERT INTO simulation_sessions (user_id, session_name, initial_cash, current_cash, total_value)
    VALUES (user_uuid, '기본 시뮬레이션', 100000000.00, 100000000.00, 100000000.00)
    RETURNING id INTO new_session_id;
    
    RETURN new_session_id;
END;
$$ LANGUAGE plpgsql;

-- 회원가입시 자동으로 시뮬레이션 세션 생성하는 트리거 함수
CREATE OR REPLACE FUNCTION auto_create_simulation_session()
RETURNS TRIGGER AS $$
BEGIN
    -- 새 사용자가 생성되면 자동으로 기본 시뮬레이션 세션 생성
    INSERT INTO simulation_sessions (user_id, session_name, initial_cash, current_cash, total_value)
    VALUES (NEW.id, '기본 시뮬레이션', 100000000.00, 100000000.00, 100000000.00);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- auth.users 테이블에 트리거 설정 (Supabase에서 사용자 생성시 자동 실행)
-- 주의: 이 트리거는 Supabase 콘솔에서 수동으로 설정해야 할 수 있습니다
-- CREATE TRIGGER on_auth_user_created 
--     AFTER INSERT ON auth.users 
--     FOR EACH ROW EXECUTE FUNCTION auto_create_simulation_session();
