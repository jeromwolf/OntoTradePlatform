-- SQL 실행을 위한 RPC 함수
-- Supabase Dashboard > SQL Editor에서 실행해야 함

CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE sql_query;
    RETURN 'Success';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
END;
$$;
