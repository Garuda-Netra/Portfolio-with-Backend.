export default function SectionContainer(id: string, content: string): string {
  return `
    <section id="${id}" class="section-container">
      <div class="max-w-7xl mx-auto">
        ${content}
      </div>
    </section>
  `;
}
