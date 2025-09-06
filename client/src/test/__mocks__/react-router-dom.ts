// Mock für react-router-dom
export const useNavigate = jest.fn();
export const useLocation = jest.fn();
export const useParams = jest.fn();
export const useSearchParams = jest.fn();
export const Link = ({ children, to, ...props }: any) => (
  <a href={to} {...props}>
    {children}
  </a>
);
export const NavLink = ({ children, to, ...props }: any) => (
  <a href={to} {...props}>
    {children}
  </a>
);
export const Outlet = () => <div data-testid="outlet" />;
export const Navigate = ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />;
