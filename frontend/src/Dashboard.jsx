import React, { useState, useEffect } from 'react';
import { fetchAll, createRecord } from './api';

export default function Dashboard({ onLogout }) {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    organization_id: '',
  });
  const [formMsg, setFormMsg] = useState('');
  const [formError, setFormError] = useState('');

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
      // Token may be expired
      onLogout();
    }
  }

  async function handleCreateContact(e) {
    e.preventDefault();
    setFormMsg('');
    setFormError('');
    try {
      const payload = { ...formData };
      if (payload.organization_id) {
        payload.organization_id = Number(payload.organization_id);
      } else {
        delete payload.organization_id;
      }
      await createRecord('contacts', payload);
      setFormMsg('Contact created successfully!');
      setFormData({ first_name: '', last_name: '', email: '', phone: '', organization_id: '' });
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
    const c = contacts.find((c) => c.id === id);
    return c ? `${c.first_name} ${c.last_name}` : '—';
  }

  function formatCurrency(val) {
    return val != null ? `$${Number(val).toLocaleString()}` : '—';
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Mini CRM Dashboard</h1>
        <button className="btn-logout" onClick={onLogout}>Logout</button>
      </div>

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
              <tr key={o.id}>
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
        <h2>
          Contacts <span className="count">{contacts.length}</span>
          <button className="btn-toggle" onClick={() => setShowForm(!showForm)} style={{ marginLeft: 'auto' }}>
            {showForm ? 'Cancel' : '+ New Contact'}
          </button>
        </h2>
        {showForm && (
          <form className="create-form" onSubmit={handleCreateContact} data-testid="create-contact-form">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact_email">Email</label>
              <input
                id="contact_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="organization">Organization</label>
              <select
                id="organization"
                value={formData.organization_id}
                onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
              >
                <option value="">None</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-create">Create Contact</button>
              {formMsg && <span className="success-msg">{formMsg}</span>}
              {formError && <span className="error-msg">{formError}</span>}
            </div>
          </form>
        )}
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
              <tr key={c.id}>
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
              <tr key={d.id}>
                <td>{d.title}</td>
                <td>{formatCurrency(d.value)}</td>
                <td>
                  <span className={`stage-badge stage-${d.stage}`}>
                    {d.stage.replace('_', ' ')}
                  </span>
                </td>
                <td>{contactName(d.contact_id)}</td>
                <td>{orgName(d.organization_id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
