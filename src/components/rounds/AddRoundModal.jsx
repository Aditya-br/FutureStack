import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import {
  ROUND_RESULTS,
  ROUND_TYPES,
  ROUND_RESULT_LABELS,
  ROUND_TYPE_LABELS,
} from '../../utils/roundHelpers';

const emptyForm = {
  round_type: 'oa',
  scheduled_date: '',
  result: 'pending',
  notes: '',
};

/**
 * Create or edit an interview round.
 */
const AddRoundModal = ({
  isOpen,
  onClose,
  onSubmit,
  roundNumber,
  initialRound = null,
  saving = false,
}) => {
  const [form, setForm] = useState(emptyForm);
  const isEdit = Boolean(initialRound);

  useEffect(() => {
    if (!isOpen) return;

    if (initialRound) {
      setForm({
        round_type: initialRound.round_type || 'oa',
        scheduled_date: initialRound.scheduled_date || '',
        result: initialRound.result || 'pending',
        notes: initialRound.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, initialRound]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      round_type: form.round_type,
      result: form.result,
      notes: form.notes.trim() || null,
      scheduled_date: form.scheduled_date || null,
    };
    await onSubmit(payload);
  };

  const title = isEdit
    ? `Edit Round ${initialRound.round_number}`
    : `Add Round ${roundNumber}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="round_type" className="mb-1.5 block text-sm font-medium text-gray-300">
            Round type
          </label>
          <select
            id="round_type"
            value={form.round_type}
            onChange={handleChange('round_type')}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none"
            required
          >
            {ROUND_TYPES.map((type) => (
              <option key={type} value={type} style={{ backgroundColor: '#111827' }}>
                {ROUND_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="scheduled_date" className="mb-1.5 block text-sm font-medium text-gray-300">
            Scheduled date (optional)
          </label>
          <input
            id="scheduled_date"
            type="date"
            value={form.scheduled_date}
            onChange={handleChange('scheduled_date')}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="result" className="mb-1.5 block text-sm font-medium text-gray-300">
            Result
          </label>
          <select
            id="result"
            value={form.result}
            onChange={handleChange('result')}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none"
            required
          >
            {ROUND_RESULTS.map((result) => (
              <option key={result} value={result} style={{ backgroundColor: '#111827' }}>
                {ROUND_RESULT_LABELS[result]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-gray-300">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={handleChange('notes')}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Prep topics, interviewer names, feedback..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add round'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddRoundModal;
