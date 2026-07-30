import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiPrivate } from '../../api/axios';

export default function WorkspaceInvite() {
  const { workspaceId: paramWorkspaceId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const workspaceId = paramWorkspaceId || searchParams.get('workspaceId');

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState('pending');
  const [toast, setToast] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  useEffect(() => {
    if (!workspaceId) {
      setErrorMsg('No workspace specified in invitation link.');
      setLoading(false);
      return;
    }

    const fetchWorkspaceDetails = async () => {
      try {
        setLoading(true);
        const res = await apiPrivate.get(`/workspace/${workspaceId}`);
        const wsData = res.data?.data || res.data;
        setWorkspace(wsData);
      } catch (err) {
        console.error('Error fetching workspace for invitation:', err);
        setWorkspace({
          _id: workspaceId,
          name: 'Workspace Invitation',
          description: 'You have been invited to collaborate on this workspace.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceDetails();
  }, [workspaceId]);

  const handleAcceptInvite = async () => {
    if (!workspaceId || actionLoading) return;
    setActionLoading(true);
    setErrorMsg('');

    try {
      const roleParam = searchParams.get('role');
      const joinUrl = `/workspace/${workspaceId}/join${roleParam ? `?role=${encodeURIComponent(roleParam)}` : ''}`;
      const response = await apiPrivate.get(joinUrl);
      setStatus('accepted');
      triggerToast('🎉 You have joined the workspace successfully!');
      
      setTimeout(() => {
        navigate('/dashboard/workspace');
      }, 1800);
    } catch (err) {
      console.error('Accept invite error:', err);
      const msg = err.response?.data?.message || 'Failed to accept invitation. Please try again.';
      setErrorMsg(msg);
      triggerToast(`Error: ${msg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectInvite = async () => {
    if (!workspaceId || actionLoading) return;
    setActionLoading(true);
    setErrorMsg('');

    try {
      await apiPrivate.get(`/workspace/${workspaceId}/reject`);
      setStatus('rejected');
      triggerToast('Invitation declined.');
    } catch (err) {
      console.error('Reject invite error:', err);
      const msg = err.response?.data?.message || 'Failed to reject invitation.';
      setErrorMsg(msg);
      triggerToast(`Error: ${msg}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Glow FX */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold transition-all duration-300 transform translate-y-0"
          style={{
            background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(99, 102, 241, 0.2)',
          }}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          {toast}
        </div>
      )}

      {/* Header Logo Brand */}
      <div className="mb-8 flex items-center gap-3 z-10">
        <div
          className="h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-2xl font-black tracking-tight text-white">
          Pulse<span className="text-indigo-400">PM</span>
        </span>
      </div>

      {/* Main Invitation Card */}
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl z-10 transition-all">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <p className="text-sm font-medium text-slate-400">Loading workspace invitation...</p>
          </div>
        ) : status === 'accepted' ? (
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Invitation Accepted!</h2>
              <p className="text-sm text-slate-400 mt-2">
                You are now a member of <span className="font-semibold text-white">{workspace?.name || 'the workspace'}</span>.
              </p>
            </div>
            <div className="pt-3">
              <Link
                to="/dashboard/workspace"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                Go to Workspace →
              </Link>
            </div>
          </div>
        ) : status === 'rejected' ? (
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="mx-auto h-20 w-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Invitation Declined</h2>
              <p className="text-sm text-slate-400 mt-2">
                You have declined the invitation to join <span className="font-semibold text-white">{workspace?.name || 'this workspace'}</span>.
              </p>
            </div>
            <div className="pt-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header / Workspace Identity */}
            <div className="text-center space-y-3">
              <div
                className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-xl"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
              >
                {workspace?.name ? workspace.name.substring(0, 2).toUpperCase() : 'WS'}
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Workspace Invitation
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white">
                {workspace?.name || 'Workspace Invitation'}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                {workspace?.description || 'You have been invited to join and collaborate on projects in this workspace.'}
              </p>
            </div>

            {/* Owner Details Card if available */}
            {workspace?.owner && (
              <div className="bg-slate-850/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
                  {(workspace.owner.firstName || workspace.owner.username || 'Owner').substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left text-xs">
                  <p className="text-slate-400 font-medium">Invited by Owner</p>
                  <p className="text-slate-200 font-bold">
                    {workspace.owner.firstName
                      ? `${workspace.owner.firstName} ${workspace.owner.lastName || ''}`
                      : workspace.owner.username || workspace.owner.email}
                  </p>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm flex items-start gap-3">
                <svg className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons: Accept / Reject */}
            <div className="space-y-3 pt-2">
              <button
                id="accept-invite-btn"
                onClick={handleAcceptInvite}
                disabled={actionLoading}
                className="w-full py-3.5 px-5 rounded-2xl font-bold text-white shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {actionLoading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Accept Invitation
                  </>
                )}
              </button>

              <button
                id="reject-invite-btn"
                onClick={handleRejectInvite}
                disabled={actionLoading}
                className="w-full py-3 px-5 rounded-2xl font-semibold text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Decline Invitation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="mt-8 text-xs text-slate-500">
        Logged in to Pulse PM • <Link to="/dashboard" className="text-indigo-400 hover:underline">Go to Dashboard</Link>
      </div>
    </div>
  );
}
