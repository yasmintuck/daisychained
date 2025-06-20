import { useAuth0 } from "@auth0/auth0-react";

export default function Login() {
  const { loginWithRedirect, isAuthenticated, user, logout } = useAuth0();

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={() => loginWithRedirect()}>Log In</button>
      ) : (
        <>
          <p>Welcome, {user?.name}</p>
          <button onClick={() => logout({ returnTo: window.location.origin })}>
            Log Out
          </button>
        </>
      )}
    </div>
  );
}
