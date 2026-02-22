import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuthContext } from '@/contexts/SupabaseAuthContext';
import { CreditCard, CheckCircle, Clock, XCircle, IndianRupee } from 'lucide-react';

interface BookingTransaction {
  id: string;
  service: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  worker: { name: string; price: string } | null;
}

const PaymentHistory = () => {
  const { user } = useSupabaseAuthContext();
  const [transactions, setTransactions] = useState<BookingTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, service, status, created_at, completed_at, worker_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
        return;
      }

      // Fetch worker names for each booking
      const workerIds = [...new Set((data || []).map(b => b.worker_id))];
      const { data: workers } = await supabase
        .from('workers_public')
        .select('id, name, price')
        .in('id', workerIds);

      const workerMap = new Map(workers?.map(w => [w.id, w]) || []);

      setTransactions(
        (data || []).map(b => ({
          id: b.id,
          service: b.service,
          status: b.status,
          created_at: b.created_at,
          completed_at: b.completed_at,
          worker: workerMap.get(b.worker_id) ? {
            name: workerMap.get(b.worker_id)!.name!,
            price: workerMap.get(b.worker_id)!.price!,
          } : null,
        }))
      );
      setLoading(false);
    };

    fetchTransactions();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-accent" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Paid';
      case 'cancelled': return 'Cancelled';
      case 'confirmed':
      case 'in_progress': return 'Pending';
      default: return 'Awaiting';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-primary/10 text-primary';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-accent/10 text-accent';
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Payment History
        </h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-primary" />
        Payment History
      </h3>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <IndianRupee className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No transactions yet</p>
          <p className="text-xs text-muted-foreground mt-1">Your payment history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center shrink-0">
                {getStatusIcon(tx.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{tx.service}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {tx.worker?.name || 'Worker'} · {new Date(tx.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-foreground text-sm">{tx.worker?.price || '—'}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusClass(tx.status)}`}>
                  {getStatusLabel(tx.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
