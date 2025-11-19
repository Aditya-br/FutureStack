import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaDownload, FaFileAlt, FaCheckSquare, FaSquare } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { opportunityService } from '../services/api';
import { generatePDF, downloadPDF } from '../utils/pdfExport';
import { formatDate } from '../utils/dateHelpers';

const Reports = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportType, setExportType] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await opportunityService.getAll();
      setOpportunities(data);
      // Initialize all as selected
      setSelectedIds(data.map(opp => opp.id));
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStatistics = (opps) => {
    return {
      total: opps.length,
      applied: opps.filter(opp => opp.status === 'applied').length,
      shortlisted: opps.filter(opp => opp.status === 'shortlisted').length,
      interviewed: opps.filter(opp => opp.status === 'interviewed').length,
      selected: opps.filter(opp => opp.status === 'selected').length,
      rejected: opps.filter(opp => opp.status === 'rejected').length,
    };
  };

  // Toggle individual opportunity selection
  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  // Select/Deselect all
  const toggleSelectAll = () => {
    if (selectedIds.length === opportunities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(opportunities.map(opp => opp.id));
    }
  };

  // Handle PDF generation and download
  const handleDownloadPDF = () => {
    try {
      let oppsToExport = [];
      let stats;

      if (exportType === 'all') {
        oppsToExport = opportunities;
        stats = calculateStatistics(opportunities);
      } else if (exportType === 'selected') {
        oppsToExport = opportunities.filter(opp => selectedIds.includes(opp.id));
        stats = calculateStatistics(oppsToExport);
      } else if (exportType === 'summary') {
        stats = calculateStatistics(opportunities);
      }

      const doc = generatePDF(oppsToExport, stats, exportType);
      const filename = `futurestack-report-${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(doc, filename);

      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  // Get opportunities to preview based on export type
  const getPreviewOpportunities = () => {
    if (exportType === 'all') {
      return opportunities;
    } else if (exportType === 'selected') {
      return opportunities.filter(opp => selectedIds.includes(opp.id));
    }
    return [];
  };

  const previewOpportunities = getPreviewOpportunities();
  const statistics = calculateStatistics(
    exportType === 'selected' ? previewOpportunities : opportunities
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
            <p className="text-white text-lg">Loading opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Reports & Export</h1>
          <p className="text-sm sm:text-base text-gray-400">Generate and download PDF reports of your opportunities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Export Options */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FaFileAlt className="mr-2" />
                Export Options
              </h2>

              {/* Export Type Selection */}
              <div className="space-y-3 mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="exportType"
                    value="all"
                    checked={exportType === 'all'}
                    onChange={(e) => setExportType(e.target.value)}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-300">All Opportunities</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="exportType"
                    value="selected"
                    checked={exportType === 'selected'}
                    onChange={(e) => setExportType(e.target.value)}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-300">Selected Opportunities</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="exportType"
                    value="summary"
                    checked={exportType === 'summary'}
                    onChange={(e) => setExportType(e.target.value)}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-300">Summary Only</span>
                </label>
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center"
                disabled={exportType === 'selected' && selectedIds.length === 0}
              >
                <FaDownload className="mr-2" />
                Download PDF
              </Button>

              {exportType === 'selected' && selectedIds.length === 0 && (
                <p className="text-sm text-yellow-400 mt-2">
                  Please select at least one opportunity
                </p>
              )}
            </Card>

            {/* Statistics Card */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Total:</span>
                  <span className="font-semibold">{statistics.total}</span>
                </div>
                <div className="flex justify-between text-blue-400">
                  <span>Applied:</span>
                  <span className="font-semibold">{statistics.applied}</span>
                </div>
                <div className="flex justify-between text-yellow-400">
                  <span>Shortlisted:</span>
                  <span className="font-semibold">{statistics.shortlisted}</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>Interviewed:</span>
                  <span className="font-semibold">{statistics.interviewed}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Selected:</span>
                  <span className="font-semibold">{statistics.selected}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Rejected:</span>
                  <span className="font-semibold">{statistics.rejected}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Preview</h2>
                {exportType === 'selected' && opportunities.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    {selectedIds.length === opportunities.length ? (
                      <>
                        <FaCheckSquare className="mr-1" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <FaSquare className="mr-1" />
                        Select All
                      </>
                    )}
                  </button>
                )}
              </div>

              {exportType === 'summary' ? (
                <div className="text-gray-300">
                  <p className="mb-4">The PDF will include summary statistics only:</p>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Total opportunities: {statistics.total}</li>
                    <li>Applied: {statistics.applied}</li>
                    <li>Shortlisted: {statistics.shortlisted}</li>
                    <li>Interviewed: {statistics.interviewed}</li>
                    <li>Selected: {statistics.selected}</li>
                    <li>Rejected: {statistics.rejected}</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {previewOpportunities.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No opportunities to preview
                    </p>
                  ) : (
                    previewOpportunities.map((opp) => (
                      <div
                        key={opp.id}
                        className={`p-4 rounded-lg border ${exportType === 'selected'
                          ? selectedIds.includes(opp.id)
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/10 bg-white/5'
                          : 'border-white/10 bg-white/5'
                          }`}
                      >
                        <div className="flex items-start">
                          {exportType === 'selected' && (
                            <button
                              onClick={() => toggleSelection(opp.id)}
                              className="mr-3 mt-1 text-blue-400 hover:text-blue-300"
                            >
                              {selectedIds.includes(opp.id) ? (
                                <FaCheckSquare size={20} />
                              ) : (
                                <FaSquare size={20} />
                              )}
                            </button>
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {opp.title}
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                              <div>
                                <span className="text-gray-400">Category: </span>
                                <span className="text-gray-300">
                                  {opp.category.charAt(0).toUpperCase() + opp.category.slice(1)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Status: </span>
                                <span className="text-gray-300">
                                  {opp.status.charAt(0).toUpperCase() + opp.status.slice(1)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Deadline: </span>
                                <span className="text-gray-300">{formatDate(opp.deadline)}</span>
                              </div>
                            </div>
                            {opp.description && (
                              <p className="text-gray-400 text-sm mb-2">{opp.description}</p>
                            )}
                            {opp.notes && (
                              <p className="text-gray-400 text-sm">
                                <span className="font-medium">Notes:</span> {opp.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
