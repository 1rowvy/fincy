import { ArrowLeftRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { AccountCard } from '../components/accounts/AccountCard';
import { AccountForm, toAccountInput, type AccountFormValues } from '../components/accounts/AccountForm';
import { TransferForm } from '../components/accounts/TransferForm';
import { Button } from '../components/ui/Button';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import {
  useAccounts,
  useArchiveAccount,
  useCreateAccount,
  useCreateTransfer,
  useUpdateAccount,
} from '../hooks/useAccounts';
import { useSettings } from '../hooks/useSettings';
import type { AccountWithBalance } from '../types';

export function AccountsPage() {
  const { data: accounts = [] } = useAccounts();
  const { data: settings } = useSettings();
  const currency = settings?.currency ?? 'RUB';

  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const archiveAccount = useArchiveAccount();
  const createTransfer = useCreateTransfer();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AccountWithBalance | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);

  const handleCreate = (values: AccountFormValues) => {
    createAccount.mutate(toAccountInput(values), { onSuccess: () => setCreating(false) });
  };

  const handleUpdate = (values: AccountFormValues) => {
    if (!editing) return;
    updateAccount.mutate({ id: editing.id, input: toAccountInput(values) }, { onSuccess: () => setEditing(null) });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end gap-2">
        <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">
              <ArrowLeftRight size={15} /> Перевод
            </Button>
          </DialogTrigger>
          <DialogContent title="Перевод между счетами">
            <TransferForm
              submitting={createTransfer.isPending}
              onCancel={() => setTransferOpen(false)}
              onSubmit={(values) => createTransfer.mutate(values, { onSuccess: () => setTransferOpen(false) })}
            />
          </DialogContent>
        </Dialog>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={15} /> Счёт
            </Button>
          </DialogTrigger>
          <DialogContent title="Новый счёт">
            <AccountForm submitting={createAccount.isPending} onCancel={() => setCreating(false)} onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <p className="text-sm text-ink-muted">Пока нет счетов — добавьте первый, чтобы начать учёт.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              currency={currency}
              onEdit={() => setEditing(account)}
              onArchive={() => archiveAccount.mutate(account.id)}
            />
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent title="Изменить счёт">
          {editing && (
            <AccountForm
              initial={editing}
              submitting={updateAccount.isPending}
              onCancel={() => setEditing(null)}
              onSubmit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
