/**
 * Tests for DocumentCard component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentCard from '../DocumentCard';

const mockDocument = {
    id: 'test-doc-1',
    name: 'Software Engineer Resume',
    type: 'resume',
    version: 'v2',
    file_url: 'https://example.com/resume.pdf',
    file_size: 524288, // 512 KB
    is_external: false,
    notes: 'Updated with recent projects',
    created_at: '2025-01-15T10:00:00Z',
    opportunity_documents: [
        { opportunity_id: 'opp-1' },
        { opportunity_id: 'opp-2' }
    ]
};

const mockExternalDocument = {
    id: 'test-doc-2',
    name: 'Portfolio Site',
    type: 'portfolio',
    version: 'v1',
    file_url: 'https://myportfolio.com',
    is_external: true,
    created_at: '2025-01-10T10:00:00Z',
    opportunity_documents: []
};

describe('DocumentCard', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnView = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders document name and type', () => {
        render(
            <DocumentCard
                document={mockDocument}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onView={mockOnView}
            />
        );

        expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
        expect(screen.getByText('Resume')).toBeInTheDocument();
    });

    it('displays version label', () => {
        render(
            <DocumentCard
                document={mockDocument}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByText('v2')).toBeInTheDocument();
    });

    it('formats file size correctly', () => {
        render(
            <DocumentCard
                document={mockDocument}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByText('512.0 KB')).toBeInTheDocument();
    });

    it('shows usage count for linked opportunities', () => {
        render(
            <DocumentCard
                document={mockDocument}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByText(/Used in 2 opportunities/)).toBeInTheDocument();
    });

    it('shows singular form for single opportunity', () => {
        const singleUsageDoc = {
            ...mockDocument,
            opportunity_documents: [{ opportunity_id: 'opp-1' }]
        };

        render(
            <DocumentCard
                document={singleUsageDoc}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByText(/Used in 1 opportunity/)).toBeInTheDocument();
    });

    it('displays notes when present', () => {
        render(
            <DocumentCard
                document={mockDocument}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByText('Updated with recent projects')).toBeInTheDocument();
    });

    it('shows "External Link" badge for external documents', () => {
        render(
            <DocumentCard
                document={mockExternalDocument}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByText('External Link')).toBeInTheDocument();
    });

    it('shows Download button for uploaded files', () => {
        render(
            <DocumentCard
                document={mockDocument}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByText('Download')).toBeInTheDocument();
    });

    it('shows Open button for external links', () => {
        render(
            <DocumentCard
                document={mockExternalDocument}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
        render(
            <DocumentCard
                document={mockDocument}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        const editButton = screen.getByTitle('Edit');
        fireEvent.click(editButton);

        expect(mockOnEdit).toHaveBeenCalledWith(mockDocument);
    });

    it('calls onDelete when delete button is clicked', () => {
        render(
            <DocumentCard
                document={mockDocument}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        const deleteButton = screen.getByTitle('Delete');
        fireEvent.click(deleteButton);

        expect(mockOnDelete).toHaveBeenCalledWith(mockDocument);
    });

    it('has correct download link for uploaded files', () => {
        render(
            <DocumentCard
                document={mockDocument}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        const downloadLink = screen.getByRole('link');
        expect(downloadLink).toHaveAttribute('href', 'https://example.com/resume.pdf');
        expect(downloadLink).toHaveAttribute('target', '_blank');
    });
});
