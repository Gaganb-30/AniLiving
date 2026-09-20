import { Navigate } from 'react-router-dom';

/**
 * ForgotPasswordPage & ResetPasswordPage
 *
 * AniLiving uses passwordless Phone + OTP authentication.
 * Customers sign in directly with their mobile number and a verification code.
 */
const ForgotPasswordPage = () => {
  return <Navigate to="/login" replace />;
};

export const ResetPasswordPage = () => {
  return <Navigate to="/login" replace />;
};

export default ForgotPasswordPage;
