#!/bin/bash
# ============================================
# OpenAPI 문서 수동 업데이트 스크립트
# ============================================
# 사용법: ./update-openapi-docs.sh

set -e

echo "📚 OpenAPI 문서 생성 중..."

# 백엔드 디렉토리로 이동
cd /home/ubuntu/itdaing

# Gradle로 OpenAPI 문서 생성
./gradlew generateOpenApiDocs

# 생성된 문서 확인
if [ -f "/home/ubuntu/itdaing/docs/openapi.json" ]; then
    echo "✅ OpenAPI 문서 생성 완료: itdaing/docs/openapi.json"
    
    # 프론트엔드로 복사
    cp /home/ubuntu/itdaing/docs/openapi.json /home/ubuntu/itdaing-web/openapi.json
    echo "✅ 프론트엔드에 복사 완료: itdaing-web/openapi.json"
    
    echo ""
    echo "✨ OpenAPI 문서 업데이트 완료!"
    echo ""
    echo "📌 다음 단계:"
    echo "  1. 루트로 이동: cd /home/ubuntu"
    echo "  2. Git에 커밋: git add itdaing/docs/openapi.json itdaing-web/openapi.json"
    echo "  3. 커밋: git commit -m '📚 Update OpenAPI documentation'"
    echo "  4. Push: git push origin main"
    echo "  5. GitHub Pages 자동 배포됨"
    echo "  6. 문서 확인: https://da-itdaing.github.io/sub-repo/"
else
    echo "❌ OpenAPI 문서 생성 실패"
    exit 1
fi

