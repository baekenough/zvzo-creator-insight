import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-12">
        <div className="text-center space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ZVZO Creator Insight</h3>
            <p className="text-sm text-gray-600">AI-powered creator sales analysis platform</p>
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zvzo-500 transition-colors inline-flex items-center space-x-1"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
            <span className="text-gray-400">|</span>
            <a href="/docs" className="hover:text-zvzo-500 transition-colors">
              Documentation
            </a>
            <span className="text-gray-400">|</span>
            <a href="/contact" className="hover:text-zvzo-500 transition-colors">
              Contact
            </a>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © 2026 ZVZO. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 mt-1">Powered by AI</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
