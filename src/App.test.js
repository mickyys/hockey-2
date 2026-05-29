import { render, screen } from '@testing-library/react';
import App from './App';
import { ConfigProvider } from './context/ConfigContext';

test('renders scoreboard config page', () => {
  render(
    <ConfigProvider>
      <App />
    </ConfigProvider>
  );
  expect(screen.getByText(/Configuración del Tablero/i)).toBeInTheDocument();
});
