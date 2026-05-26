import { useState, useCallback } from 'react';
import { toolsApi } from '@/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Copy, RefreshCw, Wand2 } from 'lucide-react';
import { copyToClipboard } from '@/utils';
import toast from 'react-hot-toast';
import { cn } from '@/utils';

function StrengthBar({ password }: { password: string }) {
  const score = getScore(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500'];
  return (
    <div>
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-all', i <= score ? colors[score] : 'bg-slate-700')} />
        ))}
      </div>
      {password && <p className="text-xs text-slate-400">{labels[score]}</p>}
    </div>
  );
}

function getScore(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z\d]/.test(pw)) s++;
  return Math.min(s, 5);
}

interface ToggleProps { label: string; checked: boolean; onChange: (v: boolean) => void; }
function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-2">
      <span className="text-sm text-slate-300">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn('relative w-10 h-5 rounded-full transition-colors', checked ? 'bg-primary-600' : 'bg-slate-600')}
      >
        <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </label>
  );
}

export default function GeneratorPage() {
  const [options, setOptions] = useState({
    length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true, avoidSimilar: false,
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function set(k: string) {
    return (v: boolean | number) => setOptions(o => ({ ...o, [k]: v }));
  }

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const r = await toolsApi.generatePassword(options);
      setPassword(r.data.password);
    } catch { toast.error('Generation failed'); }
    finally { setLoading(false); }
  }, [options]);

  async function handleCopy() {
    await copyToClipboard(password);
    toast.success('Copied! Clears in 20s');
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card title="Password Generator">
        {/* Generated password display */}
        <div className="bg-dark-950 border border-slate-700 rounded-xl p-4 mb-4 min-h-[60px] flex items-center justify-between gap-3">
          <span className="font-mono text-base text-white break-all flex-1">
            {password || <span className="text-slate-500">Click Generate…</span>}
          </span>
          {password && (
            <button onClick={handleCopy} className="text-slate-400 hover:text-primary-400 transition-colors flex-shrink-0">
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>

        {password && <StrengthBar password={password} />}

        {/* Length slider */}
        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-300">Length</span>
            <span className="text-sm font-mono text-primary-400">{options.length}</span>
          </div>
          <input
            type="range" min={6} max={64} value={options.length}
            onChange={e => set('length')(parseInt(e.target.value))}
            className="w-full accent-primary-500"
          />
        </div>

        {/* Toggles */}
        <div className="mt-4 divide-y divide-slate-800">
          <Toggle label="Uppercase (A–Z)"   checked={options.uppercase}    onChange={set('uppercase')} />
          <Toggle label="Lowercase (a–z)"   checked={options.lowercase}    onChange={set('lowercase')} />
          <Toggle label="Numbers (0–9)"     checked={options.numbers}      onChange={set('numbers')} />
          <Toggle label="Symbols (!@#$…)"   checked={options.symbols}      onChange={set('symbols')} />
          <Toggle label="Avoid similar chars (0,O,1,l)" checked={options.avoidSimilar} onChange={set('avoidSimilar')} />
        </div>

        <div className="flex gap-3 mt-6">
          <Button className="flex-1 justify-center" loading={loading} icon={<Wand2 className="w-4 h-4" />} onClick={generate}>
            Generate
          </Button>
          {password && (
            <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={generate} loading={loading}>
              Regenerate
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
