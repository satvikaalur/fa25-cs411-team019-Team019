'use client';

import { useEffect, useState } from 'react';

interface EmailList {
  listId: number;
  listTitle: string;
  createdDate: string;
}

interface Customer {
  custName: string;
  email: string;
}

export default function EmailListsPage() {
  const [lists, setLists] = useState<EmailList[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedList, setExpandedList] = useState<number | null>(null);
  const [customers, setCustomers] = useState<Record<number, Customer[]>>({});

  const [listTitle, setListTitle] = useState('');
  const [minDate, setMinDate] = useState('');
  const [minSpend, setMinSpend] = useState('');
  const [categories, setCategories] = useState('');
  const [hasReturned, setHasReturned] = useState(false);

  const fetchLists = async () => {
    setLoading(true);
    const res = await fetch('/api/email-lists');
    const data = await res.json();
    setLists(data);
    setLoading(false);
  };

  useEffect(() => { fetchLists(); }, []);

  const refreshAll = async () => {
    setLoading(true);
    await fetch('/api/email-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'refreshAll' }),
    });
    await fetchLists();
    setLoading(false);
  };

  const createList = async () => {
    setLoading(true);
    await fetch('/api/email-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createUserList', listTitle, minDate, minSpend, categories, hasReturned }),
    });
    await fetchLists();
    setLoading(false);
  };

  const fetchCustomers = async (listId: number) => {
    if (customers[listId]) {
      setExpandedList(expandedList === listId ? null : listId);
      return;
    }
    const res = await fetch('/api/email-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getCustomersByList', listId }),
    });
    const data = await res.json();
    setCustomers(prev => ({ ...prev, [listId]: data }));
    setExpandedList(expandedList === listId ? null : listId);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Email List Builder</h1>

      {/* Custom List Filters */}
      <section className="mb-6">
        <h2 className="font-semibold">Custom List Filters</h2>
        <input placeholder="List Title" value={listTitle} onChange={e => setListTitle(e.target.value)} className="border p-1 m-1" />
        <input type="date" placeholder="Min Purchase Date" value={minDate} onChange={e => setMinDate(e.target.value)} className="border p-1 m-1" />
        <input type="number" placeholder="Min Spend" value={minSpend} onChange={e => setMinSpend(e.target.value)} className="border p-1 m-1" />
        <input placeholder="Categories (comma)" value={categories} onChange={e => setCategories(e.target.value)} className="border p-1 m-1" />
        <label className="m-1">
          <input type="checkbox" checked={hasReturned} onChange={e => setHasReturned(e.target.checked)} /> Has Returned
        </label>
        <button onClick={createList} className="bg-blue-500 text-white px-3 py-1 rounded m-1">Create/Update List</button>
      </section>

      {/* Existing Lists */}
      <section className="mb-6">
        <h2 className="font-semibold">Existing Lists</h2>
        <button onClick={refreshAll} className="bg-green-500 text-white px-3 py-1 rounded mb-2">Refresh All Lists</button>

        {loading ? <p>Loading...</p> : (
          <ul>
            {lists.map(list => (
              <li key={list.listId} className="mb-2 border-b pb-2">
                <div className="flex justify-between items-center">
                  <span>{list.listTitle} ({new Date(list.createdDate).toLocaleDateString()})</span>
                  <button
                    onClick={() => fetchCustomers(list.listId)}
                    className="text-blue-500 underline"
                  >
                    {expandedList === list.listId ? 'Hide Customers' : 'View Customers'}
                  </button>
                </div>
                {expandedList === list.listId && customers[list.listId] && (
                  <ul className="ml-4 mt-2">
                    {customers[list.listId].map((cust, i) => (
                      <li key={i}>{cust.custName} — {cust.email}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}