-- 주식 마스터 데이터 테이블 (신규 생성)
CREATE TABLE IF NOT EXISTS stocks (
    symbol VARCHAR(20) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    name_kr VARCHAR(200),  -- 한글명 (예: "Tesla Inc. (테슬라)")
    market VARCHAR(50) NOT NULL DEFAULT 'NASDAQ',
    price DECIMAL(10,4) NOT NULL,
    open_price DECIMAL(10,4),
    high_price DECIMAL(10,4),
    low_price DECIMAL(10,4),
    previous_close DECIMAL(10,4),
    change_amount DECIMAL(10,4),
    change_percent DECIMAL(8,4),
    volume BIGINT,
    market_cap BIGINT,
    currency VARCHAR(5) DEFAULT 'USD',
    sector VARCHAR(100),
    industry VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 주식 검색을 위한 인덱스 (한글 검색 지원)
CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_stocks_name_lower ON stocks(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_stocks_name_kr_lower ON stocks(LOWER(name_kr));
CREATE INDEX IF NOT EXISTS idx_stocks_active ON stocks(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_stocks_market ON stocks(market);
CREATE INDEX IF NOT EXISTS idx_stocks_price ON stocks(price);

-- 추가 검색 성능 인덱스
CREATE INDEX IF NOT EXISTS idx_stocks_name_text ON stocks USING gin(to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_stocks_name_kr_text ON stocks USING gin(to_tsvector('simple', name_kr));

-- 샘플 데이터 삽입
INSERT INTO stocks (symbol, name, name_kr, market, price, change_amount, change_percent, volume, market_cap, sector, is_active) VALUES
('AAPL', 'Apple Inc.', 'Apple Inc. (애플)', 'NASDAQ', 175.45, 2.35, 1.36, 89542000, 2750000000000, 'Technology', true),
('MSFT', 'Microsoft Corporation', 'Microsoft Corporation (마이크로소프트)', 'NASDAQ', 378.85, -1.25, -0.33, 42563000, 2820000000000, 'Technology', true),
('GOOGL', 'Alphabet Inc.', 'Alphabet Inc. (구글)', 'NASDAQ', 2756.32, 15.67, 0.57, 28934000, 1780000000000, 'Technology', true),
('TSLA', 'Tesla Inc.', 'Tesla Inc. (테슬라)', 'NASDAQ', 248.50, -3.45, -1.37, 125847000, 790000000000, 'Automotive', true),
('AMZN', 'Amazon.com Inc.', 'Amazon.com Inc. (아마존)', 'NASDAQ', 144.25, 0.85, 0.59, 35672000, 1490000000000, 'E-commerce', true),
('NVDA', 'NVIDIA Corporation', 'NVIDIA Corporation (엔비디아)', 'NASDAQ', 418.75, 8.92, 2.18, 67234000, 1030000000000, 'Technology', true),
('META', 'Meta Platforms Inc.', 'Meta Platforms Inc. (메타)', 'NASDAQ', 298.67, -2.14, -0.71, 41285000, 765000000000, 'Technology', true),
('NFLX', 'Netflix Inc.', 'Netflix Inc. (넷플릭스)', 'NASDAQ', 385.12, 4.67, 1.23, 12847000, 171000000000, 'Media', true),
('CRM', 'Salesforce Inc.', 'Salesforce Inc. (세일즈포스)', 'NYSE', 215.43, -1.78, -0.82, 8924000, 212000000000, 'Software', true),
('ORCL', 'Oracle Corporation', 'Oracle Corporation (오라클)', 'NYSE', 118.95, 0.45, 0.38, 25647000, 328000000000, 'Software', true)
ON CONFLICT (symbol) DO UPDATE SET
    name = EXCLUDED.name,
    name_kr = EXCLUDED.name_kr,
    market = EXCLUDED.market,
    price = EXCLUDED.price,
    change_amount = EXCLUDED.change_amount,
    change_percent = EXCLUDED.change_percent,
    volume = EXCLUDED.volume,
    market_cap = EXCLUDED.market_cap,
    sector = EXCLUDED.sector,
    is_active = EXCLUDED.is_active,
    last_updated = NOW();

-- 테이블 생성 완료 확인
SELECT 'stocks 테이블 생성 완료!' as message;
SELECT COUNT(*) as total_stocks FROM stocks WHERE is_active = true;
