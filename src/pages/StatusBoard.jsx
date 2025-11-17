import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import StatusColumn from '../components/statusboard/StatusColumn';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { opportunityService } from '../services/api';

const StatusBoard = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState(null);

  // Fetch all opportunities on component mount
  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await opportunityService.getAll();
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load opportunities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group opportunities by status
  const groupedOpportunities = {
    applied: opportunities.filter((opp) => opp.status === 'applied'),
    shortlisted: opportunities.filter((opp) => opp.status === 'shortlisted'),
    interviewed: opportunities.filter((opp) => opp.status === 'interviewed'),
    selected: opportunities.filter((opp) => opp.status === 'selected'),
    rejected: opportunities.filter((opp) => opp.status === 'rejected'),
  };

  // Handle status change
  const handleStatusChange = async (opportunityId, newStatus) => {
    try {
      // Find the opportunity to update
      const opportunityToUpdate = opportunities.find((opp) => opp.id === opportunityId);
      
      if (!opportunityToUpdate) {
        toast.error('Opportunity not found');
        return;
      }

      // Update the opportunity status via API
      await opportunityService.update(opportunityId, {
        ...opportunityToUpdate,
        status: newStatus,
      });

      // Update UI immediately
      setOpportunities((prevOpportunities) =>
        prevOpportunities.map((opp) =>
          opp.id === opportunityId ? { ...opp, status: newStatus } : opp
        )
      );

      // Show success toast
      toast.success('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status. Please try again.');
    }
  };

  // Handle delete click
  const handleDeleteClick = (id) => {
    setOpportunityToDelete(id);
    setDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!opportunityToDelete) return;

    try {
      await opportunityService.delete(opportunityToDelete);
      setOpportunities((prev) =>
        prev.filter((opp) => opp.id !== opportunityToDelete)
      );
      toast.success('Opportunity deleted successfully!');
      setDeleteModalOpen(false);
      setOpportunityToDelete(null);
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Failed to delete opportunity. Please try again.');
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setOpportunityToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-lg">Loading status board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Status Board</h1>
        <p className="text-sm sm:text-base text-gray-400">Track your application progress across different stages</p>
      </div>

      {/* Status Board - Horizontal scrollable on mobile, side-by-side on desktop */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-3 sm:gap-4 min-w-max lg:justify-start">
          <StatusColumn
            status="applied"
            opportunities={groupedOpportunities.applied}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteClick}
          />
          <StatusColumn
            status="shortlisted"
            opportunities={groupedOpportunities.shortlisted}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteClick}
          />
          <StatusColumn
            status="interviewed"
            opportunities={groupedOpportunities.interviewed}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteClick}
          />
          <StatusColumn
            status="selected"
            opportunities={groupedOpportunities.selected}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteClick}
          />
          <StatusColumn
            status="rejected"
            opportunities={groupedOpportunities.rejected}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteClick}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Confirm Delete"
      >
        <div>
          <p className="text-gray-300 mb-6">
            Are you sure you want to delete this opportunity? This action cannot
            be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StatusBoard;
