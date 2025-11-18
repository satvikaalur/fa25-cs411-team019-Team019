"use client";

import { useEffect, useState } from "react";
import { Navbar } from "../components/NavBar";

export default function MarketingListsPage() {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [customers, setCustomers] = useState([]);

  const [title, setTitle] = useState("");
  const [lastPurchaseBefore, setLastPurchaseBefore] = useState("");
  const [minSpent, setMinSpent] = useState("");
  const [hasReturned, setHasReturned] = useState("any");
  const [category, setCategory] = useState("");

  const [popup, setPopup] = useState<string | null>(null);

  async function loadLists() {
    const res = await fetch("/api/marketing", { cache: "no-store" });
    const json = await res.json();
    setLists(json);
  }

  async function viewList(id: number) {
    const res = await fetch(`/api/marketing?listid=${id}`);
    const json = await res.json();
    setCustomers(json);
    setSelectedList(id);
  }

  async function deleteList(id: number) {
    await fetch(`/api/marketing?listid=${id}`, { method: "DELETE" });
    if (selectedList === id) setSelectedList(null);
    loadLists();
  }

  async function createCustomList() {
    const body = {
      listtitle: title,
      lastPurchaseBefore: lastPurchaseBefore || null,
      minSpent: minSpent ? Number(minSpent) : null,
      hasReturned: hasReturned === "any" ? null : hasReturned === "yes",
      category: category || null,
    };
  
    const res = await fetch("/api/marketing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  
    const result = await res.json();
  
    if (!result.success) {
      setPopup("No customers matched your requirements. Please try again.");
      return;
    }
  
    setPopup(
      `List '${title}' created successfully with ${result.count} customers!`
    );
  
    // Reset fields
    setTitle("");
    setLastPurchaseBefore("");
    setMinSpent("");
    setHasReturned("any");
    setCategory("");
  
    loadLists();
  }

  useEffect(() => {
    loadLists();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-black dark:bg-black dark:text-zinc-50">
      <Navbar />

      <main className="mx-auto flex max-w-7xl gap-6 px-6 py-10">
        {/* Custom List Column */}
        <div className="w-1/3 rounded-lg border border-black/10 p-4 dark:border-white/10 font-sans">
          <h2 className="mb-4 text-lg font-semibold">Create Custom List</h2>

          {popup && (
            <div className="mb-3 rounded bg-green-200 p-2 text-sm text-green-900" onClick={() => setPopup(null)}>
              {popup}
            </div>
          )}

          <input
            placeholder="List Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-2 w-full rounded border p-2 text-sm"
          />

          <label className="text-xs text-zinc-500">Last purchase before:</label>
          <input
            type="date"
            value={lastPurchaseBefore}
            onChange={(e) => setLastPurchaseBefore(e.target.value)}
            className="mb-2 w-full rounded border p-2 text-sm"
          />

          <label className="text-xs text-zinc-500">Minimum spent:</label>
          <input
            placeholder="Min Spent ($)"
            value={minSpent}
            onChange={(e) => setMinSpent(e.target.value)}
            className="mb-2 w-full rounded border p-2 text-sm"
          />

          <label className="text-xs text-zinc-500">Returns:</label>
          <select
            value={hasReturned}
            onChange={(e) => setHasReturned(e.target.value)}
            className="w-full p-2 border rounded bg-white text-black dark:bg-zinc-800 dark:text-white"
          >
            <option value="any">Returned or Not Returned</option>
            <option value="yes">Has Returned</option>
            <option value="no">Has Not Returned</option>
          </select>

          <label className="text-xs text-zinc-500">Product Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded bg-white text-black dark:bg-zinc-800 dark:text-white"
          >
            <option value="">Any Category</option>
            <option value="electronics">Electronics</option>
            <option value="home">Home</option>
            <option value="books">Books</option>
          </select>

          <button
            onClick={createCustomList}
            className="w-full rounded bg-black px-4 py-2 text-sm text-white hover:bg-[#333] dark:bg-white dark:text-black dark:hover:bg-[#ddd]"
          >
            Create List
          </button>
        </div>

        {/* Existing Lists Column */}
        <div className="w-1/3 rounded-lg border border-black/10 p-4 dark:border-white/10">
          <h2 className="mb-4 text-lg font-semibold">Existing Lists</h2>

          <div className="space-y-3">
            {lists.map((l: any) => (
              <div key={l.listid} className="rounded-md border border-black/10 p-3 dark:border-white/10">
                <p className="font-medium">{l.listtitle}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{l.createddate}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">{l.count} customers</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => viewList(l.listid)}
                    className="rounded bg-black px-3 py-1 text-xs text-white hover:bg-[#383838] dark:bg-white dark:text-black dark:hover:bg-[#ddd]"
                  >
                    View
                  </button>

                  <button
                    onClick={() => deleteList(l.listid)}
                    className="rounded border border-red-500 px-3 py-1 text-xs text-red-500 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customers Column */}
        {selectedList && (
          <div className="w-1/3 rounded-lg border border-black/10 p-4 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Customers</h2>
              <button onClick={() => setSelectedList(null)} className="text-sm text-zinc-500 hover:underline">
                Close
              </button>
            </div>

            <div className="mt-4 max-h-[70vh] space-y-2 overflow-y-auto">
              {customers.map((c: any, i: number) => (
                <div key={i} className="rounded border border-black/10 p-2 text-sm dark:border-white/10">
                  <p className="font-medium">{c.custname}</p>
                  <p className="text-xs text-zinc-500">{c.email}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}