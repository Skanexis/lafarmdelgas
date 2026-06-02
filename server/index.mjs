import http from 'node:http';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedProducts } from './seed-products.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const host = process.env.API_HOST || '127.0.0.1';
const port = Number(process.env.API_PORT || 8787);
const adminToken = process.env.ADMIN_TOKEN || 'lafarm2026';
const dataDir = join(__dirname, 'data');
const uploadsDir = join(__dirname, 'uploads');
const productsFile = join(dataDir, 'products.json');
const messagesFile = join(dataDir, 'messages.json');
const categoriesFile = join(dataDir, 'categories.json');
const settingsFile = join(dataDir, 'settings.json');
const contactsFile = join(dataDir, 'contacts.json');

const defaultContacts = {
  whatsappGroupName: 'LA FARM DEL GAS',
  whatsappGroupUrl: 'https://chat.whatsapp.com/',
  whatsappContactLabel: '+39 333 000 0000',
  whatsappContactUrl: 'https://wa.me/393330000000',
  instagramLabel: '@lafarmdelgas',
  instagramUrl: 'https://instagram.com/lafarmdelgas',
};

async function ensureDataFiles() {
  await mkdir(dataDir, { recursive: true });
  await mkdir(uploadsDir, { recursive: true });

  if (!existsSync(productsFile)) {
    await writeJson(productsFile, seedProducts);
  }

  if (!existsSync(messagesFile)) {
    await writeJson(messagesFile, []);
  }

  if (!existsSync(categoriesFile)) {
    const categories = Array.from(new Set(seedProducts.map(product => product.category).filter(Boolean)));
    await writeJson(categoriesFile, categories);
  }

  if (!existsSync(settingsFile)) {
    await writeJson(settingsFile, {
      logoUrl: '',
      heroMediaUrl: '',
    });
  }

  if (!existsSync(contactsFile)) {
    await writeJson(contactsFile, defaultContacts);
  }
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function sendBuffer(res, status, buffer, contentType) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=31536000, immutable',
  });
  res.end(buffer);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        const error = new Error('Payload too large');
        error.status = 413;
        reject(error);
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

function readRequestBuffer(req, maxBytes = 50_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxBytes) {
        const error = new Error('Payload too large');
        error.status = 413;
        reject(error);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseMultipart(buffer, contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) {
    throw new Error('Missing multipart boundary');
  }

  const boundary = `--${boundaryMatch[1] || boundaryMatch[2]}`;
  const raw = buffer.toString('binary');
  const parts = raw.split(boundary).slice(1, -1);

  return parts
    .map(part => {
      const cleanPart = part.replace(/^\r\n/, '').replace(/\r\n$/, '');
      const headerEnd = cleanPart.indexOf('\r\n\r\n');
      if (headerEnd === -1) return null;

      const headerText = cleanPart.slice(0, headerEnd);
      const bodyBinary = cleanPart.slice(headerEnd + 4);
      const disposition = headerText.match(/content-disposition:\s*form-data;([^\r\n]+)/i)?.[1] || '';
      const name = disposition.match(/name="([^"]+)"/i)?.[1] || '';
      const filename = disposition.match(/filename="([^"]*)"/i)?.[1] || '';
      const mime = headerText.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim() || 'application/octet-stream';

      return {
        name,
        filename,
        mime,
        data: Buffer.from(bodyBinary, 'binary'),
      };
    })
    .filter(Boolean);
}

function mediaTypeFromMime(mime) {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  return 'file';
}

function contentTypeForFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.m4v': 'video/x-m4v',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.mpeg': 'video/mpeg',
    '.mpg': 'video/mpeg',
    '.3gp': 'video/3gpp',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.zip': 'application/zip',
    '.rar': 'application/vnd.rar',
    '.7z': 'application/x-7z-compressed',
  };

  return types[ext] || 'application/octet-stream';
}

function safeUploadName(originalName) {
  const ext = extname(originalName).toLowerCase().replace(/[^.\w]/g, '');
  const base = basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${base || 'media'}${ext || '.bin'}`;
}

function isAuthorized(req) {
  const auth = req.headers.authorization || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return bearer === adminToken || req.headers['x-admin-token'] === adminToken;
}

function normalizeProduct(input, existingId) {
  const files = Array.isArray(input.files)
    ? input.files
        .filter(file => file && file.url)
        .map(file => {
          const mime = String(file.mime || 'application/octet-stream');
          return {
            name: String(file.name || basename(String(file.url))),
            originalName: file.originalName ? String(file.originalName) : undefined,
            url: String(file.url),
            mime,
            type: ['image', 'video', 'file'].includes(file.type) ? file.type : mediaTypeFromMime(mime),
            size: Number.isFinite(Number(file.size)) ? Number(file.size) : 0,
          };
        })
    : [];

  const product = {
    id: String(existingId || input.id || Date.now()),
    name: String(input.name || '').trim(),
    brand: String(input.brand || '').trim(),
    origin: String(input.origin || '').trim(),
    description: String(input.description || '').trim(),
    images: Array.isArray(input.images) ? input.images.filter(Boolean).map(String) : [],
    hasVideo: Boolean(input.hasVideo || input.videoUrl),
    videoUrl: input.videoUrl ? String(input.videoUrl) : undefined,
    files,
    weights: Array.isArray(input.weights) ? input.weights : [],
    badge: input.badge || null,
    category: String(input.category || '').trim(),
    isNew: Boolean(input.isNew),
  };

  if (!product.name || !product.brand || !product.origin || !product.category) {
    throw new Error('Product name, brand, origin and category are required');
  }

  if (!product.images.length) {
    throw new Error('At least one product image is required');
  }

  if (!product.weights.length) {
    throw new Error('At least one weight price is required');
  }

  product.weights = product.weights.map(item => {
    const price = item.price === 'pvt' ? 'pvt' : Number(item.price);
    if (!item.weight || (price !== 'pvt' && !Number.isFinite(price))) {
      throw new Error('Invalid weight price');
    }

    return {
      weight: String(item.weight),
      price,
    };
  });

  return product;
}

function normalizeCategory(input) {
  const name = String(input.name || '').trim();
  if (!name) {
    throw new Error('Category name is required');
  }

  if (name.toLowerCase() === 'tutti') {
    throw new Error('Tutti is a system category');
  }

  return name;
}

function normalizeContacts(input, current = defaultContacts) {
  return {
    ...current,
    whatsappGroupName:
      typeof input.whatsappGroupName === 'string' ? input.whatsappGroupName.trim() : current.whatsappGroupName,
    whatsappGroupUrl:
      typeof input.whatsappGroupUrl === 'string' ? input.whatsappGroupUrl.trim() : current.whatsappGroupUrl,
    whatsappContactLabel:
      typeof input.whatsappContactLabel === 'string'
        ? input.whatsappContactLabel.trim()
        : current.whatsappContactLabel,
    whatsappContactUrl:
      typeof input.whatsappContactUrl === 'string' ? input.whatsappContactUrl.trim() : current.whatsappContactUrl,
    instagramLabel: typeof input.instagramLabel === 'string' ? input.instagramLabel.trim() : current.instagramLabel,
    instagramUrl: typeof input.instagramUrl === 'string' ? input.instagramUrl.trim() : current.instagramUrl,
  };
}

async function handleRequest(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method || 'GET';

  if (method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (path.startsWith('/uploads/') && method === 'GET') {
    const relativePath = decodeURIComponent(path.replace('/uploads/', ''));
    const filePath = normalize(join(uploadsDir, relativePath));

    if (!filePath.startsWith(uploadsDir) || !existsSync(filePath)) {
      sendJson(res, 404, { error: 'File not found' });
      return;
    }

    sendBuffer(res, 200, await readFile(filePath), contentTypeForFile(filePath));
    return;
  }

  if (path === '/api/health' && method === 'GET') {
    sendJson(res, 200, { ok: true, service: 'la-farm-del-gas-api' });
    return;
  }

  if (path === '/api/products' && method === 'GET') {
    const products = await readJson(productsFile, []);
    sendJson(res, 200, products);
    return;
  }

  if (path === '/api/categories' && method === 'GET') {
    const categories = await readJson(categoriesFile, []);
    sendJson(res, 200, categories);
    return;
  }

  if (path === '/api/settings' && method === 'GET') {
    const settings = await readJson(settingsFile, { logoUrl: '', heroMediaUrl: '' });
    sendJson(res, 200, settings);
    return;
  }

  if (path === '/api/contacts' && method === 'GET') {
    const contacts = await readJson(contactsFile, defaultContacts);
    sendJson(res, 200, normalizeContacts(contacts));
    return;
  }

  const productMatch = path.match(/^\/api\/products\/([^/]+)$/);
  if (productMatch && method === 'GET') {
    const products = await readJson(productsFile, []);
    const product = products.find(item => item.id === productMatch[1]);
    sendJson(res, product ? 200 : 404, product || { error: 'Product not found' });
    return;
  }

  if (path === '/api/contact' && method === 'POST') {
    const body = await parseBody(req);
    const message = {
      id: String(Date.now()),
      name: String(body.name || '').trim(),
      email: String(body.email || '').trim(),
      message: String(body.message || '').trim(),
      createdAt: new Date().toISOString(),
    };

    if (!message.name || !message.email || !message.message) {
      sendJson(res, 400, { error: 'Name, email and message are required' });
      return;
    }

    const messages = await readJson(messagesFile, []);
    messages.unshift(message);
    await writeJson(messagesFile, messages);
    sendJson(res, 201, { ok: true, id: message.id });
    return;
  }

  if (path === '/api/admin/session' && method === 'GET') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    sendJson(res, 200, { ok: true });
    return;
  }

  if (path === '/api/admin/media' && method === 'GET') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const files = await readdir(uploadsDir);
    const media = await Promise.all(
      files.map(async file => {
        const filePath = join(uploadsDir, file);
        const info = await stat(filePath);
        const mime = contentTypeForFile(filePath);

        return {
          name: file,
          url: `/uploads/${encodeURIComponent(file)}`,
          mime,
          type: mediaTypeFromMime(mime),
          size: info.size,
          createdAt: info.birthtime.toISOString(),
        };
      }),
    );

    sendJson(res, 200, media.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    return;
  }

  if (path === '/api/admin/upload' && method === 'POST') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      sendJson(res, 400, { error: 'Expected multipart form data' });
      return;
    }

    const maxUploadBytes = Number(process.env.UPLOAD_MAX_BYTES || 1_073_741_824);
    const parts = parseMultipart(await readRequestBuffer(req, maxUploadBytes), contentType);
    const file = parts.find(part => part.filename && part.data.length);

    if (!file) {
      sendJson(res, 400, { error: 'File is required' });
      return;
    }

    const detectedMime = file.mime === 'application/octet-stream' ? contentTypeForFile(file.filename) : file.mime;
    const type = mediaTypeFromMime(detectedMime);

    const name = safeUploadName(file.filename);
    const filePath = join(uploadsDir, name);
    await writeFile(filePath, file.data);

    sendJson(res, 201, {
      name,
      originalName: file.filename,
      url: `/uploads/${encodeURIComponent(name)}`,
      mime: detectedMime,
      type,
      size: file.data.length,
    });
    return;
  }

  if (path === '/api/admin/settings' && method === 'PUT') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const current = await readJson(settingsFile, { logoUrl: '', heroMediaUrl: '' });
    const body = await parseBody(req);
    const settings = {
      ...current,
      logoUrl: typeof body.logoUrl === 'string' ? body.logoUrl : current.logoUrl,
      heroMediaUrl: typeof body.heroMediaUrl === 'string' ? body.heroMediaUrl : current.heroMediaUrl,
    };

    await writeJson(settingsFile, settings);
    sendJson(res, 200, settings);
    return;
  }

  if (path === '/api/admin/contacts' && method === 'PUT') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const current = await readJson(contactsFile, defaultContacts);
    const contacts = normalizeContacts(await parseBody(req), current);

    await writeJson(contactsFile, contacts);
    sendJson(res, 200, contacts);
    return;
  }

  if (path === '/api/admin/categories' && method === 'POST') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const category = normalizeCategory(await parseBody(req));
    const categories = await readJson(categoriesFile, []);
    const exists = categories.some(item => item.toLowerCase() === category.toLowerCase());

    if (exists) {
      sendJson(res, 409, { error: 'Category already exists' });
      return;
    }

    categories.push(category);
    await writeJson(categoriesFile, categories);
    sendJson(res, 201, category);
    return;
  }

  const adminCategoryMatch = path.match(/^\/api\/admin\/categories\/([^/]+)$/);
  if (adminCategoryMatch && ['PUT', 'DELETE'].includes(method)) {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const currentName = decodeURIComponent(adminCategoryMatch[1]);
    const categories = await readJson(categoriesFile, []);
    const index = categories.findIndex(item => item.toLowerCase() === currentName.toLowerCase());

    if (index === -1) {
      sendJson(res, 404, { error: 'Category not found' });
      return;
    }

    const products = await readJson(productsFile, []);

    if (method === 'DELETE') {
      const used = products.some(product => product.category.toLowerCase() === categories[index].toLowerCase());
      if (used) {
        sendJson(res, 409, { error: 'Category is used by products' });
        return;
      }

      const [deleted] = categories.splice(index, 1);
      await writeJson(categoriesFile, categories);
      sendJson(res, 200, deleted);
      return;
    }

    const nextName = normalizeCategory(await parseBody(req));
    const duplicate = categories.some(
      (item, itemIndex) => itemIndex !== index && item.toLowerCase() === nextName.toLowerCase(),
    );

    if (duplicate) {
      sendJson(res, 409, { error: 'Category already exists' });
      return;
    }

    const oldName = categories[index];
    categories[index] = nextName;
    const updatedProducts = products.map(product =>
      product.category.toLowerCase() === oldName.toLowerCase() ? { ...product, category: nextName } : product,
    );

    await writeJson(categoriesFile, categories);
    await writeJson(productsFile, updatedProducts);
    sendJson(res, 200, nextName);
    return;
  }

  if (path === '/api/admin/products' && method === 'POST') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const products = await readJson(productsFile, []);
    const product = normalizeProduct(await parseBody(req));
    products.unshift(product);
    await writeJson(productsFile, products);
    sendJson(res, 201, product);
    return;
  }

  const adminProductMatch = path.match(/^\/api\/admin\/products\/([^/]+)$/);
  if (adminProductMatch && ['PUT', 'DELETE'].includes(method)) {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const id = adminProductMatch[1];
    const products = await readJson(productsFile, []);
    const index = products.findIndex(item => item.id === id);

    if (index === -1) {
      sendJson(res, 404, { error: 'Product not found' });
      return;
    }

    if (method === 'DELETE') {
      const [deleted] = products.splice(index, 1);
      await writeJson(productsFile, products);
      sendJson(res, 200, deleted);
      return;
    }

    const product = normalizeProduct(await parseBody(req), id);
    products[index] = product;
    await writeJson(productsFile, products);
    sendJson(res, 200, product);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

await ensureDataFiles();

http
  .createServer((req, res) => {
    handleRequest(req, res).catch(error => {
      sendJson(res, error.status || 500, { error: error.message || 'Internal server error' });
    });
  })
  .listen(port, host, () => {
    console.log(`LA FARM DEL GAS API listening on http://${host}:${port}`);
  });
