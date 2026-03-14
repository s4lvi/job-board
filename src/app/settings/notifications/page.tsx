export default function NotificationSettingsPage() {
  return (
    <div>
      <h2 className="text-lg mb-6">Notifications</h2>

      <div className="space-y-4">
        {[
          { label: "New applications on my listings", desc: "Get notified when someone applies" },
          { label: "Application status updates", desc: "When your application is accepted or rejected" },
          { label: "Contract updates", desc: "Escrow funded, released, or disputed" },
          { label: "New messages", desc: "When you receive a new message" },
          { label: "Review received", desc: "When someone leaves a review" },
        ].map((item) => (
          <div key={item.label} className="border border-white/5 bg-surface p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">{item.label}</h3>
              <p className="text-white/40 text-xs">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-white/10 peer-checked:bg-primary rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
