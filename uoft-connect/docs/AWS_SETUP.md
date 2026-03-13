# AWS Setup Guide

This document contains all AWS CLI commands used to set up the UofT Connect infrastructure.

## Prerequisites

```bash
# Verify AWS CLI is configured
aws sts get-caller-identity

# Set region (if not already set)
export AWS_DEFAULT_REGION="us-west-2"
```

---

## 1. Amazon Cognito User Pool

Cognito handles user authentication with email domain restriction for UofT members only.

### 1.1 Create User Pool

```bash
# Create the user pool with email as username
aws cognito-idp create-user-pool \
  --pool-name "uoft-connect-users" \
  --username-attributes email \
  --auto-verified-attributes email \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": false
    }
  }' \
  --schema '[
    {
      "Name": "email",
      "Required": true,
      "Mutable": true
    },
    {
      "Name": "name",
      "Required": true,
      "Mutable": true
    }
  ]' \
  --account-recovery-setting '{
    "RecoveryMechanisms": [
      {
        "Priority": 1,
        "Name": "verified_email"
      }
    ]
  }'
```

**Created:** `UserPool.Id = us-west-2_I6KatsaHX`

### 1.2 Create App Client

```bash
# Replace USER_POOL_ID with the ID from step 1.1
aws cognito-idp create-user-pool-client \
  --user-pool-id USER_POOL_ID \
  --client-name "uoft-connect-web" \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_PASSWORD_AUTH \
  --supported-identity-providers COGNITO \
  --callback-urls '["http://localhost:3000/api/auth/callback/cognito","https://uoftconnect.app/api/auth/callback/cognito"]' \
  --logout-urls '["http://localhost:3000","https://uoftconnect.app"]' \
  --allowed-o-auth-flows code \
  --allowed-o-auth-scopes openid email profile \
  --allowed-o-auth-flows-user-pool-client
```

**Created:** `UserPoolClient.ClientId = 3if01l2n8nhhj2tl01ogsa7nlk`

### 1.3 Create Cognito Domain

```bash
# Replace USER_POOL_ID with your pool ID
# Choose a unique domain prefix
aws cognito-idp create-user-pool-domain \
  --user-pool-id USER_POOL_ID \
  --domain "uoft-connect-auth"
```

---

## 2. Lambda Trigger for Email Domain Validation

This Lambda function runs before user signup to ensure only `@utoronto.ca` and `@mail.utoronto.ca` emails can register.

### 2.1 Create IAM Role for Lambda

```bash
# Create the trust policy file
cat > /tmp/lambda-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create the IAM role
aws iam create-role \
  --role-name "uoft-connect-lambda-role" \
  --assume-role-policy-document file:///tmp/lambda-trust-policy.json

# Attach basic Lambda execution policy
aws iam attach-role-policy \
  --role-name "uoft-connect-lambda-role" \
  --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
```

**Save the `Role.Arn` from the output!**

### 2.2 Create Lambda Function Code

```bash
# Create the Lambda function code
cat > /tmp/presignup-trigger.js << 'EOF'
exports.handler = async (event) => {
  const email = event.request.userAttributes.email;
  
  // Check if email ends with allowed UofT domains
  const allowedDomains = ['@utoronto.ca', '@mail.utoronto.ca'];
  const isAllowed = allowedDomains.some(domain => 
    email.toLowerCase().endsWith(domain)
  );
  
  if (!isAllowed) {
    throw new Error('Registration is restricted to University of Toronto email addresses (@utoronto.ca or @mail.utoronto.ca)');
  }
  
  // Auto-confirm the user (since we trust UofT emails)
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  
  return event;
};
EOF

# Create zip file for Lambda deployment
cd /tmp && zip presignup-trigger.zip presignup-trigger.js
```

### 2.3 Deploy Lambda Function

```bash
# Wait a few seconds for IAM role to propagate, then create Lambda
# Replace ROLE_ARN with the ARN from step 2.1
aws lambda create-function \
  --function-name "uoft-connect-presignup" \
  --runtime "nodejs18.x" \
  --role ROLE_ARN \
  --handler "presignup-trigger.handler" \
  --zip-file "fileb:///tmp/presignup-trigger.zip" \
  --description "Validates UofT email domain on signup"
```

**Save the `FunctionArn` from the output!**

### 2.4 Grant Cognito Permission to Invoke Lambda

```bash
# Replace LAMBDA_ARN and USER_POOL_ID
aws lambda add-permission \
  --function-name "uoft-connect-presignup" \
  --statement-id "CognitoPreSignUp" \
  --action "lambda:InvokeFunction" \
  --principal "cognito-idp.amazonaws.com" \
  --source-arn "arn:aws:cognito-idp:us-west-2:ACCOUNT_ID:userpool/USER_POOL_ID"
```

### 2.5 Attach Lambda Trigger to Cognito

```bash
# Replace USER_POOL_ID and LAMBDA_ARN
aws cognito-idp update-user-pool \
  --user-pool-id USER_POOL_ID \
  --lambda-config '{
    "PreSignUp": "LAMBDA_ARN"
  }'
```

---

## 3. Verification

### Test the Setup

```bash
# Try to sign up with a non-UofT email (should fail)
aws cognito-idp sign-up \
  --client-id CLIENT_ID \
  --username "test@gmail.com" \
  --password "TestPass123" \
  --user-attributes Name=email,Value=test@gmail.com Name=name,Value="Test User"
# Expected: Error - Registration is restricted to University of Toronto email addresses

# Try to sign up with a UofT email (should succeed)
aws cognito-idp sign-up \
  --client-id CLIENT_ID \
  --username "test@mail.utoronto.ca" \
  --password "TestPass123" \
  --user-attributes Name=email,Value=test@mail.utoronto.ca Name=name,Value="Test User"
# Expected: Success with auto-confirmation
```

---

## Environment Variables

After setup, add these to your `.env.local`:

```bash
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-west-2_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_COGNITO_DOMAIN=uoft-connect-auth.auth.us-west-2.amazoncognito.com
```

---

## Resource Summary

| Resource | Name/ID | Purpose |
|----------|---------|---------|
| Cognito User Pool | `uoft-connect-users` | User authentication |
| Cognito App Client | `uoft-connect-web` | Web app OAuth client |
| Cognito Domain | `uoft-connect-auth` | Hosted UI domain |
| Lambda Function | `uoft-connect-presignup` | Email domain validation |
| IAM Role | `uoft-connect-lambda-role` | Lambda execution role |

---

## Cleanup (if needed)

```bash
# Delete in reverse order of creation
aws cognito-idp delete-user-pool-domain --user-pool-id USER_POOL_ID --domain uoft-connect-auth
aws cognito-idp delete-user-pool --user-pool-id USER_POOL_ID
aws lambda delete-function --function-name uoft-connect-presignup
aws iam detach-role-policy --role-name uoft-connect-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam delete-role --role-name uoft-connect-lambda-role
```
