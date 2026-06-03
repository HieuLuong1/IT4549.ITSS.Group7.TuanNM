#!/bin/bash

# Test login
echo "🔍 Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mealmate.local",
    "password": "admin123"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "✅ Token: $TOKEN"

# Test family endpoint
echo ""
echo "🔍 Testing /api/v1/users/familys/current..."
FAMILY_RESPONSE=$(curl -s -X GET http://localhost:8080/api/v1/users/familys/current \
  -H "Authorization: Bearer $TOKEN")

echo "Family Response: $FAMILY_RESPONSE"
