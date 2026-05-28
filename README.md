# VitalLift Coach

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=fff)
![AWS Ready](https://img.shields.io/badge/AWS-Amplify%20%2B%20SAM-FF9900?logo=amazonaws&logoColor=fff)
![Status](https://img.shields.io/badge/status-active%20prototype-2E8B57)

**VitalLift Coach** is a premium nutritional coaching web app for people who lift, track meals, and want a clearer path between training effort and body-composition progress.

It combines weightlifting planning, meal logging, macronutrient targets, progress visuals, and an account-ready AWS architecture in one polished dashboard.

## Why it exists

Most fitness apps split the experience into too many places: one tool for workouts, another for food, another for progress. VitalLift Coach is designed as a focused command center for lifters who want to answer four questions quickly:

- What should I train next?
- Am I hitting my protein, carbs, fats, and calories?
- Is my week trending in the right direction?
- What should I adjust today?

## Product Highlights

| Area | What it does |
| --- | --- |
| Training | Shows a structured weightlifting split with active workout state and next-plan generation. |
| Nutrition | Tracks meals with protein, carbs, fats, and calories. |
| Macro Targets | Calculates daily targets from body weight and goal direction. |
| Progress | Displays meal and workout progress graphs in a dedicated section. |
| Coaching | Surfaces practical tips for recovery, nutrition, and training focus. |
| Accounts | Supports local demo accounts now and real Cognito auth when AWS env vars are configured. |

## Architecture

VitalLift Coach is designed as a Vite frontend hosted by AWS Amplify, with Cognito for accounts and a serverless backend path through API Gateway, Lambda, and DynamoDB.

Read the full architecture documentation and diagrams here:

[docs/architecture.md](docs/architecture.md)

## Current Features

- Premium React + Vite dashboard interface
- Healthy visual direction with fitness-focused icons and polished UI states
- Meal creation and macro progress tracking
- Weightlifting plan controls and active workout feedback
- Progress section with calorie trend and workout volume charts
- Local demo sign-up/sign-in flow using browser storage
- AWS Cognito-ready authentication flow
- AWS SAM template for Cognito, DynamoDB, API Gateway, and Lambda
- AWS Amplify Hosting config for frontend CI/CD from GitHub

## Local Development

```bash
npm install
npm run dev
```

Open the Vite URL, usually:

```text
http://localhost:5173/
```

Build the production bundle:

```bash
npm run build
```

## Account Mode

VitalLift Coach works in two modes:

| Mode | Behavior |
| --- | --- |
| Local demo | Works immediately on your laptop. Accounts are stored in browser `localStorage`. |
| AWS Cognito | Used automatically when Cognito environment variables are present. |

After deploying the backend, create `.env.local`:

```bash
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=<CognitoUserPoolId>
VITE_COGNITO_USER_POOL_CLIENT_ID=<CognitoUserPoolClientId>
```

Restart the dev server after creating or changing `.env.local`.

## AWS Deployment Path

### Frontend hosting

1. Open AWS Amplify Hosting.
2. Connect this GitHub repository.
3. Use the included `amplify.yml` build configuration.
4. Amplify will install dependencies, build the Vite app, and publish `dist`.

### Backend resources

Deploy the serverless backend with AWS SAM:

```bash
cd infrastructure
sam build
sam deploy --guided
```

The SAM template includes:

- Amazon Cognito User Pool for user registration and sign-in
- Cognito User Pool Client for the web app
- Amazon DynamoDB table for nutrition data
- AWS Lambda function placeholder for coaching APIs
- Amazon API Gateway HTTP API

Copy the deployment outputs into Amplify environment variables:

```bash
VITE_AWS_REGION=<your-aws-region>
VITE_COGNITO_USER_POOL_ID=<CognitoUserPoolId>
VITE_COGNITO_USER_POOL_CLIENT_ID=<CognitoUserPoolClientId>
```

## Recommended Next Steps

- Persist meal entries per authenticated user in DynamoDB
- Store workout sessions and progressive overload history
- Add editable exercise library and movement categories
- Add weekly reports for calories, macros, strength volume, and recovery
- Connect a coaching API for personalized training and nutrition suggestions
- Add screenshots or product demo GIFs once the UI direction stabilizes

## Project Structure

```text
.
├── amplify.yml
├── backend/
│   └── lambda/
├── docs/
│   └── architecture.md
├── infrastructure/
│   └── template.yaml
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
└── package.json
```

## Important Note

This is an active prototype. The interface and local workflows are usable now, while cloud persistence and production-grade account management depend on deploying and configuring the AWS resources above.
