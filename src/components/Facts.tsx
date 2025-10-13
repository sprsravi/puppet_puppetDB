import React, { useState, useEffect } from 'react';
import { Database, Search, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { puppetDB, PuppetFact } from '../services/puppetdb';

export const Facts: React.FC = () => {
  const [facts, setFacts] = useState<PuppetFact[]>([]);
  const [factNames, setFactNames] = useState<string[]>([]);
  const [filteredFacts, setFilteredFacts] = useState<PuppetFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFactName, setSelectedFactName] = useState('');
  const [expandedFacts, setExpandedFacts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFactNames();
  }, []);

  useEffect(() => {
    if (selectedFactName) {
      loadFacts(selectedFactName);
    }
  }, [selectedFactName]);

  useEffect(() => {
    filterFacts();
  }, [searchTerm, facts]);

  const loadFactNames = async () => {
    setLoading(true);
    try {
      const names = await puppetDB.getFactNames();
      setFactNames(names.sort());
    } catch (error) {
      console.error('Failed to load fact names:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFacts = async (factName: string) => {
    setLoading(true);
    try {
      const data = await puppetDB.searchFacts(factName);
      setFacts(data);
      setFilteredFacts(data);
    } catch (error) {
      console.error('Failed to load facts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFacts = () => {
    if (!searchTerm) {
      setFilteredFacts(facts);
      return;
    }

    const filtered = facts.filter((fact) =>
      fact.certname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(fact.value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredFacts(filtered);
  };

  const toggleFactExpansion = (certname: string) => {
    const newExpanded = new Set(expandedFacts);
    if (newExpanded.has(certname)) {
      newExpanded.delete(certname);
    } else {
      newExpanded.add(certname);
    }
    setExpandedFacts(newExpanded);
  };

  const formatFactValue = (value: unknown): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const isComplexValue = (value: unknown): boolean => {
    return typeof value === 'object' && value !== null;
  };

  if (loading && factNames.length === 0) {
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
          <h1 className="text-3xl font-bold text-slate-800">Facts</h1>
          <p className="text-slate-600 mt-1">Browse and search node facts</p>
        </div>
        <button
          onClick={loadFactNames}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Fact Names</h3>
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {factNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedFactName(name)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedFactName === name
                      ? 'bg-orange-500 text-white'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedFactName ? (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Fact: <span className="text-orange-600">{selectedFactName}</span>
                  </h3>
                  <span className="text-sm text-slate-600">
                    {filteredFacts.length} nodes
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search nodes or values..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {filteredFacts.map((fact) => (
                      <div key={fact.certname} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Database className="w-5 h-5 text-slate-400" />
                              <h4 className="font-medium text-slate-900">{fact.certname}</h4>
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                {fact.environment}
                              </span>
                            </div>
                            {isComplexValue(fact.value) ? (
                              <div>
                                <button
                                  onClick={() => toggleFactExpansion(fact.certname)}
                                  className="flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700 mb-2"
                                >
                                  {expandedFacts.has(fact.certname) ? (
                                    <>
                                      <ChevronDown className="w-4 h-4" />
                                      <span>Hide details</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronRight className="w-4 h-4" />
                                      <span>Show details</span>
                                    </>
                                  )}
                                </button>
                                {expandedFacts.has(fact.certname) && (
                                  <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm text-slate-700">
                                    {formatFactValue(fact.value)}
                                  </pre>
                                )}
                              </div>
                            ) : (
                              <p className="text-slate-700 font-mono text-sm bg-slate-100 px-3 py-2 rounded">
                                {formatFactValue(fact.value)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredFacts.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No facts found</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Select a Fact
              </h3>
              <p className="text-slate-600">
                Choose a fact name from the list to view its values across all nodes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
