import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DiagnosticsTabs from '../components/admin/DiagnosticsTabs';
import ApiDebugPanel from '../components/admin/ApiDebugPanel';
import HealthPanel from '../components/admin/HealthPanel';
import DbStatusPanel from '../components/admin/DbStatusPanel';
import HttpStatusBadge from '../components/ui/HttpStatusBadge';
import Tooltip from '../components/ui/Tooltip';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
global.localStorage = localStorageMock;

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Admin Diagnostics Components', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorageMock.getItem.mockClear();
  });

  describe('DiagnosticsTabs', () => {
    it('should render all tabs', () => {
      renderWithRouter(<DiagnosticsTabs />);
      
      expect(screen.getByText('API-Debug')).toBeInTheDocument();
      expect(screen.getByText('System-Health')).toBeInTheDocument();
      expect(screen.getByText('DB-Schema')).toBeInTheDocument();
    });

    it('should switch between tabs', () => {
      renderWithRouter(<DiagnosticsTabs />);
      
      fireEvent.click(screen.getByText('System-Health'));
      expect(screen.getByText('System-Health-Status')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('DB-Schema'));
      expect(screen.getByText('Datenbank-Schema-Status')).toBeInTheDocument();
    });
  });

  describe('ApiDebugPanel', () => {
    it('should render preset checks', () => {
      renderWithRouter(<ApiDebugPanel />);
      
      expect(screen.getByText('Health Check')).toBeInTheDocument();
      expect(screen.getByText('DB Status')).toBeInTheDocument();
      expect(screen.getByText('Meine Daten')).toBeInTheDocument();
    });

    it('should select preset and populate form', () => {
      renderWithRouter(<ApiDebugPanel />);
      
      fireEvent.click(screen.getByText('Health Check'));
      
      expect(screen.getByDisplayValue('GET')).toBeInTheDocument();
      expect(screen.getByDisplayValue('/api/admin/health')).toBeInTheDocument();
    });

    it('should execute API debug request', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 200,
          ms: 150,
          headers: { 'content-type': 'application/json' },
          jsonTrunc: '{"status":"OK"}'
        })
      });

      renderWithRouter(<ApiDebugPanel />);
      
      fireEvent.click(screen.getByText('Health Check'));
      fireEvent.click(screen.getByText('Ausführen'));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/admin/api-debug', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          },
          body: JSON.stringify({
            method: 'GET',
            path: '/api/admin/health',
            headers: {},
            body: null
          })
        });
      });
    });
  });

  describe('HealthPanel', () => {
    it('should perform health check on mount', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          app: { ok: true, version: '2.1.0' },
          db: { ok: true, latencyMs: 25 },
          time: { server: '2024-12-19T10:00:00Z', tz: 'Europe/Berlin' },
          uptimeSec: 3600
        })
      });

      renderWithRouter(<HealthPanel />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/admin/health', {
          headers: {
            'Authorization': 'Bearer mock-token'
          }
        });
      });
    });

    it('should display health status', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          app: { ok: true, version: '2.1.0' },
          db: { ok: true, latencyMs: 25 },
          time: { server: '2024-12-19T10:00:00Z', tz: 'Europe/Berlin' },
          uptimeSec: 3600
        })
      });

      renderWithRouter(<HealthPanel />);

      await waitFor(() => {
        expect(screen.getByText('Anwendung')).toBeInTheDocument();
        expect(screen.getByText('Datenbank')).toBeInTheDocument();
        expect(screen.getByText('Version 2.1.0')).toBeInTheDocument();
      });
    });
  });

  describe('DbStatusPanel', () => {
    it('should perform DB status check on mount', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          pendingMigrations: [],
          drift: false,
          summary: 'Schema ist aktuell',
          existingTables: 10,
          expectedTables: 10
        })
      });

      renderWithRouter(<DbStatusPanel />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/admin/db/status', {
          headers: {
            'Authorization': 'Bearer mock-token'
          }
        });
      });
    });

    it('should display DB status', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          pendingMigrations: [],
          drift: false,
          summary: 'Schema ist aktuell',
          existingTables: 10,
          expectedTables: 10
        })
      });

      renderWithRouter(<DbStatusPanel />);

      await waitFor(() => {
        expect(screen.getByText('Schema-Konsistenz')).toBeInTheDocument();
        expect(screen.getByText('Schema ist aktuell')).toBeInTheDocument();
      });
    });
  });

  describe('HttpStatusBadge', () => {
    it('should render status badge with tooltip', () => {
      renderWithRouter(
        <HttpStatusBadge status={200} />
      );
      
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show tooltip on hover', async () => {
      renderWithRouter(
        <HttpStatusBadge status={404} />
      );
      
      const badge = screen.getByRole('button');
      fireEvent.mouseEnter(badge);

      await waitFor(() => {
        expect(screen.getByText('404 - Not Found')).toBeInTheDocument();
      });
    });
  });

  describe('Tooltip', () => {
    it('should show tooltip on hover', async () => {
      renderWithRouter(
        <Tooltip content="Test tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );
      
      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      renderWithRouter(
        <Tooltip content="Test tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );
      
      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);
      
      await waitFor(() => {
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(button);

      await waitFor(() => {
        expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
      });
    });

    it('should close tooltip on escape key', async () => {
      renderWithRouter(
        <Tooltip content="Test tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );
      
      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);
      
      await waitFor(() => {
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
      });

      fireEvent.keyDown(button, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
      });
    });
  });
});
