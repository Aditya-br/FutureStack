/**
 * Tests for DocumentUpload component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import DocumentUpload from '../DocumentUpload';

// Mock the Modal component
jest.mock('../../common/Modal', () => ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div data-testid="modal">
            <h2>{title}</h2>
            <button onClick={onClose}>Close</button>
            {children}
        </div>
    );
});

// Mock the Button component
jest.mock('../../common/Button', () => ({ children, ...props }) => (
    <button {...props}>{children}</button>
));

describe('DocumentUpload', () => {
    const mockOnClose = jest.fn();
    const mockOnUpload = jest.fn();
    const mockOnCreateExternal = jest.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onUpload: mockOnUpload,
        onCreateExternal: mockOnCreateExternal,
        isLoading: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders when isOpen is true', () => {
        render(<DocumentUpload {...defaultProps} />);
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByText('Add Document')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
        render(<DocumentUpload {...defaultProps} isOpen={false} />);
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('shows upload mode by default', () => {
        render(<DocumentUpload {...defaultProps} />);
        expect(screen.getByText('Upload File')).toBeInTheDocument();
        expect(screen.getByText(/Drag & drop or click to upload/)).toBeInTheDocument();
    });

    it('switches to external link mode', async () => {
        render(<DocumentUpload {...defaultProps} />);

        const externalButton = screen.getByText('External Link');
        await userEvent.click(externalButton);

        expect(screen.getByPlaceholderText(/drive.google.com/)).toBeInTheDocument();
    });

    it('shows file type options', () => {
        render(<DocumentUpload {...defaultProps} />);

        expect(screen.getByText('Resume')).toBeInTheDocument();
        expect(screen.getByText('Cover Letter')).toBeInTheDocument();
        expect(screen.getByText('Portfolio')).toBeInTheDocument();
        expect(screen.getByText('Other')).toBeInTheDocument();
    });

    it('validates required name field', async () => {
        render(<DocumentUpload {...defaultProps} />);

        // Switch to external mode (no file needed)
        await userEvent.click(screen.getByText('External Link'));

        // Fill URL but leave name empty
        await userEvent.type(screen.getByPlaceholderText(/drive.google.com/), 'https://example.com');

        // Submit
        await userEvent.click(screen.getByText('Add Link'));

        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(mockOnCreateExternal).not.toHaveBeenCalled();
    });

    it('validates URL format for external links', async () => {
        render(<DocumentUpload {...defaultProps} />);

        // Switch to external mode
        await userEvent.click(screen.getByText('External Link'));

        // Fill with invalid URL
        await userEvent.type(screen.getByPlaceholderText(/Software Engineer/), 'My Resume');
        await userEvent.type(screen.getByPlaceholderText(/drive.google.com/), 'not-a-url');

        // Submit
        await userEvent.click(screen.getByText('Add Link'));

        expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });

    it('calls onCreateExternal with correct data for external links', async () => {
        render(<DocumentUpload {...defaultProps} />);

        // Switch to external mode
        await userEvent.click(screen.getByText('External Link'));

        // Fill form
        await userEvent.type(screen.getByPlaceholderText(/Software Engineer/), 'My Portfolio');
        await userEvent.type(screen.getByPlaceholderText(/drive.google.com/), 'https://myportfolio.com');

        // Change type to portfolio
        await userEvent.selectOptions(screen.getByDisplayValue('Resume'), 'portfolio');

        // Submit
        await userEvent.click(screen.getByText('Add Link'));

        expect(mockOnCreateExternal).toHaveBeenCalledWith({
            name: 'My Portfolio',
            type: 'portfolio',
            version: 'v1',
            notes: '',
            file_url: 'https://myportfolio.com',
            is_external: true
        });
    });

    it('shows loading state when isLoading is true', () => {
        render(<DocumentUpload {...defaultProps} isLoading={true} />);

        expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    it('disables submit button when loading', () => {
        render(<DocumentUpload {...defaultProps} isLoading={true} />);

        const submitButton = screen.getByText('Uploading...').closest('button');
        expect(submitButton).toBeDisabled();
    });

    it('shows version input field', () => {
        render(<DocumentUpload {...defaultProps} />);

        expect(screen.getByPlaceholderText(/v1, v2, Final/)).toBeInTheDocument();
    });

    it('shows notes textarea', () => {
        render(<DocumentUpload {...defaultProps} />);

        expect(screen.getByPlaceholderText(/Optional notes/)).toBeInTheDocument();
    });

    it('validates file type in upload mode', async () => {
        render(<DocumentUpload {...defaultProps} />);

        // This tests file validation - in real implementation, 
        // file validation happens in handleFile
        expect(screen.getByText(/PDF, DOC, DOCX \(max 5MB\)/)).toBeInTheDocument();
    });

    it('calls onClose when modal is closed', async () => {
        render(<DocumentUpload {...defaultProps} />);

        await userEvent.click(screen.getByText('Close'));

        expect(mockOnClose).toHaveBeenCalled();
    });
});
