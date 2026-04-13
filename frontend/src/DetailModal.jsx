import React, { useState } from 'react';
import { updateRecord, deleteRecord } from './api';

const STAGES = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'hire_this_guy'];

const FIELD_DEFS = {
  contacts: [
    { key: 'first_name', label: 'First Name', required: true },
    { key: 'last_name', label: 'Last Name', required: true },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone' },
  ],
  organizations: [
    { key: 'name', label: 'Name', required: true },
    { key: 'industry', label: 'Industry' },
    { key: 'website', label: 'Website' },
  ],
  deals: [
    { key: 'title', label: 'Title', required: true },
    { key: 'value', label: 'Value ($)', type: 'number' },
    { key: 'stage', label: 'Stage', type: 'select', options: STAGES },
  ],
};

export default function DetailModal({ type, record, contacts, organizations, deals, onClose, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fields = FIELD_DEFS[type];

  function startEdit() {
    const data = {};
    fields.forEach((f) => { data[f.key] = record[f.key] ?? ''; });
    setEditData(data);
    setEditing(true);
    setError('');
  }

  function cancelEdit() {
    setEditing(false);
    setError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...editData };
      if (payload.value !== undefined && payload.value !== '') {
        payload.value = Number(payload.value);
      }
      await updateRecord(type, record.id, payload);
      setEditing(false);
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    setError('');
    try {
      await deleteRecord(type, record.id);
      onClose();
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  }

  // Related data lookups
  const relatedOrg = record.organization_id
    ? organizations.find((o) => o.id === record.organization_id)
    : null;

  const relatedContact = record.contact_id
    ? contacts.find((c) => c.id === record.contact_id)
    : null;

  const relatedContacts = type === 'organizations'
    ? contacts.filter((c) => c.organization_id === record.id)
    : [];

  const relatedDeals =
    type === 'contacts'
      ? deals.filter((d) => d.contact_id === record.id)
      : type === 'organizations'
        ? deals.filter((d) => d.organization_id === record.id)
        : [];

  const relatedOrgForDeal = type === 'deals' ? relatedOrg : null;
  const relatedContactForDeal = type === 'deals' ? relatedContact : null;

  function formatStage(s) {
    return s ? s.replaceAll('_', ' ') : '—';
  }

  function formatCurrency(val) {
    return val != null ? `$${Number(val).toLocaleString()}` : '—';
  }

  const typeLabel = type === 'organizations' ? 'Organization' : type === 'contacts' ? 'Contact' : 'Deal';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{typeLabel} Details</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* Main fields */}
          {editing ? (
            <form onSubmit={handleSave}>
              <div className="modal-fields">
                {fields.map((f) => (
                  <div className="modal-field" key={f.key}>
                    <label>{f.label}</label>
                    {f.type === 'select' ? (
                      <select
                        value={editData[f.key]}
                        onChange={(e) => setEditData({ ...editData, [f.key]: e.target.value })}
                      >
                        {f.options.map((o) => (
                          <option key={o} value={o}>{formatStage(o)}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type || 'text'}
                        value={editData[f.key]}
                        onChange={(e) => setEditData({ ...editData, [f.key]: e.target.value })}
                        required={f.required}
                      />
                    )}
                  </div>
                ))}
              </div>
              {error && <p className="error-msg">{error}</p>}
              <div className="modal-actions">
                <button type="submit" className="btn-save">Save</button>
                <button type="button" className="btn-cancel" onClick={cancelEdit}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div className="modal-fields">
                {fields.map((f) => (
                  <div className="modal-field" key={f.key}>
                    <label>{f.label}</label>
                    <span>
                      {f.type === 'select'
                        ? <span className={`stage-badge stage-${record[f.key]}`}>{formatStage(record[f.key])}</span>
                        : f.key === 'value'
                          ? formatCurrency(record[f.key])
                          : (record[f.key] || '—')}
                    </span>
                  </div>
                ))}
                <div className="modal-field">
                  <label>Created</label>
                  <span>{record.created_at || '—'}</span>
                </div>
              </div>

              {/* Related data */}
              {type === 'contacts' && (
                <div className="modal-related">
                  {relatedOrg && (
                    <div className="related-section">
                      <h3>Organization</h3>
                      <div className="related-row"><span>Name</span><span>{relatedOrg.name}</span></div>
                      <div className="related-row"><span>Industry</span><span>{relatedOrg.industry || '—'}</span></div>
                      <div className="related-row"><span>Website</span><span>{relatedOrg.website || '—'}</span></div>
                    </div>
                  )}
                  {relatedDeals.length > 0 && (
                    <div className="related-section">
                      <h3>Deals ({relatedDeals.length})</h3>
                      {relatedDeals.map((d) => (
                        <div className="related-row" key={d.id}>
                          <span>{d.title}</span>
                          <span>{formatCurrency(d.value)} &middot; <span className={`stage-badge stage-${d.stage}`}>{formatStage(d.stage)}</span></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {type === 'organizations' && (
                <div className="modal-related">
                  {relatedContacts.length > 0 && (
                    <div className="related-section">
                      <h3>Contacts ({relatedContacts.length})</h3>
                      {relatedContacts.map((c) => (
                        <div className="related-row" key={c.id}>
                          <span>{c.first_name} {c.last_name}</span>
                          <span>{c.email || '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {relatedDeals.length > 0 && (
                    <div className="related-section">
                      <h3>Deals ({relatedDeals.length})</h3>
                      {relatedDeals.map((d) => (
                        <div className="related-row" key={d.id}>
                          <span>{d.title}</span>
                          <span>{formatCurrency(d.value)} &middot; <span className={`stage-badge stage-${d.stage}`}>{formatStage(d.stage)}</span></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {type === 'deals' && (
                <div className="modal-related">
                  {relatedContactForDeal && (
                    <div className="related-section">
                      <h3>Contact</h3>
                      <div className="related-row"><span>Name</span><span>{relatedContactForDeal.first_name} {relatedContactForDeal.last_name}</span></div>
                      <div className="related-row"><span>Email</span><span>{relatedContactForDeal.email || '—'}</span></div>
                      <div className="related-row"><span>Phone</span><span>{relatedContactForDeal.phone || '—'}</span></div>
                    </div>
                  )}
                  {relatedOrgForDeal && (
                    <div className="related-section">
                      <h3>Organization</h3>
                      <div className="related-row"><span>Name</span><span>{relatedOrgForDeal.name}</span></div>
                      <div className="related-row"><span>Industry</span><span>{relatedOrgForDeal.industry || '—'}</span></div>
                      <div className="related-row"><span>Website</span><span>{relatedOrgForDeal.website || '—'}</span></div>
                    </div>
                  )}
                </div>
              )}

              {error && <p className="error-msg">{error}</p>}
              <div className="modal-actions">
                <button className="btn-edit" onClick={startEdit}>Edit</button>
                {confirmDelete ? (
                  <>
                    <span className="delete-confirm-text">Are you sure?</span>
                    <button className="btn-delete-confirm" onClick={handleDelete}>Yes, Delete</button>
                    <button className="btn-cancel" onClick={() => setConfirmDelete(false)}>No</button>
                  </>
                ) : (
                  <button className="btn-delete" onClick={() => setConfirmDelete(true)}>Delete</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
