import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { formatRelative } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('pending');

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin-reports', status],
    queryFn: () => adminService.getReports({ status }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, newStatus }) => adminService.updateReport(id, newStatus),
    onSuccess: () => {
      toast.success('Report updated');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });

  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-2xl text-slate-900 mb-6">Reports</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-xl mb-6 w-fit">
        {['pending', 'resolved', 'dismissed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${status === s ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-3">✅</div>
          <p>No {status} reports</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`badge font-medium ${
                    report.reason === 'scam' ? 'bg-red-100 text-red-700' :
                    report.reason === 'spam' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    🚩 {report.reason.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{formatRelative(report.created_at)}</span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-surface-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">Reporter</p>
                  <p className="text-sm font-medium text-slate-800">{report.reporter?.full_name}</p>
                  <p className="text-xs text-slate-400">{report.reporter?.email}</p>
                </div>
                {report.listing && (
                  <div className="bg-surface-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">Reported Listing</p>
                    <p className="text-sm font-medium text-slate-800">{report.listing.title}</p>
                  </div>
                )}
                {report.reported_user && (
                  <div className="bg-surface-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">Reported User</p>
                    <p className="text-sm font-medium text-slate-800">{report.reported_user.full_name}</p>
                    <p className="text-xs text-slate-400">{report.reported_user.email}</p>
                  </div>
                )}
              </div>

              {report.description && (
                <p className="text-sm text-slate-600 bg-surface-50 rounded-xl p-3 mb-4">
                  "{report.description}"
                </p>
              )}

              {status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => updateMutation.mutate({ id: report.id, newStatus: 'resolved' })}
                    className="btn-primary text-sm flex-1 justify-center bg-emerald-600 hover:bg-emerald-700"
                  >
                    ✅ Mark Resolved
                  </button>
                  <button
                    onClick={() => updateMutation.mutate({ id: report.id, newStatus: 'dismissed' })}
                    className="btn-secondary text-sm flex-1 justify-center"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
