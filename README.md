# VitalLift Coach

Premium nutritional coaching web app for weightlifting, exercise planning, food logging, and macronutrient tracking.

## What is included

- React + Vite frontend with a polished health-focused dashboard
- Macro target calculator based on body weight and goal
- Meal logging with protein, carbs, fats, and calories
- Weightlifting split view with weekly structure
- Coaching tips panel for next actions
- AWS Amplify hosting config
- AWS SAM template for Cognito user accounts, DynamoDB, API Gateway, and Lambda

## Local development

```bash
npm install
npm run dev
```

For local Cognito auth, create `.env.local` after deploying the backend:

```bash
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=<CognitoUserPoolId>
VITE_COGNITO_USER_POOL_CLIENT_ID=<CognitoUserPoolClientId>
```

## Build

```bash
npm run build
```

## AWS deployment path

1. Use AWS Amplify Hosting for the frontend.
2. Connect Amplify to this GitHub repository.
3. Amplify will use `amplify.yml` and publish the `dist` folder.
4. Deploy the backend with AWS SAM when you are ready for user accounts and cloud persistence:

```bash
cd infrastructure
sam build
sam deploy --guided
```

5. Copy the `CognitoUserPoolId` and `CognitoUserPoolClientId` outputs into Amplify environment variables:

```bash
VITE_AWS_REGION=<your-aws-region>
VITE_COGNITO_USER_POOL_ID=<CognitoUserPoolId>
VITE_COGNITO_USER_POOL_CLIENT_ID=<CognitoUserPoolClientId>
```

Recommended next AWS resources:

- Amazon Cognito for user login
- Amazon DynamoDB for meal logs, body metrics, and training sessions
- AWS Lambda for coaching APIs
- Amazon API Gateway HTTP API for backend endpoints
- AWS Amplify Hosting for CI/CD from GitHub

## Roadmap

- Persist meal entries per authenticated user
- Add exercise library and progressive overload history
- Connect an AI coach endpoint for personalized meal and training suggestions
- Add weekly reports for calories, macros, strength volume, and recovery
