#!/usr/bin/env bash
# Test S3 access from EC2 instance

set -euo pipefail

BUCKET="daitdaing-static-files"
TEST_FILE="/tmp/s3-test-$(date +%s).txt"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}S3 Access Test${NC}"
echo -e "${YELLOW}================================${NC}"
echo ""
echo "Bucket: $BUCKET"
echo "Testing from: $(hostname)"
echo ""

# Test 1: List bucket
echo "Test 1: List bucket (s3:ListBucket)"
if aws s3 ls "s3://$BUCKET/" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Can list bucket${NC}"
else
    echo -e "${RED}✗ Cannot list bucket${NC}"
    echo "Error: Missing s3:ListBucket permission"
    exit 1
fi

# Test 2: Upload file
echo ""
echo "Test 2: Upload file (s3:PutObject)"
echo "test-content-$(date)" > "$TEST_FILE"
TEST_KEY="test/access-test-$(date +%s).txt"

if aws s3 cp "$TEST_FILE" "s3://$BUCKET/$TEST_KEY" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Can upload files${NC}"
    echo "  Uploaded to: s3://$BUCKET/$TEST_KEY"
else
    echo -e "${RED}✗ Cannot upload files${NC}"
    echo "Error: Missing s3:PutObject permission"
    rm -f "$TEST_FILE"
    exit 1
fi

# Test 3: Download file
echo ""
echo "Test 3: Download file (s3:GetObject)"
DOWNLOAD_FILE="/tmp/s3-download-$(date +%s).txt"
if aws s3 cp "s3://$BUCKET/$TEST_KEY" "$DOWNLOAD_FILE" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Can download files${NC}"
    rm -f "$DOWNLOAD_FILE"
else
    echo -e "${RED}✗ Cannot download files${NC}"
    echo "Error: Missing s3:GetObject permission"
    rm -f "$TEST_FILE"
    exit 1
fi

# Test 4: Delete file
echo ""
echo "Test 4: Delete file (s3:DeleteObject)"
if aws s3 rm "s3://$BUCKET/$TEST_KEY" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Can delete files${NC}"
else
    echo -e "${RED}✗ Cannot delete files${NC}"
    echo "Error: Missing s3:DeleteObject permission"
    rm -f "$TEST_FILE"
    exit 1
fi

# Cleanup
rm -f "$TEST_FILE"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}All S3 Tests Passed!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "The EC2 instance has all required S3 permissions."
echo "Image upload should work correctly now."
echo ""
echo "Next step: Test image upload via the web application"

