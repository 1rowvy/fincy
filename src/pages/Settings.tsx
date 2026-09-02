import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { Field, Input, NativeSelect } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Switch } from '../components/ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import {
  useArchiveCategory,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from '../hooks/useCategories';
import { useCreateTag, useDeleteTag, useTags } from '../hooks/useTags';
import { useSetSetting, useSettings } from '../hooks/useSettings';
import { useTheme } from '../lib/theme';
import { ICON_KEYS, getIcon } from '../lib/icons';
import type { Category, TxType } from '../types';
import { isAutostartEnabled, setAutostart } from '../lib/autostart';

const CURRENCIES = [
  { value: 'RUB', label: '₽ Российский рубль' },
  { value: 'USD', label: '$ Доллар США' },
  { value: 'EUR', label: '€ Евро' },
];

const CATEGORY_COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#eab308', '#06b6d4', '#64748b', '#ef4444'];

function CategoryEditor({
  initial,
  onDone,
}: {
  initial?: Category;
  onDone: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<TxType>(initial?.type ?? 'expense');
  const [icon, setIcon] = useState(initial?.icon ?? 'circle');
  const [color, setColor] = useState(initial?.color ?? CATEGORY_COLORS[0]);
  const create = useCreateCategory();
  const update = useUpdateCategory();

  const handleSave = () => {
    if (!name.trim()) return;
    const input = { name: name.trim(), type, icon, color };
    if (initial) {
      update.mutate({ id: initial.id, input }, { onSuccess: onDone });
    } else {
      create.mutate(input, { onSuccess: onDone });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label="Название">
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <Tabs value={type} onValueChange={(v) => setType(v as TxType)}>
        <TabsList className="w-full">
          <TabsTrigger value="expense" className="flex-1">
            Расход
          </TabsTrigger>
          <TabsTrigger value="income" className="flex-1">
            Доход
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div>
        <div className="mb-1.5 text-xs font-medium text-ink-secondary">Цвет</div>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className="h-7 w-7 rounded-full"
              style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1.5 text-xs font-medium text-ink-secondary">Иконка</div>
        <div className="grid grid-cols-8 gap-2">
          {ICON_KEYS.map((key) => {
            const Icon = getIcon(key);
            return (
              <button
                type="button"
                key={key}
                onClick={() => setIcon(key)}
                className={
                  icon === key
                    ? 'flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-ink'
                    : 'flex h-8 w-8 items-center justify-center rounded-lg bg-surface-card-hover text-ink-secondary'
                }
              >
                <Icon size={15} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          Отмена
        </Button>
        <Button onClick={handleSave}>Сохранить</Button>
      </div>
    </div>
  );
}

function CategoriesTab() {
  const { data: categories = [] } = useCategories();
  const archive = useArchiveCategory();
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  const expense = categories.filter((c) => c.type === 'expense');
  const income = categories.filter((c) => c.type === 'income');

  const renderGroup = (title: string, list: Category[]) => (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{title}</div>
      <div className="flex flex-col gap-1.5">
        {list.map((c) => {
          const Icon = getIcon(c.icon);
          return (
            <div key={c.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-card-hover">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ backgroundColor: `${c.color}22`, color: c.color }}
              >
                <Icon size={14} />
              </span>
              <span className="flex-1 text-sm text-ink-primary">{c.name}</span>
              <button
                type="button"
                onClick={() => setEditing(c)}
                className="text-xs font-medium text-accent hover:underline"
              >
                Изменить
              </button>
              <Button variant="ghost" size="icon" onClick={() => archive.mutate(c.id)} aria-label="Архивировать">
                <Trash2 size={14} />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary">
              <Plus size={14} /> Категория
            </Button>
          </DialogTrigger>
          <DialogContent title="Новая категория">
            <CategoryEditor onDone={() => setCreating(false)} />
          </DialogContent>
        </Dialog>
      </div>
      {renderGroup('Расходы', expense)}
      {renderGroup('Доходы', income)}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent title="Категория">
          {editing && <CategoryEditor initial={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TagsTab() {
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const [name, setName] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input placeholder="Новый тег" value={name} onChange={(e) => setName(e.target.value)} />
        <Button
          variant="secondary"
          onClick={() => {
            if (name.trim()) {
              createTag.mutate({ name: name.trim() });
              setName('');
            }
          }}
        >
          <Plus size={14} /> Добавить
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag.id} className="flex items-center gap-1.5 rounded-full bg-surface-card-hover px-3 py-1.5 text-sm text-ink-primary">
            {tag.name}
            <button type="button" onClick={() => deleteTag.mutate(tag.id)} className="text-ink-muted hover:text-status-critical">
              <Trash2 size={12} />
            </button>
          </span>
        ))}
        {tags.length === 0 && <p className="text-sm text-ink-muted">Тегов пока нет</p>}
      </div>
    </div>
  );
}

function GeneralTab() {
  const { data: settings } = useSettings();
  const setSetting = useSetSetting();
  const { theme, toggleTheme } = useTheme();
  const [autostart, setAutostartState] = useState(false);

  useEffect(() => {
    isAutostartEnabled().then(setAutostartState);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-ink-primary">Валюта</div>
          <div className="text-xs text-ink-muted">Используется для форматирования всех сумм</div>
        </div>
        <div className="w-56">
          <Select
            value={settings?.currency ?? 'RUB'}
            onValueChange={(v) => setSetting.mutate({ key: 'currency', value: v })}
            options={CURRENCIES}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-ink-primary">Тёмная тема</div>
          <div className="text-xs text-ink-muted">Переключить оформление приложения</div>
        </div>
        <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-ink-primary">Запускать при входе в систему</div>
          <div className="text-xs text-ink-muted">
            Fincy стартует вместе с Windows и сворачивается в трей — нужно для надёжной работы напоминаний
          </div>
        </div>
        <Switch
          checked={autostart}
          onCheckedChange={async (v) => {
            await setAutostart(v);
            setAutostartState(v);
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-ink-primary">Напоминать о платежах за</div>
          <div className="text-xs text-ink-muted">Количество дней до списания</div>
        </div>
        <div className="w-24">
          <NativeSelect
            value={settings?.recurring_reminder_lead_days ?? '3'}
            onChange={(e) => setSetting.mutate({ key: 'recurring_reminder_lead_days', value: e.target.value })}
          >
            {[1, 2, 3, 5, 7, 14].map((n) => (
              <option key={n} value={n}>
                {n} дн.
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Tabs defaultValue="general">
        <TabsList className="mb-5">
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
          <TabsTrigger value="tags">Теги</TabsTrigger>
        </TabsList>
        <Card>
          <TabsContent value="general">
            <GeneralTab />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
          <TabsContent value="tags">
            <TagsTab />
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
