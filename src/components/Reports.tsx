import React, { useState, useEffect } from 'react';
import { FileText, Search, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { puppetDB, PuppetReport } from '../services/puppetdb';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<PuppetReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<PuppetReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<PuppetReport | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchTerm, statusFilter, reports]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await puppetDB.getReports(100);
      setReports(data);
      setFilteredReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter((report) =>
        report.certname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.environment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    setFilteredReports(filtered);
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

  const calculateDuration = (start: string, end: string) => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    return (duration / 1000).toFixed(2) + 's';
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
          <h1 className="text-3xl font-bold text-slate-800">Reports</h1>
          <p className="text-slate-600 mt-1">View and analyze Puppet run reports</p>
        </div>
        <button
          onClick={loadReports}
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
              placeholder="Search reports..."
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
                  Node
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Environment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredReports.map((report) => (
                <tr key={report.hash} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-slate-400 mr-3" />
                      <span className="text-sm font-medium text-slate-900">{report.certname}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{report.environment}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatTimestamp(report.producer_timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {calculateDuration(report.start_time, report.end_time)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedReport(report)}
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

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No reports found</p>
          </div>
        )}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-800">Report Details</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Node</label>
                  <p className="text-slate-900 mt-1">{selectedReport.certname}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Environment</label>
                  <p className="text-slate-900 mt-1">{selectedReport.environment}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Puppet Version</label>
                  <p className="text-slate-900 mt-1">{selectedReport.puppet_version}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Start Time</label>
                  <p className="text-slate-900 mt-1">{formatTimestamp(selectedReport.start_time)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">End Time</label>
                  <p className="text-slate-900 mt-1">{formatTimestamp(selectedReport.end_time)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Duration</label>
                  <p className="text-slate-900 mt-1">
                    {calculateDuration(selectedReport.start_time, selectedReport.end_time)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Noop Mode</label>
                  <p className="text-slate-900 mt-1">{selectedReport.noop ? 'Yes' : 'No'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Transaction UUID</label>
                <p className="text-slate-900 mt-1 font-mono text-sm break-all">
                  {selectedReport.transaction_uuid}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Report Hash</label>
                <p className="text-slate-900 mt-1 font-mono text-sm break-all">
                  {selectedReport.hash}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Configuration Version</label>
                <p className="text-slate-900 mt-1">{selectedReport.configuration_version}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Cached Catalog Status</label>
                <p className="text-slate-900 mt-1">{selectedReport.cached_catalog_status}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
