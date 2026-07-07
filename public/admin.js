document.addEventListener('DOMContentLoaded', () => {
  const loginPanel = document.getElementById('login-panel');
  const adminPanel = document.getElementById('admin-panel');
  const loginForm = document.getElementById('login-form');
  const adminPasswordInput = document.getElementById('admin-password');
  
  const menuItems = document.querySelectorAll('.menu-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const logoutBtn = document.getElementById('logout-btn');
  
  const configForm = document.getElementById('config-form');
  const configGeminiKey = document.getElementById('config-gemini-key');
  const configTemp = document.getElementById('config-temp');
  const tempVal = document.getElementById('temp-val');
  const configInstruction = document.getElementById('config-instruction');
  
  const pdfDropzone = document.getElementById('pdf-dropzone');
  const fileInput = document.getElementById('file-input');
  const docsListBody = document.getElementById('docs-list-body');
  
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingText = document.getElementById('loading-text');

  // Set Temp Value display
  configTemp.addEventListener('input', () => {
    tempVal.textContent = configTemp.value;
  });

  // Check auth session
  const checkAuth = () => {
    const token = sessionStorage.getItem('admin_token');
    if (token) {
      loginPanel.style.display = 'none';
      adminPanel.style.display = 'block';
      document.body.style.backgroundColor = '#f3f4f6';
      loadConfig();
      loadDocuments();
    } else {
      loginPanel.style.display = 'block';
      adminPanel.style.display = 'none';
      document.body.style.backgroundColor = '#1e293b';
    }
  };

  // Login handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = adminPasswordInput.value;
    
    showLoading("Memverifikasi password...");
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      hideLoading();
      
      if (res.ok && data.token) {
        sessionStorage.setItem('admin_token', data.token);
        adminPasswordInput.value = '';
        checkAuth();
        showToast("Login berhasil!");
      } else {
        showToast(data.error || "Password salah!");
      }
    } catch (err) {
      hideLoading();
      showToast("Gagal terhubung ke server.");
    }
  });

  // Logout handler
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('admin_token');
    checkAuth();
    showToast("Berhasil logout!");
  });

  // Tab switching
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(m => m.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      
      item.classList.add('active');
      const tabId = item.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Load config from DB
  const loadConfig = async () => {
    const token = sessionStorage.getItem('admin_token');
    try {
      const res = await fetch('/api/admin/config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('admin_token');
        checkAuth();
        return;
      }
      const data = await res.json();
      if (res.ok && data.config) {
        configTemp.value = data.config.temperature || 0.9;
        tempVal.textContent = configTemp.value;
        configInstruction.value = data.config.system_instruction || '';
        // Gemini key is hidden by placeholder
        configGeminiKey.value = '';
      }
    } catch (err) {
      showToast("Gagal mengambil data konfigurasi.");
    }
  };

  // Save config handler
  configForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('admin_token');
    const temperature = parseFloat(configTemp.value);
    const system_instruction = configInstruction.value;
    const gemini_api_key = configGeminiKey.value;
    
    showLoading("Menyimpan konfigurasi...");
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ temperature, system_instruction, gemini_api_key })
      });
      const data = await res.json();
      hideLoading();
      
      if (res.ok) {
        showToast("Konfigurasi berhasil disimpan!");
        configGeminiKey.value = ''; // clear password input field
      } else {
        showToast(data.error || "Gagal menyimpan konfigurasi.");
      }
    } catch (err) {
      hideLoading();
      showToast("Gagal mengirim data konfigurasi.");
    }
  });

  // Load PDF documents list
  const loadDocuments = async () => {
    const token = sessionStorage.getItem('admin_token');
    try {
      const res = await fetch('/api/admin/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && Array.isArray(data.documents)) {
        renderDocumentsTable(data.documents);
      }
    } catch (err) {
      showToast("Gagal memuat berkas dokumen.");
    }
  };

  // Render docs list to table
  const renderDocumentsTable = (docs) => {
    docsListBody.innerHTML = '';
    
    if (docs.length === 0) {
      docsListBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8;">Belum ada dokumen PDF terunggah di database.</td></tr>`;
      return;
    }
    
    docs.forEach(doc => {
      const tr = document.createElement('tr');
      const sizeKB = ((doc.sizeBytes || 0) / 1024).toFixed(1);
      const uploadDate = new Date(doc.uploadDate || Date.now()).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const docId = doc._id || doc.id;
      tr.innerHTML = `
        <td style="font-weight: 500; color: #334155;">${doc.filename || 'Unknown'}</td>
        <td>${sizeKB} KB</td>
        <td>${uploadDate}</td>
        <td>
          <button class="action-btn-del" title="Hapus Berkas dari DB" data-id="${docId}">&times;</button>
        </td>
      `;
      
      tr.querySelector('.action-btn-del').addEventListener('click', () => {
        if (confirm(`Apakah Anda yakin ingin menghapus berkas "${doc.filename}" beserta seluruh data vektor terkait?`)) {
          deleteDocument(docId);
        }
      });
      
      docsListBody.appendChild(tr);
    });
  };

  // Delete PDF document
  const deleteDocument = async (id) => {
    const token = sessionStorage.getItem('admin_token');
    showLoading("Menghapus berkas...");
    try {
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      hideLoading();
      
      if (res.ok) {
        showToast("Berkas berhasil dihapus!");
        loadDocuments();
      } else {
        showToast(data.error || "Gagal menghapus berkas.");
      }
    } catch (err) {
      hideLoading();
      showToast("Gagal melakukan request penghapusan.");
    }
  };

  // Dropzone drag-drop click handlers
  pdfDropzone.addEventListener('click', () => fileInput.click());
  
  pdfDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    pdfDropzone.classList.add('dragover');
  });
  
  pdfDropzone.addEventListener('dragleave', () => {
    pdfDropzone.classList.remove('dragover');
  });
  
  pdfDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    pdfDropzone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handlePdfUpload(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handlePdfUpload(fileInput.files[0]);
      fileInput.value = ''; // reset
    }
  });

  // Upload handler
  const handlePdfUpload = async (file) => {
    if (file.type !== 'application/pdf') {
      showToast("Hanya menerima berkas berformat PDF!");
      return;
    }
    
    const token = sessionStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('pdf', file);
    
    showLoading(`Mengunggah dan mengindeks "${file.name}" ke Astra DB...`);
    try {
      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      hideLoading();
      
      if (res.ok) {
        showToast("Berkas berhasil diunggah & diindeks!");
        loadDocuments();
      } else {
        showToast(data.error || "Gagal mengunggah berkas.");
      }
    } catch (err) {
      hideLoading();
      showToast("Koneksi bermasalah saat mengunggah.");
    }
  };

  // Change password handler
  const passwordForm = document.getElementById('password-form');
  const oldPasswordInput = document.getElementById('old-password');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('admin_token');
    const oldPassword = oldPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword !== confirmPassword) {
      showToast("Password baru tidak cocok dengan konfirmasi!");
      return;
    }

    showLoading("Memperbarui password admin...");
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      hideLoading();

      if (res.ok) {
        showToast("Password berhasil diperbarui!");
        oldPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
      } else {
        showToast(data.error || "Gagal memperbarui password.");
      }
    } catch (err) {
      hideLoading();
      showToast("Koneksi bermasalah saat memperbarui password.");
    }
  });

  // Helpers UI Toast / Loading
  function showToast(message) {
    const toast = document.createElement('div');
    toast.classList.add('toast-msg');
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  function showLoading(text) {
    loadingText.textContent = text;
    loadingOverlay.style.display = 'flex';
  }

  function hideLoading() {
    loadingOverlay.style.display = 'none';
  }

  // Initial check
  checkAuth();
});
