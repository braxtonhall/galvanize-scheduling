# adapter
cd ./adapter || exit
rm -rf ./adapter/node_modules
npm install --no-audit
npm run build

# backend
cd ../backend || exit
rm -rf ./node_modules/adapter
npm remove adapter
npm install ../adapter --save --no-audit
npm install --no-audit

# frontend
cd ../frontend || exit
rm -rf ./node_modules/adapter
npm remove adapter
npm install ../adapter --save --no-audit
npm install --no-audit
