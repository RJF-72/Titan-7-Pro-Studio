const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const OWNER_EMAIL_HASHES = [
    'd2cd68d04c78da5b40eb46fd8d9e2c294599a85f79e46ce2874e44d191e1d6a3',
    '2ba3a33ecd03c03be75192e58d1be4bef12e0c548bfe141e370bdab6968994f9',
    '5b98465e76a594a62b15ddc21cccdb4824bceec9d2edcaba2de9695614de5af0',
    '315d53fe49420116ae9eac74a9f786a16ad12cf3ed78bd63455f4814aa0ab31b'
];

const LICENSEE = 'Redemption Road Music Group';
const PRODUCT = 'Titan 7 Pro';

const PRICING = {
    monthly: { price: 29.99, duration: 30, label: 'Monthly' },
    annual: { price: 349.99, duration: 365, label: 'Annual' },
    lifetime: { price: 599.99, duration: null, label: 'Lifetime' }
};

function getUserDataPath() {
    return process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.local/share');
}

function getLicenseFilePath() {
    return path.join(getUserDataPath(), 'Titan7Pro', 'license.json');
}

function ensureLicenseDir() {
    const dir = path.dirname(getLicenseFilePath());
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function hash(input) {
    return crypto.createHash('sha256').update(input.toLowerCase().trim()).digest('hex');
}

function isOwnerEmail(email) {
    const emailHash = hash(email);
    return OWNER_EMAIL_HASHES.includes(emailHash);
}

function activateOwner(email) {
    if (!isOwnerEmail(email)) return { success: false, reason: 'Invalid owner email.' };
    ensureLicenseDir();
    const record = {
        type: 'owner',
        email: email.toLowerCase().trim(),
        licensee: LICENSEE,
        product: PRODUCT,
        activatedAt: new Date().toISOString(),
        expiresAt: null,
        tier: 'owner',
        fingerprint: hash(email).substring(0, 16)
    };
    fs.writeFileSync(getLicenseFilePath(), JSON.stringify(record, null, 2));
    return { success: true, record };
}

function activateLicense(email, licenseKey, tier) {
    if (!validateLicenseKey(licenseKey)) return { success: false, reason: 'Invalid or malformed license key.' };
    if (!email || !email.includes('@')) return { success: false, reason: 'Valid email required.' };
    if (!PRICING[tier]) return { success: false, reason: 'Invalid license tier.' };

    ensureLicenseDir();
    const tierInfo = PRICING[tier];
    let expiresAt = null;

    if (tierInfo.duration) {
        const expires = new Date();
        expires.setDate(expires.getDate() + tierInfo.duration);
        expiresAt = expires.toISOString();
    }

    const record = {
        type: tier === 'lifetime' ? 'lifetime' : 'subscription',
        email: email.toLowerCase().trim(),
        licensee: LICENSEE,
        product: PRODUCT,
        key: licenseKey,
        tier: tier,
        price: tierInfo.price,
        activatedAt: new Date().toISOString(),
        expiresAt: expiresAt,
        fingerprint: hash(licenseKey + email).substring(0, 16)
    };
    fs.writeFileSync(getLicenseFilePath(), JSON.stringify(record, null, 2));
    return { success: true, record };
}

function renewLicense(email, licenseKey) {
    const current = loadLicense();
    if (!current || current.type === 'owner') {
        return { success: false, reason: 'No active subscription to renew.' };
    }
    if (current.email !== email.toLowerCase().trim()) {
        return { success: false, reason: 'Email does not match current license.' };
    }
    if (!validateLicenseKey(licenseKey)) {
        return { success: false, reason: 'Invalid renewal key.' };
    }

    const tier = current.tier || 'monthly';
    const tierInfo = PRICING[tier];
    if (!tierInfo || !tierInfo.duration) {
        return { success: false, reason: 'Lifetime licenses do not require renewal.' };
    }

    let baseDate = new Date();
    if (current.expiresAt && new Date(current.expiresAt) > baseDate) {
        baseDate = new Date(current.expiresAt);
    }

    const expires = new Date(baseDate);
    expires.setDate(expires.getDate() + tierInfo.duration);

    const record = {
        ...current,
        key: licenseKey,
        renewedAt: new Date().toISOString(),
        expiresAt: expires.toISOString()
    };
    fs.writeFileSync(getLicenseFilePath(), JSON.stringify(record, null, 2));
    return { success: true, record };
}

function loadLicense() {
    try {
        const file = getLicenseFilePath();
        if (!fs.existsSync(file)) return null;
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
        return null;
    }
}

function isLicensed() {
    const license = loadLicense();
    if (!license) return false;
    if (license.product !== PRODUCT) return false;
    if (license.licensee !== LICENSEE) return false;
    if (license.type === 'owner') return true;
    if (license.tier === 'lifetime') return true;
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) return false;
    return true;
}

function getLicenseStatus() {
    const license = loadLicense();
    if (!license) return { licensed: false, status: 'none' };

    if (license.type === 'owner') {
        return { licensed: true, status: 'owner', email: license.email, tier: 'owner' };
    }

    if (license.tier === 'lifetime') {
        return { licensed: true, status: 'lifetime', email: license.email, tier: 'lifetime' };
    }

    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
        return { licensed: false, status: 'expired', email: license.email, tier: license.tier, expiresAt: license.expiresAt };
    }

    return {
        licensed: true,
        status: 'active',
        email: license.email,
        tier: license.tier,
        expiresAt: license.expiresAt,
        daysRemaining: Math.ceil((new Date(license.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
    };
}

function clearLicense() {
    try {
        fs.unlinkSync(getLicenseFilePath());
    } catch (e) {}
}

function generateLicenseKey() {
    return {
        key: 'TITAN7-' + Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 8).toUpperCase()).join('-'),
        licensee: LICENSEE,
        product: PRODUCT
    };
}

function validateLicenseKey(key) {
    if (typeof key !== 'string') return false;
    const trimmed = key.trim().toUpperCase();
    if (/^TITAN7-[A-Z0-9]{4}(?:-[A-Z0-9]{4}){3,}$/.test(trimmed)) {
        if (trimmed.length >= 21 && trimmed.length <= 29) return true;
    }
    if (/^(sk_test_|sk_live_|pk_test_|pk_live_)[A-Za-z0-9]{20,}$/.test(trimmed)) return true;
    if (/^TITAN-[A-Z0-9]{4,8}-[A-Z0-9]{4,8}-[A-Z0-9]{4,8}$/.test(trimmed)) return true;
    if (/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(trimmed)) return true;
    if (trimmed.length >= 16 && trimmed.length <= 64) return true;
    return false;
}

function ObfuscateLicenseKey(key) {
    const normalized = String(key || '').replace(/\s+/g, '').toUpperCase();
    if (!/^TITAN7-[A-Z0-9]{4}(-[A-Z0-9]{4})+$/.test(normalized)) return null;
    const groups = normalized.slice(7).split('-');
    const masked = groups.map((segment, index) => index < groups.length - 2 ? segment[0] + '****' + segment[segment.length - 1] : segment).join('-');
    return `TITAN7-${masked}`;
}

module.exports = {
    isOwnerEmail,
    isLicensed,
    activateOwner,
    activateLicense,
    renewLicense,
    loadLicense,
    getLicenseStatus,
    clearLicense,
    generateLicenseKey,
    validateLicenseKey,
    ObfuscateLicenseKey,
    LICENSEE,
    PRODUCT,
    PRICING
};
