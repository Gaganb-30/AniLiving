import { Navigate, useSearchParams } from 'react-router-dom';

/**
 * RegisterPage
 *
 * AniLiving uses passwordless Phone + OTP authentication.
 * New accounts are automatically created upon verifying the mobile number.
 * Any traffic hitting /register is forwarded to /login.
 */
const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  return (
    <Navigate
      to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}
      replace
    />
  );
};

export default RegisterPage;
