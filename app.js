const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FileServiceProxy = require('./services/fileServiceProxy');

// Instantiate the proxy which in turn instantiates the real service
const fileService = new FileServiceProxy();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (front‑end) from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer storage to store files in the uploads directory with a unique name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage: storage });

// Upload a single file
app.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }
    try {
      const id = await fileService.addFile(file);
      res.json({ message: 'File uploaded successfully', fileId: id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to save file' });
    }
});

// List all files
app.get('/files', async (req, res) => {
  try {
    const files = await fileService.getAllFiles();
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve files' });
  }
});

// Download a file by id
app.get('/files/:id/download', async (req, res) => {
  const id = req.params.id;
  try {
    const file = await fileService.getFileById(id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    const filePath = path.join(__dirname, 'uploads', file.stored_name);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File missing on server' });
    }
    res.download(filePath, file.original_name);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to download file' });
  }
});

// Rename a file
app.put('/files/:id', async (req, res) => {
  const id = req.params.id;
  const { original_name } = req.body;
  if (!original_name) {
    return res.status(400).json({ message: 'original_name is required' });
  }
  try {
    const updated = await fileService.renameFile(id, original_name);
    if (!updated) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.json({ message: 'File renamed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to rename file' });
  }
});

// Delete a file
app.delete('/files/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await fileService.deleteFile(id);
    if (!deleted) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});