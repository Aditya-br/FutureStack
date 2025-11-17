import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import OpportunityForm from '../components/opportunities/OpportunityForm';
import Button from '../components/common/Button';
import { opportunityService } from '../services/api';

const AddOpportunity = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await opportunityService.create(formData);
      toast.success('Opportunity added successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast.error('Failed to add opportunity. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate(-1); // Navigate back to previous page
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg shadow-black/30 p-6 sm:p-8 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">
            Add New Opportunity
          </h2>
          
          <OpportunityForm onSubmit={handleSubmit} isEdit={false} />
          
          <div className="mt-6 pt-4 border-t border-slate-700">
            <button
              onClick={handleCancel}
              className="w-full px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOpportunity;
