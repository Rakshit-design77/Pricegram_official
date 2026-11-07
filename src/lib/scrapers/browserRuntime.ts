import puppeteer, { type Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

interface BrowserOptions {
  endpoint?: string;
  executablePath?: string;
  vercel: boolean;
  platform?: NodeJS.Platform;
}

let chromiumPath: Promise<string> | undefined;

export async function openGroceryBrowser(options: BrowserOptions): Promise<Browser> {
  if (options.endpoint) {
    if (!/^wss?:\/\//.test(options.endpoint)) throw new Error('Invalid browser endpoint configuration');
    return puppeteer.connect({ browserWSEndpoint: options.endpoint, protocolTimeout: 8000 });
  }
  if (options.vercel) {
    if ((options.platform ?? process.platform) !== 'linux') throw new Error('Serverless Chromium requires Linux');
    // Both providers can cold-start together. Extract the browser binary only once per instance.
    chromiumPath ??= chromium.executablePath().catch(error => { chromiumPath = undefined; throw error; });
    return puppeteer.launch({ executablePath: await chromiumPath,
      // Single-process mode cannot safely support isolated shopper browser contexts.
      args: chromium.args.filter(argument => argument !== '--single-process'),
      headless: 'shell', timeout: 10000, protocolTimeout: 8000,
    });
  }
  return puppeteer.launch({ headless: true, timeout: 8000, protocolTimeout: 8000,
    ...(options.executablePath ? { executablePath: options.executablePath } : { channel: 'chrome' as const }),
  });
}
