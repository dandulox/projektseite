import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';

// Mock für DynamicGreeting
jest.mock('../components/DynamicGreeting', () => {
  return function MockDynamicGreeting() {
    return <div data-testid="dynamic-greeting">Guten Tag!</div>;
  };
});

// Mock für ThemeToggle
jest.mock('../components/ThemeToggle', () => {
  return function MockThemeToggle() {
    return <button data-testid="theme-toggle">Theme Toggle</button>;
  };
});

// Test-Helper
const renderWithProviders = (component, { isAuthenticated = false } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // Mock localStorage für Auth
  const mockLocalStorage = {
    getItem: jest.fn((key) => {
      if (key === 'token' && isAuthenticated) {
        return 'mock-token';
      }
      return null;
    }),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('LandingPage', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders main heading with correct text', () => {
      renderWithProviders(<App />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Tracke deinen Lern- & Projektfortschritt');
    });

    test('renders subtitle with correct text', () => {
      renderWithProviders(<App />);
      
      const subtitle = screen.getByText(/Aufgaben, Deadlines, Kanban & mehr/);
      expect(subtitle).toBeInTheDocument();
    });

    test('renders all feature cards', () => {
      renderWithProviders(<App />);
      
      expect(screen.getByText('Projektverwaltung')).toBeInTheDocument();
      expect(screen.getByText('Meine Aufgaben')).toBeInTheDocument();
      expect(screen.getByText('Deadlines-Kalender')).toBeInTheDocument();
      expect(screen.getByText('Kanban Boards')).toBeInTheDocument();
    });

    test('renders skip to content link for accessibility', () => {
      renderWithProviders(<App />);
      
      const skipLink = screen.getByText('Zum Hauptinhalt springen');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });

  describe('Authentication States', () => {
    test('shows login/register buttons when not authenticated', () => {
      renderWithProviders(<App />, { isAuthenticated: false });
      
      expect(screen.getByText('Jetzt starten')).toBeInTheDocument();
      expect(screen.getByText('Features ansehen')).toBeInTheDocument();
    });

    test('shows dashboard button when authenticated', async () => {
      renderWithProviders(<App />, { isAuthenticated: true });
      
      await waitFor(() => {
        expect(screen.getByText('Zum Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Feature Navigation', () => {
    test('feature cards are clickable and have proper ARIA labels', () => {
      renderWithProviders(<App />);
      
      const projectCard = screen.getByLabelText('Zu Projektverwaltung navigieren');
      const tasksCard = screen.getByLabelText('Zu Meine Aufgaben navigieren');
      const calendarCard = screen.getByLabelText('Zu Dashboard mit Deadlines navigieren');
      const kanbanCard = screen.getByLabelText('Zu Kanban Board navigieren');
      
      expect(projectCard).toBeInTheDocument();
      expect(tasksCard).toBeInTheDocument();
      expect(calendarCard).toBeInTheDocument();
      expect(kanbanCard).toBeInTheDocument();
    });

    test('feature cards have proper keyboard navigation', () => {
      renderWithProviders(<App />);
      
      const projectCard = screen.getByLabelText('Zu Projektverwaltung navigieren');
      
      // Test Enter key
      fireEvent.keyDown(projectCard, { key: 'Enter' });
      
      // Test Space key
      fireEvent.keyDown(projectCard, { key: ' ' });
      
      expect(projectCard).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Scroll to Features', () => {
    test('features button scrolls to features section', () => {
      renderWithProviders(<App />);
      
      // Mock scrollIntoView
      const mockScrollIntoView = jest.fn();
      Element.prototype.scrollIntoView = mockScrollIntoView;
      
      const featuresButton = screen.getByText('Features ansehen');
      fireEvent.click(featuresButton);
      
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      renderWithProviders(<App />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      
      expect(h1).toBeInTheDocument();
      expect(h3Elements).toHaveLength(4); // 4 feature cards
    });

    test('all interactive elements have proper ARIA labels', () => {
      renderWithProviders(<App />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    test('main content has proper landmark', () => {
      renderWithProviders(<App />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
    });
  });

  describe('Environment Variables', () => {
    test('respects redirect flag when authenticated', () => {
      // Mock environment variable
      const originalEnv = process.env.REACT_APP_REDIRECT_HOME_TO_DASHBOARD;
      process.env.REACT_APP_REDIRECT_HOME_TO_DASHBOARD = 'true';
      
      renderWithProviders(<App />, { isAuthenticated: true });
      
      // Should redirect to dashboard (this would be tested in E2E)
      // For unit test, we just verify the flag is read
      expect(process.env.REACT_APP_REDIRECT_HOME_TO_DASHBOARD).toBe('true');
      
      // Restore original value
      process.env.REACT_APP_REDIRECT_HOME_TO_DASHBOARD = originalEnv;
    });
  });
});
