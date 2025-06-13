// scripts/make-images-manifest.js
const fs = require('fs');
const path = require('path');
const categories = {
    'antitarnish': 'PJ%20Jewellery%20Pics/Antitarnish%20Jewellery',
    'bali': 'PJ%20Jewellery%20Pics/Bali%20and%20halfbali%20style%20earrings',
    'bangles': 'PJ%20Jewellery%20Pics/Bangles',
    'bracelets': 'PJ%20Jewellery%20Pics/Bracelets',
    'delicate-pendant': 'PJ%20Jewellery%20Pics/Delicate%20Pendant%20Sets',
    'kundan-heavy': 'PJ%20Jewellery%20Pics/Kundan%20Heavy%20Sets',
    'kundan': 'PJ%20Jewellery%20Pics/Kundan%20earrings',
    'ring-nath': 'PJ%20Jewellery%20Pics/RingNath',
    'sets': 'PJ%20Jewellery%20Pics/Sets',
    'silver': 'PJ%20Jewellery%20Pics/Silver%20Replicas',
    'studs': 'PJ%20Jewellery%20Pics/Studs',
    'temple': 'PJ%20Jewellery%20Pics/Temple%20Jewellery',
};
let manifest = {};

for (let key in categories) {
  const dir = path.join(__dirname, '..', categories[key]);
  manifest[key] = fs.readdirSync(dir)
                    .filter(f => /\.(jpe?g|png)$/i.test(f))
                    .sort(); // if order matters
}

fs.writeFileSync(path.join(__dirname, '..', 'public', 'images.json'),
                 JSON.stringify(manifest, null, 2));
