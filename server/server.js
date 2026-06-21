const express  = require('express');
const http     = require('http');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);

const initSocket = require('./socket');
initSocket(server);


app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const path = require('path');
app.use('/uploads', require('express').static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.json({ message: 'Cloud DMS API ✅' }));

try { app.use('/api/auth',        require('./routes/auth.routes'));       console.log('✅ auth routes'); }       catch(e) { console.error('❌ auth:', e.message); }
try { app.use('/api/documents',   require('./routes/document.routes'));   console.log('✅ document routes'); }   catch(e) { console.error('❌ documents:', e.message); }
try { app.use('/api/documents',   require('./routes/version.routes'));    console.log('✅ version routes'); }    catch(e) { console.error('❌ versions:', e.message); }
try { app.use('/api/documents',   require('./routes/permission.routes')); console.log('✅ permission routes'); } catch(e) { console.error('❌ permissions:', e.message); }
try { app.use('/api/search',      require('./routes/search.routes'));     console.log('✅ search routes'); }     catch(e) { console.error('❌ search:', e.message); }
try { app.use('/api/audit',       require('./routes/audit.routes'));      console.log('✅ audit routes'); }      catch(e) { console.error('❌ audit:', e.message); }

app.use(require('./middleware/error.middleware'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));