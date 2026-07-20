import React from "react";
import Avatar from "./Avatar";

export default function Table({ data = [], isEmpty = false }) {
  const statusStyles = {
    Completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10",
    Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10",
    Failed: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/10",
  };

  if (isEmpty || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-slate-100 rounded-xl">
        <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5" />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-slate-900">No activity recorded</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-xs">There are currently no transactions or logs generated in this cycle. Try modifying filters or triggers.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xs shadow-slate-100/50 overflow-hidden">
      {/* Table header title area */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          Recent Transactions
        </h3>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">
          Live stream
        </span>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/75">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                Transaction ID
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                Date & Time
              </th>
              <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3.5 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition duration-150">
                <td className="whitespace-nowrap px-6 py-4.5 text-sm font-semibold text-slate-700">
                  {row.id}
                </td>
                <td className="whitespace-nowrap px-6 py-4.5">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      initials={row.user.initials}
                      name={row.user.name}
                      bgClass={row.user.avatarBg}
                      size="sm"
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-800 leading-none">
                        {row.user.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {row.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4.5 text-sm text-slate-500">
                  {row.type}
                </td>
                <td className="whitespace-nowrap px-6 py-4.5 text-sm text-slate-400">
                  {row.date}
                </td>
                <td className="whitespace-nowrap px-6 py-4.5 text-sm text-right font-semibold text-slate-800">
                  {row.amount}
                </td>
                <td className="whitespace-nowrap px-6 py-4.5 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[row.status] || "bg-slate-50 text-slate-600"}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-between sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-slate-200 text-xs font-semibold rounded-md text-slate-600 bg-white hover:bg-slate-50 transition cursor-pointer">
            Previous
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-200 text-xs font-semibold rounded-md text-slate-600 bg-white hover:bg-slate-50 transition cursor-pointer">
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="font-semibold text-slate-800">1</span> to <span className="font-semibold text-slate-800">5</span> of{" "}
              <span className="font-semibold text-slate-800">24</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-xs -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-200 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 transition cursor-pointer">
                <span className="sr-only">Previous</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button aria-current="page" className="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-3.5 py-1.5 border text-xs font-semibold cursor-pointer">
                1
              </button>
              <button className="border-slate-200 text-slate-500 hover:bg-slate-50 relative inline-flex items-center px-3.5 py-1.5 border text-xs font-semibold transition cursor-pointer">
                2
              </button>
              <button className="border-slate-200 text-slate-500 hover:bg-slate-50 hidden md:inline-flex relative items-center px-3.5 py-1.5 border text-xs font-semibold transition cursor-pointer">
                3
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-200 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 transition cursor-pointer">
                <span className="sr-only">Next</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
