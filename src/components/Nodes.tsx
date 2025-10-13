import React, { useState, useEffect } from 'react';
import { Server, Search, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { puppetDB, PuppetNode } from '../services/puppetdb';

export const Nodes: React.FC = () => {
  const [nodes, setNodes] = useState<PuppetNode[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<PuppetNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNode, setSelectedNode] = useState<PuppetNode | null>(null);

  useEffect(() => {
    loadNodes();
  }, []);

  useEffect(() => {
    filterNodes();
  }, [searchTerm, statusFilter, nodes]);

  const loadNodes = async () => {
    setLoading(true);
    try {
      const data = await puppetDB.getNodes();
      setNodes(data);
      setFilteredNodes(data);
    } catch (error) {
      console.error('Failed to load nodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNodes = () => {
    let filtered = nodes;

    if (searchTerm) {
      filtered = filtered.filter((node) =>
        node.certname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.catalog_environment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((node) => node.latest_report_status === statusFilter);
    }

    setFilteredNodes(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unchanged':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Unchanged
          </span>
        );
      case 'changed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <RefreshCw className="w-3 h-3 mr-1" />
            Changed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unknown
          </span>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Nodes</h1>
          <p className="text-slate-600 mt-1">Manage and monitor your infrastructure nodes</p>
        </div>
        <button
          onClick={loadNodes}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="unchanged">Unchanged</option>
              <option value="changed">Changed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Node Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Environment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Last Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredNodes.map((node) => (
                <tr key={node.certname} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Server className="w-5 h-5 text-slate-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">{node.certname}</div>
                        {node.deactivated && (
                          <div className="text-xs text-red-500">Deactivated</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{node.catalog_environment}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(node.latest_report_status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {node.report_timestamp ? formatTimestamp(node.report_timestamp) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedNode(node)}
                      className="text-orange-600 hover:text-orange-800 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredNodes.length === 0 && (
          <div className="text-center py-12">
            <Server className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No nodes found</p>
          </div>
        )}
      </div>

      {selectedNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-800">Node Details</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Certname</label>
                <p className="text-slate-900 mt-1">{selectedNode.certname}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <div className="mt-1">{getStatusBadge(selectedNode.latest_report_status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Environment</label>
                <p className="text-slate-900 mt-1">{selectedNode.catalog_environment}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Catalog Timestamp</label>
                <p className="text-slate-900 mt-1">
                  {selectedNode.catalog_timestamp
                    ? formatTimestamp(selectedNode.catalog_timestamp)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Facts Timestamp</label>
                <p className="text-slate-900 mt-1">
                  {selectedNode.facts_timestamp
                    ? formatTimestamp(selectedNode.facts_timestamp)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Report Timestamp</label>
                <p className="text-slate-900 mt-1">
                  {selectedNode.report_timestamp
                    ? formatTimestamp(selectedNode.report_timestamp)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Cached Catalog Status</label>
                <p className="text-slate-900 mt-1">{selectedNode.cached_catalog_status}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
