import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomFieldFormDialog } from './CustomFieldFormDialog';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { adminApi } from '@serviceops/services/api/adminServices';

// ── Store helpers ────────────────────────────────────────────────────────

const createTestStore = () =>
  configureStore({
    reducer: {
      [adminApi.reducerPath]: adminApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(adminApi.middleware),
  });

const renderWithProviders = (ui: React.ReactElement, store = createTestStore()) => {
  return render(<Provider store={store}>{ui}</Provider>);
};

// ── Default dialog props ────────────────────────────────────────────────

const defaultProps = {
  open: true,
  tab: 'Create Ticket' as 'Create Ticket' | 'Ticket Details',
  onClose: vi.fn(),
  onSave: vi.fn(),
};

const renderDialog = (props: Partial<typeof defaultProps> = {}) => {
  const merged = { ...defaultProps, ...props };
  return { ...renderWithProviders(<CustomFieldFormDialog {...merged} />), props: merged };
};

// ── Helpers ─────────────────────────────────────────────────────────────

const openSave = async () => {
  fireEvent.click(screen.getByRole('button', { name: /Add Field/i }));
  const fieldName = await screen.findByLabelText(/Field Name/);
  const displayLabel = screen.getByLabelText(/Display Label/);
  return { fieldName, displayLabel };
};

describe('CustomFieldFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────

  it('renders when open is true', () => {
    renderDialog();
    expect(screen.getByText('Add Custom Field')).toBeTruthy();
  });

  it('does not render when open is false', () => {
    renderDialog({ open: false });
    expect(screen.queryByText('Add Custom Field')).toBeNull();
  });

  it('shows the form with required inputs', () => {
    renderDialog();
    expect(screen.getByLabelText(/Field Name/)).toBeTruthy();
    expect(screen.getByLabelText(/Display Label/)).toBeTruthy();
    expect(screen.getByLabelText(/Field Type/)).toBeTruthy();
    expect(screen.getByLabelText(/Required/)).toBeTruthy();
  });

  it('shows Cancel and Save buttons', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: /Cancel/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Save$/ })).toBeTruthy();
  });

  it('disables the Save button initially', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: /^Save$/ })).toBeDisabled();
  });

  // ── Cancel behavior ────────────────────────────────────────────────

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    renderDialog({ onClose });
    fireEvent.click(screen.getByRole('button', { name: /Cancel/ }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Validation ─────────────────────────────────────────────────────

  it('shows error when field name is empty on submit', async () => {
    renderDialog();

    const { fieldName } = await openSave();
    await userEvent.type(fieldName, ''); // leave empty
    await userEvent.click(screen.getByRole('button', { name: /^Save$/ }));

    expect(screen.getByText('Field Name is required')).toBeTruthy();
  });

  it('shows error when display label is empty on submit', async () => {
    renderDialog();

    const { fieldName, displayLabel } = await openSave();
    await userEvent.type(fieldName, 'field_name');
    await userEvent.type(displayLabel, '');
    await userEvent.click(screen.getByRole('button', { name: /^Save$/ }));

    expect(screen.getByText('Display Label is required')).toBeTruthy();
  });

  it('keeps Save disabled when form is invalid', async () => {
    renderDialog();

    const { fieldName } = await openSave();
    await userEvent.type(fieldName, 'valid');
    expect(screen.getByRole('button', { name: /^Save$/ })).toBeDisabled();
  });

  // ── Successful save ────────────────────────────────────────────────

  it('calls onSave with field data when form is valid', async () => {
    const onSave = vi.fn();
    renderDialog({ onSave });

    const { fieldName, displayLabel } = await openSave();
    await userEvent.type(fieldName, 'my_field');
    await userEvent.type(displayLabel, 'My Field');
    await userEvent.click(screen.getByRole('button', { name: /^Save$/ }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock.calls[0][0];
    expect(payload).toMatchObject({
      label: 'my_field',
      displayLabel: 'My Field',
      required: false,
    });
    expect(payload).toHaveProperty('type');
  });

  it('calls onSave with required:true when checkbox is checked', async () => {
    const onSave = vi.fn();
    renderDialog({ onSave });

    const { fieldName, displayLabel } = await openSave();
    await userEvent.type(fieldName, 'req_field');
    await userEvent.type(displayLabel, 'Required Field');
    fireEvent.click(screen.getByLabelText(/Required/));
    await userEvent.click(screen.getByRole('button', { name: /^Save$/ }));

    const payload = onSave.mock.calls[0][0];
    expect(payload.required).toBe(true);
  });

  // ── Tab variants ───────────────────────────────────────────────────

  it('renders for Ticket Details tab', () => {
    renderDialog({ tab: 'Ticket Details' });
    expect(screen.getByLabelText(/Field Name/)).toBeTruthy();
  });

  // ── Field Type selection ───────────────────────────────────────────

  it('allows changing the field type', async () => {
    const onSave = vi.fn();
    renderDialog({ onSave });

    const { fieldName, displayLabel } = await openSave();
    await userEvent.type(fieldName, 'type_field');
    await userEvent.type(displayLabel, 'Type Field');

    const typeSelect = screen.getByLabelText(/Field Type/);
    fireEvent.mouseDown(typeSelect);

    // Select a different option
    const options = screen.getAllByRole('option');
    if (options.length > 1) {
      fireEvent.click(options[1]);
    }

    await userEvent.click(screen.getByRole('button', { name: /^Save$/ }));

    expect(onSave).toHaveBeenCalled();
  });

  // ── Close after successful save ────────────────────────────────────

  it('closes the dialog after a successful save', async () => {
    const onClose = vi.fn();
    renderDialog({ onClose, onSave: vi.fn() });

    const { fieldName, displayLabel } = await openSave();
    await userEvent.type(fieldName, 'close_test');
    await userEvent.type(displayLabel, 'Close Test');
    await userEvent.click(screen.getByRole('button', { name: /^Save$/ }));

    expect(onClose).toHaveBeenCalled();
  });

  // ── Accessibility ──────────────────────────────────────────────────

  it('has accessible labels on all form controls', () => {
    renderDialog();
    expect(screen.getByLabelText(/Field Name/)).toBeTruthy();
    expect(screen.getByLabelText(/Display Label/)).toBeTruthy();
    expect(screen.getByLabelText(/Field Type/)).toBeTruthy();
    expect(screen.getByLabelText(/Required/)).toBeTruthy();
  });
});
