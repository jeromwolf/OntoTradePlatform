-- OntoTradePlatform 테이블 생성 스크립트
-- Supabase PostgreSQL에서 실행

-- 1. 시뮬레이션 세션 테이블
CREATE TABLE IF NOT EXISTS simulation_sessions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    cash DECIMAL(15,2) NOT NULL DEFAULT 100000000,
    total_value DECIMAL(15,2) NOT NULL DEFAULT 100000000,
    total_pnl DECIMAL(15,2) DEFAULT 0,
    total_pnl_percent DECIMAL(8,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 시뮬레이션 보유종목 테이블
CREATE TABLE IF NOT EXISTS simulation_holdings (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    avg_price DECIMAL(10,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- 3. 시뮬레이션 거래내역 테이블
CREATE TABLE IF NOT EXISTS simulation_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('buy', 'sell')),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,4) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 사용자 관심종목 테이블
CREATE TABLE IF NOT EXISTS user_watchlists (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    market VARCHAR(50),
    type VARCHAR(20) DEFAULT 'Stock',
    region VARCHAR(10) DEFAULT 'US',
    currency VARCHAR(5) DEFAULT 'USD',
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- 5. 사용자 최근 조회 종목 테이블
CREATE TABLE IF NOT EXISTS user_recent_stocks (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    market VARCHAR(50),
    last_viewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, symbol)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_simulation_holdings_user_id ON simulation_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_transactions_user_id ON simulation_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_transactions_created_at ON simulation_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_watchlists_user_id ON user_watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recent_stocks_last_viewed ON user_recent_stocks(last_viewed DESC);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE simulation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recent_stocks ENABLE ROW LEVEL SECURITY;

-- 사용자 본인 데이터만 접근 가능하도록 정책 설정
CREATE POLICY "Users can view own simulation sessions" ON simulation_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own simulation holdings" ON simulation_holdings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own simulation transactions" ON simulation_transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own watchlists" ON user_watchlists
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recent stocks" ON user_recent_stocks
    FOR ALL USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 설정
CREATE TRIGGER update_simulation_sessions_updated_at 
    BEFORE UPDATE ON simulation_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simulation_holdings_updated_at 
    BEFORE UPDATE ON simulation_holdings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_watchlists_updated_at 
    BEFORE UPDATE ON user_watchlists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 댓글: 테이블 생성 완료!
-- 다음 단계: Supabase 대시보드에서 이 SQL을 실행하세요.
