export default function ProfileImage(imageUrl: string, altText: string): string {
  const isPlaceholder = imageUrl.includes('placeholder');

  return `
    <div class="relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 mx-auto mb-12 animate-on-scroll">
      <!-- Glow ring -->
      <div class="absolute inset-0 rounded-full profile-glow" style="border: 2px solid var(--accent-cyan);"></div>

      <!-- Secondary ring -->
      <div class="absolute inset-2 rounded-full border-glow" style="border: 1px solid rgba(var(--accent-purple-rgb), 0.25);"></div>

      <!-- Image Container -->
      <div class="absolute inset-4 rounded-full overflow-hidden flex items-center justify-center" style="
          background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-card));
          border: 1px solid var(--glass-border);
        ">
        ${isPlaceholder
          ? `<svg viewBox="0 0 200 200" class="w-3/4 h-3/4" style="color: var(--text-muted); opacity: 0.25;">
               <circle cx="100" cy="75" r="35" fill="currentColor" />
               <ellipse cx="100" cy="170" rx="55" ry="48" fill="currentColor" />
             </svg>`
          : `<img src="${imageUrl}" alt="${altText}" class="w-full h-full object-cover" />`
        }
      </div>
    </div>
  `;
}
