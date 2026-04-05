type ToastType = 'success' | 'error' | 'warning';

type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  isPublished: boolean;
  isFeatured: boolean;
  thumbnailUrl?: string;
  publishedDate?: string;
  createdDate: string;
  readTime: number;
  views: number;
};

type BlogManagerOptions = {
  adminFetch: (url: string, options?: RequestInit) => Promise<Response>;
  showToast: (message: string, type: ToastType) => void;
  escapeHtml: (value: string) => string;
};

type BlogFilter = 'all' | 'published' | 'draft';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

function parseMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>');
}

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function setupBlogManager(options: BlogManagerOptions): void {
  const panel = document.querySelector<HTMLElement>('[data-panel="blog"]');
  if (!panel) return;

  panel.innerHTML = `
    <article class="blog-manager-card">
      <div id="blog-list-view" class="blog-list-view">
        <div class="blog-topbar">
          <h2>Blog & Writeups</h2>
          <button id="blog-add-btn" class="admin-btn primary" type="button">＋ Add New Post</button>
        </div>

        <div class="blog-filter-row">
          <button class="blog-filter active" data-filter="all" type="button">All</button>
          <button class="blog-filter" data-filter="published" type="button">Published <span id="blog-published-count">0</span></button>
          <button class="blog-filter" data-filter="draft" type="button">Drafts <span id="blog-draft-count">0</span></button>
          <select id="blog-category-filter" class="blog-category-filter">
            <option value="all">All Categories</option>
          </select>
        </div>

        <div id="blog-loading" class="loading-skeleton blog-skeleton"></div>
        <div id="blog-error" class="error-state hidden">
          <p>Failed to load blog posts.</p>
          <button id="blog-retry" class="admin-btn" type="button">Retry</button>
        </div>
        <div id="blog-list" class="blog-post-list hidden"></div>
      </div>

      <div id="blog-editor-view" class="blog-editor-view hidden"></div>
    </article>

    <div id="blog-view-modal" class="admin-modal hidden" role="dialog" aria-modal="true" aria-label="View blog post">
      <div class="admin-modal-card blog-view-modal-card">
        <button id="blog-modal-close" class="admin-btn" type="button">Close</button>
        <div id="blog-modal-content"></div>
      </div>
    </div>
  `;

  const listView = panel.querySelector<HTMLElement>('#blog-list-view');
  const editorView = panel.querySelector<HTMLElement>('#blog-editor-view');
  const listRoot = panel.querySelector<HTMLElement>('#blog-list');
  const loading = panel.querySelector<HTMLElement>('#blog-loading');
  const error = panel.querySelector<HTMLElement>('#blog-error');
  const retry = panel.querySelector<HTMLButtonElement>('#blog-retry');
  const addButton = panel.querySelector<HTMLButtonElement>('#blog-add-btn');
  const categoryFilterSelect = panel.querySelector<HTMLSelectElement>('#blog-category-filter');
  const publishedCount = panel.querySelector<HTMLElement>('#blog-published-count');
  const draftCount = panel.querySelector<HTMLElement>('#blog-draft-count');
  const modal = panel.querySelector<HTMLElement>('#blog-view-modal');
  const modalContent = panel.querySelector<HTMLElement>('#blog-modal-content');
  const modalClose = panel.querySelector<HTMLButtonElement>('#blog-modal-close');

  let posts: BlogPost[] = [];
  let currentFilter: BlogFilter = 'all';
  let categoryFilter = 'all';
  let editingPost: BlogPost | null = null;
  let tagsState: string[] = [];
  let pendingThumbnailFile: File | null = null;
  let pendingThumbnailObjectUrl: string | null = null;

  function closeModal(): void {
    modal?.classList.add('hidden');
    if (modalContent) modalContent.innerHTML = '';
  }

  function openModal(post: BlogPost): void {
    if (!modal || !modalContent) return;
    const source = options.escapeHtml(post.content || '');
    modalContent.innerHTML = `
      <h2>${options.escapeHtml(post.title)}</h2>
      <p class="blog-modal-meta">${options.escapeHtml(post.category)} • ${new Date(post.createdDate).toLocaleDateString()} • ${post.readTime} min • 👁 ${post.views}</p>
      <article class="blog-markdown-render">${parseMarkdown(source)}</article>
    `;
    modal.classList.remove('hidden');
  }

  function buildEditor(post?: BlogPost): void {
    if (!editorView || !listView) return;

    editingPost = post ?? null;
    tagsState = post?.tags ? [...post.tags] : [];
    pendingThumbnailFile = null;
    if (pendingThumbnailObjectUrl) {
      URL.revokeObjectURL(pendingThumbnailObjectUrl);
      pendingThumbnailObjectUrl = null;
    }

    editorView.innerHTML = `
      <div class="blog-editor-card">
        <button id="blog-back-btn" class="admin-btn" type="button">← Back to list</button>

        <div class="admin-field">
          <input id="blog-title-input" type="text" placeholder=" " value="${options.escapeHtml(post?.title ?? '')}" />
          <label for="blog-title-input">Title</label>
        </div>
        <p id="blog-slug-preview" class="blog-slug-preview">slug: ${options.escapeHtml(post?.slug ?? '')}</p>

        <div class="admin-field">
          <select id="blog-category-input">
            ${['CTF Writeup', 'Security Research', 'Tool Review', 'Tutorial', 'Other'].map((item) => `<option value="${item}" ${post?.category === item ? 'selected' : ''}>${item}</option>`).join('')}
          </select>
          <label class="select-label" for="blog-category-input">Category</label>
        </div>

        <div class="typing-manager">
          <h3>Tags</h3>
          <div id="blog-tags-list" class="typing-tags"></div>
          <div class="typing-input-row">
            <input id="blog-tag-input" type="text" placeholder="Press Enter or comma to add tag" />
          </div>
        </div>

        <div class="admin-field">
          <textarea id="blog-excerpt-input" rows="3" maxlength="200" placeholder=" ">${options.escapeHtml(post?.excerpt ?? '')}</textarea>
          <label for="blog-excerpt-input">Excerpt</label>
          <small id="blog-excerpt-count" class="char-count">0 / 200</small>
        </div>

        <div class="blog-content-head">
          <h3>Content</h3>
          <button id="blog-preview-toggle" class="admin-btn" type="button">Toggle Preview</button>
        </div>
        <div class="admin-field">
          <textarea id="blog-content-input" rows="14" class="blog-content-textarea" placeholder=" ">${options.escapeHtml(post?.content ?? '')}</textarea>
          <label for="blog-content-input">Markdown Content</label>
        </div>
        <div id="blog-markdown-preview" class="blog-markdown-preview hidden"></div>

        <p id="blog-content-stats" class="blog-content-stats">Word count: 0 • Estimated read time: 1 min</p>

        <div class="blog-thumbnail-block">
          <p class="blog-thumbnail-title">Thumbnail</p>
          <div id="blog-thumbnail-preview" class="blog-thumbnail-preview">
            ${post?.thumbnailUrl ? `<img src="${options.escapeHtml(post.thumbnailUrl)}" alt="${options.escapeHtml(post.title)} thumbnail" />` : '<span>No thumbnail selected</span>'}
          </div>
          <div class="blog-thumbnail-actions">
            <button id="blog-thumbnail-select" class="admin-btn" type="button">Choose Thumbnail</button>
            <button id="blog-thumbnail-clear" class="admin-btn" type="button">Clear</button>
          </div>
          <p id="blog-thumbnail-name" class="blog-thumbnail-name">${post?.thumbnailUrl ? 'Using saved thumbnail' : 'No file selected.'}</p>
          <input id="blog-thumbnail-input" type="file" accept="image/png,image/jpeg,image/webp" hidden />
        </div>

        <label class="switch-row" for="blog-published-input">
          <span>Published</span>
          <input id="blog-published-input" type="checkbox" ${post?.isPublished ? 'checked' : ''} />
        </label>

        <label class="switch-row" for="blog-featured-input">
          <span>Featured on Frontend</span>
          <input id="blog-featured-input" type="checkbox" ${post?.isFeatured ? 'checked' : ''} />
        </label>

        <div class="blog-editor-actions">
          <button id="blog-save-draft" class="admin-btn" type="button">Save Draft</button>
          <button id="blog-publish" class="admin-btn primary" type="button">Publish</button>
        </div>
      </div>
    `;

    listView.classList.add('hidden');
    editorView.classList.remove('hidden');

    const titleInput = editorView.querySelector<HTMLInputElement>('#blog-title-input');
    const slugPreview = editorView.querySelector<HTMLElement>('#blog-slug-preview');
    const excerptInput = editorView.querySelector<HTMLTextAreaElement>('#blog-excerpt-input');
    const excerptCount = editorView.querySelector<HTMLElement>('#blog-excerpt-count');
    const contentInput = editorView.querySelector<HTMLTextAreaElement>('#blog-content-input');
    const contentStats = editorView.querySelector<HTMLElement>('#blog-content-stats');
    const previewToggle = editorView.querySelector<HTMLButtonElement>('#blog-preview-toggle');
    const previewNode = editorView.querySelector<HTMLElement>('#blog-markdown-preview');
    const tagInput = editorView.querySelector<HTMLInputElement>('#blog-tag-input');
    const thumbnailInput = editorView.querySelector<HTMLInputElement>('#blog-thumbnail-input');
    const thumbnailPreview = editorView.querySelector<HTMLElement>('#blog-thumbnail-preview');
    const thumbnailName = editorView.querySelector<HTMLElement>('#blog-thumbnail-name');

    const renderTags = (): void => {
      const tagList = editorView.querySelector<HTMLElement>('#blog-tags-list');
      if (!tagList) return;
      tagList.innerHTML = tagsState.map((tag, index) => `
        <span class="typing-tag">${options.escapeHtml(tag)} <button type="button" class="typing-tag-remove" data-tag-index="${index}">✕</button></span>
      `).join('');

      tagList.querySelectorAll<HTMLButtonElement>('[data-tag-index]').forEach((button) => {
        button.addEventListener('click', () => {
          const index = Number(button.dataset.tagIndex ?? '-1');
          if (index < 0) return;
          tagsState = tagsState.filter((_item, i) => i !== index);
          renderTags();
        });
      });
    };

    const updateLiveStats = (): void => {
      const title = titleInput?.value.trim() ?? '';
      if (slugPreview) {
        slugPreview.textContent = `slug: ${generateSlug(title)}`;
      }

      const excerptLength = excerptInput?.value.length ?? 0;
      if (excerptCount) {
        excerptCount.textContent = `${excerptLength} / 200`;
      }

      const content = contentInput?.value ?? '';
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      if (contentStats) {
        contentStats.textContent = `Word count: ${wordCount} • Estimated read time: ${estimateReadTime(content)} min`;
      }

      if (previewNode && !previewNode.classList.contains('hidden')) {
        previewNode.innerHTML = parseMarkdown(options.escapeHtml(content));
      }
    };

    const addTagFromInput = (): void => {
      const raw = tagInput?.value.trim() ?? '';
      const cleaned = raw.replace(/,+$/, '').trim();
      if (!cleaned) return;
      if (!tagsState.includes(cleaned)) {
        tagsState.push(cleaned);
      }
      if (tagInput) tagInput.value = '';
      renderTags();
    };

    titleInput?.addEventListener('input', updateLiveStats);
    excerptInput?.addEventListener('input', updateLiveStats);
    contentInput?.addEventListener('input', updateLiveStats);

    tagInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        addTagFromInput();
      }
    });

    tagInput?.addEventListener('blur', () => addTagFromInput());

    editorView.querySelector<HTMLButtonElement>('#blog-thumbnail-select')?.addEventListener('click', () => {
      thumbnailInput?.click();
    });

    editorView.querySelector<HTMLButtonElement>('#blog-thumbnail-clear')?.addEventListener('click', () => {
      pendingThumbnailFile = null;
      if (pendingThumbnailObjectUrl) {
        URL.revokeObjectURL(pendingThumbnailObjectUrl);
        pendingThumbnailObjectUrl = null;
      }

      if (thumbnailInput) {
        thumbnailInput.value = '';
      }

      if (thumbnailPreview) {
        if (editingPost?.thumbnailUrl) {
          thumbnailPreview.innerHTML = `<img src="${options.escapeHtml(editingPost.thumbnailUrl)}" alt="${options.escapeHtml(editingPost.title)} thumbnail" />`;
        } else {
          thumbnailPreview.innerHTML = '<span>No thumbnail selected</span>';
        }
      }

      if (thumbnailName) {
        thumbnailName.textContent = editingPost?.thumbnailUrl ? 'Using saved thumbnail' : 'No file selected.';
      }
    });

    thumbnailInput?.addEventListener('change', () => {
      const file = thumbnailInput.files?.[0];
      if (!file) return;

      pendingThumbnailFile = file;
      if (pendingThumbnailObjectUrl) {
        URL.revokeObjectURL(pendingThumbnailObjectUrl);
      }
      pendingThumbnailObjectUrl = URL.createObjectURL(file);

      if (thumbnailPreview) {
        thumbnailPreview.innerHTML = `<img src="${pendingThumbnailObjectUrl}" alt="Selected thumbnail" />`;
      }
      if (thumbnailName) {
        thumbnailName.textContent = file.name;
      }
    });

    previewToggle?.addEventListener('click', () => {
      if (!previewNode || !contentInput) return;
      previewNode.classList.toggle('hidden');
      if (!previewNode.classList.contains('hidden')) {
        previewNode.innerHTML = parseMarkdown(options.escapeHtml(contentInput.value));
      }
    });

    editorView.querySelector<HTMLButtonElement>('#blog-back-btn')?.addEventListener('click', () => {
      editorView.classList.add('hidden');
      listView.classList.remove('hidden');
      editingPost = null;
      tagsState = [];
      pendingThumbnailFile = null;
      if (pendingThumbnailObjectUrl) {
        URL.revokeObjectURL(pendingThumbnailObjectUrl);
        pendingThumbnailObjectUrl = null;
      }
    });

    editorView.querySelector<HTMLButtonElement>('#blog-save-draft')?.addEventListener('click', () => {
      void savePost(false);
    });

    editorView.querySelector<HTMLButtonElement>('#blog-publish')?.addEventListener('click', () => {
      void savePost(true);
    });

    renderTags();
    updateLiveStats();
  }

  function filteredPosts(): BlogPost[] {
    let rows = [...posts];

    if (currentFilter === 'published') {
      rows = rows.filter((post) => post.isPublished);
    }
    if (currentFilter === 'draft') {
      rows = rows.filter((post) => !post.isPublished);
    }

    if (categoryFilter !== 'all') {
      rows = rows.filter((post) => post.category === categoryFilter);
    }

    return rows;
  }

  function renderList(): void {
    if (!listRoot || !categoryFilterSelect) return;

    const published = posts.filter((post) => post.isPublished).length;
    const drafts = posts.length - published;
    if (publishedCount) publishedCount.textContent = String(published);
    if (draftCount) draftCount.textContent = String(drafts);

    const categories = Array.from(new Set(posts.map((post) => post.category).filter(Boolean))).sort();
    categoryFilterSelect.innerHTML = `<option value="all">All Categories</option>${categories.map((item) => `<option value="${options.escapeHtml(item)}" ${item === categoryFilter ? 'selected' : ''}>${options.escapeHtml(item)}</option>`).join('')}`;

    const rows = filteredPosts();
    if (rows.length === 0) {
      listRoot.innerHTML = '<div class="empty-state">No posts yet. Click Add New Post to start writing.</div>';
      return;
    }

    listRoot.innerHTML = rows.map((post) => `
      <article class="blog-post-card">
        ${post.thumbnailUrl ? `<img class="blog-post-thumb" src="${options.escapeHtml(post.thumbnailUrl)}" alt="${options.escapeHtml(post.title)} thumbnail" />` : ''}
        <button class="blog-post-title-link" data-view-id="${post._id}" type="button">${options.escapeHtml(post.title)}</button>
        <div class="blog-post-meta">
          <span class="blog-category">${options.escapeHtml(post.category || 'Other')}</span>
          <span class="blog-badge ${post.isPublished ? 'published' : 'draft'}">${post.isPublished ? 'Published' : 'Draft'}</span>
          <span class="blog-badge ${post.isFeatured ? 'featured' : 'not-featured'}">${post.isFeatured ? 'Featured' : 'Not Featured'}</span>
          <span>${new Date(post.createdDate).toLocaleDateString()}</span>
          <span>👁 ${post.views}</span>
          <span>⏱ ${post.readTime} min</span>
        </div>
        <p class="blog-post-excerpt">${options.escapeHtml(post.excerpt || '')}</p>
        <div class="blog-post-actions">
          <button class="admin-btn" data-edit-id="${post._id}" type="button">Edit</button>
          <button class="admin-btn danger" data-delete-id="${post._id}" type="button">Delete</button>
          <button class="admin-btn" data-publish-id="${post._id}" type="button">${post.isPublished ? 'Unpublish' : 'Publish'}</button>
          <button class="admin-btn" data-feature-id="${post._id}" type="button">${post.isFeatured ? 'Unfeature' : 'Feature'}</button>
        </div>
      </article>
    `).join('');

    listRoot.querySelectorAll<HTMLButtonElement>('[data-view-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.viewId;
        const post = posts.find((item) => item._id === id);
        if (post) openModal(post);
      });
    });

    listRoot.querySelectorAll<HTMLButtonElement>('[data-edit-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.editId;
        const post = posts.find((item) => item._id === id);
        if (post) buildEditor(post);
      });
    });

    listRoot.querySelectorAll<HTMLButtonElement>('[data-delete-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.deleteId;
        if (!id) return;
        void deletePost(id);
      });
    });

    listRoot.querySelectorAll<HTMLButtonElement>('[data-publish-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.publishId;
        if (!id) return;
        void togglePublish(id);
      });
    });

    listRoot.querySelectorAll<HTMLButtonElement>('[data-feature-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.featureId;
        if (!id) return;
        void toggleFeatured(id);
      });
    });
  }

  async function uploadThumbnail(postId: string, file: File): Promise<boolean> {
    const formData = new FormData();
    formData.append('thumbnail', file);

    const response = await options.adminFetch(`/api/blog/${postId}/thumbnail`, {
      method: 'POST',
      body: formData
    });

    return response.ok;
  }

  async function loadPosts(): Promise<void> {
    loading?.classList.remove('hidden');
    error?.classList.add('hidden');
    listRoot?.classList.add('hidden');

    try {
      const response = await options.adminFetch('/api/blog/admin');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch blog posts`);
      }

      const payload = (await response.json()) as { posts?: BlogPost[] };
      if (!Array.isArray(payload.posts)) {
        console.warn('Blog posts not an array, using empty array');
      }
      posts = payload.posts ?? [];
      renderList();
      loading?.classList.add('hidden');
      listRoot?.classList.remove('hidden');
    } catch (err) {
      console.error('Blog load error:', err);
      loading?.classList.add('hidden');
      error?.classList.remove('hidden');
    }
  }

  async function savePost(forcePublish: boolean): Promise<void> {
    if (!editorView) return;

    const title = editorView.querySelector<HTMLInputElement>('#blog-title-input')?.value.trim() ?? '';
    const category = editorView.querySelector<HTMLSelectElement>('#blog-category-input')?.value ?? 'Other';
    const excerpt = editorView.querySelector<HTMLTextAreaElement>('#blog-excerpt-input')?.value.trim() ?? '';
    const content = editorView.querySelector<HTMLTextAreaElement>('#blog-content-input')?.value ?? '';
    const publishToggle = editorView.querySelector<HTMLInputElement>('#blog-published-input')?.checked ?? false;
    const featuredToggle = editorView.querySelector<HTMLInputElement>('#blog-featured-input')?.checked ?? false;

    if (!title) {
      options.showToast('Title is required.', 'error');
      return;
    }

    const payload = {
      title,
      category,
      excerpt,
      content,
      tags: tagsState,
      isPublished: forcePublish || publishToggle,
      isFeatured: featuredToggle
    };

    const endpoint = editingPost ? `/api/blog/${editingPost._id}` : '/api/blog';
    const method = editingPost ? 'PUT' : 'POST';

    try {
      const response = await options.adminFetch(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        options.showToast('Failed to save post.', 'error');
        return;
      }

      const result = (await response.json()) as { post?: BlogPost };
      const savedId = result.post?._id;

      if (pendingThumbnailFile && savedId) {
        const uploaded = await uploadThumbnail(savedId, pendingThumbnailFile);
        if (!uploaded) {
          options.showToast('Post saved, but thumbnail upload failed.', 'warning');
        }
      }

      options.showToast(forcePublish ? 'Post published successfully.' : 'Draft saved successfully.', 'success');
      editorView.classList.add('hidden');
      listView?.classList.remove('hidden');
      editingPost = null;
      tagsState = [];
      pendingThumbnailFile = null;
      if (pendingThumbnailObjectUrl) {
        URL.revokeObjectURL(pendingThumbnailObjectUrl);
        pendingThumbnailObjectUrl = null;
      }
      await loadPosts();
    } catch {
      options.showToast('Failed to save post.', 'error');
    }
  }

  async function deletePost(id: string): Promise<void> {
    if (!window.confirm('Delete this post?')) return;

    try {
      const response = await options.adminFetch(`/api/blog/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        options.showToast('Failed to delete post.', 'error');
        return;
      }
      options.showToast('Post deleted.', 'success');
      await loadPosts();
    } catch {
      options.showToast('Failed to delete post.', 'error');
    }
  }

  async function togglePublish(id: string): Promise<void> {
    try {
      const response = await options.adminFetch(`/api/blog/${id}/publish`, {
        method: 'PATCH'
      });
      if (!response.ok) {
        options.showToast('Failed to update publish state.', 'error');
        return;
      }
      options.showToast('Publish status updated.', 'success');
      await loadPosts();
    } catch {
      options.showToast('Failed to update publish state.', 'error');
    }
  }

  async function toggleFeatured(id: string): Promise<void> {
    try {
      const response = await options.adminFetch(`/api/blog/${id}/featured`, {
        method: 'PATCH'
      });
      if (!response.ok) {
        options.showToast('Failed to update featured state.', 'error');
        return;
      }
      options.showToast('Featured status updated.', 'success');
      await loadPosts();
    } catch {
      options.showToast('Failed to update featured state.', 'error');
    }
  }

  panel.querySelectorAll<HTMLButtonElement>('.blog-filter').forEach((button) => {
    button.addEventListener('click', () => {
      currentFilter = (button.dataset.filter as BlogFilter) ?? 'all';
      panel.querySelectorAll<HTMLButtonElement>('.blog-filter').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      renderList();
    });
  });

  categoryFilterSelect?.addEventListener('change', () => {
    categoryFilter = categoryFilterSelect.value;
    renderList();
  });

  addButton?.addEventListener('click', () => {
    buildEditor();
  });

  retry?.addEventListener('click', () => {
    void loadPosts();
  });

  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  void loadPosts();
}
