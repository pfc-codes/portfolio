// ============================================================================
// ROUTER — Minimal SPA Router using History API
// ============================================================================

export type RouteHandler = () => Promise<string> | string;

interface Route {
  path: string;
  handler: RouteHandler;
}

class Router {
  private routes: Route[] = [];
  private currentPath: string = '/';
  private appContainer: HTMLElement | null = null;
  private onRouteChange: ((path: string) => void) | null = null;

  constructor() {
    window.addEventListener('popstate', () => this.handleRoute());
  }

  init(container: HTMLElement, callback?: (path: string) => void): void {
    this.appContainer = container;
    this.onRouteChange = callback || null;

    // Handle all link clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[data-link]');

      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          this.navigate(href);
        }
      }
    });

    // Initial route
    this.handleRoute();
  }

  addRoute(path: string, handler: RouteHandler): void {
    this.routes.push({ path, handler });
  }

  navigate(path: string): void {
    if (path === this.currentPath) return;

    history.pushState(null, '', path);
    this.handleRoute();
  }

  private async handleRoute(): Promise<void> {
    const path = window.location.pathname;
    this.currentPath = path;

    // Find matching route
    let route = this.routes.find(r => r.path === path);

    // Handle work deep links like /work?project=p03
    if (!route && path.startsWith('/work')) {
      route = this.routes.find(r => r.path === '/work');
    }

    // Default to home if no match
    if (!route) {
      route = this.routes.find(r => r.path === '/');
    }

    if (!route || !this.appContainer) return;

    // Notify about route change
    if (this.onRouteChange) {
      this.onRouteChange(path);
    }

    // Fade out current content
    const currentContent = this.appContainer.querySelector('.route-content');
    if (currentContent) {
      currentContent.classList.remove('visible');
      await this.wait(220);
    }

    // Get new content
    const html = await route.handler();

    // Update container
    this.appContainer.innerHTML = `<div class="route-content">${html}</div>`;

    // Fade in new content
    requestAnimationFrame(() => {
      const newContent = this.appContainer?.querySelector('.route-content');
      if (newContent) {
        newContent.classList.add('visible');
      }
    });

    // Scroll to top
    window.scrollTo(0, 0);

    // Update nav active states
    this.updateNavActiveStates(path);
  }

  private updateNavActiveStates(path: string): void {
    const navLinks = document.querySelectorAll('.nav-link[data-nav]');
    navLinks.forEach(link => {
      const navKey = link.getAttribute('data-nav');
      let isActive = false;

      if (navKey === 'home' && path === '/') {
        isActive = true;
      } else if (navKey && path.startsWith(`/${navKey}`)) {
        isActive = true;
      }

      link.classList.toggle('active', isActive);
    });
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCurrentPath(): string {
    return this.currentPath;
  }
}

export const router = new Router();
