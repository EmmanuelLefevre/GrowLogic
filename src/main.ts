import { bootstrapApplication } from '@angular/platform-browser';

import { DotLottie } from '@lottiefiles/dotlottie-web';

import { AppComponent } from './app/app.component';
import { APP_CONFIG } from './app/app.config';

DotLottie.setWasmUrl('/assets/wasm/dotlottie-player.wasm');

try {
  await bootstrapApplication(AppComponent, APP_CONFIG);
}
catch(err) {
  console.error(err);
}
