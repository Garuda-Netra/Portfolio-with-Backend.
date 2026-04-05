import { API_BASE_URL } from './config';

type ToastType = 'success' | 'error' | 'warning';

type ResumeRecord = {
  _id: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  fileSize: number;
  downloadCount: number;
  isActive: boolean;
  filePath: string;
  cloudinaryPublicId?: string;
};

type ResumeManagerOptions = {
  adminFetch: (url: string, options?: RequestInit) => Promise<Response>;
  showToast: (message: string, type: ToastType) => void;
  onStatsChange?: () => void;
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function setupResumeManager(options: ResumeManagerOptions): void {
  const panel = document.querySelector<HTMLElement>('[data-panel="resume"]');
  if (!panel) return;

  panel.innerHTML = `
    <article class="resume-manager-card">
      <div class="resume-topbar">
        <h2>Resume Manager</h2>
        <button id="resume-pick-btn" class="admin-btn primary" type="button">⤴ Upload New Resume</button>
        <input id="resume-file-input" type="file" accept="application/pdf" hidden />
      </div>

      <div id="resume-loading" class="loading-skeleton resume-skeleton"></div>
      <div id="resume-error" class="error-state hidden">
        <p>Failed to load resume info.</p>
        <button id="resume-retry" class="admin-btn" type="button">Retry</button>
      </div>

      <div id="resume-selected" class="resume-selected hidden"></div>
      <div id="resume-progress-wrap" class="progress-wrap hidden" aria-hidden="true">
        <div id="resume-progress-bar" class="progress-bar"></div>
      </div>

      <div id="resume-content" class="hidden"></div>
    </article>
  `;

  const loading = panel.querySelector<HTMLElement>('#resume-loading');
  const error = panel.querySelector<HTMLElement>('#resume-error');
  const retry = panel.querySelector<HTMLButtonElement>('#resume-retry');
  const content = panel.querySelector<HTMLElement>('#resume-content');
  const fileInput = panel.querySelector<HTMLInputElement>('#resume-file-input');
  const pickButton = panel.querySelector<HTMLButtonElement>('#resume-pick-btn');
  const selectedWrap = panel.querySelector<HTMLElement>('#resume-selected');
  const progressWrap = panel.querySelector<HTMLElement>('#resume-progress-wrap');
  const progressBar = panel.querySelector<HTMLElement>('#resume-progress-bar');

  let activeResume: ResumeRecord | null = null;
  let selectedFile: File | null = null;

  function renderSelectedFile(): void {
    if (!selectedWrap) return;

    if (!selectedFile) {
      selectedWrap.classList.add('hidden');
      selectedWrap.innerHTML = '';
      return;
    }

    selectedWrap.classList.remove('hidden');
    selectedWrap.innerHTML = `
      <div class="resume-selected-info">
        <p class="resume-filename">${selectedFile.name}</p>
        <p class="resume-meta">${formatSize(selectedFile.size)}</p>
      </div>
      <button id="resume-upload-btn" class="admin-btn primary" type="button">Upload Now</button>
    `;

    const uploadBtn = selectedWrap.querySelector<HTMLButtonElement>('#resume-upload-btn');
    uploadBtn?.addEventListener('click', () => {
      void uploadSelectedFile();
    });
  }

  function renderResumeCard(resume: ResumeRecord): void {
    if (!content) return;

    const uploaded = new Date(resume.uploadDate).toLocaleString();
    content.innerHTML = `
      <div class="resume-stats-grid">
        <article class="resume-stat-box">
          <p class="resume-stat-label">Filename</p>
          <p class="resume-filename">${resume.originalName}</p>
        </article>
        <article class="resume-stat-box">
          <p class="resume-stat-label">Uploaded</p>
          <p class="resume-stat-value">${uploaded}</p>
        </article>
        <article class="resume-stat-box">
          <p class="resume-stat-label">File Size</p>
          <p class="resume-stat-value">${formatSize(resume.fileSize)}</p>
        </article>
        <article class="resume-stat-box downloads">
          <p class="resume-stat-label">⤓ Total Downloads</p>
          <p class="resume-download-count">${resume.downloadCount}</p>
        </article>
      </div>
      <div class="resume-actions">
        <button id="resume-preview-btn" class="admin-btn" type="button">Download Preview</button>
        <button id="resume-delete-btn" class="admin-btn danger" type="button">Delete</button>
      </div>
    `;

    const previewBtn = content.querySelector<HTMLButtonElement>('#resume-preview-btn');
    const deleteBtn = content.querySelector<HTMLButtonElement>('#resume-delete-btn');

    previewBtn?.addEventListener('click', () => {
      const target = resume.filePath.startsWith('http') ? resume.filePath : `${API_BASE_URL}${resume.filePath}`;
      window.open(target, '_blank', 'noopener');
    });

    deleteBtn?.addEventListener('click', () => {
      void deleteResume(deleteBtn, previewBtn);
    });
  }

  function renderEmptyState(): void {
    if (!content) return;
    content.innerHTML = `
      <div class="empty-state">
        <p>No resume uploaded yet</p>
        <button id="resume-empty-upload" class="admin-btn primary" type="button">Upload Resume</button>
      </div>
    `;

    const emptyUpload = content.querySelector<HTMLButtonElement>('#resume-empty-upload');
    emptyUpload?.addEventListener('click', () => {
      fileInput?.click();
    });
  }

  async function loadResume(): Promise<void> {
    loading?.classList.remove('hidden');
    error?.classList.add('hidden');
    content?.classList.add('hidden');

    try {
      const response = await options.adminFetch('/api/resume');
      if (response.status === 404) {
        activeResume = null;
        renderEmptyState();
        loading?.classList.add('hidden');
        content?.classList.remove('hidden');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch resume`);
      }

      const payload = (await response.json()) as { resume?: ResumeRecord };
      activeResume = payload.resume ?? null;

      if (!activeResume) {
        renderEmptyState();
      } else {
        renderResumeCard(activeResume);
      }

      loading?.classList.add('hidden');
      content?.classList.remove('hidden');
    } catch (catchError) {
      console.error('Resume load error:', catchError);
      loading?.classList.add('hidden');
      error?.classList.remove('hidden');
    }
  }

  async function deleteResume(
    deleteBtn?: HTMLButtonElement | null,
    previewBtn?: HTMLButtonElement | null
  ): Promise<void> {
    if (!activeResume) return;
    if (!window.confirm('Delete this resume permanently?')) return;

    const originalDeleteText = deleteBtn?.textContent ?? 'Delete';
    if (deleteBtn) {
      deleteBtn.disabled = true;
      deleteBtn.textContent = 'Deleting...';
    }
    if (previewBtn) {
      previewBtn.disabled = true;
    }

    try {
      const response = await options.adminFetch(`/api/resume/${activeResume._id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        if (deleteBtn) {
          deleteBtn.disabled = false;
          deleteBtn.textContent = originalDeleteText;
        }
        if (previewBtn) {
          previewBtn.disabled = false;
        }
        options.showToast('Failed to delete resume.', 'error');
        return;
      }

      options.showToast('Resume deleted successfully.', 'success');
      options.onStatsChange?.();
      await loadResume();
    } catch {
      if (deleteBtn) {
        deleteBtn.disabled = false;
        deleteBtn.textContent = originalDeleteText;
      }
      if (previewBtn) {
        previewBtn.disabled = false;
      }
      options.showToast('Failed to delete resume.', 'error');
    }
  }

  async function uploadSelectedFile(): Promise<void> {
    if (!selectedFile) {
      options.showToast('Select a PDF first.', 'warning');
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/index.html';
      return;
    }

    const formData = new FormData();
    formData.append('resume', selectedFile);

    progressWrap?.classList.remove('hidden');
    if (progressBar) progressBar.style.width = '0%';

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/api/resume/upload`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
        if (!event.lengthComputable || !progressBar) return;
        const progress = Math.round((event.loaded / event.total) * 100);
        progressBar.style.width = `${progress}%`;

        const uploadBtn = selectedWrap?.querySelector<HTMLButtonElement>('#resume-upload-btn');
        if (uploadBtn) {
          uploadBtn.textContent = 'Uploading...';
        }
      };

      xhr.onload = () => {
        progressWrap?.classList.add('hidden');
        const uploadBtn = selectedWrap?.querySelector<HTMLButtonElement>('#resume-upload-btn');
        if (uploadBtn) {
          uploadBtn.disabled = false;
          uploadBtn.textContent = 'Upload Now';
        }

        if (xhr.status < 200 || xhr.status >= 300) {
          options.showToast('Resume upload failed.', 'error');
          resolve();
          return;
        }

        selectedFile = null;
        renderSelectedFile();
        options.showToast('Resume uploaded successfully.', 'success');
        options.onStatsChange?.();
        void loadResume();
        resolve();
      };

      xhr.onerror = () => {
        progressWrap?.classList.add('hidden');
        const uploadBtn = selectedWrap?.querySelector<HTMLButtonElement>('#resume-upload-btn');
        if (uploadBtn) {
          uploadBtn.disabled = false;
          uploadBtn.textContent = 'Upload Now';
        }
        options.showToast('Resume upload failed.', 'error');
        resolve();
      };

      const uploadBtn = selectedWrap?.querySelector<HTMLButtonElement>('#resume-upload-btn');
      if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';
      }

      xhr.send(formData);
    });
  }

  pickButton?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0] ?? null;
    if (!file) return;

    if (file.type !== 'application/pdf') {
      options.showToast('Invalid file type. Only PDF files are allowed.', 'error');
      fileInput.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      options.showToast('File is too large. Max allowed size is 10MB.', 'error');
      fileInput.value = '';
      return;
    }

    selectedFile = file;
    renderSelectedFile();
  });

  retry?.addEventListener('click', () => {
    void loadResume();
  });

  window.setInterval(() => {
    const visible = !panel.classList.contains('hidden');
    if (visible) {
      void loadResume();
    }
  }, 60_000);

  void loadResume();
}
