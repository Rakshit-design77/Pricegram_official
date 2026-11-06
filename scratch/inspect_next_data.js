import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scratch/next_data.json', 'utf-8'));
const pageProps = data.props?.pageProps;
console.log("pageProps values:", JSON.stringify(pageProps, null, 2).substring(0, 2000));
