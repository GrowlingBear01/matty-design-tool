require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Import routes and middleware
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const Design = require('./models/Design');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- ROUTES ---
app.use('/api/auth', authRoutes);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Mongo connected')).catch(err => console.error(err));

const upload = multer({ storage: multer.memoryStorage() });

// === PROTECTED ROUTES ===
app.post('/api/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided in the request.' });
    }
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'matty' }, (error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };
    const result = await streamUpload(req.file.buffer);
    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error('Error during file upload process:', err);
    res.status(500).json({ error: 'Server error during upload.' });
  }
});

app.post('/api/designs', authMiddleware, async (req, res) => {
  try {
    const { title, jsonData, thumbnailUrl } = req.body;
    const design = new Design({ title, userId: req.user.id, jsonData, thumbnailUrl });
    await design.save();
    res.json(design);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Save failed' });
  }
});

// *** NEW ROUTE TO GET USER'S DESIGNS ***
app.get('/api/designs/my-designs', authMiddleware, async (req, res) => {
    try {
        // req.user.id is available from the authMiddleware
        const designs = await Design.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(designs);
    } catch (error) {
        console.error('Error fetching user designs:', error);
        res.status(500).json({ error: 'Failed to fetch designs' });
    }
});


// === PUBLIC ROUTES ===
app.get('/api/designs', async (req, res) => {
  const designs = await Design.find().sort({ createdAt: -1 }).limit(50);
  res.json(designs);
});

app.get('/api/designs/:id', async (req, res) => {
  try {
    const d = await Design.findById(req.params.id);
    if (!d) return res.status(404).json({ error: 'Not found' });
    res.json(d);
  } catch (err) {
    res.status(400).json({ error: 'Bad id' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server listening on', PORT));

