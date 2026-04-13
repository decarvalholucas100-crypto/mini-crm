import React, { useState, useEffect } from 'react';
import { fetchAll, createRecord } from './api';
import DetailModal from './DetailModal';

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  org_name: '',
  org_industry: '',
  org_website: '',
  deal_title: '',
  deal_value: '',
  deal_stage: 'prospecting',
};

export default function Dashboard({ onLogout }) {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formMsg, setFormMsg] = useState('');
  const [formError, setFormError] = useState('');
  const [modal, setModal] = useState(null); // { type, record }

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [d, c, o] = await Promise.all([
        fetchAll('deals'),
        fetchAll('contacts'),
        fetchAll('organizations'),
      ]);
      setDeals(d);
      setContacts(c);
      setOrgs(o);
    } catch {
      onLogout();
    }
  }

  function set(field) {
    return (e) => setFormData({ ...formData, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormMsg('');
    setFormError('');
    try {
      // 1. Create organization if name is provided
      let organizationId = null;
      if (formData.org_name.trim()) {
        const org = await createRecord('organizations', {
          name: formData.org_name.trim(),
          industry: formData.org_industry.trim() || null,
          website: formData.org_website.trim() || null,
        });
        organizationId = org.id;
      }

      // 2. Create contact (linked to org if created)
      const contactPayload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        phone: formData.phone || null,
      };
      if (organizationId) contactPayload.organization_id = organizationId;
      const contact = await createRecord('contacts', contactPayload);

      // 3. Create deal if title is provided (linked to contact and org)
      if (formData.deal_title.trim()) {
        const dealPayload = {
          title: formData.deal_title.trim(),
          value: formData.deal_value ? Number(formData.deal_value) : null,
          stage: formData.deal_stage,
          contact_id: contact.id,
        };
        if (organizationId) dealPayload.organization_id = organizationId;
        await createRecord('deals', dealPayload);
      }

      setFormData(EMPTY_FORM);
      setShowForm(false);
      loadData();
    } catch (err) {
      setFormError(err.message);
    }
  }

  function orgName(id) {
    const org = orgs.find((o) => o.id === id);
    return org ? org.name : '—';
  }

  function contactName(id) {
    const c = contacts.find((ct) => ct.id === id);
    return c ? `${c.first_name} ${c.last_name}` : '—';
  }

  function formatCurrency(val) {
    return val != null ? `$${Number(val).toLocaleString()}` : '—';
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Mini CRM Dashboard</h1>
        <div className="header-actions">
          <button className="btn-toggle" onClick={() => { setShowForm(!showForm); setFormMsg(''); setFormError(''); }}>
            {showForm ? 'Cancel' : '+ New Contact'}
          </button>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {showForm && (
        <form className="create-form" onSubmit={handleSubmit} data-testid="create-contact-form">
          {/* Contact section */}
          <fieldset className="form-section">
            <legend>Contact</legend>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input id="first_name" value={formData.first_name} onChange={set('first_name')} required />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input id="last_name" value={formData.last_name} onChange={set('last_name')} required />
              </div>
              <div className="form-group">
                <label htmlFor="contact_email">Email</label>
                <input id="contact_email" type="email" value={formData.email} onChange={set('email')} />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input id="phone" value={formData.phone} onChange={set('phone')} />
              </div>
            </div>
          </fieldset>

          {/* Organization section */}
          <fieldset className="form-section">
            <legend>Organization <span className="optional-label">(optional)</span></legend>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="org_name">Name</label>
                <input id="org_name" value={formData.org_name} onChange={set('org_name')} />
              </div>
              <div className="form-group">
                <label htmlFor="org_industry">Industry</label>
                <input id="org_industry" value={formData.org_industry} onChange={set('org_industry')} />
              </div>
              <div className="form-group">
                <label htmlFor="org_website">Website</label>
                <input id="org_website" value={formData.org_website} onChange={set('org_website')} />
              </div>
            </div>
          </fieldset>

          {/* Deal section */}
          <fieldset className="form-section">
            <legend>Deal <span className="optional-label">(optional)</span></legend>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="deal_title">Title</label>
                <input id="deal_title" value={formData.deal_title} onChange={set('deal_title')} />
              </div>
              <div className="form-group">
                <label htmlFor="deal_value">Value ($)</label>
                <input id="deal_value" type="number" min="0" value={formData.deal_value} onChange={set('deal_value')} />
              </div>
              <div className="form-group">
                <label htmlFor="deal_stage">Stage</label>
                <select id="deal_stage" value={formData.deal_stage} onChange={set('deal_stage')}>
                  <option value="prospecting">Prospecting</option>
                  <option value="qualification">Qualification</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed_won">Closed Won</option>
                  <option value="hire_this_guy">Hire This Guy</option>
                </select>
              </div>
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="submit" className="btn-create">Create Contact</button>
            {formMsg && <span className="success-msg">{formMsg}</span>}
            {formError && <span className="error-msg">{formError}</span>}
          </div>
        </form>
      )}

      {/* Organizations */}
      <div className="section">
        <h2>Organizations <span className="count">{orgs.length}</span></h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Industry</th>
              <th>Website</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id} className="clickable-row" onClick={() => setModal({ type: 'organizations', record: o })}>
                <td>{o.name}</td>
                <td>{o.industry}</td>
                <td>{o.website}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contacts */}
      <div className="section">
        <h2>Contacts <span className="count">{contacts.length}</span></h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Organization</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="clickable-row" onClick={() => setModal({ type: 'contacts', record: c })}>
                <td>{c.first_name} {c.last_name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{orgName(c.organization_id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deals */}
      <div className="section">
        <h2>Deals <span className="count">{deals.length}</span></h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Value</th>
              <th>Stage</th>
              <th>Contact</th>
              <th>Organization</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d.id} className="clickable-row" onClick={() => setModal({ type: 'deals', record: d })}>
                <td>{d.title}</td>
                <td>{formatCurrency(d.value)}</td>
                <td>
                  <span className={`stage-badge stage-${d.stage}`}>
                    {d.stage.replaceAll('_', ' ')}
                  </span>
                </td>
                <td>{contactName(d.contact_id)}</td>
                <td>{orgName(d.organization_id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <DetailModal
          type={modal.type}
          record={modal.record}
          contacts={contacts}
          organizations={orgs}
          deals={deals}
          onClose={() => setModal(null)}
          onRefresh={() => { setModal(null); loadData(); }}
        />
      )}
    </div>
  );
}
