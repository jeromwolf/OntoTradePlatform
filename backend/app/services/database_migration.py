"""
데이터베이스 마이그레이션 서비스
테이블 자동 생성 및 스키마 업데이트
"""

import logging
from typing import Dict, List, Any
from app.services.supabase_service import supabase_service

logger = logging.getLogger(__name__)

class DatabaseMigration:
    """데이터베이스 마이그레이션 관리 클래스"""
    
    def __init__(self):
        self.supabase = supabase_service.supabase
    
    async def create_stocks_table(self) -> Dict[str, Any]:
        """주식 마스터 테이블 생성"""
        try:
            sql = """
            -- 주식 마스터 데이터 테이블 생성
            CREATE TABLE IF NOT EXISTS stocks (
                symbol VARCHAR(20) PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                name_kr VARCHAR(200),  -- 한글명
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
            """
            
            response = self.supabase.rpc('execute_sql', {'sql': sql}).execute()
            
            if response.data:
                logger.info("Stocks table created successfully")
                return {"success": True, "message": "Stocks table created"}
            else:
                return {"success": False, "error": "Failed to create stocks table"}
                
        except Exception as e:
            logger.error(f"Error creating stocks table: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def create_indexes(self) -> Dict[str, Any]:
        """주식 테이블 인덱스 생성"""
        try:
            indexes_sql = """
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
            """
            
            response = self.supabase.rpc('execute_sql', {'sql': indexes_sql}).execute()
            
            if response.data is not None:
                logger.info("Indexes created successfully")
                return {"success": True, "message": "Indexes created"}
            else:
                return {"success": False, "error": "Failed to create indexes"}
                
        except Exception as e:
            logger.error(f"Error creating indexes: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def check_table_exists(self, table_name: str) -> bool:
        """테이블 존재 여부 확인"""
        try:
            sql = f"""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = '{table_name}'
            );
            """
            
            response = self.supabase.rpc('execute_sql', {'sql': sql}).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0].get('exists', False)
            return False
            
        except Exception as e:
            logger.error(f"Error checking table exists: {str(e)}")
            return False
    
    async def get_table_info(self, table_name: str) -> Dict[str, Any]:
        """테이블 정보 조회"""
        try:
            sql = f"""
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = '{table_name}'
            ORDER BY ordinal_position;
            """
            
            response = self.supabase.rpc('execute_sql', {'sql': sql}).execute()
            
            return {
                "success": True,
                "table_name": table_name,
                "columns": response.data if response.data else []
            }
            
        except Exception as e:
            logger.error(f"Error getting table info: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def run_full_migration(self) -> Dict[str, Any]:
        """전체 마이그레이션 실행"""
        try:
            results = []
            
            # 1. 주식 테이블 생성
            logger.info("Creating stocks table...")
            table_result = await self.create_stocks_table()
            results.append({"step": "create_stocks_table", "result": table_result})
            
            # 2. 인덱스 생성
            logger.info("Creating indexes...")
            index_result = await self.create_indexes()
            results.append({"step": "create_indexes", "result": index_result})
            
            # 3. 테이블 확인
            logger.info("Verifying table creation...")
            table_exists = await self.check_table_exists('stocks')
            results.append({"step": "verify_table", "result": {"exists": table_exists}})
            
            success_count = sum(1 for r in results if r["result"].get("success", False))
            
            return {
                "success": success_count >= 2,  # 최소 테이블 생성과 인덱스 생성 성공
                "results": results,
                "message": f"Migration completed: {success_count}/{len(results)} steps successful"
            }
            
        except Exception as e:
            logger.error(f"Error running full migration: {str(e)}")
            return {"success": False, "error": str(e)}

# 글로벌 인스턴스
db_migration = DatabaseMigration()
