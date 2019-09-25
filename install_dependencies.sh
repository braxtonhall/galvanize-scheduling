# adapter
cd ./adapter || exit
rm -rf ./adapter/node_modules
npm install
npm run build

# backend
cd ../backend || exit
rm -rf ./node_modules/adapter
npm remove adapter
npm install ../adapter --save
npm install

# frontend
cd ../frontend || exit
rm -rf ./node_modules/adapter
npm remove adapter
npm install ../adapter --save
npm install
