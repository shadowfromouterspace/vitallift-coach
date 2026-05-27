import { Amplify } from "aws-amplify";

export const authConfig = {
  region: import.meta.env.VITE_AWS_REGION,
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID
};

export const isAuthConfigured = Boolean(
  authConfig.region && authConfig.userPoolId && authConfig.userPoolClientId
);

if (isAuthConfigured) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: authConfig.userPoolId,
        userPoolClientId: authConfig.userPoolClientId
      }
    }
  });
}
