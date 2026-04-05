export default function GlowButton(text: string, href: string, isPrimary: boolean = true): string {
  const variantClass = isPrimary ? 'glow-button-primary' : 'glow-button-secondary';

  return `
    <a href="${href}" class="glow-button ${variantClass}">
      ${text}
    </a>
  `;
}
