import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Database,
  Users,
} from 'lucide-react';
import { puppetDB, PuppetNode, PuppetReport } from '../services/puppetdb';

interface Stats {
  totalNodes: number;
  activeNodes: number;
  failedNodes: number;
  unchangedNodes: number;
  recentReports: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalNodes: 0,
    activeNodes: 0,
    failedNodes: 0,
    unchangedNodes: 0,
    recentReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentNodes, setRecentNodes] = useState<PuppetNode[]>([]);
  const [recentReports, setRecentReports] = useState<PuppetReport[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [nodes, reports] = await Promise.all([
        puppetDB.getNodes(),
        puppetDB.getReports(10),
      ]);

      const activeNodes = nodes.filter(
        (n) => !n.deactivated && !n.expired
      );
      const failedNodes = nodes.filter(
        (n) => n.latest_report_status === 'failed'
      );
      const unchangedNodes = nodes.filter(
        (n) => n.latest_report_status === 'unchanged'
      );

      setStats({
        totalNodes: nodes.length,
        activeNodes: activeNodes.length,
        failedNodes: failedNodes.length,
        unchangedNodes: unchangedNodes.length,
        recentReports: reports.length,
      });

      setRecentNodes(nodes.slice(0, 5));
      setRecentReports(reports.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unchanged':
        return 'text-emerald-400';
      case 'changed':
        return 'text-blue-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unchanged':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'changed':
        return <Activity className="w-5 h-5 text-blue-400" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
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
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your Puppet infrastructure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Nodes</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stats.totalNodes}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Server className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-500">
            <Database className="w-4 h-4 mr-1" />
            <span>Managed nodes</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Nodes</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.activeNodes}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-emerald-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Healthy status</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Failed Nodes</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.failedNodes}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <Activity className="w-4 h-4 mr-1" />
            <span>Requires attention</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Unchanged</p>
              <p className="text-3xl font-bold text-slate-700 mt-2">{stats.unchangedNodes}</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <Clock className="w-8 h-8 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-500">
            <Users className="w-4 h-4 mr-1" />
            <span>No changes</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800">Recent Nodes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentNodes.map((node) => (
                <div
                  key={node.certname}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(node.latest_report_status)}
                    <div>
                      <p className="font-medium text-slate-800">{node.certname}</p>
                      <p className="text-sm text-slate-500">{node.catalog_environment}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(node.latest_report_status)}`}>
                    {node.latest_report_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800">Recent Reports</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.hash}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(report.status)}
                    <div>
                      <p className="font-medium text-slate-800">{report.certname}</p>
                      <p className="text-sm text-slate-500">
                        {formatTimestamp(report.producer_timestamp)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
