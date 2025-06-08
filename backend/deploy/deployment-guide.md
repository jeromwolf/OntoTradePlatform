# 🚀 OntoTradePlatform 배포 가이드

## 환경변수 관리 전략

### 1. **Vercel 배포 (프론트엔드)**
```bash
# Vercel CLI로 환경변수 설정
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# 또는 Vercel 대시보드에서 설정
# Project Settings > Environment Variables
```

### 2. **Railway/Render 배포 (백엔드)**
```bash
# Railway
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_SERVICE_KEY=your_service_key

# Render
# Dashboard > Environment > Environment Variables 추가
```

### 3. **AWS/GCP 배포**
```bash
# AWS ECS/Fargate
aws ecs update-service --service your-service \
  --task-definition your-task-def:latest

# GCP Cloud Run
gcloud run deploy ontotrade-api \
  --set-env-vars SUPABASE_URL=https://your-project.supabase.co
```

### 4. **Docker 배포**
```yaml
# docker-compose.production.yml
version: '3.8'
services:
  backend:
    build: .
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
    env_file:
      - production.env
```

## 보안 체크리스트

### ✅ **환경변수 보안**
- [ ] `.env` 파일을 `.gitignore`에 추가
- [ ] 프로덕션용 강력한 `SECRET_KEY` 생성
- [ ] Supabase RLS (Row Level Security) 정책 확인
- [ ] API 키 로테이션 계획 수립

### ✅ **Supabase 프로덕션 설정**
- [ ] 프로덕션 Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 마이그레이션
- [ ] RLS 정책 적용
- [ ] 백업 설정

### ✅ **모니터링 및 로깅**
- [ ] Sentry 에러 트래킹 설정
- [ ] 로그 레벨을 INFO/WARNING으로 설정
- [ ] 성능 모니터링 도구 연동

## 배포 시나리오별 가이드

### **시나리오 1: Vercel + Railway**
1. **프론트엔드**: Vercel에 배포
2. **백엔드**: Railway에 배포
3. **데이터베이스**: Supabase 클라우드

### **시나리오 2: Netlify + Render**
1. **프론트엔드**: Netlify에 배포
2. **백엔드**: Render에 배포
3. **데이터베이스**: Supabase 클라우드

### **시나리오 3: 완전 자체 호스팅**
1. **모든 서비스**: AWS/GCP/Azure
2. **데이터베이스**: PostgreSQL (RDS/Cloud SQL)
3. **인증**: Supabase Self-hosted 또는 AWS Cognito

## 환경변수 템플릿

개발/스테이징/프로덕션 환경별로 다른 값을 사용하세요:

```bash
# 개발환경
SUPABASE_URL=https://dev-project.supabase.co
DEBUG=true

# 스테이징환경
SUPABASE_URL=https://staging-project.supabase.co
DEBUG=false

# 프로덕션환경
SUPABASE_URL=https://prod-project.supabase.co
DEBUG=false
```
