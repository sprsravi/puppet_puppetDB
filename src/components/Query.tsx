import React, { useState } from 'react';
import { Play, Code, AlertCircle, CheckCircle } from 'lucide-react';
import { puppetDB } from '../services/puppetdb';

export const Query: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const exampleQueries = [
    {
      title: 'All nodes',
      query: '["=", "certname", "~", ".*"]',
      description: 'Get all nodes in the infrastructure',
    },
    {
      title: 'Failed nodes',
      query: '["=", "latest_report_status", "failed"]',
      description: 'Find nodes with failed status',
    },
    {
      title: 'Nodes in production',
      query: '["=", "catalog_environment", "production"]',
      description: 'Get all nodes in production environment',
    },
    {
      title: 'Active nodes',
      query: '["and", ["null?", "deactivated", true], ["null?", "expired", true]]',
      description: 'Find all active (not deactivated or expired) nodes',
    },
  ];

  const executeQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const data = await puppetDB.executeQuery(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (exampleQuery: string) => {
    setQuery(exampleQuery);
    setError('');
    setResults(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">PuppetDB Query</h1>
        <p className="text-slate-600 mt-1">Execute custom PuppetDB queries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
              <Code className="w-4 h-4 mr-2" />
              Example Queries
            </h3>
            <div className="space-y-3">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => loadExample(example.query)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all group"
                >
                  <div className="font-medium text-slate-800 text-sm mb-1 group-hover:text-orange-600">
                    {example.title}
                  </div>
                  <div className="text-xs text-slate-500">{example.description}</div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="text-xs font-semibold text-slate-700 mb-2">Query Syntax</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <p>Queries use JSON array format:</p>
                <code className="block bg-slate-100 p-2 rounded mt-2">
                  ["operator", "field", "value"]
                </code>
                <p className="mt-2">Common operators:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>=, !=, ~, !~</li>
                  <li>&gt;, &gt;=, &lt;, &lt;=</li>
                  <li>and, or, not</li>
                  <li>null?, in, extract</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Query Input
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Enter PuppetDB query, e.g., ["=", "certname", "~", ".*"]'
              rows={8}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
            />

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={executeQuery}
              disabled={loading}
              className="mt-4 flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Execute Query</span>
                </>
              )}
            </button>
          </div>

          {results && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-slate-800">Query Results</h3>
                </div>
                <span className="text-sm text-slate-600">
                  {Array.isArray(results) ? `${results.length} results` : 'Result'}
                </span>
              </div>
              <div className="p-6">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {!results && !error && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Code className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No Results Yet
              </h3>
              <p className="text-slate-600">
                Enter a query and click Execute to see results
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">PuppetDB Query Documentation</h4>
            <p className="text-sm text-blue-800">
              For complete query syntax and examples, refer to the{' '}
              <a
                href="https://puppet.com/docs/puppetdb/latest/api/query/v4/query.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-900"
              >
                official PuppetDB query documentation
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
