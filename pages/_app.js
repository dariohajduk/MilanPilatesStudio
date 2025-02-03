import { LogoProvider } from '../src/contexts/LogoContext';
import { UserProvider } from '../src/contexts/UserContext';
import '../styles/index.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <LogoProvider>  
        <Component {...pageProps} />
      </LogoProvider>
    </UserProvider>
  );
}
