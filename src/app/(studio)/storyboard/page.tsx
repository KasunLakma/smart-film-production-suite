import { Film } from "lucide-react";

export default function StoryboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-studio-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Film className="w-6 h-6 text-studio-accent" />
            16:9 Storyboard
          </h1>
          <p className="text-sm text-slate-400">
            Shot sequence visualization, camera angles, and animatic timelines.
          </p>
        </div>
      </div>
      <div className="p-8 rounded-xl bg-studio-900 border border-studio-700 text-center text-slate-400">
        16:9 Storyboard canvas initialized.
      </div>
    </div>
  );
}
